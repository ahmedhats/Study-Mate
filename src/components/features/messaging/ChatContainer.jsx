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
  Spin,
  Empty,
  message as antMessage,
  Tooltip,
} from "antd";
import {
  SendOutlined,
  UserOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import websocketService from "../../../services/websocket/websocketService";
import { useMessaging } from "../../../context/MessagingContext";

const { Text } = Typography;
const { TextArea } = Input;

// Helper function to generate an avatar color based on name (reused from CommunityChat)
const getAvatarColor = (name) => {
  if (!name) return "#1890ff";

  // Simple hash function for the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert hash to a color
  const colors = [
    "#f56a00", "#7265e6", "#ffbf00", "#00a2ae",
    "#1890ff", "#52c41a", "#722ed1", "#eb2f96", "#faad14"
  ];

  return colors[Math.abs(hash) % colors.length];
};

/**
 * A reusable chat container component that works with all conversation types
 */
const ChatContainer = ({
  conversationId,
  conversationType = "DM", // Can be "DM", "COMMUNITY", or "STUDY_SESSION"
  title,
  participants = [],
  canSendMessages = true,
  onJoinClick = null, // For joining communities or study sessions
  currentUser,
  loadingMessages,
  onLoadMoreMessages = null,
}) => {
  const {
    activeConversationMessages,
    actions,
    error
  } = useMessaging();

  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTypingInThisChat, setIsTypingInThisChat] = useState(false);
  const [typingUserInThisChat, setTypingUserInThisChat] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleTypingStartForUI = useCallback((data) => {
    if (data.conversationId === conversationId && data.user?.id !== currentUser?._id) {
      setIsTypingInThisChat(true);
      setTypingUserInThisChat(data.user);
    }
  }, [conversationId, currentUser?._id]);

  const handleTypingStopForUI = useCallback((data) => {
    if (data.conversationId === conversationId && data.user?.id === typingUserInThisChat?.id) {
      setIsTypingInThisChat(false);
      setTypingUserInThisChat(null);
    }
  }, [conversationId, typingUserInThisChat?.id]);

  useEffect(() => {
    websocketService.subscribe("SERVER:TYPING_START", handleTypingStartForUI);
    websocketService.subscribe("SERVER:TYPING_STOP", handleTypingStopForUI);

    return () => {
      websocketService.unsubscribe("SERVER:TYPING_START", handleTypingStartForUI);
      websocketService.unsubscribe("SERVER:TYPING_STOP", handleTypingStopForUI);
    };
  }, [conversationId, handleTypingStartForUI, handleTypingStopForUI]);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversationMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    console.log('ChatContainer: handleSendMessage called', { newMessage, canSendMessages, currentUser, conversationId });
    if (!newMessage.trim() || !canSendMessages || !currentUser) return;

    setIsSending(true);
    const messageContent = {
      type: "TEXT",
      text: newMessage.trim(),
    };
    
    try {
      await actions.sendMessage(conversationId, messageContent);
      setNewMessage("");
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
        websocketService.sendMessage("CLIENT:TYPING_STOP", { conversationId });
      }
    } catch (sendError) {
      // Error is already set in context by actions.sendMessage if it fails
      // antMessage.error(error?.message || "Failed to send message. Please try again.");
      // The context's error state can be displayed by MessagingPage or here if specific UI needed
    } finally {
      setIsSending(false);
    }
  };

  const handleTextChange = (e) => {
    setNewMessage(e.target.value);
    if (!currentUser) return;

    if (!typingTimeoutRef.current) {
      websocketService.sendMessage("CLIENT:TYPING_START", {
        conversationId,
        user: { id: currentUser._id, name: currentUser.name },
      });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      websocketService.sendMessage("CLIENT:TYPING_STOP", { conversationId, userId: currentUser._id });
      typingTimeoutRef.current = null;
    }, 3000); // 3 seconds of inactivity
  };

  const renderMessageItem = (item) => {
    if (!currentUser) return null;
    const isSender = item.senderId === currentUser._id || item.senderId === currentUser.id;
    const avatarColor = getAvatarColor(item.senderName);

    return (
      <List.Item
        key={item._id || `pending-${item.timestamp}`}
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
                borderRadius: isSender
                  ? "15px 15px 0 15px"
                  : "15px 15px 15px 0",
              }}
              style={{ border: "none" }}
            >
              {!isSender && <Text strong style={{display: 'block', marginBottom: '2px'}}>{item.senderName}</Text>}
              <Text style={{ color: isSender ? "white" : "black" }}>
                {item.content?.text || item.text /* Handle both structures if needed */}
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
            {item.pending && <Spin size="small" style={{marginLeft: 5}}/>}
            {item.failed && <Tooltip title="Failed to send"><InfoCircleOutlined style={{color: 'red', marginLeft: 5}}/></Tooltip>}
          </Text>
        </Space>
      </List.Item>
    );
  };
  
  const renderSystemMessage = (item) => (
    <List.Item style={{ textAlign: 'center', width: '100%' }}>
      <Text type="secondary" style={{ fontStyle: 'italic' }}>
        {item.content?.text || item.text}
      </Text>
      <Divider style={{margin: '5px 0'}}/>
    </List.Item>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '10px' }}>
        {loadingMessages && <div style={{textAlign: 'center'}}><Spin tip="Loading messages..."/></div>}
        {!loadingMessages && activeConversationMessages.length === 0 && (
          <Empty description="No messages yet. Start the conversation!" />
        )}
        <List
          dataSource={activeConversationMessages}
          renderItem={(item) => 
             item.content?.type === 'SYSTEM_NOTIFICATION' 
               ? renderSystemMessage(item)
               : renderMessageItem(item)
          }
          split={false}
        />
        {isTypingInThisChat && typingUserInThisChat && (
          <div style={{ paddingLeft: '10px', fontStyle: 'italic', color: 'gray' }}>
            {typingUserInThisChat.name} is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ padding: '10px', borderTop: '1px solid #f0f0f0' }}>
        {canSendMessages ? (
          <Space.Compact style={{ width: "100%" }}>
            <TextArea
              value={newMessage}
              onChange={handleTextChange}
              placeholder="Type a message..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              onPressEnter={(e) => {
                console.log('ChatContainer: TextArea onPressEnter triggered');
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => {
                console.log('ChatContainer: Send Button onClick triggered');
                handleSendMessage();
              }}
              loading={isSending}
            />
          </Space.Compact>
        ) : (
          <Button type="primary" onClick={onJoinClick} block>
            Join {conversationType === 'COMMUNITY' ? 'Community' : 'Study Session'} to Chat
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChatContainer; 