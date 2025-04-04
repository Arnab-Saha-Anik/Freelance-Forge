import React, { useState, useEffect } from "react";

const ClientDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
  });

  // Get the logged-in client's ID (e.g., from localStorage or global state)
  const loggedInClientId = localStorage.getItem("clientId"); // Replace with your auth logic

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/projects?clientId=${loggedInClientId}`
        );
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, [loggedInClientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": loggedInClientId, // Pass the logged-in client's ID
        },
        body: JSON.stringify(newProject),
      });

      if (response.ok) {
        const createdProject = await response.json();
        setProjects([...projects, createdProject]);
        setNewProject({
          title: "",
          description: "",
          budget: "",
          deadline: "",
        });
      } else {
        console.error("Error creating project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/projects/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": loggedInClientId, // Pass the logged-in client's ID
        },
      });
  
      if (response.ok) {
        setProjects(projects.filter((project) => project._id !== id));
      } else {
        const errorData = await response.json();
        console.error("Error deleting project:", errorData.message);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Client Dashboard</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Project Title"
          value={newProject.title}
          onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
          required
          style={{ padding: "10px", marginRight: "10px" }}
        />
        <input
          type="text"
          placeholder="Project Description"
          value={newProject.description}
          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
          required
          style={{ padding: "10px", marginRight: "10px" }}
        />
        <input
          type="number"
          placeholder="Budget"
          value={newProject.budget}
          onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
          required
          style={{ padding: "10px", marginRight: "10px" }}
        />
        <input
          type="date"
          placeholder="Deadline"
          value={newProject.deadline}
          onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
          required
          style={{ padding: "10px", marginRight: "10px" }}
        />
        <button type="submit" style={{ padding: "10px" }}>
          Add Project
        </button>
      </form>

      <input
        type="text"
        placeholder="Search projects..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: "10px", marginBottom: "20px" }}
      />

      {loading ? (
        <p>Loading projects...</p>
      ) : filteredProjects.length > 0 ? (
        <div>
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                margin: "10px",
                backgroundColor: project.isOwner ? "#D1FFD1" : "#FFD1DC",
              }}
            >
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <p>Budget: ${project.budget}</p>
              <p>Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
              <p>Progress: {project.progress}</p>
              <p>Bids Received: {project.bids.length}</p>
              {project.isOwner && (
                <button
                  onClick={() => handleDelete(project._id)}
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    cursor: "pointer",
                    marginRight: "10px",
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No projects found.</p>
      )}
    </div>
  );
};

export default ClientDashboard;