const Project = require("../models/projectModel");


const deleteProject = async (req, res) => {
  try {
    const { id } = req.params; // Get the project ID from the request parameters
    const clientId = req.headers["x-client-id"]; // Get the client ID from the request headers

    if (!clientId) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    // Find the project by ID
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if the logged-in client owns the project
    if (project.client !== clientId) {
      return res.status(403).json({ message: "You are not authorized to delete this project" });
    }

    // Delete the project from the database
    await Project.findByIdAndDelete(id);

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Error deleting project", error });
  }
};

// Create a new project
const createProject = async (req, res) => {
  try {
    const { title, description, budget, deadline } = req.body;
    const clientId = req.headers["x-client-id"]; // Get the client ID from the request headers

    if (!clientId) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    // Create a new project instance
    const newProject = new Project({
      title,
      description,
      client: clientId, // Set the client ID from the logged-in user
      budget,
      deadline,
      progress: "Not Started", // Default progress
      bids: [], // Initialize with an empty array
    });

    // Save the project to the database
    await newProject.save();

    res.status(201).json(newProject);
  } catch (error) {
    console.error("Error creating project:", error);
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