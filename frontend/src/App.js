import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
// import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import ClientDashboard from "./components/Dashboard/ClientDashboard";
import FreelancerDashboard from "./components/Dashboard/FreelancerDashboard";
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute
import FreelancerProfile from "./pages/FreelancerProfile";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./components/Dashboard/AdminDashboard";

function App() {
  return (
    <>
      {/* <Navbar /> */}

      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRole="client" />}>
            <Route path="/client-dashboard" element={<ClientDashboard />} />
          </Route>
          <Route element={<ProtectedRoute allowedRole="freelancer" />}>
            <Route path="/freelancer-dashboard" element={<FreelancerDashboard />} />
            <Route path="/freelancer-dashboard/profile" element={<FreelancerProfile />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;