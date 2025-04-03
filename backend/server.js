const express = require("express");
const dotenv = require("dotenv"); // For environment variables
const cors = require("cors"); // Import cors middleware
const connectDB = require("./config/database"); // Import the database connection
const userController = require("./controllers/userController"); // Import user routes

dotenv.config();
// Connect to MongoDB
connectDB();

const app = express();
// Enable CORS
app.use(cors());
app.use(express.json()); // For JSON requests
app.use(express.urlencoded({ extended: true })); // Parse FormData


// Routes
app.use("/users", userController); // Use the user routes

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));






