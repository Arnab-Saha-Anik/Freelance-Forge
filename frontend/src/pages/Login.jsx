import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Email:', email, 'Password:', password);

    if (email === 'freelancer@example.com') {
      navigate('/freelancer-dashboard');
    } else {
      navigate('/client-dashboard');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #87CEEB, #9370DB, #FF69B4, #FFDAB9)', // Gradient background
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Blurred overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backdropFilter: 'blur(10px)', // Blur effect
          zIndex: 1,
        }}
      ></div>

      {/* Login form container */}
      <div
        style={{
          width: '400px',
          padding: '30px',
          backgroundColor: 'rgba(204, 162, 220, 0.8)', // Semi-transparent white
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(10px)',
          zIndex: 2, // Ensure it appears above the blur
        }}
      >
        <h1 style={{ color: '#593D3D', textAlign: 'center' }}>Login</h1>
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
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
            Login
          </button>
        </form>
        <p style={{ color: '#593D3D', marginTop: '20px', textAlign: 'center' }}>
          Didn't sign up yet?{' '}
          <span
            style={{
              color: '#007BFF',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/register')}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;