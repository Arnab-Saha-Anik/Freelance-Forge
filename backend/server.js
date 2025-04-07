const express = require("express");
const dotenv = require("dotenv"); // For environment variables
const cors = require("cors"); // Import cors middleware
const connectDB = require("./config/database"); // Import the database connection
const userController = require("./controllers/userController"); // Import user routes
const freelancerInformationController = require("./controllers/freelancerInformationController"); // Import freelancer routes
const projectController = require("./controllers/projectController"); // Import project routes

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Enable CORS
app.use(cors()); // Add this line to enable CORS for all routes

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/users", userController); // Use the user routes
app.use("/projects", projectController);
app.use("/freelancers", freelancerInformationController); // Use the freelancer routes


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);






