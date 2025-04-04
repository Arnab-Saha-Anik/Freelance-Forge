import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const location = useLocation(); // Get the current route
  const navigate = useNavigate(); // For navigation after logout
  const isClientDashboard = location.pathname === "/client-dashboard"; // Check if the current route is the client dashboard
  const isFreelancerDashboard = location.pathname === "/freelancer-dashboard"; // Check if the current route is the freelancer dashboard

  const [dropdownOpen, setDropdownOpen] = useState(false); // State to toggle dropdown
  const [freelancerData, setFreelancerData] = useState({
    earnings: 0,
    reviews: 0,
    projectsCompleted: 0,
  }); // State to store freelancer data

  useEffect(() => {
    const fetchFreelancerData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = JSON.parse(atob(token.split(".")[1])).id; // Decode userId from JWT

        const response = await fetch(`http://localhost:5000/freelancers/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in the request
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch freelancer data");
        }

        const data = await response.json();
        setFreelancerData({
          earnings: data.earnings || 0,
          reviews: data.reviews || 0,
          projectsCompleted: data.projectsCompleted || 0,
        });
      } catch (err) {
        console.error("Error fetching freelancer data:", err);
        setFreelancerData({
          earnings: 0,
          reviews: 0,
          projectsCompleted: 0,
        }); // Default values in case of an error
      }
    };

    if (isFreelancerDashboard) {
      fetchFreelancerData();
    }
  }, [isFreelancerDashboard]);

  const handleLogout = () => {
    // Clear any stored tokens or session data
    localStorage.removeItem("token");
    navigate("/"); // Redirect to the homepage
  };

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "15px",
        backgroundColor: "#000000",
        borderBottom: "1px solid #ddd",
      }}
    >
      {/* Left: Freelance Forge */}
      <div style={{ marginLeft: "15px" }}>
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "#007BFF",
            fontSize: "18px",
          }}
        >
          Freelance Forge
        </Link>
      </div>

      {/* Logout Button for Client Dashboard */}
      {isClientDashboard && (
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "red",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      )}

      {/* Dropdown Menu (only on Freelancer Dashboard) */}
      {isFreelancerDashboard && (
        <div style={{ marginRight: "15px", position: "relative" }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              backgroundColor: "#007BFF",
              color: "#FFFFFF",
              border: "none",
              padding: "10px 15px",
              borderRadius: "5px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            My Account
            <span style={{ fontSize: "12px" }}>▼</span> {/* Down arrow */}
          </button>
          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                backgroundColor: "#FFFFFF", // Light background for better visibility
                color: "#000000", // Dark text color for contrast
                border: "1px solid #ddd",
                borderRadius: "5px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                zIndex: 1000,
                padding: "10px",
                minWidth: "200px",
              }}
            >
              <ul style={{ listStyleType: "none", margin: 0, padding: 0 }}>
                <li style={{ marginBottom: "10px" }}>
                  <span style={{ color: "#007BFF", fontWeight: "bold" }}>Earnings:</span> ${freelancerData.earnings}
                </li>
                <li style={{ marginBottom: "10px" }}>
                  <span style={{ color: "#007BFF", fontWeight: "bold" }}>Reviews:</span> {freelancerData.reviews}/5
                </li>
                <li style={{ marginBottom: "10px" }}>
                  <span style={{ color: "#007BFF", fontWeight: "bold" }}>Projects Completed:</span> {freelancerData.projectsCompleted}
                </li>
                <li style={{ marginTop: "10px", borderTop: "1px solid #ddd", paddingTop: "10px" }}>
                  <Link
                    to="/freelancer-dashboard/profile"
                    style={{ textDecoration: "none", color: "#007BFF" }}
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    to="/freelancer-dashboard/profile"
                    style={{ textDecoration: "none", color: "#007BFF" }}
                  >
                    Settings
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;