import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    // Retrieve user data from localStorage
    const storedUserData = localStorage.getItem("userData");
    const storedProfileData = localStorage.getItem("userProfile");

    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }

    if (storedProfileData) {
      setProfileData(JSON.parse(storedProfileData));
    }
  }, []);

  const handleLogout = () => {
    // In a real app, you would clear authentication tokens here
    navigate("/");
  };

  const handleEditProfile = () => {
    navigate("/profile-setup");
  };

  // Helper function to format education level for display
  const formatEducation = (edu) => {
    if (!edu) return "Not specified";

    const formats = {
      high_school: "High School",
      undergraduate: "Undergraduate",
      graduate: "Graduate",
      phd: "PhD",
      other: "Other",
    };

    return formats[edu] || edu;
  };

  // Helper function to format study preference for display
  const formatStudyPreference = (pref) => {
    if (!pref) return "Not specified";

    const formats = {
      individual: "Individual Study",
      group: "Group Study",
      both: "Both Individual and Group Study",
    };

    return formats[pref] || pref;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1>Welcome to Your Dashboard</h1>

        {userData && (
          <div className="user-welcome">
            Hello, {userData.firstName} {userData.lastName}!
          </div>
        )}

        <div className="profile-section">
          <div className="profile-header">
            <h2>Your Profile</h2>
            <button className="edit-profile-btn" onClick={handleEditProfile}>
              Edit Profile
            </button>
          </div>

          {profileData ? (
            <div className="profile-details">
              <div className="profile-item">
                <span className="profile-label">Education Level:</span>
                <span className="profile-value">
                  {formatEducation(profileData.education)}
                </span>
              </div>

              <div className="profile-item">
                <span className="profile-label">Field of Study/Major:</span>
                <span className="profile-value">
                  {profileData.major || "Not specified"}
                </span>
              </div>

              <div className="profile-item">
                <span className="profile-label">Academic Interests:</span>
                <p className="profile-text">
                  {profileData.interests || "Not specified"}
                </p>
              </div>

              <div className="profile-item">
                <span className="profile-label">Hobbies:</span>
                <p className="profile-text">
                  {profileData.hobbies || "Not specified"}
                </p>
              </div>

              <div className="profile-item">
                <span className="profile-label">Study Preference:</span>
                <span className="profile-value">
                  {formatStudyPreference(profileData.studyPreference)}
                </span>
              </div>
            </div>
          ) : (
            <div className="profile-incomplete">
              <p>
                Your profile is incomplete. Please complete your profile to get
                a personalized experience.
              </p>
              <button
                className="complete-profile-btn"
                onClick={handleEditProfile}
              >
                Complete Profile
              </button>
            </div>
          )}
        </div>

        <div className="dashboard-actions">
          <button className="action-btn">Start Studying</button>
          <button className="action-btn">Join Study Group</button>
          <button className="action-btn">Set Study Goals</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
