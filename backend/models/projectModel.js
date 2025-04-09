const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  deadline: { type: Date, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
});


projectSchema.index({ client: 1, title: 1 }, { unique: true });

module.exports = mongoose.model("Project", projectSchema);