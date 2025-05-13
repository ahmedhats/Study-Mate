import React from "react";
import { Modal, Form, Input, Select, message } from "antd";
import { updateUserProfile } from "../../../services/api/userService";

const { Option } = Select;
const { TextArea } = Input;

const ProfileModal = ({ visible, onCancel, onFinish, initialValues }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      await updateUserProfile(values);
      message.success("Profile updated successfully");
      onFinish(values);
    } catch (error) {
      message.error("Failed to update profile");
    }
  };

  return (
    <Modal
      title="Edit Profile"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
      >
        <Form.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: "Please input your name!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="education"
          label="Education Level"
          rules={[
            { required: true, message: "Please select your education level!" },
          ]}
        >
          <Select>
            <Option value="high_school">High School</Option>
            <Option value="bachelors">Bachelor's Degree</Option>
            <Option value="masters">Master's Degree</Option>
            <Option value="phd">PhD</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="major"
          label="Field of Study"
          rules={[
            { required: true, message: "Please input your field of study!" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="interests"
          label="Interests"
          rules={[{ required: true, message: "Please input your interests!" }]}
        >
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="hobbies"
          label="Hobbies"
          rules={[{ required: true, message: "Please input your hobbies!" }]}
        >
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="studyPreference"
          label="Study Preference"
          rules={[
            { required: true, message: "Please select your study preference!" },
          ]}
        >
          <Select>
            <Option value="morning">Morning</Option>
            <Option value="afternoon">Afternoon</Option>
            <Option value="evening">Evening</Option>
            <Option value="night">Night</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProfileModal;
