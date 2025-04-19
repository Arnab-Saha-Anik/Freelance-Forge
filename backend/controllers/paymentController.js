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
      success_url: `${process.env.CLIENT_URL}/client-dashboard`, // Redirect to client dashboard
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    if (!session || !session.id) {
      throw new Error("Failed to create Stripe session. Session or session ID is undefined.");
    }

    // Save the payment record in the database
    const payment = new Payment({
      project: project._id, // Use the project ID from the database
      client: client._id, // Use the client ID from the database
      amount,
      status: "Succeeded", // Initial status
      paymentIntentId: session.id, // Use the session ID as the payment intent ID
    });
    await payment.save();

    project.escrowStatus = "Funded";
    await project.save();

    Activity.create({
      userId: client._id,
      action: `Payment of $${amount} for project ID: ${projectId} has been funded in the Escrow System.`,
    });


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

      console.log("Checkout session completed:", session);

      // Find the payment record by session ID
      const payment = await Payment.findOne({ paymentIntentId: session.id });
      if (!payment) {
        console.error("Payment record not found for session ID:", session.id);
        return res.status(404).send("Payment record not found");
      }

      res.status(200).send("Webhook handled successfully");
    } else {
      res.status(400).send("Unhandled event type");
    }
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

module.exports = router;