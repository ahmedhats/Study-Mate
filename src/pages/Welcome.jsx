import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Welcome.css";

const Welcome = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <div className="logo-container">
          <span className="logo-icon">S</span>
        </div>
        <h1 className="welcome-title">Welcome to StudyMate !</h1>
        <p className="welcome-subtitle">lorem</p>
        <button className="get-started-btn" onClick={handleGetStarted}>
          Get Started Now
        </button>
      </div>
    </div>
  );
};

export default Welcome;
