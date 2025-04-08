const express = require("express");
const Project = require("../models/projectModel");
const User = require("../models/userModel"); // Correct the import path for the User model
const { verifyToken } = require("../middleware/authMiddleware");
const router = express.Router();

// @route   POST /projects/create
// @desc    Create a new project
// @access  Private
router.post("/create", verifyToken, async (req, res) => {
  const { title, description, budget, deadline, client } = req.body;

  if (!client) {
    return res.status(400).json({ error: "Client ID is required" });
  }

  try {
    const project = new Project({
      title,
      description,
      budget,
      deadline,
      client,
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        error: `A project with the title "${title}" already exists for this client.`,
      });
    }
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   GET /projects
// @desc    Fetch all projects
// @access  Public
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Error fetching projects", error });
  }
});

// @route   DELETE /projects/:id
// @desc    Delete a project by ID
// @access  Public
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID
    if (!id || id.length !== 24) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    // Find and delete the project by ID
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Error deleting project:", err); // Log the actual error
    res.status(500).json({ message: "Error deleting project", error: err.message });
  }
});

// @route   DELETE /projects/admin/:id
// @desc    Public route for admin to delete a project by ID
// @access  Public
router.delete("/admin/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID
    if (!id || id.length !== 24) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    // Find and delete the project by ID
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ message: "Error deleting project", error: err.message });
  }
});

// @route   GET /projects/featured
// @desc    Fetch featured projects
// @access  Public
router.get("/featured", async (req, res) => {
  try {
    const featuredProjects = await Project.find().sort({ createdAt: -1 }).limit(6);
    res.status(200).json(featuredProjects);
  } catch (error) {
    console.error("Error fetching featured projects:", error);
    res.status(500).json({ message: "Error fetching featured projects", error });
  }
});

// @route   GET /projects/client/projects
// @desc    Fetch projects for the logged-in client
// @access  Private
router.get("/client/projects", verifyToken, async (req, res) => {
  try {
    const clientId = req.user.id; // Extract client ID from the token

    // Fetch projects where the client matches the logged-in user's ID
    const projects = await Project.find({ client: clientId });

    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching client projects:", error);
    res.status(500).json({ message: "Error fetching projects", error });
  }
});

// @route   PUT /client/update
// @desc    Update client profile (name, password)
// @access  Private
router.put("/client/update", verifyToken, async (req, res) => {
  const { name, currentPassword, newPassword, confirmPassword } = req.body;

  try {
    // Find the user by ID from the token
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
    console.error("Error in /client/update:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   DELETE /client/delete/:id
// @desc    Delete a project by the client who created it
// @access  Private
router.delete("/client/delete/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the project ID
    if (!id || id.length !== 24) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    // Find the project by ID
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if the logged-in user is the owner of the project
    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to delete this project" });
    }

    // Delete the project
    await Project.findByIdAndDelete(id);

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
