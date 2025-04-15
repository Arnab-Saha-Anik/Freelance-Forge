const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  deadline: { type: Date, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "selected", "accepted", "done"], default: "pending" }, 
  acceptedFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Added field to store accepted freelancer
  acceptedmoney: { type: Number }, // Added field to store accepted money
});


projectSchema.index({ client: 1, title: 1 }, { unique: true });

module.exports = mongoose.model("Project", projectSchema);