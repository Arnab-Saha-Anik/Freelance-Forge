import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Freelance Forge';
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#593D3D', minHeight: '100vh' }}>
      <h1 style={{ color: '#FFFFFF' }}>Welcome to the Freelance Forge</h1>
      <p style={{ color: '#FFFFFF' }}>Learn more, develop more!</p>
      <div style={{ marginTop: '20px' }}>
        <button
          style={{
            padding: '10px 20px',
            margin: '10px',
            backgroundColor: '#0056B3',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#007BFF')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#0056B3')}
          onClick={() => navigate('/register')}
        >
          Register
        </button>
        <button
          style={{
            padding: '10px 20px',
            margin: '10px',
            backgroundColor: '#1E7E34',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#28A745')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#1E7E34')}
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default HomePage;