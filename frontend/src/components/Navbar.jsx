import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation(); // Get the current route
  const isFreelancerDashboard = location.pathname === '/freelancer-dashboard'; // Check if the current route is the freelancer dashboard

  const [dropdownOpen, setDropdownOpen] = useState(false); // State to toggle dropdown

  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', backgroundColor: '#000000', borderBottom: '1px solid #ddd' }}>
      {/* Left: Freelance Forge */}
      <div style={{ marginLeft: '15px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#007BFF', fontSize: '18px' }}>
          Freelance Forge
        </Link>
      </div>

      {/* Dropdown Menu (only on Freelancer Dashboard) */}
      {isFreelancerDashboard && (
        <div style={{ marginRight: '15px', position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              backgroundColor: '#007BFF',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            My Account
            <span style={{ fontSize: '12px' }}>▼</span> {/* Down arrow */}
          </button>
          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: '#FFFFFF',
                color: '#000000',
                border: '1px solid #ddd',
                borderRadius: '5px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
              }}
            >
              <ul style={{ listStyleType: 'none', margin: 0, padding: '10px' }}>
                <li style={{ marginBottom: '10px' }}>
                  <span style={{ color: '#007BFF', fontWeight: 'bold' }}>Earnings:</span> $5,000
                </li>
                <li style={{ marginBottom: '10px' }}>
                  <span style={{ color: '#007BFF', fontWeight: 'bold' }}>Reviews:</span> 4.8/5
                </li>
                <li style={{ marginBottom: '10px' }}>
                  <span style={{ color: '#007BFF', fontWeight: 'bold' }}>Projects Completed:</span> 15
                </li>
                <li style={{ marginTop: '10px', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                  <Link
                    to="/freelancer-dashboard/profile"
                    style={{ textDecoration: 'none', color: '#007BFF' }}
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    to="/freelancer-dashboard/settings"
                    style={{ textDecoration: 'none', color: '#007BFF' }}
                  >
                    Settings
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;