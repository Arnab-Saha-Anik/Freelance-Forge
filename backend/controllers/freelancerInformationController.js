const express = require("express");
const router = express.Router();
const FreelancerInformation = require("../models/freelancerInformationModel");
const User = require("../models/userModel");
const { verifyToken } = require("../middleware/authMiddleware"); 


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


router.post("/", verifyToken, async (req, res) => {
  const { userId, skills, portfolio, experience } = req.body;

  try {

 
    const existingProfile = await FreelancerInformation.findOne({ userId });
    if (existingProfile) {
      return res.status(400).json({ error: "Freelancer profile already exists" });
    }


    const freelancerInformation = new FreelancerInformation({
      userId,
      skills,
      portfolio,
      experience,
      earnings: 0,
      reviews: 0,
      projectsCompleted: 0,
    });

    await freelancerInformation.save();
    res.status(201).json(freelancerInformation);
  } catch (err) {
    console.error("Error creating freelancer profile:", err); // Log the error
    res.status(500).json({ error: err.message || "Server error" });
  }
});


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


router.delete("/delete", verifyToken, async (req, res) => {
  const { email, password } = req.body;

  try {

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }


    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }


    await FreelancerInformation.findOneAndDelete({ userId: user._id });


    await User.findByIdAndDelete(user._id);

    res.json({ message: "Account and freelancer profile deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;