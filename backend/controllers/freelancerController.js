const express = require("express");
const router = express.Router();
const Freelancer = require("../models/freelancerModel");
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
router.delete("/:userId", verifyToken, async (req, res) => {
  try {
    const freelancer = await Freelancer.findOneAndDelete({ userId: req.params.userId });

    if (!freelancer) {
      return res.status(404).json({ error: "Freelancer profile not found" });
    }

    res.json({ message: "Freelancer profile deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;