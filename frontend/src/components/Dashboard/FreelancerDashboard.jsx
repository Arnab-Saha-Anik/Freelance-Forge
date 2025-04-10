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
  const navigate = useNavigate(); 
  const location = useLocation(); 

  
  const token = location.state?.token || localStorage.getItem("token");
  const userId = token ? JSON.parse(atob(token.split(".")[1])).id : null; 

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

    
    const fetchProjects = async () => {
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
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
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
    fetchProjects();
    fetchFreelancerData();
  }, [navigate, token]);

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
        window.alert("An admin has deleted your account. You will now be logged out.");
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

  const handleBidClick = (project) => {
    setSelectedProject(project); 
    setShowBidModal(true);
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("No token found. Please log in again.");
      navigate("/login"); 
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/projects/${selectedProject._id}/bid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bidAmount }),
      });

      if (response.ok) {
        alert(`Your bid of $${bidAmount} has been submitted for "${selectedProject.title}"`);
        setShowBidModal(false); 
        setBidAmount(""); 
      } else {
        alert("Failed to submit bid. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting bid:", err);
      alert("An error occurred while submitting your bid.");
    }
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

      {/* Dropdown Menu */}
      <div
        style={{
          position: "absolute", 
          top: "20px", 
          right: "20px", 
        }}
      >
        {/* My Account Button */}
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
            transition: "background-color 0.3s ease", // Smooth hover transition
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")} // Darker blue on hover
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#007BFF")} // Reset to original color
        >
          My Account {dropdownOpen ? "▲" : "▼"} {/* Arrow changes dynamically */}
        </button>

        {/* Dropdown Menu */}
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
              <li>
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
            <li
              style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "#333333",
                borderRadius: "10px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              }}
            >
              <h3 style={{ marginBottom: "10px", color: "#FFD700" }}>React Documentation</h3>
              <p style={{ marginBottom: "10px" }}>
                Learn React from the official documentation.
              </p>
              <a
                href="https://reactjs.org/docs/getting-started.html"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#007BFF", textDecoration: "none" }}
              >
                Visit React Docs
              </a>
            </li>
            <li
              style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "#333333",
                borderRadius: "10px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              }}
            >
              <h3 style={{ marginBottom: "10px", color: "#FFD700" }}>JavaScript Info</h3>
              <p style={{ marginBottom: "10px" }}>
                A comprehensive guide to modern JavaScript.
              </p>
              <a
                href="https://javascript.info/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#007BFF", textDecoration: "none" }}
              >
                Visit JavaScript Info
              </a>
            </li>
            <li
              style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "#333333",
                borderRadius: "10px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              }}
            >
              <h3 style={{ marginBottom: "10px", color: "#FFD700" }}>MDN Web Docs</h3>
              <p style={{ marginBottom: "10px" }}>
                Explore web development resources from MDN.
              </p>
              <a
                href="https://developer.mozilla.org/en-US/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#007BFF", textDecoration: "none" }}
              >
                Visit MDN Web Docs
              </a>
            </li>
            <li
              style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "#333333",
                borderRadius: "10px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              }}
            >
              <h3 style={{ marginBottom: "10px", color: "#FFD700" }}>FreeCodeCamp</h3>
              <p style={{ marginBottom: "10px" }}>
                Learn to code for free with FreeCodeCamp.
              </p>
              <a
                href="https://www.freecodecamp.org/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#007BFF", textDecoration: "none" }}
              >
                Visit FreeCodeCamp
              </a>
            </li>
          </ul>
        )}
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
                <p style={{ marginBottom: "10px" }}>
                  Deadline: {new Date(project.deadline).toLocaleDateString()}
                </p>
                <button
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#007BFF",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    transition: "background-color 0.3s",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px", 
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#007BFF")}
                  onClick={() => handleBidClick(project)}
                >
                  Bid
                </button>
              </li>
            ))}
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
    </div>
  );
};

export default FreelancerDashboard;