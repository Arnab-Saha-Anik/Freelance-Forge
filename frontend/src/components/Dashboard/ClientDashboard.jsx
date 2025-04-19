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
  const [showDirectHireModal, setShowDirectHireModal] = useState(false);
  const [selectedFreelancerId, setSelectedFreelancerId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [bids, setBids] = useState([]); // State to store bids
  const [showBidsModal, setShowBidsModal] = useState(false); // State to control the modal
  const [selectedProjectTitle, setSelectedProjectTitle] = useState(""); // State to store the project title
  const [activityLogs, setActivityLogs] = useState([]); // State to store activity logs
  const [showActivityHistory, setShowActivityHistory] = useState(false); // State to control the activity history modal
  const [showCompletionModal, setShowCompletionModal] = useState(false); // State to control the modal visibility
  const [completionPercentage, setCompletionPercentage] = useState(0); // State to store the completion percentage
  const [searchQuery, setSearchQuery] = useState(""); // Search query
  const [filteredProjects, setFilteredProjects] = useState([]); // Filtered projects
  const [freelancerSearchQuery, setFreelancerSearchQuery] = useState(""); // Search query for freelancers
  const [filteredFreelancers, setFilteredFreelancers] = useState([]); // Filtered freelancers

  const token = localStorage.getItem("clientToken");
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
  }, [token, navigate, loggedInClientId]);

  
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

  const fetchProjectsForDirectHire = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/projects/client/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data); // Store projects in state
      } else {
        console.error("Failed to fetch projects for direct hire.");
      }
    } catch (error) {
      console.error("Error fetching projects for direct hire:", error);
    }
  }, [token]);

  const fetchFreelancers = useCallback(async () => {
    setLoadingFreelancers(true);
    try {
      const response = await fetch("http://localhost:5000/users/allfreelancers");
      const data = await response.json();
      console.log("Freelancers fetched:", data); // Debugging
      setFreelancers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching freelancers:", error);
    } finally {
      setLoadingFreelancers(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        console.error("Failed to fetch notifications.");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [token]); // Add 'token' as a dependency

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

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]); // Include 'fetchNotifications' in the dependency array

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
        fetchProjects(); // Refresh the project list
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete the project.");
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

  const handleDirectHireClick = async (freelancerId) => {
    await fetchProjectsForDirectHire(); // Fetch projects for direct hire
    setSelectedFreelancerId(freelancerId);
    setShowDirectHireModal(true);
  };

  const handleDirectHire = async (projectId) => {
    try {
      const response = await fetch("http://localhost:5000/direct-hire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          freelancerId: selectedFreelancerId,
          projectId,
        }),
      });
  
      if (response.ok) {
        alert("Freelancer has been offered to hire successfully!");
        setShowDirectHireModal(false);
        setSelectedProjectId(null); // Reset selected project
      } else {
        const data = await response.json();
        alert(data.error || "Failed to hire freelancer.");
      }
    } catch (error) {
      console.error("Error hiring freelancer:", error);
      alert("An error occurred while hiring the freelancer.");
    }
  };

  const fetchBidsForProject = async (projectId, projectTitle) => {
    try {
      const response = await fetch(`http://localhost:5000/bids/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setBids(data); // Store the fetched bids in state
        setSelectedProjectTitle(projectTitle); // Set the project title
        setShowBidsModal(true); // Show the modal
      } else {
        console.error("Failed to fetch bids for the project.");
      }
    } catch (error) {
      console.error("Error fetching bids for the project:", error);
    }
  };

  const handleSelectBid = async (bidId) => {
    // Show a confirmation alert
    const confirmSelect = window.confirm(
      "Once you select, you cannot cancel it. Are you sure you want to proceed?"
    );
  
    if (!confirmSelect) {
      return; // Exit the function if the user cancels
    }
  
    try {
      const response = await fetch(`http://localhost:5000/bids/select/${bidId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        alert("Bid selected successfully!");
        setShowBidsModal(false); // Close the modal after selecting a bid
        fetchProjects(); // Refresh the projects list
      } else {
        console.error("Failed to select bid.");
      }
    } catch (error) {
      console.error("Error selecting bid:", error);
    }
  };
  
  const closeBidsModal = () => {
    setShowBidsModal(false);
    setBids([]);
    setSelectedProjectTitle("");
  };

  const fetchActivityLogs = async () => {
    try {
      const response = await fetch("http://localhost:5000/activities", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setActivityLogs(data); // Store the fetched activity logs in state
      } else {
        console.error("Failed to fetch activity logs.");
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    }
  };

  const handleViewCompletion = (percentage, title) => {
    setCompletionPercentage(percentage || 0); // Set the completion percentage
    setSelectedProjectTitle(title); // Set the project title
    setShowCompletionModal(true); // Show the modal
  };

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  
    // Filter projects based on the search query
    const filtered = projects.filter((project) => {
      const queryLower = query.toLowerCase();
      return (
        project.title.toLowerCase().includes(queryLower) ||
        project.description.toLowerCase().includes(queryLower) ||
        project.budget.toString().includes(queryLower) ||
        new Date(project.deadline).toLocaleDateString().includes(queryLower)
      );
    });
  
    setFilteredProjects(filtered);
  }, [projects]); // Dependency array for useCallback

  // Fetch projects when "Show My Projects" is toggled
  useEffect(() => {
    if (showProjects) {
      fetchProjects();
    }
  }, [showProjects, fetchProjects]);

  // Update filtered projects when the projects list changes
  useEffect(() => {
    handleSearch(searchQuery); // Reapply the search filter
  }, [projects, handleSearch, searchQuery]);

  useEffect(() => {
    document.title = "Freelance Forge - Client Dashboard"; 
  }, []);

  // Function to handle freelancer search input changes
  const handleFreelancerSearch = useCallback((query) => {
    setFreelancerSearchQuery(query);
  
    // Filter freelancers based on the search query
    const filtered = freelancers.filter((freelancer) => {
      const queryLower = query.toLowerCase();
      return (
        (freelancer.name && freelancer.name.toLowerCase().includes(queryLower)) ||
        (freelancer.email && freelancer.email.toLowerCase().includes(queryLower)) ||
        (freelancer.profile?.[0]?.skills &&
          freelancer.profile[0].skills.join(", ").toLowerCase().includes(queryLower)) ||
        (freelancer.profile?.[0]?.portfolio &&
          freelancer.profile[0].portfolio.toLowerCase().includes(queryLower)) ||
        (freelancer.profile?.[0]?.experience &&
          freelancer.profile[0].experience.toLowerCase().includes(queryLower))
      );
    });
  
    setFilteredFreelancers(filtered);
  }, [freelancers]); // Dependency array for useCallback

  // Update filtered freelancers when the freelancers list changes
  useEffect(() => {
    handleFreelancerSearch(freelancerSearchQuery); // Reapply the search filter
  }, [freelancers, freelancerSearchQuery, handleFreelancerSearch]); // Include all dependencies

  const handleFundEscrow = async (projectId) => {
    try {
      const response = await fetch(`http://localhost:5000/projects/escrow/fund/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("clientToken")}`,
        },
        body: JSON.stringify({ amount: 1000 }), // Replace 1000 with the actual amount
      });

      if (response.ok) {
        alert("Escrow funded successfully!");
        window.location.reload(); // Reload the page to reflect changes
      } else {
        const data = await response.json();
        alert(data.error || "Failed to fund escrow.");
      }
    } catch (error) {
      console.error("Error funding escrow:", error);
      alert("An error occurred while funding escrow.");
    }
  };

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
                backgroundColor: "#FFFFFF", // White background
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
                    <p
                      style={{
                        margin: 0,
                        color: "#000000", // Change text color to black
                      }}
                    >
                      {notification.message}
                    </p>
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
                <p style={{ textAlign: "center", color: "#555555" /* Dark gray for no notifications */ }}>
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
              </form>

              {/* Activity History Button */}
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <button
                  onClick={() => {
                    setShowActivityHistory(!showActivityHistory);
                    if (!showActivityHistory) fetchActivityLogs(); // Fetch activity logs when toggling
                  }}
                  style={{
                    padding: "10px",
                    backgroundColor: "#FFC107", // Yellow
                    color: "#000000", // Black text
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    width: "100%", // Match the width of other buttons
                    fontWeight: "bold",
                  }}
                >
                  Activity History
                </button>
              </div>

              {/* Logout Button */}
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: "10px",
                    backgroundColor: "#007BFF", // Blue
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    width: "100%", // Match the width of other buttons
                  }}
                >
                  Logout
                </button>
              </div>
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
            {/* Search Bar */}
            <div style={{ marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="Search projects by title, budget, deadline, or description"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                style={{
                  padding: "10px",
                  width: "100%",
                  borderRadius: "5px",
                  border: "1px solid #ddd",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {loadingProjects ? (
              <p>Loading projects...</p>
            ) : filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div
                  key={project._id}
                  style={{
                    border: "1px solid #ddd",
                    padding: "10px",
                    margin: "10px",
                    backgroundColor: "#FFFFFF",
                    color: "#000000",
                    position: "relative", // Add relative positioning for the button
                  }}
                >
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <p>Budget: ${project.budget}</p>
                  <p>Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
                  <p>Escrow Status: {project.escrowStatus || "Not Funded"}</p>


                  {project.status === "accepted" ? (
                    // Show the "View Project Completion Percentage" button for accepted projects
                    <button
                      onClick={() => handleViewCompletion(project.completedpercentage, project.title)}
                      style={{
                        padding: "10px",
                        backgroundColor: "#007BFF", // Blue
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      View Project Completion Percentage
                    </button>
                  ) : editProject.id === project._id ? (
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
                      <button
                        onClick={() => fetchBidsForProject(project._id, project.title)}
                        style={{
                          padding: "5px 10px", // Reduced height
                          backgroundColor: "#007BFF", // Blue
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          marginLeft: "10px",
                          textAlign: "center",
                        }}
                      >
                        View Bids
                      </button>
                      {/* Add Fund Escrow Button */}
                  {project.escrowStatus !== "Funded" && (
                    <button
                      onClick={() => handleFundEscrow(project._id)}
                      style={{
                        padding: "5px 10px", // Reduced height
                          backgroundColor: "#E82FFF", // Purple
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          marginLeft: "10px",
                          textAlign: "center",
                      }}
                    >
                      Fund Escrow
                    </button>
                  )}
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
        <h2 style={{ color: "#000000" }}>Freelancers</h2>

        {/* Search Bar for Freelancers */}
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Search freelancers by name, email, skills, portfolio, or experience"
            value={freelancerSearchQuery}
            onChange={(e) => handleFreelancerSearch(e.target.value)}
            style={{
              padding: "10px",
              width: "100%",
              borderRadius: "5px",
              border: "1px solid #ddd",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Display Freelancers */}
        {loadingFreelancers ? (
          <p>Loading freelancers...</p>
        ) : filteredFreelancers.length > 0 ? (
          filteredFreelancers.map((freelancer) => (
            <div
              key={freelancer._id}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                margin: "10px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <h3 style={{ color: "#000000" }}>{freelancer.name || "Not Given"}</h3>
              <p style={{ color: "#000000" }}>Email: {freelancer.email || "Not Given"}</p>
              <p style={{ color: "#000000" }}>
                Skills: {freelancer.profile?.[0]?.skills?.join(", ") || "Not Provided"}
              </p>
              <p style={{ color: "#000000" }}>
                Portfolio:{" "}
                {freelancer.profile?.[0]?.portfolio ? (
                  <a
                    href={freelancer.profile[0].portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#007BFF" }}
                  >
                    View Portfolio
                  </a>
                ) : (
                  "Not Provided"
                )}
              </p>
              <p style={{ color: "#000000" }}>
                Experience: {freelancer.profile?.[0]?.experience || "Not Provided"}
              </p>
              <button
                onClick={() => handleDirectHireClick(freelancer._id)}
                style={{
                  padding: "10px",
                  backgroundColor: "#28A745",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Direct Hire
              </button>
            </div>
          ))
        ) : (
          <p>No freelancers found.</p>
        )}
      </div>

      {showDirectHireModal && (
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
            width: "400px",
            color: "#000000", // Ensure text color is black
          }}
        >
          <h3>Select a Project to Hire</h3>
          <div style={{ marginBottom: "20px", position: "relative" }}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                padding: "10px",
                backgroundColor: "#007BFF",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
              }}
            >
              {selectedProjectId
                ? projects.find((project) => project._id === selectedProjectId)?.title
                : "Select a Project"}
            </button>
            {isDropdownOpen && (
              <ul
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "0",
                  width: "100%",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  listStyleType: "none",
                  padding: "10px",
                  margin: "0",
                  zIndex: 1000,
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                {projects.map((project) => (
                  <li
                    key={project._id}
                    onClick={() => {
                      setSelectedProjectId(project._id);
                      setIsDropdownOpen(false); // Close the dropdown after selection
                    }}
                    style={{
                      padding: "10px",
                      cursor: "pointer",
                      backgroundColor:
                        selectedProjectId === project._id ? "#007BFF" : "#FFFFFF",
                      color: selectedProjectId === project._id ? "#FFFFFF" : "#000000",
                      borderRadius: "5px",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#007BFF")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor =
                        selectedProjectId === project._id ? "#007BFF" : "#FFFFFF")
                    }
                  >
                    {project.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={() => {
              if (selectedProjectId) {
                handleDirectHire(selectedProjectId);
              } else {
                alert("Please select a project before confirming.");
              }
            }}
            style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: "#28A745", // Green
              color: "#FFFFFF",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Confirm
          </button>
          <button
            onClick={() => setShowDirectHireModal(false)}
            style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: "#DC3545", // Red
              color: "#FFFFFF",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {showBidsModal && (
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
            width: "600px",
            maxHeight: "80vh",
            overflowY: "auto",
            color: "#000000", // Black text
          }}
        >
          <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
            Bids for "{selectedProjectTitle}"
          </h3>
          {bids.length > 0 ? (
            bids.map((bid) => (
              <div
                key={bid._id}
                style={{
                  borderBottom: "1px solid #ddd",
                  padding: "10px 0",
                  marginBottom: "10px",
                }}
              >
                <p>
                  <strong>Freelancer:</strong> {bid.freelancerId.name || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {bid.freelancerId.email || "N/A"}
                </p>
                <p>
                  <strong>Bid Amount:</strong> ${bid.amount}
                </p>
                <button
                  onClick={() => handleSelectBid(bid._id)}
                  style={{
                    padding: "10px",
                    backgroundColor: "#28A745", // Green
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginTop: "10px",
                  }}
                >
                  Select Bid
                </button>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", color: "#555" }}>
              No bids available for this project.
            </p>
          )}
          <button
            onClick={closeBidsModal}
            style={{
              marginTop: "20px",
              padding: "10px",
              backgroundColor: "#DC3545", // Red
              color: "#FFFFFF",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Close
          </button>
        </div>
      )}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
</div>
{showActivityHistory && (
  <div
    style={{
      position: "absolute",
      top: "100px",
      left: "50%",
      transform: "translateX(-50%)",
      padding: "20px",
      backgroundColor: "#444444",
      borderRadius: "10px",
      color: "#FFFFFF",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      zIndex: 1000,
      width: "80%",
    }}
  >
    <button
      onClick={() => setShowActivityHistory(false)}
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        backgroundColor: "#FF0000",
        borderRadius: "50%",
        border: "none",
        color: "#FFFFFF",
        fontSize: "20px",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      ✖
    </button>

    <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Activity History</h2>
    {activityLogs.length > 0 ? (
      activityLogs.map((log, index) => (
        <div
          key={index}
          style={{
            marginBottom: "10px",
            padding: "10px",
            backgroundColor: "#333333",
            borderRadius: "5px",
          }}
        >
          <p>{log.action}</p>
          <p style={{ fontSize: "12px", color: "#AAAAAA" }}>
            {new Date(log.timestamp).toLocaleString()}
          </p>
        </div>
      ))
    ) : (
      <p style={{ textAlign: "center", color: "#FFD700" }}>No activity found.</p>
    )}
  </div>
)}

{showCompletionModal && (
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
    }}
  >
    {/* Display the project title */}
    <h3 style={{ color: "#000000", marginBottom: "10px" }}>{selectedProjectTitle}</h3>
    {/* Display the project completion percentage */}
    <p style={{ color: "#000000" }}>{`Project Completion: ${completionPercentage}%`}</p>
    <button
      onClick={() => setShowCompletionModal(false)} // Close the modal
      style={{
        padding: "10px 20px",
        backgroundColor: "#007BFF",
        color: "#FFFFFF",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontWeight: "bold",
        marginTop: "10px",
      }}
    >
      OK
    </button>
  </div>
)}
    </div>
  );
};

export default ClientDashboard;