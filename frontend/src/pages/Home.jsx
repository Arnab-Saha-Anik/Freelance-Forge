import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
const HomePage = () => {
const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Freelance Forge'; // Set the browser tab title
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Welcome to the Freelance Forge</h1>
      <p>Learn more, develop more!</p>
      <div style={{ marginTop: '20px' }}>
        <button
          style={{
            padding: '10px 20px',
            margin: '10px',
            backgroundColor: '#007BFF',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/register')}
        >
          Register
        </button>
        <button
          style={{
            padding: '10px 20px',
            margin: '10px',
            backgroundColor: '#28A745',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default HomePage;