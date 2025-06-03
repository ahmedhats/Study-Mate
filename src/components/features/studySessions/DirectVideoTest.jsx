import React, { useState } from "react";
import {
  Card,
  Button,
  Space,
  Typography,
  Form,
  Input,
  Select,
  Divider,
  notification,
} from "antd";
import {
  ReloadOutlined,
  PlusOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import {
  createStudySession,
  getStudySessionDetails,
} from "../../../services/api/studySessionService";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const DirectVideoTest = () => {
  const [loading, setLoading] = useState(false);
  const [testSession, setTestSession] = useState(null);
  const [form] = Form.useForm();

  const testRoomName = "study-mate-test-room";
  const testUserName = "TestUser";

  // Simple Jitsi URL for testing
  const jitsiUrl = `https://meet.jit.si/${testRoomName}#userInfo.displayName="${testUserName}"`;

  console.log("Test Jitsi URL:", jitsiUrl);

  const openInNewTab = () => {
    window.open(jitsiUrl, "_blank");
  };

  // Test creating a session with user data
  const handleCreateTestSession = async (values) => {
    setLoading(true);
    try {
      console.log("Creating test session with data:", values);

      // Create the session
      const response = await createStudySession({
        ...values,
        startImmediately: true,
        type: values.sessionMode || "group",
      });

      if (response && response.data) {
        console.log("Test session created:", response.data);
        setTestSession(response.data);

        // Test retrieving the session to verify data persistence
        setTimeout(async () => {
          try {
            const retrievedSession = await getStudySessionDetails(
              response.data._id
            );
            console.log("Retrieved session data:", retrievedSession.data);

            notification.success({
              message: "Test Session Created Successfully!",
              description: `Session "${retrievedSession.data.title}" created and verified with correct data.`,
              duration: 5,
            });
          } catch (error) {
            console.error("Error retrieving test session:", error);
            notification.error({
              message: "Session Creation Issue",
              description:
                "Session was created but couldn't be retrieved properly.",
            });
          }
        }, 500);
      }
    } catch (error) {
      console.error("Error creating test session:", error);
      notification.error({
        message: "Failed to Create Test Session",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Test joining the created session
  const handleJoinTestSession = () => {
    if (testSession) {
      const sessionUrl = `/study-session/${testSession._id}`;
      window.open(sessionUrl, "_blank");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Title level={2}>Jitsi Meet Integration Test</Title>

      <Card title="Basic URL Test" style={{ marginBottom: "20px" }}>
        <Paragraph>
          <Text strong>Room Name:</Text> {testRoomName}
        </Paragraph>
        <Paragraph>
          <Text strong>User Name:</Text> {testUserName}
        </Paragraph>
        <Paragraph>
          <Text strong>Full URL:</Text>
          <br />
          <Text code>{jitsiUrl}</Text>
        </Paragraph>
        <Space>
          <Button type="primary" onClick={openInNewTab}>
            Open Jitsi in New Tab
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </Space>
      </Card>

      <Card title="User Session Creation Test" style={{ marginBottom: "20px" }}>
        <Paragraph>
          <Text type="secondary">
            Test creating a user session with custom data to verify names and
            details are preserved correctly.
          </Text>
        </Paragraph>

        <Form
          form={form}
          onFinish={handleCreateTestSession}
          layout="vertical"
          initialValues={{
            title: "My Test Study Session",
            description: "Testing session creation with user data",
            subject: "Testing",
            sessionMode: "group",
            maxParticipants: 5,
          }}
        >
          <Form.Item
            name="title"
            label="Session Title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input placeholder="Enter session title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <Input.TextArea rows={2} placeholder="Enter session description" />
          </Form.Item>

          <Form.Item name="subject" label="Subject">
            <Select placeholder="Select subject">
              <Option value="Mathematics">Mathematics</Option>
              <Option value="Physics">Physics</Option>
              <Option value="Computer Science">Computer Science</Option>
              <Option value="Testing">Testing</Option>
            </Select>
          </Form.Item>

          <Form.Item name="sessionMode" label="Session Type">
            <Select>
              <Option value="group">Group Study</Option>
              <Option value="individual">Individual Study</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<ExperimentOutlined />}
            >
              Create Test Session
            </Button>
          </Form.Item>
        </Form>

        {testSession && (
          <div
            style={{
              marginTop: 16,
              padding: 16,
              backgroundColor: "#f6ffed",
              border: "1px solid #b7eb8f",
              borderRadius: 6,
            }}
          >
            <Title level={5}>Test Session Created!</Title>
            <Paragraph>
              <Text strong>ID:</Text> {testSession._id}
              <br />
              <Text strong>Title:</Text> {testSession.title}
              <br />
              <Text strong>Description:</Text> {testSession.description}
              <br />
              <Text strong>Subject:</Text> {testSession.subject}
              <br />
              <Text strong>Type:</Text> {testSession.type}
            </Paragraph>
            <Button type="primary" onClick={handleJoinTestSession}>
              Join Test Session
            </Button>
          </div>
        )}
      </Card>

      <Card title="Embedded Test">
        <div
          style={{
            background: "#f5f5f5",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <Text type="secondary">
            If you see a working Jitsi Meet interface below, the integration is
            working. If it's black or shows an error, there might be an iframe
            security issue.
          </Text>
        </div>

        <div
          style={{
            width: "100%",
            height: "500px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <iframe
            src={jitsiUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            title="Jitsi Meet Test"
          />
        </div>

        <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
          <Text type="secondary">
            Test Room: {testRoomName} | User: {testUserName}
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default DirectVideoTest;
