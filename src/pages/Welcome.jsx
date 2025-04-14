import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Welcome.css";
import WelcomeCard from "../components/features/welcome/WelcomeCard";

const Welcome = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  return (
    <div className="welcome-container">
      <WelcomeCard onGetStarted={handleGetStarted} />
    </div>
  );
};

export default Welcome;
