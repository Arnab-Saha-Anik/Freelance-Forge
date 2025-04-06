import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const FreelancerDashboard = () => {
  const [showBidModal, setShowBidModal] = useState(false); // State to toggle bid modal
  const [selectedProject, setSelectedProject] = useState(null); // State to store the selected project
  const [bidAmount, setBidAmount] = useState(""); // State to store the bid amount
  const [showLearningMaterials, setShowLearningMaterials] = useState(false); // State to toggle learning materials
  const [projects, setProjects] = useState([]); // State to store all projects
  const [loading, setLoading] = useState(true); // State to manage loading
  const [error, setError] = useState(null); // State to manage errors
  const [freelancerData, setFreelancerData] = useState({
    earnings: 0,
    reviews: 0,
    projectsCompleted: 0,
  }); // State to store freelancer-specific data
  const [userName, setUserName] = useState("Loading..."); // State to store the user's name
  const [dropdownOpen, setDropdownOpen] = useState(false); // State to toggle dropdown
  const navigate = useNavigate(); // For navigation
  const location = useLocation(); // To access state passed via navigation

  // Use token from state or fallback to localStorage
  const token = location.state?.token || localStorage.getItem("token");

  useEffect(() => {
    document.title = "Freelancer Dashboard";

    if (!token) {
      console.error("No token found");
      setUserName("Error fetching name");
      navigate("/login"); // Redirect to login if no token is found
      return;
    }

    // Fetch the updated user information from the backend
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("http://localhost:5000/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserName(data.name); // Set the updated name
        } else {
          console.error("Failed to fetch user info");
          setUserName("Error fetching name");
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
        setUserName("Error fetching name");
      }
    };

    // Fetch projects and freelancer data
    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:5000/projects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }

        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchFreelancerData = async () => {
      try {
        const userId = JSON.parse(atob(token.split(".")[1])).id; // Decode userId from token
        const freelancerResponse = await fetch(`http://localhost:5000/freelancers/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!freelancerResponse.ok) {
          throw new Error("Failed to fetch freelancer stats");
        }

        const freelancerStats = await freelancerResponse.json();
        setFreelancerData({
          earnings: freelancerStats.earnings || 0,
          reviews: freelancerStats.reviews || 0,
          projectsCompleted: freelancerStats.projectsCompleted || 0,
        });
      } catch (err) {
        console.error("Error fetching freelancer data:", err);
        setFreelancerData({
          earnings: 0,
          reviews: 0,
          projectsCompleted: 0,
        });
      }
    };

    fetchUserInfo(); // Fetch the updated user info
    fetchProjects();
    fetchFreelancerData();
  }, [navigate, token]);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token from localStorage
    navigate("/login"); // Redirect to the login page
  };

  const handleBidClick = (project) => {
    setSelectedProject(project); // Set the selected project
    setShowBidModal(true); // Show the bid modal
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("No token found. Please log in again.");
      navigate("/login"); // Redirect to login
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/projects/${selectedProject._id}/bid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bidAmount }),
      });

      if (response.ok) {
        alert(`Your bid of $${bidAmount} has been submitted for "${selectedProject.title}"`);
        setShowBidModal(false); // Close the modal
        setBidAmount(""); // Reset the bid amount
      } else {
        alert("Failed to submit bid. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting bid:", err);
      alert("An error occurred while submitting your bid.");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#593D3D",
        color: "#FFFFFF",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Display the user's name */}
      
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Welcome, {userName}</h1>

      {/* Dropdown Menu */}
      <div
        style={{
          position: "relative", // Position relative to the parent container
          display: "flex",
          justifyContent: "flex-end", // Align to the right
          marginTop: "20px", // Add some spacing from the top
          marginRight: "20px", // Add spacing from the right
        }}
      >
        {/* My Account Button */}
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            backgroundColor: "#007BFF", // Blue background for the button
            color: "#FFFFFF", // White text for better contrast
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          My Account
          <span style={{ fontSize: "14px" }}>▼</span> {/* Down arrow */}
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%", // Position below the button
              right: "0", // Align to the right edge of the button
              backgroundColor: "#444444", // Dark background for the dropdown
              color: "#FFFFFF", // White text for dropdown items
              borderRadius: "10px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Add a subtle shadow
              padding: "15px",
              minWidth: "250px", // Set a fixed width for the dropdown
            }}
          >
            <ul style={{ listStyleType: "none", margin: 0, padding: 0 }}>
              <li style={{ marginBottom: "10px" }}>
                <span style={{ color: "#FFD700", fontWeight: "bold" }}>Earnings:</span> ${freelancerData.earnings}
              </li>
              <li style={{ marginBottom: "10px" }}>
                <span style={{ color: "#FFD700", fontWeight: "bold" }}>Reviews:</span> {freelancerData.reviews}/5
              </li>
              <li style={{ marginBottom: "10px" }}>
                <span style={{ color: "#FFD700", fontWeight: "bold" }}>Projects Completed:</span>{" "}
                {freelancerData.projectsCompleted}
              </li>
              <li style={{ marginTop: "20px", borderTop: "1px solid #FFD700", paddingTop: "10px" }}>
                <button
                  onClick={() => navigate("/freelancer-dashboard/profile", { state: { token } })}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#FFD700", // Gold color for Profile Settings
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: "18px", // Slightly smaller font size for Profile Settings
                    fontWeight: "bold",
                    padding: 0,
                    display: "block",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  Profile Settings
                </button>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#FF0000", // Red color for Logout
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: "18px", // Slightly smaller font size for Logout
                    fontWeight: "bold",
                    padding: 0,
                    display: "block",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
      
      {/* The rest of the code remains unchanged */}
      {/* Learning Materials Section */}
      {/* Projects Section */}
      {/* Bid Modal */}


      {/* Learning Materials Section */}
      <div
        style={{
          marginBottom: "20px",
          padding: "20px",
          backgroundColor: "#444444",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Want to Learn Something New?</h2>
        <button
          onClick={() => setShowLearningMaterials(!showLearningMaterials)}
          style={{
            display: "block",
            margin: "0 auto",
            padding: "10px 20px",
            backgroundColor: "#007BFF",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#007BFF")}
        >
          {showLearningMaterials ? (
            <>
              Close Learning Materials <span style={{ fontSize: "1.2rem" }}>↑</span>
            </>
          ) : (
            <>
              Click Here to Learn <span style={{ fontSize: "1.2rem" }}>↓</span>
            </>
          )}
        </button>
        {showLearningMaterials && (
          <ul
            style={{
              marginTop: "20px",
              listStyleType: "none",
              padding: 0,
              fontSize: "16px",
              color: "#FFFFFF",
            }}
          >
            <li
              style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "#333333",
                borderRadius: "10px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              }}
            >
              <h3 style={{ marginBottom: "10px", color: "#FFD700" }}>React Documentation</h3>
              <p style={{ marginBottom: "10px" }}>
                Learn React from the official documentation.
              </p>
              <a
                href="https://reactjs.org/docs/getting-started.html"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#007BFF", textDecoration: "none" }}
              >
                Visit React Docs
              </a>
            </li>
            <li
              style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "#333333",
                borderRadius: "10px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              }}
            >
              <h3 style={{ marginBottom: "10px", color: "#FFD700" }}>JavaScript Info</h3>
              <p style={{ marginBottom: "10px" }}>
                A comprehensive guide to modern JavaScript.
              </p>
              <a
                href="https://javascript.info/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#007BFF", textDecoration: "none" }}
              >
                Visit JavaScript Info
              </a>
            </li>
            <li
              style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "#333333",
                borderRadius: "10px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              }}
            >
              <h3 style={{ marginBottom: "10px", color: "#FFD700" }}>MDN Web Docs</h3>
              <p style={{ marginBottom: "10px" }}>
                Explore web development resources from MDN.
              </p>
              <a
                href="https://developer.mozilla.org/en-US/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#007BFF", textDecoration: "none" }}
              >
                Visit MDN Web Docs
              </a>
            </li>
            <li
              style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "#333333",
                borderRadius: "10px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              }}
            >
              <h3 style={{ marginBottom: "10px", color: "#FFD700" }}>FreeCodeCamp</h3>
              <p style={{ marginBottom: "10px" }}>
                Learn to code for free with FreeCodeCamp.
              </p>
              <a
                href="https://www.freecodecamp.org/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#007BFF", textDecoration: "none" }}
              >
                Visit FreeCodeCamp
              </a>
            </li>
          </ul>
        )}
      </div>

      {/* Projects Section */}
      <div
        style={{
          marginTop: "40px",
          padding: "20px",
          backgroundColor: "#444444",
          borderRadius: "10px",
          color: "#FFFFFF",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Available Projects</h2>

        {loading ? (
          <p style={{ textAlign: "center" }}>Loading projects...</p>
        ) : error ? (
          <p style={{ textAlign: "center", color: "red" }}>{error}</p>
        ) : projects.length === 0 ? (
          <p style={{ textAlign: "center" }}>No projects available.</p>
        ) : (
          <ul style={{ listStyleType: "none", padding: 0, fontSize: "18px" }}>
            {projects.map((project) => (
              <li
                key={project._id}
                style={{
                  marginBottom: "20px",
                  padding: "15px",
                  backgroundColor: "#333333",
                  borderRadius: "10px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                }}
              >
                <h3 style={{ marginBottom: "10px", color: "#FFD700" }}>{project.title}</h3>
                <p style={{ marginBottom: "10px" }}>{project.description}</p>
                <p style={{ marginBottom: "10px", fontWeight: "bold" }}>Budget: ${project.budget}</p>
                <p style={{ marginBottom: "10px" }}>
                  Deadline: {new Date(project.deadline).toLocaleDateString()}
                </p>
                <button
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#007BFF",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    transition: "background-color 0.3s",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px", // Add spacing between text and arrow
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#007BFF")}
                  onClick={() => handleBidClick(project)}
                >
                  Bid
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showBidModal && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#FFFFFF",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
            textAlign: "center",
            width: "400px", // Set a fixed width for the modal
          }}
        >
          {/* Display the project name */}
          <h3 style={{ marginBottom: "20px", color: "#333333" }}>
            Place Your Bid for: <span style={{ color: "#007BFF" }}>{selectedProject?.title}</span>
          </h3>
          <form onSubmit={handleBidSubmit}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Enter your bid amount"
                style={{
                  padding: "10px",
                  width: "100%",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
                required
              />
            </div>
            <div>
              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#007BFF",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginRight: "10px",
                }}
              >
                Submit Bid
              </button>
              <button
                type="button"
                onClick={() => setShowBidModal(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#FF0000",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FreelancerDashboard;