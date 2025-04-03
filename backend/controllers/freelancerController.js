const express = require("express");
const router = express.Router();
const Freelancer = require("../models/freelancerModel");
const User = require("../models/userModel");
const { verifyToken } = require("../middleware/authMiddleware"); // Import verifyToken middleware

// @route   GET /freelancers/:userId
// @desc    Get freelancer profile by userId
// @access  Private
router.get("/:userId", verifyToken, async (req, res) => {
  try {
    const freelancer = await Freelancer.findOne({ userId: req.params.userId });
    if (!freelancer) {
      return res.status(404).json({ error: "Freelancer profile not found" });
    }
    res.json(freelancer);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// @route   POST /freelancers
// @desc    Create freelancer profile
// @access  Private
router.post("/", verifyToken, async (req, res) => {
  const { userId, skills, portfolio, experience } = req.body;

  try {
    const freelancer = new Freelancer({
      userId,
      skills,
      portfolio,
      experience,
    });
    await freelancer.save();
    res.status(201).json(freelancer);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// @route   PUT /freelancers/:userId
// @desc    Update freelancer profile
// @access  Private
router.put("/:userId", verifyToken, async (req, res) => {
  const { skills, portfolio, experience } = req.body;

  try {
    const freelancer = await Freelancer.findOneAndUpdate(
      { userId: req.params.userId },
      { skills, portfolio, experience },
      { new: true }
    );

    if (!freelancer) {
      return res.status(404).json({ error: "Freelancer profile not found" });
    }

    res.json(freelancer);
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
    await Freelancer.findOneAndDelete({ userId: user._id });

    // Delete the user account
    await User.findByIdAndDelete(user._id);

    res.json({ message: "Account and freelancer profile deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;