// src/pages/ProfileSetup.jsx
import React, { useState } from "react";
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
  const navigate = useNavigate();

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

      // Merge new profile data with existing user data
      const updatedUserData = {
        ...existingUserData,
        ...values,
        profileCompleted: true,
      };

      // Update user data in localStorage
      localStorage.setItem("userData", JSON.stringify(updatedUserData));

      // Call the update service
      await updateUserProfile(updatedUserData);

      message.success("Profile setup completed successfully!");
      navigate("/dashboard");
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
              <Select>
                <Select.Option value="high_school">High School</Select.Option>
                <Select.Option value="undergraduate">
                  Undergraduate
                </Select.Option>
                <Select.Option value="graduate">Graduate</Select.Option>
                <Select.Option value="phd">PhD</Select.Option>
                <Select.Option value="other">Other</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="major"
              label="Field of Study/Major"
              rules={[
                { required: true, message: "Please enter your field of study" },
              ]}
            >
              <Input placeholder="E.g., Computer Science, Biology, Literature" />
            </Form.Item>
          </>
        );
      case 1:
        return (
          <>
            <Form.Item
              name="interests"
              label="Academic Interests"
              rules={[
                {
                  required: true,
                  message: "Please share your academic interests",
                },
              ]}
            >
              <TextArea
                placeholder="What subjects are you most interested in studying?"
                rows={3}
              />
            </Form.Item>
            <Form.Item
              name="hobbies"
              label="Hobbies"
              rules={[{ required: true, message: "Please share your hobbies" }]}
            >
              <TextArea
                placeholder="What do you enjoy doing outside of your studies?"
                rows={3}
              />
            </Form.Item>
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
                Skip for Now
              </Button>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ProfileSetup;
