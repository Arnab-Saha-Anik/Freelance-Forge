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
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/stripe/create', createStripePaymentIntent);
router.put('/stripe/update', updateStripePaymentStatus);
router.post('/projects', createProject);
router.get('/projects', getAllProjects);
router.get('/projects/:id', getProjectById);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

module.exports = router;