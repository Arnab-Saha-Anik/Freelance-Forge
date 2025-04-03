require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors"); // Import cors middleware
const connectDB = require("./config/database"); // Import the database connection
const userController = require("./controllers/userController"); // Import user routes
const bodyParser = require("body-parser");
const app = express();

app.use(express.json());

// Enable CORS
app.use(cors());
app.use(express.json()); // For JSON requests
app.use(express.urlencoded({ extended: true })); // Parse FormData

// Connect to MongoDB
connectDB();

// Routes
app.use("/", userController); // Use the user routes

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

