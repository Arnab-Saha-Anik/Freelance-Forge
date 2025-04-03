import React, { useState, useEffect } from "react";

const ClientDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    client: "64a1234567890abcdef12345", // Replace with the logged-in client's ID
    budget: "",
    deadline: "",
  });
  const [selectedProject, setSelectedProject] = useState(null); // State to track the selected project

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:5000/projects");
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []); // Ensure `data` is an array
        setLoading(false);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProject),
      });

      if (response.ok) {
        const createdProject = await response.json();
        setProjects([...projects, createdProject]); // Add the new project to the list
        setNewProject({ title: "", description: "", client: "64a1234567890abcdef12345", budget: "", deadline: "" }); // Reset form
      } else {
        console.error("Error creating project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  // Handle project selection
  const handleSelect = (id) => {
    const project = projects.find((project) => project._id === id);
    setSelectedProject(project); // Set the selected project
    console.log("Selected project:", project); // Log the selected project
  };

  // Filter projects based on the search term
  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Client Dashboard</h1>

      {/* Form to create a new project */}
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

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search projects..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: "10px", marginBottom: "20px" }}
      />

      {/* Display projects */}
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
                backgroundColor: selectedProject?._id === project._id ? "#f0f8ff" : "white", // Highlight selected project
              }}
            >
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <p>Budget: ${project.budget}</p>
              <p>Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
              <p>Progress: {project.progress}</p>
              <p>Bids Received: {project.bids.length}</p>
              <button
                onClick={() => handleSelect(project._id)}
                style={{
                  backgroundColor: "blue",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  cursor: "pointer",
                }}
              >
                Select
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No projects found.</p>
      )}

      {/* Display selected project details */}
      {selectedProject && (
        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ddd" }}>
          <h2>Selected Project</h2>
          <p><strong>Title:</strong> {selectedProject.title}</p>
          <p><strong>Description:</strong> {selectedProject.description}</p>
          <p><strong>Budget:</strong> ${selectedProject.budget}</p>
          <p><strong>Deadline:</strong> {new Date(selectedProject.deadline).toLocaleDateString()}</p>
          <p><strong>Progress:</strong> {selectedProject.progress}</p>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;