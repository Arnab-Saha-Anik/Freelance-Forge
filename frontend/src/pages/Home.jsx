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
        backgroundImage: 'url("https://img.freepik.com/free-vector/call-center-agent-concept_23-2147939653.jpg?t=st=1743675998~exp=1743679598~hmac=eb1814a83ed06fd9232524a84dc64e8859824c2fe47ee7dffe7adf2d77b7b59a&w=826")',
        backgroundSize: 'cover', // Ensures the image covers the entire background
        backgroundPosition: 'center', // Centers the image
        backgroundRepeat: 'no-repeat', // Prevents the image from repeating
        minHeight: '100vh',
      }}
    >
      <h1 style={{ color: '#000000' }}>Welcome to the Freelance Forge</h1>
      <p style={{ color: '#000000' }}>Learn more, develop more!</p>
      <div style={{ marginTop: '20px' }}>
        <button
          style={{
            padding: '10px 20px',
            margin: '10px',
            backgroundColor: '#ADFF2F',
            color: '#000',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#ADFF2F')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#ADFF2F')}
          onClick={() => navigate('/register')}
        >
          Register
        </button>
        <button
          style={{
            padding: '10px 20px',
            margin: '10px',
            backgroundColor: '#ADFF2F',
            color: '#000',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#ADFF2F')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#ADFF2F')}
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default HomePage;