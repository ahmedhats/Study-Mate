import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  List,
  Avatar,
  Spin,
  Empty,
  Typography,
  Modal,
  message,
  Input,
} from "antd";
import { PlusOutlined, VideoCameraOutlined } from "@ant-design/icons";
import {
  getCommunityStudySessions,
  createStudySession,
  joinStudySession,
} from "../../../services/api/studySessionService";

const { Title, Text } = Typography;

const CommunityStudySessions = ({ communityId, isMember }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newSession, setNewSession] = useState({ title: "", description: "" });

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line
  }, [communityId]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await getCommunityStudySessions(communityId);
      setSessions(response.data || []);
    } catch (error) {
      message.error("Failed to fetch community study sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    setCreating(true);
    try {
      const response = await createStudySession({
        ...newSession,
        communityId,
      });
      setSessions([response.data, ...sessions]);
      setIsModalVisible(false);
      setNewSession({ title: "", description: "" });
      message.success("Study session created!");
    } catch (error) {
      message.error("Failed to create study session");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinSession = async (sessionId) => {
    try {
      await joinStudySession(sessionId);
      message.success("Joined study session!");
      // Optionally, navigate to the session room
    } catch (error) {
      message.error("Failed to join study session");
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Study Sessions
        </Title>
        {isMember && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Create Session
          </Button>
        )}
      </div>
      {loading ? (
        <Spin size="large" style={{ display: "block", margin: "40px auto" }} />
      ) : sessions.length === 0 ? (
        <Empty description="No study sessions for this community yet." />
      ) : (
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={sessions}
          renderItem={(session) => (
            <List.Item>
              <Card
                title={session.title}
                actions={[
                  <Button
                    type="primary"
                    icon={<VideoCameraOutlined />}
                    onClick={() => handleJoinSession(session._id)}
                    disabled={!isMember}
                  >
                    Join
                  </Button>,
                ]}
              >
                <Text>{session.description}</Text>
                <div style={{ marginTop: 12 }}>
                  <Avatar.Group maxCount={4}>
                    {(session.participants || []).map((p) => (
                      <Avatar key={p._id}>{p.name?.[0] || "?"}</Avatar>
                    ))}
                  </Avatar.Group>
                  <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
                    {(session.participants || []).length} participants
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
      <Modal
        title="Create Study Session"
        open={isModalVisible}
        onOk={handleCreateSession}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={creating}
      >
        <Input
          placeholder="Session Title"
          value={newSession.title}
          onChange={(e) =>
            setNewSession({ ...newSession, title: e.target.value })
          }
          style={{ marginBottom: 12 }}
        />
        <Input.TextArea
          placeholder="Description"
          value={newSession.description}
          onChange={(e) =>
            setNewSession({ ...newSession, description: e.target.value })
          }
          rows={3}
        />
      </Modal>
    </div>
  );
};

export default CommunityStudySessions;
