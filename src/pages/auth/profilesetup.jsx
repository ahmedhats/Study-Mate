// src/pages/ProfileSetup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/profilesetup.css";

const ProfileSetup = () => {
  const [profileData, setProfileData] = useState({
    education: "",
    major: "",
    interests: "",
    hobbies: "",
    studyPreference: "individual", // default value
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Here you would typically send this data to your backend API
    console.log("Profile data submitted:", profileData);

    // For now, we'll just save it to localStorage as a placeholder
    localStorage.setItem("userProfile", JSON.stringify(profileData));

    // Navigate to dashboard after profile completion
    navigate("/dashboard");
  };

  const skipSetup = () => {
    // Navigate to dashboard without completing profile
    navigate("/dashboard");
  };

  return (
    <div className="profile-setup-container">
      <div className="profile-setup-card">
        <h1 className="profile-setup-title">Complete Your Profile</h1>
        <p className="profile-setup-subtitle">
          Help us personalize your study experience
        </p>

        <form className="profile-setup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="education">Education Level</label>
            <select
              id="education"
              name="education"
              value={profileData.education}
              onChange={handleChange}
              required
            >
              <option value="">Select your education level</option>
              <option value="high_school">High School</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="graduate">Graduate</option>
              <option value="phd">PhD</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="major">Field of Study/Major</label>
            <input
              type="text"
              id="major"
              name="major"
              placeholder="E.g., Computer Science, Biology, Literature"
              value={profileData.major}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="interests">Academic Interests</label>
            <textarea
              id="interests"
              name="interests"
              placeholder="What subjects are you most interested in studying?"
              value={profileData.interests}
              onChange={handleChange}
              rows="3"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="hobbies">Hobbies</label>
            <textarea
              id="hobbies"
              name="hobbies"
              placeholder="What do you enjoy doing outside of your studies?"
              value={profileData.hobbies}
              onChange={handleChange}
              rows="3"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label>Study Preference</label>
            <div className="radio-group">
              <div className="radio-option">
                <input
                  type="radio"
                  id="individual"
                  name="studyPreference"
                  value="individual"
                  checked={profileData.studyPreference === "individual"}
                  onChange={handleChange}
                />
                <label htmlFor="individual">Individual Study</label>
              </div>
              <div className="radio-option">
                <input
                  type="radio"
                  id="group"
                  name="studyPreference"
                  value="group"
                  checked={profileData.studyPreference === "group"}
                  onChange={handleChange}
                />
                <label htmlFor="group">Group Study</label>
              </div>
              <div className="radio-option">
                <input
                  type="radio"
                  id="both"
                  name="studyPreference"
                  value="both"
                  checked={profileData.studyPreference === "both"}
                  onChange={handleChange}
                />
                <label htmlFor="both">Both</label>
              </div>
            </div>
          </div>

          <div className="profile-setup-buttons">
            <button type="button" className="skip-button" onClick={skipSetup}>
              Skip for Now
            </button>
            <button type="submit" className="complete-button">
              Complete Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
