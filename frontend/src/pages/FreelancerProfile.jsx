import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const FreelancerProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    skills: "",
    portfolio: "",
    experience: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [deleteData, setDeleteData] = useState({
    email: "",
    password: "",
  });
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = JSON.parse(atob(token.split(".")[1])).id;

        const response = await fetch(`http://localhost:5000/freelancers/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile({
            name: data.name || "",
            skills: data.skills ? data.skills.join(", ") : "",
            portfolio: data.portfolio || "",
            experience: data.experience || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleDeleteChange = (e) => {
    setDeleteData({ ...deleteData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const userId = JSON.parse(atob(token.split(".")[1])).id;

      const response = await fetch(`http://localhost:5000/freelancers/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          skills: profile.skills.split(",").map((skill) => skill.trim()),
          portfolio: profile.portfolio,
          experience: profile.experience,
        }),
      });

      if (response.ok) {
        setMessage("Profile updated successfully!");
      } else {
        setMessage("Failed to update profile.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage("An error occurred.");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/users/update-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      if (response.ok) {
        setMessage("Password updated successfully!");
      } else {
        setMessage("Failed to update password.");
      }
    } catch (err) {
      console.error("Error updating password:", err);
      setMessage("An error occurred.");
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch("http://localhost:5000/users/delete", {
        method: "DELETE", // Use DELETE method
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include token for authentication
        },
        body: JSON.stringify(deleteData), // Send email and password
      });
  
      if (response.ok) {
        alert("Account deleted successfully!");
        navigate("/register"); // Redirect to the registration page
      } else {
        const data = await response.json();
        setMessage(data.error || "Failed to delete account.");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      setMessage("An error occurred.");
    }
  };
  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Freelancer Profile</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleProfileSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleProfileChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            placeholder="Enter your name"
            required
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Skills (comma-separated):</label>
          <input
            type="text"
            name="skills"
            value={profile.skills}
            onChange={handleProfileChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            placeholder="Enter your skills"
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Portfolio URL:</label>
          <input
            type="text"
            name="portfolio"
            value={profile.portfolio}
            onChange={handleProfileChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            placeholder="Enter your portfolio URL"
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Experience:</label>
          <textarea
            name="experience"
            value={profile.experience}
            onChange={handleProfileChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            placeholder="Describe your experience"
          />
        </div>
        <button type="submit" style={{ padding: "10px 15px" }}>
          Update Profile
        </button>
      </form>

      <h2 style={{ marginTop: "40px" }}>Update Password</h2>
      <form onSubmit={handlePasswordSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Current Password:</label>
          <input
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            required
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>New Password:</label>
          <input
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            required
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Confirm New Password:</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            required
          />
        </div>
        <button type="submit" style={{ padding: "10px 15px" }}>
          Update Password
        </button>
      </form>

      <h2 style={{ marginTop: "40px" }}>Delete Account</h2>
      <button
        onClick={() => setShowDeleteForm(!showDeleteForm)}
        style={{
          padding: "10px 15px",
          backgroundColor: "red",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Delete Account ▼
      </button>
      {showDeleteForm && (
        <form onSubmit={handleDeleteAccount} style={{ marginTop: "20px" }}>
          <div style={{ marginBottom: "10px" }}>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={deleteData.email}
              onChange={handleDeleteChange}
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              required
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={deleteData.password}
              onChange={handleDeleteChange}
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
              required
            />
          </div>
          <button type="submit" style={{ padding: "10px 15px", backgroundColor: "red", color: "white" }}>
            Confirm Delete
          </button>
        </form>
      )}
    </div>
  );
};

export default FreelancerProfile;