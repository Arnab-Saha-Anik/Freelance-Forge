import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { handleGlobalLogout } from "../../utils/logout";

const FreelancerDashboard = () => {
  const [showBidModal, setShowBidModal] = useState(false); 
  const [selectedProject, setSelectedProject] = useState(null); 
  const [bidAmount, setBidAmount] = useState(""); 
  const [showLearningMaterials, setShowLearningMaterials] = useState(false); 
  const [projects, setProjects] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [freelancerData, setFreelancerData] = useState({
    earnings: 0,
    reviews: 0,
    projectsCompleted: 0,
  }); 
  const [userName, setUserName] = useState("Loading..."); 
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileExists, setProfileExists] = useState(false); 
  const [loadingProfile, setLoadingProfile] = useState(true); 
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHireOffers, setShowHireOffers] = useState(false);
  const [hireOffers, setHireOffers] = useState([]);
  const [myBids, setMyBids] = useState({}); // Store bids for all projects
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [showSelectedBids, setShowSelectedBids] = useState(false);
  const [selectedBids, setSelectedBids] = useState([]); // Add state for selected bids
  const [showActivityHistory, setShowActivityHistory] = useState(false); // Add state for activity history
  const [activityLogs, setActivityLogs] = useState([]); // Add state for activity logs
  const [learningSearchQuery, setLearningSearchQuery] = useState("");
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState([]);
  const navigate = useNavigate(); 
  const location = useLocation(); 

  const token = location.state?.token || localStorage.getItem("token");
  const userId = token ? JSON.parse(atob(token.split(".")[1])).id : null; 

  // Define the learningMaterials array first
const learningMaterials = [
  {
    id: 1,
    title: "React Documentation",
    description: "Learn React from the official documentation.",
    link: "https://reactjs.org/docs/getting-started.html",
  },
  {
    id: 2,
    title: "JavaScript Info",
    description: "A comprehensive guide to modern JavaScript.",
    link: "https://javascript.info/",
  },
  {
    id: 3,
    title: "MDN Web Docs",
    description: "Explore web development resources from MDN.",
    link: "https://developer.mozilla.org/en-US/",
  },
  {
    id: 4,
    title: "FreeCodeCamp",
    description: "Learn to code for free with FreeCodeCamp.",
    link: "https://www.freecodecamp.org/",
  },
];

// Then initialize the state
const [filteredLearningMaterials, setFilteredLearningMaterials] = useState(learningMaterials);

  useEffect(() => {
    document.title = "Freelance Forge - Freelancer Dashboard";

    if (!token) {
      console.error("No token found");
      setUserName("Error fetching name");
      navigate("/login"); 
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const response = await fetch("http://localhost:5000/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserName(data.name); 
        } else {
          console.error("Failed to fetch user info");
          setUserName("Error fetching name");
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
        setUserName("Error fetching name");
      }
    };

    const fetchFreelancerData = async () => {
      try {
        const userId = JSON.parse(atob(token.split(".")[1])).id; 
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

    fetchUserInfo(); 
    fetchFreelancerData();
  }, [navigate, userId, token]);

  useEffect(() => {
    const fetchProfileExistence = async () => {
      setLoadingProfile(true); 
      try {
        const userId = JSON.parse(atob(token.split(".")[1])).id; 
        
        const response = await fetch(`http://localhost:5000/freelancers/check/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfileExists(data.exists); 
        } else {
          setProfileExists(false); 
        }
      } catch (err) {
        console.error("Error checking profile existence:", err);
        setProfileExists(false); 
      } finally {
        setLoadingProfile(false); 
      }
    };

    fetchProfileExistence();
  }, [token]);

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
  }, [token]);

  const fetchHireOffers = async () => {
    try {
      const response = await fetch("http://localhost:5000/direct-hire/freelancer", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHireOffers(data);
      } else {
        console.error("Failed to fetch hire offers.");
      }
    } catch (error) {
      console.error("Error fetching hire offers:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const checkUserExists = useCallback(async () => {
    try {
      console.log("Checking if user exists..."); 
      const response = await fetch(`http://localhost:5000/users/check/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status); 
      if (!response.ok) {
        console.log("User does not exist. Triggering logout."); 
        setTimeout(() => {
          handleGlobalLogout(navigate); 
        }, 0);
      } else {
        console.log("User exists. No action needed."); 
      }
    } catch (err) {
      console.error("Error checking user existence:", err);
      
      setTimeout(() => {
        handleGlobalLogout(navigate); 
      }, 0);
    }
  }, [userId, token, navigate]);

  useEffect(() => {
    console.log("useEffect triggered"); 

    if (!token) {
      navigate("/login"); 
      return;
    }

    const interval = setInterval(checkUserExists, 1000);

    return () => clearInterval(interval); 
  }, [token, navigate, checkUserExists]);

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    navigate("/login"); 
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
  
    if (!token) {
      setPopupMessage("No token found. Please log in again.");
      setShowPopup(true);
      return;
    }
  
    if (!profileExists) {
      setPopupMessage("You have to create your freelancer profile to submit the bid.");
      setShowPopup(true);
      return;
    }
  
    try {
      const url = myBids[selectedProject._id]
        ? `http://localhost:5000/bids/${myBids[selectedProject._id]._id}` // Update existing bid
        : `http://localhost:5000/bids/${selectedProject._id}/bid`; // Create new bid
  
      const method = myBids[selectedProject._id] ? "PUT" : "POST"; // Determine method
  
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bidAmount }),
      });
  
      if (response.ok) {
        const data = await response.json();
        alert(
          myBids[selectedProject._id]
            ? `Your bid has been updated to $${bidAmount} for "${selectedProject.title}"`
            : `Your bid of $${bidAmount} has been submitted for "${selectedProject.title}"`
        );
  
        // Update the myBids state
        setMyBids((prevBids) => ({
          ...prevBids,
          [selectedProject._id]: data.bid,
        }));
  
        setShowBidModal(false); // Close the modal
        setBidAmount(""); // Reset the bid amount
      } else {
        const data = await response.json();
        alert(data.error || "Failed to submit/update bid. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting/updating bid:", err);
      alert("An error occurred while submitting/updating your bid.");
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
        setNotifications(notifications.filter((n) => n._id !== notificationId));
      } else {
        console.error("Failed to delete notification.");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleAcceptOffer = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/direct-hire/accept/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Congratulations! Start working on this project and maintain the deadline!");
        fetchProjects(); // Refresh the projects list
        fetchHireOffers(); // Refresh the list of pending offers
      } else {
        const data = await response.json();
        alert(data.error || "Failed to accept the project.");
      }
    } catch (error) {
      console.error("Error accepting project:", error);
      alert("An error occurred while accepting the project.");
    }
  };

  const handleRejectOffer = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/direct-hire/reject/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Project rejected successfully.");
        window.location.reload(); // Reload the page
      } else {
        const data = await response.json();
        alert(data.error || "Failed to reject the project.");
      }
    } catch (error) {
      console.error("Error rejecting project:", error);
      alert("An error occurred while rejecting the project.");
    }
  };

  const fetchMyBid = useCallback(async (projectId) => {
    try {
      const response = await fetch(`http://localhost:5000/bids/${projectId}/my-bid`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data; // Return the bid data
      } else {
        return null; // No bid found
      }
    } catch (error) {
      console.error("Error fetching bid:", error);
      return null;
    }
  }, [token]); // Add 'token' as a dependency

  useEffect(() => {
    const fetchAllBids = async () => {
      const bids = {};
      for (const project of projects) {
        const bid = await fetchMyBid(project._id);
        bids[project._id] = bid;
      }
      setMyBids(bids);
    };

    if (projects.length > 0) {
      fetchAllBids();
    }
  }, [projects, fetchMyBid]); // Include 'fetchMyBid' in the dependency array

  const handleAcceptBid = async (bidId) => {
    try {
      const response = await fetch(`http://localhost:5000/bids/accept/${bidId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        alert("Bid accepted successfully! Now, work on this project maintaining the deadline.");
        window.location.reload(); // Reload the page
      } else {
        const data = await response.json();
        alert(data.error || "Failed to accept bid.");
      }
    } catch (error) {
      console.error("Error accepting bid:", error);
      alert("An error occurred while accepting the bid.");
    }
  };
  
  const handleRejectBid = async (bidId) => {
    try {
      const response = await fetch(`http://localhost:5000/bids/reject/${bidId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        alert("Bid rejected successfully.");
        window.location.reload(); // Reload the page
      } else {
        const data = await response.json();
        alert(data.error || "Failed to reject bid.");
      }
    } catch (error) {
      console.error("Error rejecting bid:", error);
      alert("An error occurred while rejecting the bid.");
    }
  };


  const fetchSelectedBids = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/bids/selected", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedBids(data);
      } else {
        console.error("Failed to fetch selected bids.");
      }
    } catch (error) {
      console.error("Error fetching selected bids:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchSelectedBids();
  }, [fetchSelectedBids]);

  const fetchActivityLogs = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/activities", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActivityLogs(data);
      } else {
        console.error("Failed to fetch activity logs.");
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    }
  }, [token]);

  const fetchProjects = useCallback(async () => {
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

      // Separate accepted projects and other projects
      const acceptedProjects = data.filter(
        (project) => project.status === "accepted" && project.acceptedFreelancer === userId
      );
      const otherProjects = data.filter(
        (project) => !(project.status === "accepted" && project.acceptedFreelancer === userId)
      );

      // Combine accepted projects on top and other projects below
      setProjects([...acceptedProjects, ...otherProjects]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, userId]); // Add token and userId as dependencies

  // Ensure fetchProjects is called in useEffect
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]); // Add fetchProjects to the dependency array

  const updateCompletionPercentage = async (projectId, percentage) => {
    try {
      const response = await fetch(`http://localhost:5000/projects/update-completion/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completedpercentage: percentage }),
      });
  
      if (response.ok) {
        alert("Project completion percentage updated successfully.");
        fetchProjects(); // Refresh the projects list
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update project completion percentage.");
      }
    } catch (error) {
      console.error("Error updating project completion percentage:", error);
      alert("An error occurred while updating the project completion percentage.");
    }
  };


  const handleSearchLearningMaterials = (query) => {
    setLearningSearchQuery(query);
  
    const filtered = learningMaterials.filter(
      (material) =>
        material.title.toLowerCase().includes(query.toLowerCase()) ||
        material.description.toLowerCase().includes(query.toLowerCase())
    );
  
    setFilteredLearningMaterials(filtered);
  };

  const handleSearchProjects = (query) => {
    setProjectSearchQuery(query);
  
    const filtered = projects.filter(
      (project) =>
        project.title.toLowerCase().includes(query.toLowerCase()) ||
        project.budget.toString().includes(query) ||
        new Date(project.deadline).toLocaleDateString().includes(query) ||
        (project.client?.email &&
          project.client.email.toLowerCase().includes(query.toLowerCase()))
    );
  
    setFilteredProjects(filtered);
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
      {loadingProfile ? (
        <p style={{ textAlign: "center", fontSize: "18px", color: "#FFD700" }}>
          Checking profile existence...
        </p>
      ) : !profileExists ? (
        <p style={{ textAlign: "center", color: "red", fontSize: "18px" }}>
          Please create your profile by clicking <strong>Profile Settings</strong> under <strong>My Account</strong> to work on projects.
        </p>
      ) : null}

      {/* My Account Dropdown */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
        }}
      >
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            backgroundColor: "#007BFF",
            color: "#FFFFFF",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#007BFF")}
        >
          My Account {dropdownOpen ? "▲" : "▼"}
        </button>

        {dropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              right: "0",
              backgroundColor: "#444444",
              color: "#FFFFFF",
              borderRadius: "10px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              padding: "15px",
              minWidth: "250px",
            }}
          >
            <ul style={{ listStyleType: "none", margin: 0, padding: 0 }}>
              <li style={{ marginBottom: "10px" }}>
                <span style={{ color: "#FFD700", fontWeight: "bold" }}>Earnings:</span> $
                {profileExists ? freelancerData.earnings : 0}
              </li>
              <li style={{ marginBottom: "10px" }}>
                <span style={{ color: "#FFD700", fontWeight: "bold" }}>Reviews:</span>{" "}
                {profileExists ? freelancerData.reviews : 0}/5
              </li>
              <li style={{ marginBottom: "10px" }}>
                <span style={{ color: "#FFD700", fontWeight: "bold" }}>Projects Completed:</span>{" "}
                {profileExists ? freelancerData.projectsCompleted : 0}
              </li>
              <li style={{ marginTop: "20px", borderTop: "1px solid #FFD700", paddingTop: "10px" }}>
                <button
                  onClick={() => navigate("/freelancer-dashboard/profile", { state: { token } })}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#FFD700",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: "18px",
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
              <li style={{ marginTop: "10px" }}>
                <button
                  onClick={() => {
                    setShowHireOffers(!showHireOffers);
                    if (!showHireOffers) fetchHireOffers();
                  }}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#FFD700",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: "18px",
                    fontWeight: "bold",
                    padding: 0,
                    display: "block",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  Hire Offers
                </button>
              </li>
              <li style={{ marginTop: "10px" }}>
                <button
                  onClick={() => {
                    setShowSelectedBids(!showSelectedBids);
                    if (!showSelectedBids) fetchSelectedBids(); // Fetch selected bids when toggling
                  }}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#FFD700",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: "18px",
                    fontWeight: "bold",
                    padding: 0,
                    display: "block",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  Bids Selected
                </button>
              </li>
              <li style={{ marginTop: "10px" }}>
                <button
                  onClick={() => {
                    setShowActivityHistory(!showActivityHistory);
                    if (!showActivityHistory) fetchActivityLogs(); // Fetch activity logs when toggling
                  }}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#FFD700",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: "18px",
                    fontWeight: "bold",
                    padding: 0,
                    display: "block",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  Activity History
                </button>
              </li>
              <li style={{ marginTop: "10px" }}>
                <button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#FF0000",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontSize: "18px",
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

      {/* Notifications Section */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "200px", // Adjusted to place it beside "My Account"
          display: "flex",
          gap: "10px",
        }}
      >
        {/* Notification Button */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          style={{
            backgroundColor: "#007BFF",
            color: "#FFFFFF",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#007BFF")}
        >
          Notifications {showNotifications ? "▲" : "▼"}
        </button>

        {/* Notifications Dropdown */}
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
                    color: "#000000",
                  }}
                >
                  <p style={{ margin: 0 }}>{notification.message}</p>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleDeleteNotification(notification._id)}
                      style={{
                        backgroundColor: "#DC3545",
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
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center", color: "#555" }}>
                No notifications available.
              </p>
            )}
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
            <div style={{ marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="Search learning materials"
                value={learningSearchQuery}
                onChange={(e) => handleSearchLearningMaterials(e.target.value)}
                style={{ padding: "10px", width: "100%", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box" }}
              />
            </div>
            {filteredLearningMaterials.length > 0 ? (
    filteredLearningMaterials.map((material) => (
      <li
        key={material.id}
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#333333",
          borderRadius: "10px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h3 style={{ marginBottom: "10px", color: "#FFD700" }}>{material.title}</h3>
        <p style={{ marginBottom: "10px" }}>{material.description}</p>
        <a
          href={material.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#007BFF", textDecoration: "none" }}
        >
          Visit
        </a>
      </li>
    ))
  ) : (
    <p style={{ textAlign: "center", color: "#FFD700" }}>No learning materials found.</p>
  )}
          </ul>
        )}
      </div>
  <div
  style={{
    marginBottom: "20px",
    padding: "20px",
    backgroundColor: "#444444",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  }}
>
  <input
    type="text"
    placeholder="Search projects using title, budget, deadline, or freelancer email"
    value={projectSearchQuery}
    onChange={(e) => handleSearchProjects(e.target.value)}
    style={{
      padding: "10px",
      width: "100%",
      borderRadius: "5px",
      border: "1px solid #ccc",
      boxSizing: "border-box",
    }}
  />
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
         ) : (projectSearchQuery ? filteredProjects : projects).length === 0 ? (
          <p style={{ textAlign: "center" }}>No projects available.</p>
        ) : (
          <ul style={{ listStyleType: "none", padding: 0, fontSize: "18px" }}>
{(projectSearchQuery ? filteredProjects : projects).map((project) => {
  const myBid = myBids[project._id]; // Get the bid for this project

  return (
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
      <h3 style={{ marginBottom: "10px", color: "#FFD700" }}>Title: {project.title}</h3>
      <p style={{ marginBottom: "10px" }}>Description: {project.description}</p>
      <p style={{ marginBottom: "10px", fontWeight: "bold" }}>Budget: ${project.budget}</p>
      <p style={{ marginBottom: "10px" }}>
        Deadline: {new Date(project.deadline).toLocaleDateString()}
      </p>
      <p style={{ marginBottom: "10px" }}>
        Client Email: {project.client?.email || "N/A"}
      </p>

      {project.status === "accepted" ? (
        project.acceptedFreelancer === userId ? ( // Check if the logged-in freelancer is the accepted one
          <>
            <span
              style={{
                padding: "10px 20px",
                backgroundColor: "#28A745", // Green background
                color: "#FFFFFF", // White text
                borderRadius: "5px",
                fontWeight: "bold",
                display: "inline-block",
                textAlign: "center",
                marginRight: "10px",
              }}
            >
              Accepted
            </span>
            <p style={{ marginBottom: "10px", fontWeight: "bold", color: "#FFD700" }}>
              Current Completion: {project.completedpercentage || 0}%
            </p>
            <button
              style={{
                padding: "10px 20px",
                backgroundColor: "#007BFF",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => {
                const percentage = prompt(
                  `Enter the project completion percentage (0-100):`,
                  project.completedpercentage || 0 // Pre-fill with the current percentage
                );
                if (percentage !== null) {
                  updateCompletionPercentage(project._id, percentage);
                }
              }}
            >
              Update Completion
            </button>
          </>
        ) : null
      ) : myBid ? (
        <>
          <button
            style={{
              padding: "10px 20px",
              backgroundColor: "#007BFF",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginRight: "10px",
            }}
            onClick={() => {
              setSelectedProject(project);
              setBidAmount(myBid.amount); // Pre-fill the bid amount
              setShowBidModal(true);
            }}
          >
            Update Bid
          </button>
          <button
            style={{
              padding: "10px 20px",
              backgroundColor: "#DC3545",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={async () => {
              try {
                const response = await fetch(`http://localhost:5000/bids/${myBid._id}`, {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });

                if (response.ok) {
                  alert("Bid deleted successfully.");
                  setMyBids((prevBids) => {
                    const updatedBids = { ...prevBids };
                    delete updatedBids[project._id];
                    return updatedBids;
                  });
                } else {
                  alert("Failed to delete bid.");
                }
              } catch (error) {
                console.error("Error deleting bid:", error);
                alert("An error occurred while deleting the bid.");
              }
            }}
          >
            Delete Bid
          </button>
        </>
      ) : (
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#007BFF",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => {
            setSelectedProject(project);
            setShowBidModal(true);
          }}
        >
          Bid
        </button>
      )}
    </li>
  );
})}
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
            width: "400px", 
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

      {/* Hire Offers Section */}
      {showHireOffers && (
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
          {/* Close Button */}
          <button
            onClick={() => setShowHireOffers(false)}
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

          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Hire Offers</h2>
          {Array.isArray(hireOffers) && hireOffers.length > 0 ? (
            hireOffers.map((offer) => {
              // Ensure the project exists before accessing its properties
              if (!offer.projectId) {
                return null; // Skip this entry if projectId is null or undefined
              }

              return (
                <div
                  key={offer._id}
                  style={{
                    marginBottom: "20px",
                    padding: "15px",
                    backgroundColor: "#333333",
                    borderRadius: "10px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <h3 style={{ marginBottom: "10px", color: "#FFD700" }}>
                    Project: {offer.projectId.title}
                  </h3>
                  <p style={{ marginBottom: "10px" }}>
                    <strong>Description:</strong> {offer.projectId.description}
                  </p>
                  <p style={{ marginBottom: "10px" }}>
                    <strong>Budget:</strong> ${offer.projectId.budget}
                  </p>
                  <p style={{ marginBottom: "10px" }}>
                    <strong>Deadline:</strong>{" "}
                    {new Date(offer.projectId.deadline).toLocaleDateString()}
                  </p>
                  <p style={{ marginBottom: "10px" }}>
                    <strong>Client Name:</strong> {offer.clientId?.name || "N/A"}
                  </p>
                  <p style={{ marginBottom: "10px" }}>
                    <strong>Client Email:</strong> {offer.clientId?.email || "N/A"}
                  </p>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleAcceptOffer(offer._id)}
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#28A745",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectOffer(offer._id)}
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#DC3545",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ textAlign: "center", color: "#FFD700", fontSize: "18px" }}>
              No hire offers available now!
            </p>
          )}
        </div>
      )}
      {showPopup && <Popup message={popupMessage} onClose={() => setShowPopup(false)} />}
       
      {showSelectedBids && (
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
            onClick={() => setShowSelectedBids(false)}
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

          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Bids Selected</h2>
          {selectedBids.length > 0 ? (
            selectedBids.map((bid) => (
              <div
                key={bid.bidId}
                style={{
                  marginBottom: "20px",
                  padding: "15px",
                  backgroundColor: "#333333",
                  borderRadius: "10px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                }}
              >
                <h3 style={{ marginBottom: "10px", color: "#FFD700" }}>
                  Project: {bid.project?.title || "N/A"}
                </h3>
                <p style={{ marginBottom: "10px" }}>
                  <strong>Description:</strong> {bid.project?.description || "N/A"}
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>Budget:</strong> ${bid.project?.budget || 0}
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>Deadline:</strong>{" "}
                  {bid.project?.deadline
                    ? new Date(bid.project.deadline).toLocaleDateString()
                    : "N/A"}
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>Client Email:</strong> {bid.client?.email || "N/A"}
                </p>
                <p style={{ marginBottom: "10px" }}>
                  <strong>Bid Amount:</strong> ${bid.bidAmount}
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  {bid.status === "accepted" ? (
                    <span
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#28A745",
                        color: "#FFFFFF",
                        borderRadius: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      Accepted
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAcceptBid(bid.bidId)}
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#007BFF",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectBid(bid.bidId)}
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#DC3545",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", color: "#FFD700", fontSize: "18px" }}>
              No selected bids available.
            </p>
          )}
        </div>
      )}
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
    </div>
  );
};

const Popup = ({ message, onClose }) => {
  return (
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
      <p style={{ marginBottom: "20px", color: "#333333" }}>{message}</p>
      <button
        onClick={onClose}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007BFF",
          color: "#FFFFFF",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        OK
      </button>
    </div>
  );
};

export default FreelancerDashboard;