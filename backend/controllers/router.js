const express = require('express');
const { registerUser, loginUser } = require('./authController');
const {
  createStripePaymentIntent,
  updateStripePaymentStatus,
} = require('./paymentController');

const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require('./projectController');

const router = express.Router();

// Mock data for projects (used as fallback or for testing)
const mockProjects = [
  {
    id: 1,
    title: "Website Development",
    description: "Build a responsive website for my business.",
    bids: [
      { freelancer: "John Doe", amount: 500 },
      { freelancer: "Jane Smith", amount: 450 },
    ],
    progress: 50,
    budget: 1000,
    deadline: "2025-04-15T00:00:00Z",
  },
  {
    id: 2,
    title: "Mobile App Design",
    description: "Design a mobile app for e-commerce.",
    bids: [],
    progress: 0,
    budget: 2000,
    deadline: "2025-05-01T00:00:00Z",
  },
];

// Root route
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Freelance Forge!',
    features: [
      'User Registration & Login',
      'Profile Management',
      'Project Posting & Bidding',
      'Payment Integration (Stripe)',
      'Admin Dashboard',
    ],
  });
});

// User authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Stripe payment routes
router.post('/stripe/create', createStripePaymentIntent);
router.put('/stripe/update', updateStripePaymentStatus);

// Project management routes
router.post('/projects', createProject);
router.get('/projects', async (req, res) => {
  try {
    // Use the actual `getAllProjects` function if available
    const projects = await getAllProjects();
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    // Fallback to mock data if there's an error
    res.status(200).json(mockProjects);
  }
});
router.get('/projects/:id', getProjectById);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

module.exports = router;