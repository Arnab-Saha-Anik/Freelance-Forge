const express = require("express");
const router = express.Router();
const FreelancerInformation = require("../models/freelancerInformationModel");
const User = require("../models/userModel");
const { verifyToken } = require("../middleware/authMiddleware"); // Import verifyToken middleware

// @route   GET /freelancers/:userId
// @desc    Get freelancer profile by userId
// @access  Private
router.get("/:userId", verifyToken, async (req, res) => {
  try {
    const freelancerInformation = await FreelancerInformation.findOne({ userId: req.params.userId });
    if (!freelancerInformation) {
      return res.status(404).json({ error: "Freelancer profile not found" });
    }
    res.json(freelancerInformation);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// @route   GET /freelancers/check/:userId
// @desc    Check if freelancer profile exists
// @access  Private
router.get("/check/:userId", verifyToken, async (req, res) => {
  try {
    const freelancerInformation = await FreelancerInformation.findOne({ userId: req.params.userId });
    if (freelancerInformation) {
      return res.json({ exists: true });
    }
    res.json({ exists: false });
  } catch (err) {
    console.error("Error checking freelancer profile existence:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   POST /freelancers
// @desc    Create freelancer profile
// @access  Private
router.post("/", verifyToken, async (req, res) => {
  const { userId, skills, portfolio, experience } = req.body;

  try {
    console.log("Request Body:", req.body); // Log the request body for debugging

    // Check if a profile already exists for the user
    const existingProfile = await FreelancerInformation.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({ error: "Freelancer profile already exists" });
    }

    // Create a new freelancer profile with default values for earnings, reviews, and projectsCompleted
    const freelancerInformation = new FreelancerInformation({
      userId,
      skills,
      portfolio,
      experience,
      earnings: 0, // Default value
      reviews: 0, // Default value
      projectsCompleted: 0, // Default value
    });

    await freelancerInformation.save();
    console.log("Freelancer profile created successfully:", freelancerInformation); // Log success
    res.status(201).json(freelancerInformation);
  } catch (err) {
    console.error("Error creating freelancer profile:", err); // Log the error
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// @route   PUT /freelancers/:userId
// @desc    Update freelancer profile
// @access  Private
router.put("/:userId", verifyToken, async (req, res) => {
  const { skills, portfolio, experience } = req.body;

  try {
    const freelancerInformation = await FreelancerInformation.findOneAndUpdate(
      { userId: req.params.userId },
      { skills, portfolio, experience },
      { new: true }
    );

    if (!freelancerInformation) {
      return res.status(404).json({ error: "Freelancer profile not found" });
    }

    res.json(freelancerInformation);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// @route   DELETE /freelancers/:userId
// @desc    Delete freelancer profile
// @access  Private
router.delete("/delete", verifyToken, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Delete the freelancer profile
    await FreelancerInformation.findOneAndDelete({ userId: user._id });

    // Delete the user account
    await User.findByIdAndDelete(user._id);

    res.json({ message: "Account and freelancer profile deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;