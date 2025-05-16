import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Radio, message, Button } from "antd";
import { updateUserProfile } from "../../../services/api/userService";

const { Option } = Select;
const { TextArea } = Input;

const ProfileModal = ({ visible, onCancel, onFinish, initialValues }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Reset form when visible changes or initialValues update
  useEffect(() => {
    if (visible && initialValues) {
      // Prepare form values making sure arrays are properly handled
      const formValues = {
        ...initialValues,
        // Convert interests to array if it's not already
        interests:
          initialValues.interests && Array.isArray(initialValues.interests)
            ? initialValues.interests
            : initialValues.interests
            ? [initialValues.interests]
            : [],
        // Convert hobbies to array if it's not already
        hobbies:
          initialValues.hobbies && Array.isArray(initialValues.hobbies)
            ? initialValues.hobbies
            : initialValues.hobbies
            ? [initialValues.hobbies]
            : [],
      };

      form.setFieldsValue(formValues);
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      // Set profileCompleted flag to ensure it's properly saved
      const updatedValues = {
        ...values,
        profileCompleted: true,
      };

      await updateUserProfile(updatedValues);
      message.success("Profile updated successfully");
      onFinish(updatedValues);
      form.resetFields();
    } catch (error) {
      console.error("Profile update error:", error);
      message.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Edit Profile"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      maskClosable={true}
      destroyOnClose={true}
      width={600}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
      >
        <Form.Item
          name="name"
          label={<span className="required-field">Full Name</span>}
          rules={[{ required: true, message: "Please input your name!" }]}
        >
          <Input placeholder="Enter your full name" />
        </Form.Item>

        <Form.Item
          name="email"
          label={<span className="required-field">Email</span>}
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input placeholder="Enter your email" disabled />
        </Form.Item>

        <Form.Item
          name="education"
          label={<span className="required-field">Education Level</span>}
          rules={[
            { required: true, message: "Please select your education level!" },
          ]}
        >
          <Select placeholder="Select your education level">
            <Option value="high_school">High School</Option>
            <Option value="bachelors">Bachelor's</Option>
            <Option value="masters">Master's</Option>
            <Option value="phd">PhD</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="major"
          label={<span className="required-field">Field of Study/Major</span>}
          rules={[
            { required: true, message: "Please input your field of study!" },
          ]}
        >
          <Select placeholder="Select your field of study">
            <Option value="computer_science">Computer Science</Option>
            <Option value="biology">Biology</Option>
            <Option value="engineering">Engineering</Option>
            <Option value="mathematics">Mathematics</Option>
            <Option value="business">Business</Option>
            <Option value="literature">Literature</Option>
            <Option value="physics">Physics</Option>
            <Option value="chemistry">Chemistry</Option>
            <Option value="psychology">Psychology</Option>
            <Option value="medicine">Medicine</Option>
            <Option value="arts">Arts</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="interests"
          label={<span className="required-field">Academic Interests</span>}
          rules={[{ required: true, message: "Please select your interests!" }]}
        >
          <Select
            mode="multiple"
            placeholder="Select your academic interests"
            optionLabelProp="label"
          >
            <Option value="Programming" label="Programming">
              Programming
            </Option>
            <Option value="Science" label="Science">
              Science
            </Option>
            <Option value="Math" label="Math">
              Math
            </Option>
            <Option value="Art" label="Art">
              Art
            </Option>
            <Option value="Music" label="Music">
              Music
            </Option>
            <Option value="Sports" label="Sports">
              Sports
            </Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="hobbies"
          label={<span className="required-field">Hobbies</span>}
          rules={[{ required: true, message: "Please select your hobbies!" }]}
        >
          <Select
            mode="multiple"
            placeholder="Select your hobbies"
            optionLabelProp="label"
          >
            <Option value="Reading" label="Reading">
              Reading
            </Option>
            <Option value="Gaming" label="Gaming">
              Gaming
            </Option>
            <Option value="Traveling" label="Traveling">
              Traveling
            </Option>
            <Option value="Cooking" label="Cooking">
              Cooking
            </Option>
            <Option value="Music" label="Music">
              Music
            </Option>
            <Option value="Sports" label="Sports">
              Sports
            </Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="studyPreference"
          label={<span className="required-field">Study Preference</span>}
          rules={[
            { required: true, message: "Please select your study preference!" },
          ]}
        >
          <Radio.Group buttonStyle="solid">
            <Radio.Button value="individual">Individual Study</Radio.Button>
            <Radio.Button value="group">Group Study</Radio.Button>
            <Radio.Button value="both">Both</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="studyGoals"
          label={<span className="required-field">Study Goals</span>}
          rules={[
            { required: true, message: "Please enter your study goals!" },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="What are your main study goals for this semester?"
          />
        </Form.Item>

        <div
          className="form-actions"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Changes
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ProfileModal;
