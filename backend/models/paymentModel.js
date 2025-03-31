const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project', // Reference to the Project model
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Stripe', 'PayPal'], // Payment methods supported
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD', // Default currency
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'], // Payment status
      default: 'Pending',
    },
    transactionId: {
      type: String, // Transaction ID from Stripe
      required: true,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

module.exports = mongoose.model('Payment', paymentSchema);