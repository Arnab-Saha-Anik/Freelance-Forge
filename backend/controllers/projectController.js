const express = require("express");
const Project = require("../models/projectModel");
const router = express.Router();

// @route   POST /projects
// @desc    Create a new project
// @access  Public
router.post("/", async (req, res) => {
  try {
    const { title, description, budget, deadline } = req.body;

    const newProject = new Project({
      title,
      description,
      budget,
      deadline,
      progress: "Not Started",
      bids: [],
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Error creating project", error });
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

module.exports = router;
