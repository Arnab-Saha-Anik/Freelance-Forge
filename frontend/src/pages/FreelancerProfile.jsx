import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const FreelancerProfile = () => {
  const [profile, setProfile] = useState({
    skills: "",
    portfolio: "",
    experience: "",
  });
  const [updateData, setUpdateData] = useState({
    name: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
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
            skills: data.skills.join(", "),
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

  const handleUpdateChange = (e) => {
    setUpdateData({ ...updateData, [e.target.name]: e.target.value });
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

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/users/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        setUpdateMessage("Profile updated successfully!");
      } else {
        setUpdateMessage(data.error || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setUpdateMessage("An error occurred.");
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = JSON.parse(atob(token.split(".")[1])).id;

      const response = await fetch(`http://localhost:5000/freelancers/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage("Profile deleted successfully!");
        navigate("/freelancer-dashboard");
      } else {
        setMessage("Failed to delete profile.");
      }
    } catch (err) {
      console.error("Error deleting profile:", err);
      setMessage("An error occurred.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Freelancer Profile</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleProfileSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Skills (comma-separated):</label>
          <input
            type="text"
            name="skills"
            value={profile.skills}
            onChange={handleProfileChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
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
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Experience:</label>
          <textarea
            name="experience"
            value={profile.experience}
            onChange={handleProfileChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <button type="submit" style={{ padding: "10px 15px", marginRight: "10px" }}>
          Update Profile
        </button>
        <button
          type="button"
          onClick={handleDelete}
          style={{ padding: "10px 15px", backgroundColor: "red", color: "white" }}
        >
          Delete Profile
        </button>
      </form>

      <h2 style={{ marginTop: "40px" }}>Update Account</h2>
      {updateMessage && <p>{updateMessage}</p>}
      <form onSubmit={handleUpdateSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={updateData.name}
            onChange={handleUpdateChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Current Password:</label>
          <input
            type="password"
            name="currentPassword"
            value={updateData.currentPassword}
            onChange={handleUpdateChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            required
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>New Password:</label>
          <input
            type="password"
            name="newPassword"
            value={updateData.newPassword}
            onChange={handleUpdateChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Confirm New Password:</label>
          <input
            type="password"
            name="confirmPassword"
            value={updateData.confirmPassword}
            onChange={handleUpdateChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <button type="submit" style={{ padding: "10px 15px" }}>
          Update Account
        </button>
      </form>
    </div>
  );
};

export default FreelancerProfile;