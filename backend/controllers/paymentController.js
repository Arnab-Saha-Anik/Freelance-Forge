require('dotenv').config(); // Automatically loads .env from the backend directory

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/paymentModel'); // Import the Payment model

// Stripe: Create a payment intent
const createStripePaymentIntent = async (req, res) => {
  const { amount, currency, userId, projectId } = req.body;

  try {
    // Create a payment intent with the specified amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in the smallest currency unit (e.g., cents for USD)
      currency,
    });

    // Save payment details to the database with status "Pending"
    const payment = await Payment.create({
      userId,
      projectId,
      paymentMethod: 'Stripe',
      amount,
      currency,
      transactionId: paymentIntent.id,
      status: 'Pending',
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret, // Send the client secret to the frontend
      paymentId: payment._id, // Send the payment ID for tracking
    });
  } catch (error) {
    console.error('Stripe Error:', error.message);
    res.status(500).json({ message: 'Stripe Payment Failed', error: error.message });
  }
};

// Update payment status after confirmation
const updateStripePaymentStatus = async (req, res) => {
  const { paymentId, status } = req.body;

  try {
    // Update the payment status in the database
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { status },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json({ message: 'Payment status updated', payment });
  } catch (error) {
    console.error('Error updating payment status:', error.message);
    res.status(500).json({ message: 'Failed to update payment status', error: error.message });
  }
};

module.exports = {
  createStripePaymentIntent,
  updateStripePaymentStatus,
};