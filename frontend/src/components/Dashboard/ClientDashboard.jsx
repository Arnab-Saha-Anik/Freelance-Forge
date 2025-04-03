import React, { useState, useEffect } from "react";

const ClientDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch projects from the backend
    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:5000/projects"); // Replace with your backend API endpoint
        const data = await response.json();
        setProjects(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        textAlign: "center",
        minHeight: "100vh",
        backgroundImage: 'url("https://img.freepik.com/premium-vector/abstract-gradient-color-background-vector-versatile-design_660762-1248.jpg")', // Background image
        backgroundSize: "cover", // Ensures the image covers the entire background
        backgroundPosition: "center", // Centers the image
        backgroundRepeat: "no-repeat", // Prevents the image from repeating
      }}
    >
      <h1 style={{ color: "#000000" }}>Client Dashboard</h1>
      <h2 style={{ color: "#000000" }}>Available Projects</h2>
      {loading ? (
        <p style={{ color: "#000000" }}>Loading projects...</p>
      ) : projects.length > 0 ? (
        <div>
          {projects.map((project) => (
            <div
              key={project.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "5px",
                padding: "15px",
                margin: "10px auto",
                maxWidth: "600px",
                textAlign: "left",
                backgroundColor: "rgba(251, 254, 196, 0.9)", // Semi-transparent white background for contrast
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Adds a shadow for better visibility
              }}
            >
              <h3 style={{ color: "#593D3D" }}>{project.title}</h3>
              <p>
                <strong>Description:</strong> {project.description}
              </p>
              <p>
                <strong>Bids Received:</strong> {project.bids.length}
              </p>
              <p>
                <strong>Progress:</strong>{" "}
                <span
                  style={{
                    color: project.progress === 100 ? "green" : "orange",
                  }}
                >
                  {project.progress}%
                </span>
              </p>
              <p>
                <strong>Budget:</strong> ${project.budget}
              </p>
              <p>
                <strong>Deadline:</strong>{" "}
                {new Date(project.deadline).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "#ffffff" }}>No projects posted yet.</p>
      )}
    </div>
  );
};

export default ClientDashboard;