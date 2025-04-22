const express = require("express");
const stripe = require("../config/stripe");
const Payment = require("../models/paymentModel");
const Project = require("../models/projectModel");
const User = require("../models/userModel"); // Assuming you have a User model
const Activity = require("../models/activityModel"); // Assuming you have an Activity model
const { verifyToken } = require("../middleware/authMiddleware"); // Middleware to verify user token

const router = express.Router();

router.post("/create-payment-intent", verifyToken, async (req, res) => {
  const { projectId, amount } = req.body;

  try {


    // Fetch the project from the database
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Fetch the client (user) from the database
    const client = await User.findById(req.user.id); // Assuming `req.user.id` is populated by the middleware
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Payment for Project ID: ${projectId}`,
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/client-dashboard`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: {
        projectId,
        clientId: client._id.toString(),
        amount: amount.toString(),
      },
    });
    

    if (!session || !session.id) {
      throw new Error("Failed to create Stripe session. Session or session ID is undefined.");
    }

    // Save the payment record in the database


    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    res.status(500).json({ error: error.message || "Failed to create Stripe session." });
  }
});

// Webhook endpoint
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const projectId = session.metadata.projectId;
      const clientId = session.metadata.clientId;
      const amount = parseFloat(session.metadata.amount);

      const project = await Project.findById(projectId);
      const client = await User.findById(clientId);

      if (!project || !client) {
        return res.status(404).send("Project or client not found.");
      }

      const payment = new Payment({
        project: project._id,
        client: client._id,
        amount,
        status: "Succeeded",
        paymentIntentId: session.id,
      });
      await payment.save();

      project.escrowStatus = "Funded";
      await project.save();

      await Activity.create({
        userId: client._id,
        action: `Payment of $${amount} for project ID: ${projectId} has been funded in the Escrow System.`,
      });

      return res.status(200).send("Webhook handled successfully");
    }

    res.status(400).send("Unhandled event type");
  } catch (error) {
    console.error("❌ Webhook Error:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

router.post("/claim-money/:projectId", verifyToken, async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId).populate("client");

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    if (project.approvalStatus !== "Approved") {
      return res.status(400).json({ error: "Project is not accepted for claiming money." });
    }

    if (project.escrowStatus === "Not Funded") {
      return res.status(400).json({ error: "Escrow is not funded for this project." });
    }

    // Validate acceptedmoney
    if (!project.acceptedmoney || isNaN(project.acceptedmoney)) {
      return res.status(400).json({ error: "Invalid accepted money amount." });
    }

    // Generate a Stripe Checkout session for the freelancer to claim money
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Claim Money for Project: ${project.title}`,
            },
            unit_amount: Math.round(project.acceptedmoney * 100), // Convert to cents and ensure it's an integer
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/freelancer-dashboard`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    // Find and update the existing payment document
    const payment = await Payment.findOneAndUpdate(
      { project: project._id }, // Find payment by project ID
      {
        client: project.client._id,
        freelancer: project.acceptedFreelancer, // Use the ObjectId directly
        amount: project.acceptedmoney,
        paymentIntentId: session.id,
      },
      { new: true, upsert: true } // Create a new document if it doesn't exist
    );

    // Update the project status
    project.escrowStatus = "Released";
    await project.save();

    res.status(200).json({ url: session.url, payment });
  } catch (error) {
    console.error("Error claiming money:", error);
    res.status(500).json({ error: "Failed to claim money." });
  }
});

router.post("/claim-remaining/:projectId", verifyToken, async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    if (project.status !== "accepted") {
      return res.status(400).json({ error: "Project is not approve for claiming the remaining budget." });
    }

    const remainingBudget = project.budget - project.acceptedmoney;

    if (remainingBudget <= 0) {
      return res.status(400).json({ error: "No remaining budget to claim." });
    }

    // Create a Stripe Checkout session for the remaining budget
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Claim Remaining Budget for Project: ${project.title}`,
            },
            unit_amount: Math.round(remainingBudget * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/client-dashboard`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    // Update the project's claimStatus to "Claimed"
    project.claimStatus = "Claimed";
    await project.save();

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error claiming remaining budget:", error);
    res.status(500).json({ error: "Failed to claim the remaining budget." });
  }
});

router.post("/refund-escrow/:projectId", verifyToken, async (req, res) => {
  const { projectId } = req.params;

  try {
    // Find the project
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    if (project.escrowStatus !== "Funded") {
      return res.status(400).json({ error: "Escrow is not funded for this project." });
    }

    // Create a Stripe Checkout session for the refund
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Refund Escrow for Project: ${project.title}`,
            },
            unit_amount: Math.round(project.budget * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/client-dashboard?refundSuccess=true`,
      cancel_url: `${process.env.CLIENT_URL}/refundCancelled`,
      metadata: {
        projectId: project._id.toString(),
      },
    });
    project.escrowStatus = "Not Funded";
    await project.save();

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error processing refund escrow:", error);
    res.status(500).json({ error: "Failed to process refund escrow." });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find({ client: req.user.id }).populate("project");
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Failed to fetch payments." });
  }
});

module.exports = router;