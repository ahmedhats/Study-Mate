import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Result, Button, Spin, message } from "antd";
import { verifyEmail } from "../../services/api/authService";
import "../../styles/Auth.css";

const VerifyEmail = () => {
  const [verificationStatus, setVerificationStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyUserEmail = async () => {
      try {
        // Get token from URL query parameters, handling both direct and hash router formats
        const queryParams = new URLSearchParams(location.search);
        let token = queryParams.get("token");

        // If token is not found in normal query params, check if it's in the hash portion
        if (!token && location.hash) {
          // Handle case where URL might be malformed like /#/verify-email?token=xyz
          const hashPart = location.hash.split("?");
          if (hashPart.length > 1) {
            const hashParams = new URLSearchParams(hashPart[1]);
            token = hashParams.get("token");
          }
        }

        if (!token) {
          console.error("Verification token is missing in URL");
          setVerificationStatus("error");
          setErrorMessage(
            "Verification token is missing in the URL. Please check your email link and try again."
          );
          return;
        }

        console.log("Attempting verification with token:", token);
        const response = await verifyEmail(token);

        if (response.success) {
          console.log("Verification successful, response:", response);

          // Get existing userData if it exists
          let userData = localStorage.getItem("userData");
          let parsedData = userData ? JSON.parse(userData) : {};

          // Create new user data object with verification info from response
          const newUserData = {
            token: response.token || parsedData.token,
            user: {
              ...(parsedData.user || {}),
              isAccountVerified: true,
              id: response.user?.id || parsedData.user?.id,
              name: response.user?.name || parsedData.user?.name,
              email: response.user?.email || parsedData.user?.email,
              profileCompleted: response.user?.profileCompleted || false,
            },
          };

          // Save the updated user data
          localStorage.setItem("userData", JSON.stringify(newUserData));

          message.success("Email verified successfully!");
          setVerificationStatus("success");

          // Short delay before redirecting to profile setup
          setTimeout(() => {
            navigate("/profile-setup");
          }, 1500);
        } else {
          console.error("Verification API returned failure:", response);
          setVerificationStatus("error");
          setErrorMessage(
            response.message || "Email verification failed. Please try again."
          );
        }
      } catch (error) {
        console.error("Verification error:", error);
        setVerificationStatus("error");
        setErrorMessage(
          error.message || "Email verification failed. Please try again."
        );
      }
    };

    verifyUserEmail();
  }, [location.search, location.hash, navigate]);

  const navigateToLogin = () => {
    navigate("/login");
  };

  const navigateToProfileSetup = () => {
    navigate("/profile-setup");
  };

  if (verificationStatus === "loading") {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <Spin size="large" />
          <p style={{ marginTop: 20 }}>Verifying your email address...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {verificationStatus === "success" ? (
          <Result
            status="success"
            title="Email Verified Successfully!"
            subTitle="Your account has been verified. You can now complete your profile setup."
            extra={[
              <Button
                type="primary"
                key="profile"
                onClick={navigateToProfileSetup}
              >
                Complete Profile Setup
              </Button>,
            ]}
          />
        ) : (
          <Result
            status="error"
            title="Verification Failed"
            subTitle={
              errorMessage || "Something went wrong with email verification."
            }
            extra={[
              <Button type="primary" key="login" onClick={navigateToLogin}>
                Go to Login
              </Button>,
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
