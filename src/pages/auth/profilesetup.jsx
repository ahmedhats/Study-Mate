// src/pages/ProfileSetup.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Input, Select, Radio, Steps, Button, message, Spin } from "antd";
import { updateUserProfile } from "../../services/api/userService";
import "../styles/profilesetup.css";

const { TextArea } = Input;
const { Step } = Steps;

const ProfileSetup = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const educationOptions = [
    { value: "high_school", label: "High School" },
    { value: "bachelors", label: "Bachelor's" },
    { value: "masters", label: "Master's" },
    { value: "phd", label: "PhD" },
    { value: "other", label: "Other" },
  ];
  const majorOptions = [
    { value: "computer_science", label: "Computer Science" },
    { value: "biology", label: "Biology" },
    { value: "engineering", label: "Engineering" },
    { value: "mathematics", label: "Mathematics" },
    { value: "business", label: "Business" },
    { value: "literature", label: "Literature" },
    { value: "physics", label: "Physics" },
    { value: "chemistry", label: "Chemistry" },
    { value: "psychology", label: "Psychology" },
    { value: "medicine", label: "Medicine" },
    { value: "arts", label: "Arts" },
    { value: "other", label: "Other" },
  ];
  const interestOptions = [
    "Math",
    "Science",
    "Programming",
    "Art",
    "Music",
    "Sports",
    "Other",
  ];
  const hobbyOptions = [
    "Reading",
    "Gaming",
    "Traveling",
    "Cooking",
    "Music",
    "Sports",
    "Other",
  ];
  const [showCustomEducation, setShowCustomEducation] = useState(false);
  const [showCustomMajor, setShowCustomMajor] = useState(false);
  const [showCustomInterest, setShowCustomInterest] = useState(false);
  const [showCustomHobby, setShowCustomHobby] = useState(false);
  const [customEducation, setCustomEducation] = useState("");
  const [customMajor, setCustomMajor] = useState("");
  const [customInterest, setCustomInterest] = useState("");
  const [customHobby, setCustomHobby] = useState("");

  useEffect(() => {
    // Check for userData in localStorage
    const userDataString = localStorage.getItem("userData");
    if (!userDataString) {
      console.log("No user data found, redirecting to login");
      message.error("Please log in first");
      navigate("/login");
      return;
    }

    try {
      const parsedData = JSON.parse(userDataString);
      console.log("User data found:", parsedData);

      // Get user data from appropriate location in the object
      const user = parsedData.user || parsedData;

      // STRICT CHECK: Ensure account is verified before allowing profile setup
      if (!user.isAccountVerified) {
        console.log("User not verified, redirecting to login");
        message.error(
          "Please verify your email before setting up your profile"
        );
        navigate("/login", {
          state: {
            message:
              "Please verify your email before setting up your profile. Check your inbox for the verification link.",
          },
        });
        return;
      }

      // Check if profile is already completed and user didn't come from registration
      // This prevents forcing returning users to complete profile setup
      if (user.profileCompleted === true) {
        console.log("Profile already completed, redirecting to dashboard");
        message.info("Your profile is already set up!");
        navigate("/dashboard");
        return;
      }

      // User is verified, profile not completed, and ready to setup profile
      console.log(
        "User verified and profile incomplete, showing profile setup"
      );
      setCheckingAuth(false);

      // Pre-fill form with existing user data if available
      const interestsArray = Array.isArray(user.interests)
        ? user.interests
        : user.interests
        ? [user.interests]
        : [];
      const hobbiesArray = Array.isArray(user.hobbies)
        ? user.hobbies
        : user.hobbies
        ? [user.hobbies]
        : [];

      form.setFieldsValue({
        education: user.education || "",
        major: user.major || "",
        interests: interestsArray,
        hobbies: hobbiesArray,
        studyPreference: user.studyPreference || "",
        studyGoals: user.studyGoals || "",
      });

      // Set custom field display state based on values
      setShowCustomEducation(user.education === "other");
      setShowCustomMajor(user.major === "other");
      setShowCustomInterest(interestsArray.includes("Other"));
      setShowCustomHobby(hobbiesArray.includes("Other"));
    } catch (err) {
      console.error("Error parsing user data:", err);
      message.error("An error occurred. Please login again.");
      navigate("/login");
      return;
    }
  }, [navigate, form, location]);

  // Show loading spinner while we check auth status
  if (checkingAuth) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const steps = [
    {
      title: "Basic Info",
      content: "basic-info",
    },
    {
      title: "Academic Details",
      content: "academic-details",
    },
    {
      title: "Preferences",
      content: "preferences",
    },
  ];

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      console.log("Submitting profile data:", values);

      // Get existing user data from localStorage
      const existingUserDataStr = localStorage.getItem("userData");
      if (!existingUserDataStr) {
        message.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      const existingUserData = JSON.parse(existingUserDataStr);
      console.log("Existing user data:", existingUserData);

      // Merge custom fields if 'Other' is selected
      const education =
        values.education === "other"
          ? values.customEducation
          : values.education;
      const major =
        values.major === "other" ? values.customMajor : values.major;
      const interests =
        (values.interests || []).includes("Other") && values.customInterest
          ? [
              ...(values.interests || []).filter((i) => i !== "Other"),
              values.customInterest,
            ]
          : values.interests;
      const hobbies =
        (values.hobbies || []).includes("Other") && values.customHobby
          ? [
              ...(values.hobbies || []).filter((h) => h !== "Other"),
              values.customHobby,
            ]
          : values.hobbies;

      // Create profile update data
      const profileData = {
        education,
        major,
        interests,
        hobbies,
        studyPreference: values.studyPreference,
        studyGoals: values.studyGoals,
        profileCompleted: true,
      };

      // Call the API to update the profile
      try {
        const result = await updateUserProfile(profileData);
        console.log("Profile update result:", result);
      } catch (apiError) {
        console.error("API error when updating profile:", apiError);
        // Continue with localStorage update even if API fails
      }

      // Update localStorage regardless of API response
      // This ensures profileCompleted is set to true in localStorage
      let updatedUserData;

      if (existingUserData.user) {
        // If userData has nested user object
        updatedUserData = {
          ...existingUserData,
          user: {
            ...existingUserData.user,
            ...profileData,
          },
        };
      } else {
        // If userData is flat
        updatedUserData = {
          ...existingUserData,
          ...profileData,
        };
      }

      console.log("Updating localStorage with:", updatedUserData);
      localStorage.setItem("userData", JSON.stringify(updatedUserData));

      message.success("Profile setup completed successfully!");

      // Force delay before redirect to ensure localStorage is updated
      setTimeout(() => {
        console.log("Redirecting to dashboard after profile setup");
        navigate("/dashboard", { replace: true });
      }, 500);
    } catch (error) {
      console.error("Profile setup error:", error);
      message.error("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    try {
      await form.validateFields(getFieldsForStep(currentStep));
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  const handleSkip = async () => {
    try {
      setLoading(true);
      // Get existing user data
      const existingUserDataStr = localStorage.getItem("userData");
      if (!existingUserDataStr) {
        message.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      const existingUserData = JSON.parse(existingUserDataStr);
      console.log("Existing user data for skip:", existingUserData);

      // Create a minimal profile data object that marks the profile as complete
      const profileData = {
        profileCompleted: true, // Critical - mark profile as completed
      };

      // Call the API to update the profile as "completed"
      try {
        const result = await updateUserProfile(profileData);
        console.log("Profile skip result:", result);
      } catch (apiError) {
        // Even if API fails, we'll still update localStorage to prevent login loops
        console.error(
          "API error when skipping profile, continuing anyway:",
          apiError
        );
      }

      // Update userData with profileCompleted flag
      let updatedUserData;
      if (existingUserData.user) {
        updatedUserData = {
          ...existingUserData,
          user: {
            ...existingUserData.user,
            profileCompleted: true, // Mark as completed when skipped
          },
        };
      } else {
        updatedUserData = {
          ...existingUserData,
          profileCompleted: true, // Mark as completed when skipped
        };
      }

      // Update localStorage
      console.log(
        "Updating localStorage with profile completed:",
        updatedUserData
      );
      localStorage.setItem("userData", JSON.stringify(updatedUserData));

      message.info("You can update your profile later from settings.");

      // Force delay before redirect to ensure localStorage is updated
      setTimeout(() => {
        console.log("Redirecting to dashboard after skipping profile setup");
        navigate("/dashboard", { replace: true });
      }, 500);
    } catch (error) {
      console.error("Error when skipping profile setup:", error);
      message.error(
        "An error occurred, but we'll redirect you to dashboard anyway."
      );

      // Even on error, try to redirect to dashboard
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  const getFieldsForStep = (step) => {
    switch (step) {
      case 0:
        return ["education", "major"];
      case 1:
        return ["interests", "hobbies"];
      case 2:
        return ["studyPreference", "studyGoals"];
      default:
        return [];
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <Form.Item
              name="education"
              label="Education Level"
              rules={[
                {
                  required: true,
                  message: "Please select your education level",
                },
              ]}
            >
              <Select
                onChange={(val) => setShowCustomEducation(val === "other")}
                placeholder="Select your education level"
              >
                {educationOptions.map((opt) => (
                  <Select.Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            {showCustomEducation && (
              <Form.Item
                name="customEducation"
                label="Custom Education Level"
                rules={[
                  {
                    required: true,
                    message: "Please enter your education level",
                  },
                ]}
              >
                <Input
                  value={customEducation}
                  onChange={(e) => setCustomEducation(e.target.value)}
                  placeholder="Enter your education level"
                />
              </Form.Item>
            )}
            <Form.Item
              name="major"
              label="Field of Study/Major"
              rules={[{ required: true, message: "Please select your major" }]}
            >
              <Select
                onChange={(val) => setShowCustomMajor(val === "other")}
                placeholder="Select your major"
              >
                {majorOptions.map((opt) => (
                  <Select.Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            {showCustomMajor && (
              <Form.Item
                name="customMajor"
                label="Custom Major"
                rules={[{ required: true, message: "Please enter your major" }]}
              >
                <Input
                  value={customMajor}
                  onChange={(e) => setCustomMajor(e.target.value)}
                  placeholder="Enter your major"
                />
              </Form.Item>
            )}
          </>
        );
      case 1:
        return (
          <>
            <Form.Item
              name="interests"
              label="Academic Interests"
              rules={[
                { required: true, message: "Please select your interests" },
              ]}
            >
              <Select
                mode="multiple"
                onChange={(vals) =>
                  setShowCustomInterest(vals.includes("Other"))
                }
                placeholder="Select your interests"
              >
                {interestOptions.map((opt) => (
                  <Select.Option key={opt} value={opt}>
                    {opt}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            {showCustomInterest && (
              <Form.Item
                name="customInterest"
                label="Custom Interest(s)"
                rules={[
                  { required: true, message: "Please enter your interest(s)" },
                ]}
              >
                <Input
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  placeholder="Enter your interest(s)"
                />
              </Form.Item>
            )}
            <Form.Item
              name="hobbies"
              label="Hobbies"
              rules={[
                { required: true, message: "Please select your hobbies" },
              ]}
            >
              <Select
                mode="multiple"
                onChange={(vals) => setShowCustomHobby(vals.includes("Other"))}
                placeholder="Select your hobbies"
              >
                {hobbyOptions.map((opt) => (
                  <Select.Option key={opt} value={opt}>
                    {opt}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            {showCustomHobby && (
              <Form.Item
                name="customHobby"
                label="Custom Hobby(ies)"
                rules={[
                  { required: true, message: "Please enter your hobby(ies)" },
                ]}
              >
                <Input
                  value={customHobby}
                  onChange={(e) => setCustomHobby(e.target.value)}
                  placeholder="Enter your hobby(ies)"
                />
              </Form.Item>
            )}
          </>
        );
      case 2:
        return (
          <>
            <Form.Item
              name="studyPreference"
              label="Study Preference"
              rules={[
                {
                  required: true,
                  message: "Please select your study preference",
                },
              ]}
            >
              <Radio.Group>
                <Radio.Button value="individual">Individual Study</Radio.Button>
                <Radio.Button value="group">Group Study</Radio.Button>
                <Radio.Button value="both">Both</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              name="studyGoals"
              label="Study Goals"
              rules={[
                { required: true, message: "Please share your study goals" },
              ]}
            >
              <TextArea
                placeholder="What are your main study goals for this semester?"
                rows={3}
              />
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="profile-setup-container">
      <div className="profile-setup-card">
        <h1 className="profile-setup-title">Complete Your Profile</h1>
        <p className="profile-setup-subtitle">
          Help us personalize your experience
        </p>

        <Steps className="setup-steps" current={currentStep} items={steps} />

        <Form
          form={form}
          layout="vertical"
          className="profile-setup-form"
          onFinish={handleSubmit}
        >
          {renderStepContent()}

          <div className="profile-setup-buttons">
            {currentStep > 0 && (
              <Button
                className="prev-button"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Previous
              </Button>
            )}

            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={() => handleNext()}>
                Next
              </Button>
            )}

            {currentStep === steps.length - 1 && (
              <Button type="primary" htmlType="submit" loading={loading}>
                Complete Setup
              </Button>
            )}

            {currentStep === 0 && (
              <Button className="skip-button" onClick={handleSkip}>
                Skip Setup
              </Button>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ProfileSetup;
