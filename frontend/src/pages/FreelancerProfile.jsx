import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const FreelancerProfile = () => {
  const location = useLocation(); // Get the state passed from the dashboard
  const navigate = useNavigate(); // For navigation

  // Use token from state or fallback to localStorage
  const token = location.state?.token || localStorage.getItem("token");

  const [freelancerInfo, setFreelancerInfo] = useState({
    skills: "Not given",
    portfolio: "Not given",
    experience: "Not given",
  });

  const [userInfo, setUserInfo] = useState({
    name: "Not given",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [deleteAccountInfo, setDeleteAccountInfo] = useState({
    email: "",
    currentPassword: "",
  });

  const [originalUserInfo, setOriginalUserInfo] = useState({});
  const [originalFreelancerInfo, setOriginalFreelancerInfo] = useState({});

  useEffect(() => {
    if (!token) {
      navigate("/login"); // Redirect to login if no token is found
      return;
    }

    const fetchFreelancerInfo = async () => {
      try {
        const userId = JSON.parse(atob(token.split(".")[1])).id; // Decode userId from token

        // Fetch freelancer information
        const freelancerResponse = await fetch(`http://localhost:5000/freelancers/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (freelancerResponse.ok) {
          const data = await freelancerResponse.json();
          setFreelancerInfo({
            skills: data.skills.length > 0 ? data.skills.join(", ") : "Not given",
            portfolio: data.portfolio || "Not given",
            experience: data.experience || "Not given",
          });
          setOriginalFreelancerInfo({
            skills: data.skills.length > 0 ? data.skills.join(", ") : "Not given",
            portfolio: data.portfolio || "Not given",
            experience: data.experience || "Not given",
          });
        }

        // Fetch user information
        const userResponse = await fetch(`http://localhost:5000/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserInfo((prev) => ({
            ...prev,
            name: userData.name || "Not given",
          }));
          setOriginalUserInfo({
            name: userData.name || "Not given",
          });
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
      }
    };

    fetchFreelancerInfo();
  }, [token, navigate]);

  const handleFreelancerInfoChange = (e) => {
    setFreelancerInfo({ ...freelancerInfo, [e.target.name]: e.target.value });
  };

  const handleUserInfoChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleDeleteAccountChange = (e) => {
    setDeleteAccountInfo({ ...deleteAccountInfo, [e.target.name]: e.target.value });
  };

  const handleFreelancerInfoSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = JSON.parse(atob(token.split(".")[1])).id;

      const response = await fetch(`http://localhost:5000/freelancers/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skills: freelancerInfo.skills.split(",").map((skill) => skill.trim()),
          portfolio: freelancerInfo.portfolio,
          experience: freelancerInfo.experience,
        }),
      });

      if (response.ok) {
        alert("Freelancer information updated successfully!");
        setOriginalFreelancerInfo(freelancerInfo); // Update original values
      } else {
        alert("Failed to update freelancer information.");
      }
    } catch (err) {
      console.error("Error updating freelancer information:", err);
      alert("An error occurred.");
    }
  };

  const handleUserInfoSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/users/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: userInfo.name,
          currentPassword: userInfo.currentPassword,
          newPassword: userInfo.newPassword,
          confirmPassword: userInfo.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("User information updated successfully!");
        setOriginalUserInfo({ name: userInfo.name }); // Update original values
        setUserInfo((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        alert(data.error || "Failed to update user information.");
      }
    } catch (err) {
      console.error("Error updating user information:", err);
      alert("An error occurred.");
    }
  };

  const handleAccountDelete = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/users/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: deleteAccountInfo.email,
          password: deleteAccountInfo.currentPassword,
        }),
      });

      if (response.ok) {
        alert("Account deleted successfully!");
        localStorage.removeItem("token"); // Remove the token from localStorage
        navigate("/login"); // Redirect to the login page
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete account.");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      alert("An error occurred.");
    }
  };

  const isFreelancerInfoChanged = JSON.stringify(freelancerInfo) !== JSON.stringify(originalFreelancerInfo);
  const isUserInfoChanged =
    userInfo.name !== originalUserInfo.name || userInfo.newPassword.trim() !== "";

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Welcome, {userInfo.name}</h1>
      <p style={{ fontSize: "18px", marginBottom: "20px" }}>
        {userInfo.name}, you can update and delete your profile here.
      </p>

      {/* Freelancer Information Form */}
      <h2>Update Freelancer Information</h2>
      <form onSubmit={handleFreelancerInfoSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Skills (comma-separated):</label>
          <input
            type="text"
            name="skills"
            value={freelancerInfo.skills}
            onChange={handleFreelancerInfoChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            placeholder="Enter your skills"
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Portfolio URL:</label>
          <input
            type="text"
            name="portfolio"
            value={freelancerInfo.portfolio}
            onChange={handleFreelancerInfoChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            placeholder="Enter your portfolio URL"
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Experience:</label>
          <textarea
            name="experience"
            value={freelancerInfo.experience}
            onChange={handleFreelancerInfoChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            placeholder="Describe your experience"
          />
        </div>
        <button type="submit" style={{ padding: "10px 15px" }} disabled={!isFreelancerInfoChanged}>
          Update Freelancer Information
        </button>
      </form>

      {/* User Information Form */}
      <h2 style={{ marginTop: "30px" }}>Update User Information</h2>
      <form onSubmit={handleUserInfoSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={userInfo.name}
            onChange={handleUserInfoChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            placeholder="Enter your name"
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Current Password:</label>
          <input
            type="password"
            name="currentPassword"
            value={userInfo.currentPassword}
            onChange={handleUserInfoChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            placeholder="Enter your current password"
            required
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>New Password:</label>
          <input
            type="password"
            name="newPassword"
            value={userInfo.newPassword}
            onChange={handleUserInfoChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            placeholder="Enter your new password"
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Confirm New Password:</label>
          <input
            type="password"
            name="confirmPassword"
            value={userInfo.confirmPassword}
            onChange={handleUserInfoChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            placeholder="Confirm your new password"
          />
        </div>
        <button type="submit" style={{ padding: "10px 15px" }} disabled={!isUserInfoChanged}>
          Update User Information
        </button>
      </form>

      {/* Delete Account Form */}
      <h2 style={{ marginTop: "30px", color: "red" }}>Delete Account</h2>
      <form onSubmit={handleAccountDelete}>
        <div style={{ marginBottom: "10px" }}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={deleteAccountInfo.email}
            onChange={handleDeleteAccountChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            placeholder="Enter your email"
            required
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Current Password:</label>
          <input
            type="password"
            name="currentPassword"
            value={deleteAccountInfo.currentPassword}
            onChange={handleDeleteAccountChange}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            placeholder="Enter your current password"
            required
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "10px 15px",
            backgroundColor: "red",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Delete Account
        </button>
      </form>
    </div>
  );
};

export default FreelancerProfile;