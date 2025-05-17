import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { useMessaging } from "../../../context/MessagingContext";

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
  currentUser,
}) => {
  const {
    activeConversationId,
    activeConversationMessages,
    loading,
    error,
    actions,
  } = useMessaging();

  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversationMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;
    if (!isMember) {
      antMessage.error("You must join the community to send messages.");
      return;
    }
    if (!activeConversationId) {
      antMessage.error("Cannot send message: No active community conversation selected in context.");
      return;
    }

    setIsSending(true);
    const messageContent = {
      type: "TEXT",
      text: newMessage.trim(),
    };

    try {
      await actions.sendMessage(activeConversationId, messageContent);
      setNewMessage("");
    } catch (sendError) {
      // Error state is set in context by actions.sendMessage
      // antMessage.error(error?.message || "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const renderMessageItem = (item) => {
    if (!currentUser) return null;
    const isSender = item.senderId === currentUser._id || item.senderId === currentUser.id;
    const avatarColor = getAvatarColor(item.senderName);

    if (item.content?.type === "STUDY_SESSION_ANNOUNCEMENT" || item.contentType === "STUDY_SESSION_ANNOUNCEMENT") {
      return (
        <List.Item style={{ textAlign: 'center', width: '100%', margin: '10px 0'}} key={item._id || item.id}>
          <Card size="small" style={{ backgroundColor: '#e6f7ff', border: '1px solid #91d5ff'}}>
            <Space direction="vertical" align="center">
              <Tag color="blue" icon={<CalendarOutlined />}>Study Session Announcement</Tag>
              <Text strong>{item.content?.title || item.title}</Text>
              <Text type="secondary">Topic: {item.content?.topic || item.topic}</Text>
              <Text type="secondary">Starts: {new Date(item.content?.startTime || item.startTime).toLocaleString()}</Text>
              <Button type="primary" size="small" onClick={() => {/* Handle join session */}}>View & Join</Button>
            </Space>
          </Card>
        </List.Item>
      );
    }

    return (
      <List.Item
        key={item._id || item.id || `pending-${item.timestamp}`}
        style={{
          textAlign: isSender ? "right" : "left",
          marginBottom: "10px",
          paddingRight: isSender ? 0 : "20%",
          paddingLeft: isSender ? "20%" : 0,
        }}
        className={isSender ? "message-sent" : "message-received"}
      >
        <Space direction="vertical" align={isSender ? "end" : "start"} style={{ width: '100%' }}>
          <Space align="start">
            {!isSender && (
              <Avatar
                src={item.senderAvatar}
                style={{ backgroundColor: !item.senderAvatar ? avatarColor : undefined }}
                icon={!item.senderAvatar && <UserOutlined />}
              >
                {!item.senderAvatar && item.senderName ? item.senderName[0].toUpperCase() : null}
              </Avatar>
            )}
            <Card
              size="small"
              bodyStyle={{
                padding: "8px 12px",
                backgroundColor: isSender ? "#1890ff" : "#f0f0f0",
                color: isSender ? "white" : "black",
                borderRadius: isSender ? "15px 15px 0 15px" : "15px 15px 15px 0",
              }}
              style={{ border: "none" }}
            >
              {!isSender && <Text strong style={{display: 'block', marginBottom: '2px'}}>{item.senderName}</Text>}
              <Text style={{ color: isSender ? "white" : "black" }}>
                {item.content?.text || item.text}
              </Text>
            </Card>
            {isSender && (
              <Avatar
                src={currentUser.avatar}
                style={{ backgroundColor: !currentUser.avatar ? getAvatarColor(currentUser.name) : undefined }}
                icon={!currentUser.avatar && <UserOutlined />}
              >
                {!currentUser.avatar && currentUser.name ? currentUser.name[0].toUpperCase() : null}
              </Avatar>
            )}
          </Space>
          <Text type="secondary" style={{ fontSize: "11px", padding: '0 5px' }}>
            {new Date(item.timestamp || item.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            {/* Add pending/failed indicators from context if actions.sendMessage provides them */}
          </Text>
        </Space>
      </List.Item>
    );
  };

  if (loading.messages && !activeConversationMessages.length) {
    return <div style={{textAlign: 'center', padding: '50px'}}><Spin tip="Loading chat..." size="large"/></div>;
  }
  
  if (error && error.type === 'fetch' && error.message.includes(activeConversationId)) {
      return <Alert message="Error" description={`Failed to load messages: ${error.message}`} type="error" showIcon style={{margin: 20}}/>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 250px)', /* Adjust height as needed */ }}>
      {/* Community Chat Header (Optional) */}
      {/* <Title level={5}>{communityName} Chat</Title> <Divider/> */}

      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '10px' }}>
        {activeConversationMessages.length === 0 && !loading.messages && (
          <Empty description="No messages in this community yet. Be the first!" />
        )}
        <List
          dataSource={activeConversationMessages}
          renderItem={renderMessageItem}
          split={false}
        />
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '10px', borderTop: '1px solid #f0f0f0' }}>
        {isMember ? (
          <Space.Compact style={{ width: "100%" }}>
            <TextArea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              autoSize={{ minRows: 1, maxRows: 3 }}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isSending}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              loading={isSending}
            />
          </Space.Compact>
        ) : (
          <Button type="primary" onClick={onJoinCommunity} block icon={<UserAddOutlined />}>
            Join Community to Chat
          </Button>
        )}
      </div>
    </div>
  );
};

export default CommunityChat;
