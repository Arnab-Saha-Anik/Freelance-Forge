require("dotenv").config(); // Load environment variables
const express = require("express");
const connectDB = require("./config/database"); // Import the database connection
const userRoutes = require("./controllers/userController"); // Import user routes

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/users", userRoutes); // Use the user routes

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

