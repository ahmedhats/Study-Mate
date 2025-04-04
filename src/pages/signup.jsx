import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    retypePassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Signup form submitted:", formData);

    navigate("/dashboard");
  };

  const navigateToLogin = () => {
    navigate("/login");
  };

  const handleSocialSignin = (provider) => {
    console.log(`Sign in with ${provider}`);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Your Account!</h1>
        <p className="auth-subtitle">Please Enter your details to sign in</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

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

          <div className="form-group password-group">
            <input
              type="password"
              name="retypePassword"
              placeholder="Retype Password"
              value={formData.retypePassword}
              onChange={handleChange}
              required
            />
            <span className="password-toggle">👁️</span>
          </div>

          <button type="submit" className="auth-button">
            Sign Up
          </button>
        </form>

        <div className="auth-options">
          <p>
            Already signed up?{" "}
            <span className="auth-link" onClick={navigateToLogin}>
              Sign In
            </span>
          </p>
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

export default Signup;
