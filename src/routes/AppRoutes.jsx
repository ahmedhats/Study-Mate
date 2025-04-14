// src/routes/AppRoutes.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Import Existing Pages
import Welcome from "../pages/Welcome";
import Login from "../pages/login";
import Signup from "../pages/signup";
import ProfileSetup from "../pages/profilesetup";
// Remove or comment out the import for the old Dashboard if no longer needed elsewhere
// import Dashboard from "../pages/Dashboard";

// Import the NEW Dashboard Page
import DashboardPage from "../pages/DashboardPage"; // Make sure the path is correct

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Routes from your original file */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />

        {/* Updated Dashboard Route to use the new design */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Fallback route from your original file */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
