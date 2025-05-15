import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Input,
  Button,
  List,
  Avatar,
  Typography,
  Divider,
  Space,
  Badge,
  Tag,
  Tooltip,
  Spin,
  Empty,
  message as antMessage,
  Alert,
} from "antd";
import {
  SendOutlined,
  ClockCircleOutlined,
  UserAddOutlined,
  CalendarOutlined,
  TeamOutlined,
  BulbOutlined,
  UserOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  getCommunityChat,
  sendCommunityMessage,
} from "../../../services/api/communityService";

const { Text, Title } = Typography;
const { TextArea } = Input;

// Helper function to generate an avatar color based on name
const getAvatarColor = (name) => {
  if (!name) return "#1890ff";

  // Simple hash function for the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert hash to a color
  const colors = [
    "#f56a00",
    "#7265e6",
    "#ffbf00",
    "#00a2ae",
    "#f56a00",
    "#1890ff",
    "#52c41a",
    "#722ed1",
    "#eb2f96",
    "#faad14",
  ];

  return colors[Math.abs(hash) % colors.length];
};

const CommunityChat = ({
  communityId,
  communityName,
  isMember = false,
  onJoinCommunity,
}) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [studySessions, setStudySessions] = useState([]);
  const messagesEndRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user from localStorage
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const parsed = JSON.parse(userData);
        setCurrentUser(parsed.user || parsed);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }

    if (communityId) {
      fetchCommunityChat();
    }
  }, [communityId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchCommunityChat = async () => {
    setLoading(true);
    try {
      const response = await getCommunityChat(communityId);
      if (response.success) {
        setMessages(response.data.messages || []);
        setStudySessions(response.data.studySessions || []);
      }
    } catch (error) {
      console.error("Error fetching community chat:", error);
      antMessage.error("Failed to load chat messages");
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    if (!isMember) {
      antMessage.error("You must join the community to send messages");
      return;
    }

    // Optimistically add message to UI
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: message,
      sender: {
        id: "currentUser",
        name: currentUser?.name || "You",
        avatar: currentUser?.avatar || null,
      },
      timestamp: new Date().toISOString(),
      type: "message",
      pending: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setMessage("");
    setSending(true);

    try {
      const response = await sendCommunityMessage(communityId, message);
      if (response.success) {
        // Replace temp message with confirmed one
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessage.id
              ? { ...response.data, pending: false }
              : msg
          )
        );
      } else {
        // Mark as failed
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessage.id
              ? { ...msg, pending: false, failed: true }
              : msg
          )
        );
        antMessage.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending community message:", error);
      // Mark as failed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id
            ? { ...msg, pending: false, failed: true }
            : msg
        )
      );
      antMessage.error("Error sending message");
    } finally {
      setSending(false);
    }
  };

  const renderMessageItem = (item) => {
    // Determine if this is a message or study session announcement
    if (item.type === "study_session") {
      return (
        <div
          style={{
            textAlign: "center",
            padding: "8px 16px",
            margin: "8px 0",
            background: "#f0f5ff",
            borderRadius: "8px",
          }}
        >
          <Space direction="vertical" size="small" align="center">
            <Tag color="blue" icon={<CalendarOutlined />}>
              Study Session
            </Tag>
            <Text strong>{item.title}</Text>
            <Text type="secondary">
              <ClockCircleOutlined />{" "}
              {new Date(item.startTime).toLocaleString()} -{" "}
              {new Date(item.endTime).toLocaleTimeString()}
            </Text>
            <Text>
              <TeamOutlined /> {item.participants} participants
            </Text>
            {item.topic && (
              <Text>
                <BulbOutlined /> Topic: {item.topic}
              </Text>
            )}
            <Button type="primary" size="small">
              Join Session
            </Button>
          </Space>
        </div>
      );
    }

    // Regular message
    const isCurrentUser = item.sender.id === "currentUser";
    const avatarColor = getAvatarColor(item.sender.name);
    const senderInitial = item.sender.name
      ? item.sender.name[0].toUpperCase()
      : "?";

    return (
      <List.Item
        style={{
          flexDirection: isCurrentUser ? "row-reverse" : "row",
          alignItems: "flex-start",
          padding: "8px 16px",
        }}
      >
        <Avatar
          src={item.sender.avatar}
          icon={!item.sender.avatar && <UserOutlined />}
          style={{
            marginRight: isCurrentUser ? 0 : 12,
            marginLeft: isCurrentUser ? 12 : 0,
            backgroundColor: !item.sender.avatar ? avatarColor : undefined,
          }}
        >
          {!item.sender.avatar && senderInitial}
        </Avatar>
        <div
          style={{
            maxWidth: "70%",
            textAlign: isCurrentUser ? "right" : "left",
          }}
        >
          <Text strong>{isCurrentUser ? "You" : item.sender.name}</Text>
          <div
            style={{
              background: isCurrentUser ? "#1890ff" : "#f0f0f0",
              color: isCurrentUser ? "white" : "inherit",
              borderRadius: "12px",
              padding: "8px 12px",
              marginTop: 4,
              position: "relative",
              wordBreak: "break-word",
            }}
          >
            {item.content}
            {item.pending && (
              <Tooltip title="Sending...">
                <Spin size="small" style={{ marginLeft: 8 }} />
              </Tooltip>
            )}
            {item.failed && (
              <Tooltip title="Failed to send. Click to retry.">
                <Button
                  type="text"
                  danger
                  size="small"
                  onClick={() => retryMessage(item.id)}
                >
                  Retry
                </Button>
              </Tooltip>
            )}
          </div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {new Date(item.timestamp).toLocaleTimeString()}
          </Text>
        </div>
      </List.Item>
    );
  };

  const retryMessage = (messageId) => {
    const failedMessage = messages.find((m) => m.id === messageId);
    if (failedMessage) {
      // Remove the failed message
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      // Reset the message input and send again
      setMessage(failedMessage.content);
    }
  };

  return (
    <Card
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            {communityName} Chat
          </Title>
          <Badge count={studySessions.length} offset={[-5, 5]}>
            <Tooltip title="Active study sessions">
              <Button icon={<CalendarOutlined />} type="text">
                Study Sessions
              </Button>
            </Tooltip>
          </Badge>
        </Space>
      }
      style={{ height: "100%" }}
      bodyStyle={{
        height: "calc(100% - 58px)",
        padding: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {!isMember && (
        <Alert
          message="Join the community to participate in the chat"
          description="You can view messages, but you need to join this community to send messages and participate in discussions."
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ margin: "12px" }}
          action={
            <Button
              size="small"
              type="primary"
              icon={<UserAddOutlined />}
              onClick={onJoinCommunity}
            >
              {" "}
              Join Community{" "}
            </Button>
          }
        />
      )}

      {loading ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spin size="large" />
        </div>
      ) : messages.length > 0 || studySessions.length > 0 ? (
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
          <List
            dataSource={[...messages, ...studySessions].sort(
              (a, b) =>
                new Date(a.timestamp || a.startTime) -
                new Date(b.timestamp || b.startTime)
            )}
            renderItem={renderMessageItem}
            split={false}
          />
          <div ref={messagesEndRef} />
        </div>
      ) : (
        <Empty
          description="No messages yet. Be the first to start a conversation!"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        />
      )}

      <div style={{ padding: "12px 16px", borderTop: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex" }}>
          <TextArea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              isMember ? "Type a message..." : "Join community to send messages"
            }
            autoSize={{ minRows: 1, maxRows: 4 }}
            onPressEnter={(e) => {
              if (!e.shiftKey && isMember) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={sending || !isMember}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={sending}
            disabled={!isMember}
            style={{ marginLeft: 8, alignSelf: "flex-end" }}
          />
        </div>
        <div style={{ marginTop: 8, textAlign: "right" }}>
          <Button
            type="link"
            icon={<CalendarOutlined />}
            size="small"
            disabled={!isMember}
          >
            Create Study Session
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CommunityChat;
