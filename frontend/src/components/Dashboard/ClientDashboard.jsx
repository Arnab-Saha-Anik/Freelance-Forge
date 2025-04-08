import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const ClientDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
  });
  const [accountInfo, setAccountInfo] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    name: "",
  });
  const [originalAccountInfo, setOriginalAccountInfo] = useState({});
  const [username, setUsername] = useState("Loading..."); // State to store the username
  const [showProjects, setShowProjects] = useState(false);
  const [showPostProject, setShowPostProject] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingFreelancers, setLoadingFreelancers] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [popupMessage, setPopupMessage] = useState(""); // Popup message state
  const [popupType, setPopupType] = useState(""); // Popup type (success or error)
  const [deleteAccountInfo, setDeleteAccountInfo] = useState({
    email: "",
    currentPassword: "",
  });

  const token = localStorage.getItem("token"); // Token for authentication
  const loggedInClientId = token ? JSON.parse(atob(token.split(".")[1])).id : null; // Decode client ID from token
  const navigate = useNavigate();

  // Decode the token to extract the username and set initial name
  useEffect(() => {
    if (token) {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setUsername(decodedToken.name || "Client");
    }
  }, [token]);

  // Function to check if the user exists
  const checkUserExists = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/users/check/${loggedInClientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // If the user does not exist, show a popup and log out
        alert("An admin has deleted your account. You will now be logged out.");
        localStorage.removeItem("token"); // Remove the token
        navigate("/login"); // Redirect to the login page
      }
    } catch (err) {
      console.error("Error checking user existence:", err);
      alert("An admin has deleted your account. You will now be logged out.");
      localStorage.removeItem("token"); // Remove the token
      navigate("/login"); // Redirect to the login page
    }
  }, [loggedInClientId, token, navigate]);

  // Periodically check user existence
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const interval = setInterval(checkUserExists, 1000); // Check every second
    return () => clearInterval(interval); // Cleanup on component unmount
  }, [checkUserExists, token, navigate]);

  // Fetch account information from the backend
  useEffect(() => {
    const fetchAccountInfo = async () => {
      try {
        const response = await fetch("http://localhost:5000/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAccountInfo((prev) => ({
            ...prev,
            name: data.name || "",
          }));
          setOriginalAccountInfo({ name: data.name || "" });
          setUsername(data.name || "Client");
        } else {
          console.error("Failed to fetch account info.");
        }
      } catch (error) {
        console.error("Error fetching account info:", error);
      }
    };

    fetchAccountInfo();
  }, [token]);

  // Memoize fetchProjects to avoid re-creation on every render
  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const response = await fetch("http://localhost:5000/projects/client/projects", {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data); // Update the state with the fetched projects
      } else {
        console.error("Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoadingProjects(false);
    }
  }, [token]);

  // Memoize fetchFreelancers to avoid re-creation on every render
  const fetchFreelancers = useCallback(async () => {
    setLoadingFreelancers(true);
    try {
      const response = await fetch(`http://localhost:5000/users/allfreelancers`); // Public route, no token required
      const data = await response.json();
      console.log("Freelancers fetched:", data); // Log the fetched data
      setFreelancers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching freelancers:", error);
    } finally {
      setLoadingFreelancers(false);
    }
  }, []);

  // Fetch freelancers when the component loads
  useEffect(() => {
    fetchFreelancers();
  }, [fetchFreelancers]);

  // Fetch projects and freelancers when toggled
  useEffect(() => {
    if (showProjects) {
      fetchProjects();
    }
  }, [showProjects, fetchProjects, fetchFreelancers]);

  const handleProjectSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/projects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newProject.title,
          description: newProject.description,
          budget: newProject.budget,
          deadline: newProject.deadline,
          client: loggedInClientId, // Pass the client ID
        }),
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
        alert("Project created successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to create project.");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("An error occurred while creating the project.");
    }
  };

  const handleAccountInfoChange = (e) => {
    setAccountInfo({ ...accountInfo, [e.target.name]: e.target.value });
  };

  const handleAccountUpdate = async (e) => {
    e.preventDefault();

    // Validation: Check if no changes are made
    if (
      accountInfo.name === originalAccountInfo.name &&
      !accountInfo.newPassword &&
      !accountInfo.confirmNewPassword
    ) {
      setPopupMessage("No changes have been made.");
      setPopupType("error");
      return;
    }

    // Validation: Check if current password is provided
    if (!accountInfo.currentPassword) {
      setPopupMessage("Please provide your current password.");
      setPopupType("error");
      return;
    }

    // Validation: Check if new password matches confirm password
    if (accountInfo.newPassword !== accountInfo.confirmNewPassword) {
      setPopupMessage("New password and confirm password do not match.");
      setPopupType("error");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/users/client/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
        body: JSON.stringify({
          name: accountInfo.name,
          currentPassword: accountInfo.currentPassword,
          newPassword: accountInfo.newPassword,
          confirmPassword: accountInfo.confirmNewPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPopupMessage("Account updated successfully!");
        setPopupType("success");
        setOriginalAccountInfo({ name: data.name }); // Update original values
        setAccountInfo((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        }));

        // Fetch updated user information and update the username
        const userResponse = await fetch(`http://localhost:5000/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (userResponse.ok) {
          const updatedUser = await userResponse.json();
          setUsername(updatedUser.name); // Update the username state
        }
      } else {
        const data = await response.json();
        setPopupMessage(data.error || "Failed to update account.");
        setPopupType("error");
      }
    } catch (error) {
      console.error("Error updating account:", error);
      setPopupMessage("An error occurred while updating the account.");
      setPopupType("error");
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    if (!deleteAccountInfo.email || !deleteAccountInfo.currentPassword) {
      alert("Please provide your email and current password.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/users/client/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
        body: JSON.stringify({
          email: deleteAccountInfo.email,
          currentPassword: deleteAccountInfo.currentPassword,
        }),
      });

      if (response.ok) {
        alert("Account deleted successfully.");
        localStorage.removeItem("token"); // Clear the token
        window.location.href = "/login"; // Redirect to login page
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete account.");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("An error occurred while deleting the account.");
    }
  };

  const handleDeleteProject = async (projectId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this project? This action cannot be undone."
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/projects/client/delete/${projectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      });

      if (response.ok) {
        alert("Project deleted successfully.");
        setProjects(projects.filter((project) => project._id !== projectId)); // Update the UI
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete project.");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("An error occurred while deleting the project.");
    }
  };

  const isUpdateDisabled =
    !accountInfo.currentPassword ||
    !accountInfo.name ||
    (accountInfo.name === originalAccountInfo.name &&
      !accountInfo.newPassword &&
      !accountInfo.confirmNewPassword) ||
    accountInfo.newPassword !== accountInfo.confirmNewPassword;

  // Function to close the popup message
  const closePopup = () => {
    setPopupMessage("");
    setPopupType("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear the token
    window.location.href = "/login"; // Redirect to login page
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Welcome, {username}</h1>

      {/* Popup Message */}
      {popupMessage && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            backgroundColor: popupType === "success" ? "#4CAF50" : "#f44336",
            color: "white",
            padding: "10px 20px",
            borderRadius: "5px",
            zIndex: 1000,
          }}
        >
          {popupMessage}
          <button
            onClick={closePopup}
            style={{
              marginLeft: "10px",
              backgroundColor: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            ✖
          </button>
        </div>
      )}

      {/* My Account Dropdown in Top-Right Corner */}
      <div style={{ position: "absolute", top: "20px", right: "40px" }}>
        <button
          onClick={() => setShowAccountDropdown(!showAccountDropdown)}
          style={{ padding: "10px" }}
        >
          My Account
        </button>
        {showAccountDropdown && (
          <div
            style={{
              position: "absolute",
              top: "50px",
              right: "20px", // Move the dropdown more to the left
              backgroundColor: "#f9f9f9",
              border: "1px solid #ddd",
              padding: "20px",
              zIndex: 1000,
              width: "300px", // Ensure proper alignment
            }}
          >
            <form onSubmit={handleAccountUpdate}>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={accountInfo.name}
                onChange={handleAccountInfoChange} // Use the function here
                style={{
                  padding: "10px",
                  marginBottom: "10px",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
              <input
                type="password"
                name="currentPassword"
                placeholder="Current Password"
                value={accountInfo.currentPassword}
                onChange={handleAccountInfoChange} // Use the function here
                style={{
                  padding: "10px",
                  marginBottom: "10px",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={accountInfo.newPassword}
                onChange={handleAccountInfoChange} // Use the function here
                style={{
                  padding: "10px",
                  marginBottom: "10px",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
              <input
                type="password"
                name="confirmNewPassword"
                placeholder="Confirm New Password"
                value={accountInfo.confirmNewPassword}
                onChange={handleAccountInfoChange} // Use the function here
                style={{
                  padding: "10px",
                  marginBottom: "10px",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="submit"
                disabled={isUpdateDisabled}
                style={{
                  padding: "10px",
                  backgroundColor: isUpdateDisabled ? "#ccc" : "#007BFF",
                  color: "white",
                  border: "none",
                  cursor: isUpdateDisabled ? "not-allowed" : "pointer",
                  width: "100%",
                }}
              >
                Update Information
              </button>
            </form>
            <form onSubmit={handleDeleteAccount} style={{ marginTop: "20px" }}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={deleteAccountInfo.email}
                onChange={(e) =>
                  setDeleteAccountInfo({ ...deleteAccountInfo, email: e.target.value })
                }
                required
                style={{
                  padding: "10px",
                  marginBottom: "10px",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
              <input
                type="password"
                name="currentPassword"
                placeholder="Current Password"
                value={deleteAccountInfo.currentPassword}
                onChange={(e) =>
                  setDeleteAccountInfo({ ...deleteAccountInfo, currentPassword: e.target.value })
                }
                required
                style={{
                  padding: "10px",
                  marginBottom: "10px",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "10px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Delete Account
              </button>
              {/* Logout Button */}
              <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button
              onClick={handleLogout}
              style={{
              padding: "10px",
              backgroundColor: "#007BFF",
              color: "white",
              border: "none",
              cursor: "pointer",
             }}
            >
             Logout
            </button>
            </div>
            </form>
          </div>
        )}
      </div>
      

      {/* Dropdown to Post a Project */}
      <div>
        <button
          onClick={() => setShowPostProject(!showPostProject)}
          style={{ padding: "10px", marginBottom: "20px" }}
        >
          {showPostProject ? "Hide Post Project" : "Post a Project"}
        </button>
        {showPostProject && (
          <form onSubmit={handleProjectSubmit} style={{ marginBottom: "20px" }}>
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
              Post Project
            </button>
          </form>
        )}
      </div>

      {/* Button to See My Projects */}
      <div>
        <button
          onClick={() => setShowProjects(!showProjects)}
          style={{ padding: "10px", marginBottom: "20px" }}
        >
          {showProjects ? "Hide My Projects" : "See My Projects"}
        </button>
        {showProjects && (
          <div>
            {loadingProjects ? (
              <p>Loading projects...</p>
            ) : projects.length > 0 ? (
              projects.map((project) => (
                <div
                  key={project._id}
                  style={{
                    border: "1px solid #ddd",
                    padding: "10px",
                    margin: "10px",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <p>Budget: ${project.budget}</p>
                  <p>Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
                  <button
                    onClick={() => handleDeleteProject(project._id)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Delete Project
                  </button>
                </div>
              ))
            ) : (
              <p>No projects found.</p>
            )}
          </div>
        )}
      </div>

      {/* Display freelancers */}
      <div>
        <h2>Freelancers</h2>
        {loadingFreelancers ? (
          <p>Loading freelancers...</p>
        ) : freelancers.length > 0 ? (
          freelancers.map((freelancer) => (
            <div
              key={freelancer._id}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                margin: "10px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <h3>{freelancer.name || "Not Given"}</h3>
              <p>Email: {freelancer.email || "Not Given"}</p>
            </div>
          ))
        ) : (
          <p>No freelancers found.</p>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;