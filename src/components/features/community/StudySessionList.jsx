import React from "react";
import {
  List,
  Card,
  Typography,
  Button,
  Badge,
  Tag,
  Space,
  Avatar,
  Tooltip,
  Progress,
  Empty,
  Spin,
} from "antd";
import {
  ClockCircleOutlined,
  TeamOutlined,
  BulbOutlined,
  RightOutlined,
  UserOutlined,
  LockOutlined,
  UnlockOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

const StudySessionList = ({ sessions, loading, onJoinSession }) => {
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Loading study sessions...</p>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No active study sessions"
        style={{ margin: "50px 0" }}
      />
    );
  }

  // Helper to get session status color
  const getStatusColor = (session) => {
    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);

    if (now < start) return "blue"; // Upcoming
    if (now >= start && now <= end) return "green"; // Active
    return "gray"; // Ended
  };

  // Helper to get session status text
  const getStatusText = (session) => {
    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);

    if (now < start) return "Upcoming";
    if (now >= start && now <= end) return "Active";
    return "Ended";
  };

  // Helper to get time remaining or elapsed
  const getTimeDisplay = (session) => {
    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);

    if (now < start) {
      // Upcoming: show time until start
      const diff = Math.floor((start - now) / 1000 / 60); // minutes
      if (diff < 60) return `Starts in ${diff} minutes`;
      return `Starts in ${Math.floor(diff / 60)} hours ${diff % 60} minutes`;
    }
    if (now >= start && now <= end) {
      // Active: show remaining time
      const diff = Math.floor((end - now) / 1000 / 60); // minutes
      if (diff < 60) return `${diff} minutes remaining`;
      return `${Math.floor(diff / 60)} hours ${diff % 60} minutes remaining`;
    }
    // Ended: show when it ended
    const diff = Math.floor((now - end) / 1000 / 60); // minutes
    if (diff < 60) return `Ended ${diff} minutes ago`;
    if (diff < 1440) return `Ended ${Math.floor(diff / 60)} hours ago`;
    return `Ended ${Math.floor(diff / 1440)} days ago`;
  };

  // Calculate session capacity percentage
  const getCapacityPercentage = (current, max) => {
    return Math.min(100, Math.round((current / max) * 100));
  };

  return (
    <List
      dataSource={sessions}
      renderItem={(session) => {
        const statusColor = getStatusColor(session);
        const statusText = getStatusText(session);
        const timeDisplay = getTimeDisplay(session);
        const capacityPercentage = getCapacityPercentage(
          session.participants.length,
          session.maxParticipants
        );
        const isFull = session.participants.length >= session.maxParticipants;
        const isActive = statusText === "Active";
        const isEnded = statusText === "Ended";

        return (
          <List.Item>
            <Card
              style={{ width: "100%" }}
              actions={[
                <Button
                  type="primary"
                  icon={<RightOutlined />}
                  disabled={isEnded || isFull}
                  onClick={() => onJoinSession(session.id)}
                >
                  {isEnded ? "View Summary" : isFull ? "Full" : "Join Session"}
                </Button>,
              ]}
            >
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <Space
                  align="center"
                  style={{ width: "100%", justifyContent: "space-between" }}
                >
                  <Badge
                    color={statusColor}
                    text={<Text strong>{session.title}</Text>}
                  />
                  <Tag color={statusColor}>{statusText}</Tag>
                </Space>

                <Space>
                  <BulbOutlined />
                  <Text>{session.topic}</Text>
                  {session.isPublic ? (
                    <Tooltip title="Public session">
                      <UnlockOutlined style={{ color: "#52c41a" }} />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Private session">
                      <LockOutlined style={{ color: "#faad14" }} />
                    </Tooltip>
                  )}
                </Space>

                <Space>
                  <ClockCircleOutlined />
                  <Text>{timeDisplay}</Text>
                </Space>

                <Space>
                  <CalendarOutlined />
                  <Text>
                    {new Date(session.startTime).toLocaleString()} -{" "}
                    {new Date(session.endTime).toLocaleTimeString()}
                  </Text>
                </Space>

                <div>
                  <Space
                    align="center"
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <Text>
                      <TeamOutlined /> {session.participants.length}/
                      {session.maxParticipants} participants
                    </Text>
                    <Tag
                      color={
                        session.difficulty === "beginner"
                          ? "green"
                          : session.difficulty === "intermediate"
                          ? "blue"
                          : "purple"
                      }
                    >
                      {session.difficulty.charAt(0).toUpperCase() +
                        session.difficulty.slice(1)}
                    </Tag>
                  </Space>
                  <Progress
                    percent={capacityPercentage}
                    size="small"
                    status={
                      isFull ? "exception" : isActive ? "active" : "normal"
                    }
                    showInfo={false}
                    style={{ marginTop: 8 }}
                  />
                </div>

                {session.participants.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <Text
                      type="secondary"
                      style={{ display: "block", marginBottom: 4 }}
                    >
                      Participants:
                    </Text>
                    <Avatar.Group maxCount={5}>
                      {session.participants.map((user) => (
                        <Tooltip key={user.id} title={user.name}>
                          <Avatar src={user.avatar} size="small">
                            {user.name.charAt(0)}
                          </Avatar>
                        </Tooltip>
                      ))}
                    </Avatar.Group>
                  </div>
                )}
              </Space>
            </Card>
          </List.Item>
        );
      }}
    />
  );
};

export default StudySessionList;
