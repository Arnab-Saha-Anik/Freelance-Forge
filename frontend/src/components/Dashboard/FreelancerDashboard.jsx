import React from 'react';

const FreelancerDashboard = () => {
  // Dummy data for available projects
  const projects = [
    {
      id: 1,
      name: 'E-commerce Website Development',
      description: 'Build a responsive e-commerce website with payment integration.',
      budget: '$2,000',
    },
    {
      id: 2,
      name: 'Mobile App Design',
      description: 'Design a user-friendly mobile app for a startup.',
      budget: '$1,500',
    },
    {
      id: 3,
      name: 'Portfolio Website',
      description: 'Create a portfolio website for a professional photographer.',
      budget: '$800',
    },
  ];

  return (
    <div
      style={{
        backgroundColor: '#593D3D',
        color: '#FFFFFF',
        minHeight: '100vh',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Freelancer Dashboard</h1>
      <p style={{ textAlign: 'center', fontSize: '18px', marginBottom: '30px' }}>
        Welcome to your dashboard! Here you can view and bid on available projects.
      </p>

      {/* Available Projects Section */}
      <div
        style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: '#444444',
          borderRadius: '10px',
          color: '#FFFFFF',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Available Projects</h2>
        <ul style={{ listStyleType: 'none', padding: 0, fontSize: '18px' }}>
          {projects.map((project) => (
            <li
              key={project.id}
              style={{
                marginBottom: '20px',
                padding: '15px',
                backgroundColor: '#333333',
                borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              }}
            >
              <h3 style={{ marginBottom: '10px', color: '#FFD700' }}>{project.name}</h3>
              <p style={{ marginBottom: '10px' }}>{project.description}</p>
              <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Budget: {project.budget}</p>
              <button
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007BFF',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
                onClick={() => alert(`You have bid on "${project.name}"`)}
              >
                Bid
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FreelancerDashboard;