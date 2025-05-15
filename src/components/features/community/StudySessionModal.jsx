import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  TimePicker,
  InputNumber,
  Switch,
  Space,
  Typography,
} from "antd";
import { createCommunityStudySession } from "../../../services/api/communityService";

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const StudySessionModal = ({
  visible,
  onCancel,
  onSuccess,
  communityId,
  communityName,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Format datetime values
      const payload = {
        ...values,
        communityId,
        startTime: values.timeRange[0].toISOString(),
        endTime: values.timeRange[1].toISOString(),
      };

      // Remove the timeRange field as we've extracted start/end times
      delete payload.timeRange;

      const response = await createCommunityStudySession(payload);

      if (response.success) {
        onSuccess(response.data);
        form.resetFields();
        onCancel();
      }
    } catch (error) {
      console.error("Failed to create study session:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Create Study Session for ${communityName}`}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Create Session
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          maxParticipants: 10,
          isPublic: true,
        }}
      >
        <Form.Item
          name="title"
          label="Session Title"
          rules={[{ required: true, message: "Please enter a title" }]}
        >
          <Input placeholder="E.g., JavaScript Basics Study Group" />
        </Form.Item>

        <Form.Item
          name="topic"
          label="Study Topic"
          rules={[
            { required: true, message: "Please specify the study topic" },
          ]}
        >
          <Input placeholder="E.g., Arrays and Objects" />
        </Form.Item>

        <Form.Item
          name="timeRange"
          label="Session Time"
          rules={[{ required: true, message: "Please select session time" }]}
        >
          <RangePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Space style={{ display: "flex", justifyContent: "space-between" }}>
          <Form.Item
            name="maxParticipants"
            label="Max Participants"
            rules={[{ required: true }]}
            style={{ width: "48%" }}
          >
            <InputNumber min={2} max={50} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="difficulty"
            label="Difficulty Level"
            rules={[{ required: true, message: "Please select difficulty" }]}
            style={{ width: "48%" }}
          >
            <Select placeholder="Select difficulty">
              <Option value="beginner">Beginner</Option>
              <Option value="intermediate">Intermediate</Option>
              <Option value="advanced">Advanced</Option>
            </Select>
          </Form.Item>
        </Space>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please provide a description" }]}
        >
          <TextArea
            rows={4}
            placeholder="Describe what will be covered in this study session..."
          />
        </Form.Item>

        <Form.Item name="prerequisites" label="Prerequisites (Optional)">
          <TextArea
            rows={2}
            placeholder="Any prerequisites participants should have..."
          />
        </Form.Item>

        <Form.Item
          name="isPublic"
          label="Session Visibility"
          valuePropName="checked"
        >
          <Switch checkedChildren="Public" unCheckedChildren="Private" />
        </Form.Item>
        <Text type="secondary">
          Public sessions are visible to all community members. Private sessions
          require an invitation.
        </Text>
      </Form>
    </Modal>
  );
};

export default StudySessionModal;
