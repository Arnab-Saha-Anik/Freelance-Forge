// utils/logout.js
export const handleGlobalLogout = (navigate) => {
    alert("Your account has been deleted. Logging you out.");
    localStorage.removeItem("token"); // Remove the token from localStorage
    navigate("/login"); // Redirect to the login page
  };