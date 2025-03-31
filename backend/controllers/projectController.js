const Project = require('../models/projectModel'); // Assuming you have a Project model

// Create a new project
const createProject = async (req, res) => {
  const { title, description, budget, deadline, clientId } = req.body;

  try {
    const project = await Project.create({
      title,
      description,
      budget,
      deadline,
      clientId, // Assuming the client ID is passed in the request
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error.message);
    res.status(500).json({ message: 'Failed to create project', error: error.message });
  }
};

// Get all projects
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error.message);
    res.status(500).json({ message: 'Failed to fetch projects', error: error.message });
  }
};

// Get a single project by ID
const getProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project:', error.message);
    res.status(500).json({ message: 'Failed to fetch project', error: error.message });
  }
};

// Update a project
const updateProject = async (req, res) => {
  const { id } = req.params;
  const { title, description, budget, deadline } = req.body;

  try {
    const project = await Project.findByIdAndUpdate(
      id,
      { title, description, budget, deadline },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error('Error updating project:', error.message);
    res.status(500).json({ message: 'Failed to update project', error: error.message });
  }
};

// Delete a project
const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error.message);
    res.status(500).json({ message: 'Failed to delete project', error: error.message });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};