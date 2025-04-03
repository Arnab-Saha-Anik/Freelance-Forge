import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const FreelancerDashboard = () => {
  const [projects, setProjects] = useState([]); // State to store projects
  const [loading, setLoading] = useState(true); // State to manage loading
  const [error, setError] = useState(null); // State to manage errors
  const navigate = useNavigate(); // For navigation

  useEffect(() => {
    document.title = "Freelance Forge";

    // Fetch projects from the backend
    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:5000/projects", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token in the request
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        setProjects(data); // Set the fetched projects
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token from localStorage
    navigate("/login"); // Redirect to the login page
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ margin: 0 }}>Freelancer Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#FF0000",
            color: "#FFFFFF",
            border: "none",
            padding: "10px 15px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Logout
        </button>
      </div>
      <p style={{ textAlign: "center", fontSize: "18px", marginBottom: "30px" }}>
        Welcome to your dashboard! Here you can view and bid on available projects.
      </p>

      {/* Available Projects Section */}
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
                <button
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#007BFF",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    transition: "background-color 0.3s",
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#007BFF")}
                  onClick={() => alert(`You have bid on "${project.title}"`)}
                >
                  Bid
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FreelancerDashboard;