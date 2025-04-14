import React from "react";

const WelcomeCard = ({ onGetStarted }) => {
  return (
    <div className="welcome-card">
      <div className="logo-container">
        <span className="logo-icon">S</span>
      </div>
      <h1 className="welcome-title">Welcome to StudyMate !</h1>
      <p className="welcome-subtitle">lorem</p>
      <button className="get-started-btn" onClick={onGetStarted}>
        Get Started Now
      </button>
    </div>
  );
};

export default WelcomeCard;
