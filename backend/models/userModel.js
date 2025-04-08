const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Ensure email is unique
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ["default", "Client", "Freelancer"], default: "default" },
  // otp: { type: String }, // OTP for email verification
  isActive: { type: Boolean, default: false } // Account activation status
});

module.exports = mongoose.model('User', userSchema);

