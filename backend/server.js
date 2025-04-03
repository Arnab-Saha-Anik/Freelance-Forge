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

// Sample project data
const projects = [
  {
    id: 1,
    title: "Website Development",
    description: "Develop a responsive website for a client.",
    bids: [
      { id: 1, freelancer: "John Doe", amount: 500 },
      { id: 2, freelancer: "Jane Smith", amount: 450 },
    ],
    progress: 75,
    budget: 1000,
    deadline: "2025-04-15T00:00:00Z",
  },
  {
    id: 2,
    title: "Mobile App Design",
    description: "Design a mobile app for e-commerce.",
    bids: [],
    progress: 30,
    budget: 2000,
    deadline: "2025-05-01T00:00:00Z",
  },
    {
        id: 3,
        title: "SEO Optimization",
        description: "Optimize website for search engines.",
        bids: [
        { id: 1, freelancer: "Alice Johnson", amount: 300 },
        { id: 2, freelancer: "Bob Brown", amount: 250 },
        ],
        progress: 50,
        budget: 800,
        deadline: "2025-03-20T00:00:00Z",
    },
    {
        id: 4,
        title: "Cookiefy",
        description: "Enjoy your meals with a happy face.",
        bids: [],
        progress: 47,
        budget: 500,
        deadline: "2025-07-10T00:00:00Z"
      },
      {
        id: 3,
        title: "Logo Design",
        description: "Create a logo for a startup company.",
        bids: [
          { id: 1, freelancer: "Alice Brown", amount: 200 }
        ],
        progress: 50,
        budget: 300,
        deadline: "2025-04-20T00:00:00Z"
      },
];

// Routes
app.use("/users", userController); // Use the user routes

// New route to serve project data
app.get("/api/projects", (req, res) => {
  res.json(projects); // Send the project data as a JSON response
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);






