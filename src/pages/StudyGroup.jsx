import React, { useState } from "react";
import { Card, Button, List, Avatar, Space, Modal, Input, Select } from "antd";
import {
  VideoCameraOutlined,
  AudioOutlined,
  MessageOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import "../styles/StudyGroup.css";

const { Option } = Select;

const StudyGroup = () => {
  const [sessions, setSessions] = useState([
    {
      id: 1,
      title: "Math Study Group",
      host: "Alex Johnson",
      participants: 4,
      subject: "Mathematics",
      time: "Today at 3:00 PM",
    },
    {
      id: 2,
      title: "Physics Partner Session",
      host: "Sarah Smith",
      participants: 2,
      subject: "Physics",
      time: "Tomorrow at 2:00 PM",
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleJoinSession = (session) => {
    // Handle joining video/audio session
    console.log("Joining session:", session);
  };

  const handleCreateSession = (values) => {
    // Handle creating new study session
    console.log("Creating session:", values);
    setIsModalVisible(false);
  };

  return (
    <div className="study-group-container">
      <div className="study-group-header">
        <h1>Study Together</h1>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Create Study Session
        </Button>
      </div>

      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={sessions}
        renderItem={(session) => (
          <List.Item>
            <Card className="session-card">
              <List.Item.Meta
                avatar={<Avatar>{session.host[0]}</Avatar>}
                title={session.title}
                description={`Hosted by ${session.host}`}
              />
              <div className="session-info">
                <p>Subject: {session.subject}</p>
                <p>Time: {session.time}</p>
                <p>Participants: {session.participants}</p>
              </div>
              <Space className="session-actions">
                <Button
                  type="primary"
                  icon={<VideoCameraOutlined />}
                  onClick={() => handleJoinSession(session)}
                >
                  Join Video
                </Button>
                <Button
                  icon={<AudioOutlined />}
                  onClick={() => handleJoinSession(session)}
                >
                  Join Audio
                </Button>
                <Button
                  icon={<MessageOutlined />}
                  onClick={() => handleJoinSession(session)}
                >
                  Chat
                </Button>
              </Space>
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title="Create Study Session"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleCreateSession}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input placeholder="Session Title" />
          <Select placeholder="Select Subject" style={{ width: "100%" }}>
            <Option value="mathematics">Mathematics</Option>
            <Option value="physics">Physics</Option>
            <Option value="chemistry">Chemistry</Option>
            <Option value="biology">Biology</Option>
          </Select>
          <Input placeholder="Time" />
          <Input placeholder="Maximum Participants" type="number" />
        </Space>
      </Modal>
    </div>
  );
};

export default StudyGroup;
