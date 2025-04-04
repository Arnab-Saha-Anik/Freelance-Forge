const Project = require("../models/projectModel");


const deleteProject = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find and delete the project
      const project = await Project.findByIdAndDelete(id);
  
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
  
      res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting project", error });
    }
  };

  

// Create a new project
const createProject = async (req, res) => {
  try {
    const { title, description, client, budget, deadline } = req.body;

    // Create a new project instance
    const newProject = new Project({
      title,
      description,
      client,
      budget,
      deadline,
      progress: "Not Started", // Default progress
      bids: [], // Initialize with an empty array
    });

    // Save the project to the database
    await newProject.save();

    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ message: "Error creating project", error });
  }
};

// Get all projects
const getAllProjects = async (req, res) => {
  try {
    const { clientId } = req.query; // Get clientId from query params
    const projects = await Project.find();

    // Add a flag to differentiate projects created by the logged-in client
    const updatedProjects = projects.map((project) => ({
      ...project._doc,
      isOwner: project.client === clientId, // Check if the project belongs to the logged-in client
    }));

    res.status(200).json(updatedProjects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  deleteProject,
};