import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ allowedRole }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // Redirect to login if no token is found
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role.toLowerCase();

    if (userRole !== allowedRole.toLowerCase()) {
      // Redirect to login if the role does not match
      return <Navigate to="/login" replace />;
    }
  } catch (err) {
    console.error("Invalid token:", err);
    // Redirect to login if the token is invalid
    return <Navigate to="/login" replace />;
  }

  // Render the child components if the user is authorized
  return <Outlet />;
};

export default ProtectedRoute;