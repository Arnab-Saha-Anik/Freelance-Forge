const express = require("express");
const Project = require("../models/projectModel");
const User = require("../models/userModel"); 
const { verifyToken } = require("../middleware/authMiddleware");
const router = express.Router();


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


router.get("/", async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Error fetching projects", error });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    
    if (!id || id.length !== 24) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    
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


router.delete("/admin/:id", async (req, res) => {
  try {
    const { id } = req.params;

    
    if (!id || id.length !== 24) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    
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


router.get("/featured", async (req, res) => {
  try {
    const featuredProjects = await Project.find().sort({ createdAt: -1 }).limit(6);
    res.status(200).json(featuredProjects);
  } catch (error) {
    console.error("Error fetching featured projects:", error);
    res.status(500).json({ message: "Error fetching featured projects", error });
  }
});


router.get("/client/projects", verifyToken, async (req, res) => {
  try {
    const clientId = req.user.id; 
    const projects = await Project.find({ client: clientId });

    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching client projects:", error);
    res.status(500).json({ message: "Error fetching projects", error });
  }
});


router.put("/client/update", verifyToken, async (req, res) => {
  const { name, currentPassword, newPassword, confirmPassword } = req.body;

  try {
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    
    if (!name && !currentPassword && !newPassword && !confirmPassword) {
      return res.status(400).json({ error: "No changes detected" });
    }

    
    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      
      if (newPassword && (await bcrypt.compare(newPassword, user.password))) {
        return res.status(400).json({ error: "New password cannot be the same as the current password" });
      }

      
      if (newPassword && newPassword !== confirmPassword) {
        return res.status(400).json({ error: "New password and confirm password do not match" });
      }

      
      if (newPassword) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
      }
    }

    
    if (name && name !== user.name) {
      user.name = name;
    }

    
    await user.save();

    res.json({ message: "Profile updated successfully", name: user.name });
  } catch (err) {
    console.error("Error in /client/update:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.delete("/client/delete/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    
    if (!id || id.length !== 24) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    
    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to delete this project" });
    }


    await Project.findByIdAndDelete(id);

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
