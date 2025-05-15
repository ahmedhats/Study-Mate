// src/pages/ProfileSetup.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  const educationOptions = [
    { value: "high_school", label: "High School" },
    { value: "bachelors", label: "Bachelor's" },
    { value: "masters", label: "Master's" },
    { value: "phd", label: "PhD" },
    { value: "other", label: "Other" },
  ];
  const majorOptions = [
    "Computer Science",
    "Biology",
    "Literature",
    "Engineering",
    "Business",
    "Mathematics",
    "Other",
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
    const userData = localStorage.getItem("userData");
    if (!userData) {
      navigate("/login");
    } else {
      try {
        const parsed = JSON.parse(userData);
        if (parsed.user?.profileCompleted === true) {
          navigate("/dashboard");
          return;
        }
      } catch {}
      setCheckingAuth(false);
      // Pre-fill form with existing user data if available
      try {
        const parsed = JSON.parse(userData);
        form.setFieldsValue({
          education: parsed.user?.education || "",
          major: parsed.user?.major || "",
          interests: parsed.user?.interests || [],
          hobbies: parsed.user?.hobbies || [],
          studyPreference: parsed.user?.studyPreference || "",
          studyGoals: parsed.user?.studyGoals || "",
        });
      } catch {}
    }
  }, [navigate, form]);

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
      // Get existing user data from localStorage
      const existingUserData = JSON.parse(
        localStorage.getItem("userData") || "{}"
      );

      // Merge custom fields if 'Other' is selected
      const education =
        values.education === "other"
          ? values.customEducation
          : values.education;
      const major =
        values.major === "Other" ? values.customMajor : values.major;
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

      // Merge new profile data with existing user data
      const updatedUserData = {
        ...existingUserData,
        education,
        major,
        interests,
        hobbies,
        studyPreference: values.studyPreference,
        studyGoals: values.studyGoals,
        profileCompleted: true,
      };

      // Call the update service
      const result = await updateUserProfile(updatedUserData);
      console.log("Profile update result:", result);
      if (result && !result.error && !result.message) {
        // Update localStorage with backend response (ensure profileCompleted is true)
        const newUserData = {
          ...existingUserData,
          user: {
            ...existingUserData.user,
            ...result,
            profileCompleted: true,
          },
          token: existingUserData.token,
        };
        localStorage.setItem("userData", JSON.stringify(newUserData));
        message.success("Profile setup completed successfully!");
        navigate("/dashboard");
      } else {
        message.error(
          result.message || "Failed to save profile. Please try again."
        );
      }
    } catch (error) {
      message.error("Failed to save profile. Please try again.");
      console.error("Profile setup error:", error);
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

  const handleSkip = () => {
    // Get existing user data
    const existingUserData = JSON.parse(
      localStorage.getItem("userData") || "{}"
    );

    // Mark profile as incomplete
    const updatedUserData = {
      ...existingUserData,
      profileCompleted: false,
    };

    // Update localStorage
    localStorage.setItem("userData", JSON.stringify(updatedUserData));

    message.info("You can complete your profile later from the settings.");
    navigate("/dashboard");
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
                onChange={(val) => setShowCustomMajor(val === "Other")}
                placeholder="Select your major"
              >
                {majorOptions.map((opt) => (
                  <Select.Option key={opt} value={opt}>
                    {opt}
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
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ProfileSetup;
