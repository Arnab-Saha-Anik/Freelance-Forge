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
  const [username, setUsername] = useState("Loading..."); 
  const [showProjects, setShowProjects] = useState(false);
  const [showPostProject, setShowPostProject] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingFreelancers, setLoadingFreelancers] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [popupMessage, setPopupMessage] = useState(""); 
  const [popupType, setPopupType] = useState(""); 
  const [deleteAccountInfo, setDeleteAccountInfo] = useState({
    email: "",
    currentPassword: "",
  });
  const [editProject, setEditProject] = useState({
    id: null,
    budget: "",
    deadline: "",
  });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const token = localStorage.getItem("token"); 
  const loggedInClientId = token ? JSON.parse(atob(token.split(".")[1])).id : null; 
  const navigate = useNavigate();

  
  useEffect(() => {
    if (token) {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      setUsername(decodedToken.name || "Client");
    }
  }, [token]);

  
  const checkUserExists = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/users/check/${loggedInClientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        
        localStorage.removeItem("token"); 
        navigate("/login"); 
      }
    } catch (err) {
      console.error("Error checking user existence:", err);
      alert("An admin has deleted your account. You will now be logged out.");
      localStorage.removeItem("token"); 
      navigate("/login"); 
    }
  }, [loggedInClientId, token, navigate]);

  
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const interval = setInterval(checkUserExists, 1000);
    return () => clearInterval(interval); 
  }, [checkUserExists, token, navigate]);

  
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

  
  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const response = await fetch("http://localhost:5000/projects/client/projects", {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data); 
      } else {
        console.error("Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoadingProjects(false);
    }
  }, [token]);


  const fetchFreelancers = useCallback(async () => {
    setLoadingFreelancers(true);
    try {
      const response = await fetch(`http://localhost:5000/users/allfreelancers`); 
      const data = await response.json();
      console.log("Freelancers fetched:", data); 
      setFreelancers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching freelancers:", error);
    } finally {
      setLoadingFreelancers(false);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://localhost:5000/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data); // Store notifications in state
      } else {
        console.error("Failed to fetch notifications.");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      const response = await fetch("http://localhost:5000/notifications/mark-as-read", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchNotifications(); // Refresh notifications
      } else {
        console.error("Failed to mark notifications as read.");
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  
  useEffect(() => {
    fetchFreelancers();
  }, [fetchFreelancers]);

  
  useEffect(() => {
    if (showProjects) {
      fetchProjects();
    }
  }, [showProjects, fetchProjects, fetchFreelancers]);

  const handleProjectSubmit = async (e) => {
    e.preventDefault();

    // Validate that the deadline is not in the past
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    if (newProject.deadline < today) {
      alert("The deadline cannot be a date in the past. Please select a valid date.");
      return;
    }

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
          client: loggedInClientId, 
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

    
    if (
      accountInfo.name === originalAccountInfo.name &&
      !accountInfo.newPassword &&
      !accountInfo.confirmNewPassword
    ) {
      setPopupMessage("No changes have been made.");
      setPopupType("error");
      return;
    }

    
    if (!accountInfo.currentPassword) {
      setPopupMessage("Please provide your current password.");
      setPopupType("error");
      return;
    }

    
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
          Authorization: `Bearer ${token}`, 
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
        setOriginalAccountInfo({ name: data.name });
        setAccountInfo((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        }));

        
        const userResponse = await fetch(`http://localhost:5000/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (userResponse.ok) {
          const updatedUser = await userResponse.json();
          setUsername(updatedUser.name); 
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

    // Ensure email and password are provided
    if (!deleteAccountInfo.email || !deleteAccountInfo.currentPassword) {
      alert("Please provide your email and current password.");
      return;
    }

    // Confirm deletion
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
        alert("Account deleted successfully. Taking you to the login page.");
        localStorage.removeItem("token"); // Clear the token
        setDeleteAccountInfo({ email: "", currentPassword: "" }); // Reset the delete account state
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
          Authorization: `Bearer ${token}`, 
        },
      });

      if (response.ok) {
        alert("Project deleted successfully.");
        setProjects(projects.filter((project) => project._id !== projectId));
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete project.");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("An error occurred while deleting the project.");
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:5000/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(notifications.filter((n) => n._id !== notificationId)); // Remove the deleted notification from state
        alert("Notification deleted successfully.");
      } else {
        console.error("Failed to delete notification.");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const isUpdateDisabled =
    !accountInfo.currentPassword ||
    !accountInfo.name ||
    (accountInfo.name === originalAccountInfo.name &&
      !accountInfo.newPassword &&
      !accountInfo.confirmNewPassword) ||
    accountInfo.newPassword !== accountInfo.confirmNewPassword;

  
  const closePopup = () => {
    setPopupMessage("");
    setPopupType("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear the token
    setDeleteAccountInfo({ email: "", currentPassword: "" }); // Reset the delete account state
    window.location.href = "/login"; // Redirect to login page
  };

  useEffect(() => {
    document.title = "Freelance Forge - Client Dashboard"; 
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        textAlign: "center",
        backgroundColor: "#723456",
        color: "#FFFFFF", 
        minHeight: "100vh", 
      }}
    >
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
      {/* My Account and Notifications Dropdown in Top-Right Corner */}
      <div style={{ position: "absolute", top: "20px", right: "40px", display: "flex", gap: "20px" }}>
        {/* Notifications Button */}
        <div>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) {
                markNotificationsAsRead(); // Mark notifications as read when opened
              }
            }}
            style={{
              padding: "10px",
              backgroundColor: "#007BFF",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Notifications
          </button>
          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "50px",
                right: "0",
                backgroundColor: "#FFFFFF",
                border: "1px solid #ddd",
                borderRadius: "5px",
                padding: "10px",
                width: "300px",
                zIndex: 1000,
              }}
            >
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    style={{
                      padding: "10px",
                      borderBottom: "1px solid #ddd",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <p style={{ margin: 0 }}>{notification.message}</p>
                    <button
                      onClick={() => handleDeleteNotification(notification._id)}
                      style={{
                        backgroundColor: "#DC3545", // Red
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        padding: "5px 10px",
                        fontSize: "12px",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: "center", color: "#555" }}>
                  You do not have any notifications.
                </p>
              )}
            </div>
          )}
        </div>

        {/* My Account Button */}
        <div>
          <button
            onClick={() => setShowAccountDropdown(!showAccountDropdown)}
            style={{
              padding: "10px",
              backgroundColor: "#28A745", // Green
              color: "#FFFFFF",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            My Account
          </button>
          {showAccountDropdown && (
            <div
              style={{
                position: "absolute",
                top: "50px",
                right: "20px",
                backgroundColor: "#f9f9f9",
                border: "1px solid #ddd",
                padding: "20px",
                zIndex: 1000,
                width: "300px",
              }}
            >
              <form onSubmit={handleAccountUpdate}>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={accountInfo.name}
                  onChange={handleAccountInfoChange} 
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
                  onChange={handleAccountInfoChange} 
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
                  onChange={handleAccountInfoChange} 
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
                  onChange={handleAccountInfoChange}
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
      </div>
      
      {/* Dropdown to Post a Project */}
      <div>
        <button
          onClick={() => setShowPostProject(!showPostProject)}
          style={{
            padding: "10px",
            marginBottom: "20px",
            backgroundColor: "#28A745", // Green
            color: "#FFFFFF",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
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
            <button
              type="submit"
              style={{
                padding: "10px",
                backgroundColor: "#007BFF",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Post Project
            </button>
          </form>
        )}
      </div>

      {/* Button to See My Projects */}
      <div>
        <button
          onClick={() => setShowProjects(!showProjects)}
          style={{
            padding: "10px",
            marginBottom: "20px",
            backgroundColor: "#FFC107", 
            color: "#000000", 
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
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
                    backgroundColor: "#FFFFFF", 
                    color: "#000000", 
                  }}
                >
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <p>Budget: ${project.budget}</p>
                  <p>Deadline: {new Date(project.deadline).toLocaleDateString()}</p>

                  {editProject.id === project._id ? (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();

                        // Validate that the deadline is not in the past
                        const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
                        if (editProject.deadline < today) {
                          alert("The deadline cannot be a date in the past. Please select a valid date.");
                          return;
                        }

                        try {
                          const response = await fetch(
                            `http://localhost:5000/projects/client/update/${editProject.id}`,
                            {
                              method: "PUT",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({
                                budget: editProject.budget,
                                deadline: editProject.deadline,
                              }),
                            }
                          );

                          if (response.ok) {
                            alert("Project updated successfully!");
                            setEditProject({ id: null, budget: "", deadline: "" });
                            fetchProjects(); // Refresh the projects list
                          } else {
                            const data = await response.json();
                            alert(data.error || "Failed to update project.");
                          }
                        } catch (error) {
                          console.error("Error updating project:", error);
                          alert("An error occurred while updating the project.");
                        }
                      }}
                    >
                      <input
                        type="number"
                        placeholder="New Budget"
                        value={editProject.budget}
                        onChange={(e) =>
                          setEditProject({ ...editProject, budget: e.target.value })
                        }
                        required
                        style={{ padding: "5px", marginRight: "10px" }}
                      />
                      <input
                        type="date"
                        placeholder="New Deadline"
                        value={editProject.deadline}
                        onChange={(e) =>
                          setEditProject({ ...editProject, deadline: e.target.value })
                        }
                        required
                        style={{ padding: "5px", marginRight: "10px" }}
                      />
                      <button
                        type="submit"
                        style={{
                          padding: "5px 10px",
                          backgroundColor: "#28A745", // Green
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditProject({ id: null, budget: "", deadline: "" })}
                        style={{
                          padding: "5px 10px",
                          backgroundColor: "#DC3545", // Red
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          marginLeft: "10px",
                        }}
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          setEditProject({
                            id: project._id,
                            budget: project.budget,
                            deadline: project.deadline.split("T")[0], // Format date for input
                          })
                        }
                        style={{
                          padding: "5px 10px",
                          backgroundColor: "#FFC107", // Yellow
                          color: "#000000",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          marginRight: "10px",
                        }}
                      >
                        Edit Project
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project._id)}
                        style={{
                          padding: "5px 10px",
                          backgroundColor: "#DC3545", // Red
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        Delete Project
                      </button>
                    </>
                  )}
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
        <h2 style={{ color: "#000000" }}>Freelancers</h2> {/* Black text for "Freelancers" */}
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
              <h3 style={{ color: "#000000" }}>{freelancer.name || "Not Given"}</h3> {/* Black text */}
              <p style={{ color: "#000000" }}>Email: {freelancer.email || "Not Given"}</p> {/* Black text */}
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