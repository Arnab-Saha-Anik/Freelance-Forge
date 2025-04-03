import React, { useState, useEffect } from "react";

const ClientDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input

  useEffect(() => {
    // Fetch projects from the backend
    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/projects"); // Replace with your backend API endpoint
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

  // Filter projects based on the search term
  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (projectId) => {
    alert(`Project with ID ${projectId} selected!`);
  };

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
      <h1 style={{ color: "rgba(230, 244, 205, 0.9)",}}>Client Dashboard</h1>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            width: "300px",
            boxSizing: "border-box",
          }}
        />
      </div>
      {loading ? (
        <p style={{ color: "#ffffff" }}>Loading projects...</p>
      ) : filteredProjects.length > 0 ? (
        <div>
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "5px",
                padding: "15px",
                margin: "10px auto",
                maxWidth: "600px",
                textAlign: "left",
                backgroundColor: "rgba(230, 244, 205, 0.9)", // Semi-transparent white background for contrast
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
              <button
                onClick={() => handleSelect(project.id)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#FFA500",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#FFA500")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#FFA500")}
              >
                Select
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "#ffffff" }}>No projects match your search.</p>
      )}
    </div>
  );
};

export default ClientDashboard;