import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login'; // Import the Login component
import Navbar from './components/Navbar';
import Register from './pages/Register'; 
function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} /> {/* Add the login route */}
          <Route path="/register" element={<Register />} /> {/* Add the register route */}
        </Routes>

      </Router>
    </>
  );
}

export default App;
