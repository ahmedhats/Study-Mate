import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Upload,
  message,
  Select,
  Radio,
  Spin,
} from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { updateUserProfile } from "../../../services/api/userService";

const { TextArea } = Input;
const { Option } = Select;

const EditProfileModal = ({
  visible,
  onCancel,
  userData,
  onProfileUpdated,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showCustomEducation, setShowCustomEducation] = useState(false);
  const [showCustomMajor, setShowCustomMajor] = useState(false);
  const [showCustomInterest, setShowCustomInterest] = useState(false);
  const [showCustomHobby, setShowCustomHobby] = useState(false);
  const [customEducation, setCustomEducation] = useState("");
  const [customMajor, setCustomMajor] = useState("");
  const [customInterest, setCustomInterest] = useState("");
  const [customHobby, setCustomHobby] = useState("");

  // Initialize form with user data when modal opens
  useEffect(() => {
    if (visible && userData) {
      console.log("Setting form values with:", userData);

      // Force a small delay to ensure modal is fully rendered before setting values
      setTimeout(() => {
        form.setFieldsValue({
          name: userData.name || "",
          email: userData.email || "",
          education: userData.education || "",
          major: userData.major || "",
          interests: userData.interests || [],
          hobbies: userData.hobbies || [],
          studyPreference: userData.studyPreference || "",
          studyGoals: userData.studyGoals || "",
        });

        // Check if we need to show custom fields
        setShowCustomEducation(userData.education === "other");
        setShowCustomMajor(userData.major === "other");
        setShowCustomInterest((userData.interests || []).includes("Other"));
        setShowCustomHobby((userData.hobbies || []).includes("Other"));
      }, 100);
    }
  }, [visible, userData, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      console.log("Submitting profile update with values:", values);

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

      // Create the updated data
      const updatedData = {
        ...values,
        education,
        major,
        interests,
        hobbies,
      };

      // Call the API to update the profile
      const response = await updateUserProfile(updatedData);

      // Update local storage with the new data
      try {
        const userData = localStorage.getItem("userData");
        if (userData) {
          const parsedData = JSON.parse(userData);

          // Update the user data in localStorage
          const updatedUserData = {
            ...parsedData,
            user: {
              ...(parsedData.user || parsedData),
              ...updatedData,
            },
          };

          console.log("Updating localStorage with:", updatedUserData);
          localStorage.setItem("userData", JSON.stringify(updatedUserData));
        }
      } catch (error) {
        console.error("Error updating localStorage:", error);
      }

      message.success("Profile updated successfully");
      if (onProfileUpdated) onProfileUpdated();
      onCancel();
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error(
        "Failed to update profile: " + (error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  // Add a handle cancel function to make the behavior explicit
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

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

  return (
    <Modal
      title="Edit Profile"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      centered
      destroyOnClose={true}
      maskClosable={false}
      className="profile-edit-modal"
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="profile-edit-form"
          preserve={false}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: "Please enter your full name" }]}
          >
            <Input placeholder="Full Name" maxLength={50} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Email" disabled />
          </Form.Item>

          <Form.Item
            name="education"
            label="Education Level"
            rules={[
              { required: true, message: "Please select your education level" },
            ]}
          >
            <Select
              placeholder="Select your education level"
              onChange={(val) => setShowCustomEducation(val === "other")}
            >
              {educationOptions.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
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
              placeholder="Select your major"
              onChange={(val) => setShowCustomMajor(val === "other")}
            >
              {majorOptions.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
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

          <Form.Item
            name="interests"
            label="Academic Interests"
            rules={[
              { required: true, message: "Please select your interests" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select your interests"
              onChange={(vals) => setShowCustomInterest(vals.includes("Other"))}
            >
              {interestOptions.map((opt) => (
                <Option key={opt} value={opt}>
                  {opt}
                </Option>
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
            rules={[{ required: true, message: "Please select your hobbies" }]}
          >
            <Select
              mode="multiple"
              placeholder="Select your hobbies"
              onChange={(vals) => setShowCustomHobby(vals.includes("Other"))}
            >
              {hobbyOptions.map((opt) => (
                <Option key={opt} value={opt}>
                  {opt}
                </Option>
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

          <div className="form-actions">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Save Changes
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default EditProfileModal;
