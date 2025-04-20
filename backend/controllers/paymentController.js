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


module.exports = router;