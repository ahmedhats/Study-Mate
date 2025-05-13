import React, { useState, useEffect } from "react";
import { Card, Button, Input, List, Avatar, message, Modal, Form } from "antd";
import {
  UserOutlined,
  VideoCameraOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  createStudySession,
  joinStudySession,
  leaveStudySession,
} from "../services/api/studySessionService";

const { TextArea } = Input;

const StudySession = () => {
  const [sessions, setSessions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/study-sessions");
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      message.error("Failed to fetch study sessions");
    }
  };

  const handleCreateSession = async (values) => {
    try {
      const session = await createStudySession(values);
      setSessions([...sessions, session]);
      setIsModalVisible(false);
      form.resetFields();
      message.success("Study session created successfully");
    } catch (error) {
      message.error("Failed to create study session");
    }
  };

  const handleJoinSession = async (sessionId) => {
    try {
      await joinStudySession(sessionId);
      navigate(`/study-session/${sessionId}`);
      message.success("Joined study session successfully");
    } catch (error) {
      message.error("Failed to join study session");
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title="Study Sessions"
        extra={
          <Button
            type="primary"
            onClick={() => setIsModalVisible(true)}
            icon={<VideoCameraOutlined />}
          >
            Create Session
          </Button>
        }
      >
        <List
          dataSource={sessions}
          renderItem={(session) => (
            <List.Item
              actions={[
                <Button
                  type="primary"
                  onClick={() => handleJoinSession(session._id)}
                >
                  Join
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={session.title}
                description={
                  <div>
                    <p>{session.description}</p>
                    <p>
                      <MessageOutlined /> {session.participants.length}{" "}
                      participants
                    </p>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="Create Study Session"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreateSession} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input placeholder="Enter session title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <TextArea rows={4} placeholder="Enter session description" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create Session
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudySession;
