import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', padding: '15px', backgroundColor: '#000000', borderBottom: '1px solid #ddd' }}>
      <ul style={{ listStyleType: 'none', display: 'flex', alignItems: 'center', margin: 0, padding: 0, flex: 1 }}>
        <li style={{ margin: '0 15px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#007BFF' }}>Freelance Forge</Link>
        </li>
      </ul>
      <ul style={{ listStyleType: 'none', display: 'flex', justifyContent: 'center', margin: 0, padding: 0 }}>
        <Link
          to="/login"
          style={{
            textDecoration: 'none',
            margin: '0 15px',
            padding: '10px',
            border: '1px solid #007BFF',
            borderRadius: '5px',
            transition: 'background-color 0.3s, color 0.3s',
            cursor: 'pointer',
            color: '#007BFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#007BFF';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#007BFF';
          }}
        >
          Login
        </Link>
        <Link
          to="/register"
          style={{
            textDecoration: 'none',
            margin: '0 15px',
            padding: '10px',
            border: '1px solid #007BFF',
            borderRadius: '5px',
            transition: 'background-color 0.3s, color 0.3s',
            cursor: 'pointer',
            color: '#007BFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#007BFF';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#007BFF';
          }}
        >
          Register
        </Link>
        
      </ul>
    </nav>
  );
};

export default Navbar;