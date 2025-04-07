const mongoose = require("mongoose");

const freelancerInformationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  skills: {
    type: [String], // Array of skills
    required: true,
    default: [],
  },
  portfolio: {
    type: String, // URL to the portfolio
    required: true,
  },
  experience: {
    type: String, // Description of experience
    required: true,
  },
  earnings: {
    type: Number, // Total earnings
    default: 0,
  },
  reviews: {
    type: Number, // Average reviews
    default: 0,
  },
  projectsCompleted: {
    type: Number, // Number of completed projects
    default: 0,
  },
});

module.exports = mongoose.model("FreelancerInformation", freelancerInformationSchema);