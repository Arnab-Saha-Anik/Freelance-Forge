import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("default");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role === "default") {
      alert("Please select a valid role (Client or Freelancer) to proceed.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Role:", role);

    if (role === "client") {
      navigate("/client-dashboard");
    } else {
      alert("Registration successful! You can now log in.");
      navigate("/login");
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundImage: 'url("https://torogipro.com/wp-content/uploads/2022/08/windows-tools-1024x819.jpg")', // Replace with the correct path to your image
        backgroundSize: 'cover', // Ensures the image covers the entire background
        backgroundPosition: 'center', // Centers the image
        backgroundRepeat: 'no-repeat', // Prevents the image from repeating
      }}
    >
      <div
        style={{
          width: '400px',
          padding: '30px',
          backgroundColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent white
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(10px)', // Blur effect for the container
        }}
      >
        <h1 style={{ color: '#593D3D', textAlign: 'center' }}>Sign Up</h1>
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <div className="form-group" style={{ marginBottom: '15px', textAlign: 'left' }}>
            <label htmlFor="name" style={{ color: '#593D3D', display: 'block', marginBottom: '5px' }}>Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '15px', textAlign: 'left' }}>
            <label htmlFor="email" style={{ color: '#593D3D', display: 'block', marginBottom: '5px' }}>Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '15px', textAlign: 'left' }}>
            <label htmlFor="password" style={{ color: '#593D3D', display: 'block', marginBottom: '5px' }}>Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '15px', textAlign: 'left' }}>
            <label htmlFor="confirmPassword" style={{ color: '#593D3D', display: 'block', marginBottom: '5px' }}>Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '15px', textAlign: 'left' }}>
            <label htmlFor="role" style={{ color: '#593D3D', display: 'block', marginBottom: '5px' }}>Role:</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <option value="default">Select Role</option>
              <option value="client">Client</option>
              <option value="freelancer">Freelancer</option>
            </select>
          </div>
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              margin: '10px 0',
              backgroundColor: '#1E7E34',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              width: '100%',
              boxSizing: 'border-box',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#28A745')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#1E7E34')}
          >
            Sign Up
          </button>
        </form>
        <p style={{ color: '#593D3D', marginTop: '20px', textAlign: 'center' }}>
          Already signed up?{' '}
          <span
            style={{
              color: '#007BFF',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/login')}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;