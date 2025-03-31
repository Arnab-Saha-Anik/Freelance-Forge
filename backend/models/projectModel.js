const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    deadline: { type: Date, required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the client
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);