import React from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Upload,
  message,
  Select,
  Radio,
} from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { updateUserProfile } from "../../../services/api/userService";

const EditProfileModal = ({
  visible,
  onCancel,
  userData,
  onProfileUpdated,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      await updateUserProfile(values);
      message.success("Profile updated successfully");
      if (onProfileUpdated) onProfileUpdated();
      onCancel();
    } catch (error) {
      message.error("Failed to update profile");
    }
  };

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

  return (
    <Modal
      title="Edit Profile"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={userData}
        onFinish={handleSubmit}
      >
        <div className="profile-image-section">
          <Upload
            name="avatar"
            listType="picture-circle"
            className="avatar-uploader"
            showUploadList={false}
          >
            <div className="upload-button">
              <span className="upload-text">
                {userData?.avatar || "Upload image"}
              </span>
              <Button type="link" className="remove-image">
                Remove Image
              </Button>
            </div>
          </Upload>
        </div>

        <Form.Item name="name" label="Full Name">
          <Input placeholder="Full Name" />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item
          name="education"
          label="Education Level"
          rules={[
            { required: true, message: "Please select your education level" },
          ]}
        >
          <Select placeholder="Select your education level">
            {educationOptions.map((opt) => (
              <Select.Option key={opt.value} value={opt.value}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="major"
          label="Field of Study/Major"
          rules={[{ required: true, message: "Please select your major" }]}
        >
          <Select placeholder="Select your major">
            {majorOptions.map((opt) => (
              <Select.Option key={opt} value={opt}>
                {opt}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="interests"
          label="Academic Interests"
          rules={[{ required: true, message: "Please select your interests" }]}
        >
          <Select mode="multiple" placeholder="Select your interests">
            {interestOptions.map((opt) => (
              <Select.Option key={opt} value={opt}>
                {opt}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="hobbies"
          label="Hobbies"
          rules={[{ required: true, message: "Please select your hobbies" }]}
        >
          <Select mode="multiple" placeholder="Select your hobbies">
            {hobbyOptions.map((opt) => (
              <Select.Option key={opt} value={opt}>
                {opt}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="studyPreference"
          label="Study Preference"
          rules={[
            { required: true, message: "Please select your study preference" },
          ]}
        >
          <Radio.Group>
            <Radio.Button value="individual">Individual Study</Radio.Button>
            <Radio.Button value="group">Group Study</Radio.Button>
            <Radio.Button value="both">Both</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <div className="modal-footer">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Save Changes
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditProfileModal;
