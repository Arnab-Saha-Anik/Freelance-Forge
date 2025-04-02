import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Freelance Forge';
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '20px', background: 'linear-gradient(to bottom, #A1045A, #FF007F, #FF6A6A)', minHeight: '100vh' }}>
      <h1 style={{ color: '#000000' }}>Welcome to the Freelance Forge</h1>
      <p style={{ color: '#000000' }}>Learn more, develop more!</p>
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
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#FFA500')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '##FFA500')}
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
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#FFA500')}
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