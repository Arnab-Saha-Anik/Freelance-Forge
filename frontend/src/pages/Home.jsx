import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Freelance Forge';
  }, []);

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '20px',
        backgroundImage: 'url("https://img.freepik.com/premium-vector/working-top-view-male-employee-is-thinking-finance-accounting-find-balance-sheet-establishment-company-flat-style-cartoon-illustration-vector_610956-846.jpg?w=740")' ,// Replace with the correct path to your image
        backgroundSize: 'cover', // Ensures the image covers the entire background
        backgroundPosition: 'center', // Centers the image
        backgroundRepeat: 'no-repeat', // Prevents the image from repeating
        minHeight: '100vh',
      }}
    >
      <h1 style={{ color: '#ffffff' }}>Welcome to the Freelance Forge</h1>
      <p style={{ color: '#ffffff' }}>Learn more, develop more!</p>
      <div style={{ marginTop: '20px' }}>
        <button
          style={{
            padding: '10px 20px',
            margin: '10px',
            backgroundColor: '#FFA500',
            color: '#000',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#FFB347')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#FFA500')}
          onClick={() => navigate('/register')}
        >
          Register
        </button>
        <button
          style={{
            padding: '10px 20px',
            margin: '10px',
            backgroundColor: '#FFA500',
            color: '#000',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#FFB347')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#FFA500')}
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default HomePage;