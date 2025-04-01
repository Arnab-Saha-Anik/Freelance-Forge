import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import ClientDashboard from './components/Dashboard/ClientDashboard';
import FreelancerDashboard from './components/Dashboard/FreelancerDashboard'; // Import FreelancerDashboard

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/freelancer-dashboard" element={<FreelancerDashboard />} /> {/* Add FreelancerDashboard route */}
        </Routes>
      </Router>
    </>
  );
}

export default App;