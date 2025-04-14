import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would normally handle form submission, validate data, etc.
    console.log("Login form submitted:", formData);

    // Check if the user has completed their profile
    const userProfile = localStorage.getItem("userProfile");

    if (userProfile) {
      // If profile exists, go directly to dashboard
      navigate("/dashboard");
    } else {
      // If no profile exists, go to profile setup
      navigate("/profile-setup");
    }
  };

  const navigateToSignup = () => {
    navigate("/signup");
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleSocialSignin = (provider) => {
    console.log(`Sign in with ${provider}`);
    // In a real app, implement OAuth logic here

    // For demonstration, we'll just check for profile and redirect
    const userProfile = localStorage.getItem("userProfile");

    if (userProfile) {
      navigate("/dashboard");
    } else {
      navigate("/profile-setup");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back!</h1>
        <p className="auth-subtitle">Please Enter your details to sign in</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group password-group">
            <input
              type="password"
              name="password"
              placeholder="Your Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span className="password-toggle">👁️</span>
          </div>

          <div className="form-options">
            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe">Remember account</label>
            </div>
            <div className="forgot-password" onClick={handleForgotPassword}>
              Forgot Password
            </div>
          </div>

          <button type="submit" className="auth-button">
            Sign in
          </button>
        </form>

        <div className="auth-options">
          <div className="signup-option">
            You Don't have account?{" "}
            <span className="auth-link" onClick={navigateToSignup}>
              Sign Up
            </span>
          </div>
          <div className="divider">Or</div>
          <div className="social-signin">
            <button
              className="social-button google-button"
              onClick={() => handleSocialSignin("Google")}
            >
              <img src="/google-icon.svg" alt="Google" /> Google
            </button>
            <button
              className="social-button apple-button"
              onClick={() => handleSocialSignin("Apple")}
            >
              <img src="/apple-icon.svg" alt="Apple" /> Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
