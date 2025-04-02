import React, { useState, useEffect } from "react";

const ClientDashboard = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // Fetch posted projects from the backend
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects"); // Fetch data from the backend
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Client Dashboard</h1>
      <h2>Posted Projects</h2>
      {projects.length > 0 ? (
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
              }}
            >
              <h3>{project.title}</h3>
              <p><strong>Description:</strong> {project.description}</p>
              <p><strong>Bids Received:</strong> {project.bids.length}</p>
              <p><strong>Progress:</strong> {project.progress}%</p>
              <p><strong>Budget:</strong> ${project.budget}</p>
              <p><strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No projects posted yet.</p>
      )}
    </div>
  );
};

export default ClientDashboard;