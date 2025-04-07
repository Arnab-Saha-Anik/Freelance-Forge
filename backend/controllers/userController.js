const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { verifyToken } = require("../middleware/authMiddleware");
const freelancerInformationModel = require('../models/freelancerInformationModel');

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Save the user to the database
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.post('/login', async (req, res) => {
  const { email, password, role } = req.body; // Include role from the frontend
  if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
  }
  try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(400).json({ error: 'Invalid email or password' });
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ error: 'Invalid email or password' });
      }

      // Check if the role matches
      if (user.role.toLowerCase() !== role.toLowerCase()) {
          return res.status(403).json({ error: 'Selected role does not match your account role' });
      }

      // Generate JWT token
      const token = jwt.sign({ id: user._id, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.status(200).json({ message: 'Login successful', token, role: user.role });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
}); 

// @route   PUT /users/update
// @desc    Update user profile (name, password)
// @access  Private
// @route   PUT /users/update
// @desc    Update user profile (name, password)
// @access  Private
router.put("/update", verifyToken, async (req, res) => {
  const { name, currentPassword, newPassword, confirmPassword } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if no changes are made
    if (!name && !currentPassword && !newPassword && !confirmPassword) {
      return res.status(400).json({ error: "No changes detected" });
    }

    // Verify the current password if provided
    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Check if the new password is the same as the current password
      if (newPassword && (await bcrypt.compare(newPassword, user.password))) {
        return res.status(400).json({ error: "New password cannot be the same as the current password" });
      }

      // Check if new password and confirm password match
      if (newPassword && newPassword !== confirmPassword) {
        return res.status(400).json({ error: "New password and confirm password do not match" });
      }

      // Update the user's password if provided
      if (newPassword) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
      }
    }

    // Update the user's name if provided
    if (name && name !== user.name) {
      user.name = name;
    }

    // Save the updated user
    await user.save();

    res.json({ message: "Profile updated successfully", name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   DELETE /users/delete
// @desc    Delete user account and corresponding freelancer profile
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

    // Delete the freelancer profile associated with the user
    await freelancerInformationModel.findOneAndDelete({ userId: user._id });

    // Delete the user account
    await User.findByIdAndDelete(user._id);

    res.json({ message: "Account and freelancer profile deleted successfully" });
  } catch (err) {
    console.error("Error deleting account:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// GET /users/me - Fetch logged-in user's data
router.get("/me", verifyToken, async (req, res) => {
  try {
    // Fetch the user data using the ID from the token
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Validate user credentials
router.post("/validate", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    res.status(200).json({ message: "Credentials are valid." });
  } catch (err) {
    console.error("Error validating user:", err);
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;


