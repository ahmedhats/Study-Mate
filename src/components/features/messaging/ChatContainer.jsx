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
  SmileOutlined,
} from "@ant-design/icons";
import websocketService from "../../../services/websocket/websocketService";
import { useMessaging } from "../../../context/MessagingContext";
import EmojiPicker from "emoji-picker-react";
import {
  MessageContainer,
  ChatContainer as StyledChatContainer,
  MessagesArea,
  InputContainer,
} from "../../../styles/InboxStyles";
import { LoadingOutlined, WarningOutlined } from "@ant-design/icons";

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
    "#f56a00",
    "#7265e6",
    "#ffbf00",
    "#00a2ae",
    "#1890ff",
    "#52c41a",
    "#722ed1",
    "#eb2f96",
    "#faad14",
  ];

  return colors[Math.abs(hash) % colors.length];
};

const getProfileImageUrl = (profileImage) => {
  if (!profileImage) return undefined;
  if (profileImage.startsWith("http")) return profileImage;
  return process.env.REACT_APP_BACKEND_URL + profileImage;
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
  const { activeConversationMessages, actions, error } = useMessaging();

  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTypingInThisChat, setIsTypingInThisChat] = useState(false);
  const [typingUserInThisChat, setTypingUserInThisChat] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);

  const handleTypingStartForUI = useCallback(
    (data) => {
      if (
        data.conversationId === conversationId &&
        data.user?.id !== currentUser?._id
      ) {
        setIsTypingInThisChat(true);
        setTypingUserInThisChat(data.user);
      }
    },
    [conversationId, currentUser?._id]
  );

  const handleTypingStopForUI = useCallback(
    (data) => {
      if (
        data.conversationId === conversationId &&
        data.user?.id === typingUserInThisChat?.id
      ) {
        setIsTypingInThisChat(false);
        setTypingUserInThisChat(null);
      }
    },
    [conversationId, typingUserInThisChat?.id]
  );

  useEffect(() => {
    websocketService.subscribe("SERVER:TYPING_START", handleTypingStartForUI);
    websocketService.subscribe("SERVER:TYPING_STOP", handleTypingStopForUI);

    return () => {
      websocketService.unsubscribe(
        "SERVER:TYPING_START",
        handleTypingStartForUI
      );
      websocketService.unsubscribe("SERVER:TYPING_STOP", handleTypingStopForUI);
    };
  }, [conversationId, handleTypingStartForUI, handleTypingStopForUI]);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversationMessages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    console.log("ChatContainer: handleSendMessage called", {
      newMessage,
      canSendMessages,
      currentUser,
      conversationId,
    });
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
      websocketService.sendMessage("CLIENT:TYPING_STOP", {
        conversationId,
        userId: currentUser._id,
      });
      typingTimeoutRef.current = null;
    }, 3000); // 3 seconds of inactivity
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
      setShowEmojiPicker(false);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  const renderMessageItem = (item) => {
    if (!currentUser) return null;
    // User's own messages (sender) are on the right, others on the left
    const isSender =
      item.senderId === currentUser._id || item.senderId === currentUser.id;
    const avatarColor = getAvatarColor(item.senderName);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: isSender ? "row-reverse" : "row",
          alignItems: "flex-end",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            flexShrink: 0,
            margin: isSender ? "0 0 0 12px" : "0 12px 0 0",
          }}
        >
          <Avatar
            src={
              getProfileImageUrl(
                isSender ? currentUser.profileImage : item.senderProfileImage
              ) || undefined
            }
            style={{
              backgroundColor: !(isSender
                ? currentUser.profileImage
                : item.senderProfileImage)
                ? avatarColor
                : undefined,
              width: 44,
              height: 44,
              fontSize: 20,
            }}
            icon={
              !(isSender
                ? currentUser.profileImage
                : item.senderProfileImage) && <UserOutlined />
            }
          >
            {!(isSender ? currentUser.profileImage : item.senderProfileImage) &&
              (isSender
                ? currentUser.name[0].toUpperCase()
                : item.senderName[0].toUpperCase())}
          </Avatar>
        </div>
        {/* Message Bubble */}
        <MessageContainer
          key={item._id || `pending-${item.timestamp}`}
          isSender={isSender}
          style={{ margin: 0 }}
        >
          <Space
            direction="vertical"
            align={isSender ? "end" : "start"}
            style={{ width: "100%" }}
          >
            {!isSender && (
              <Text strong style={{ display: "block", marginBottom: "2px" }}>
                {item.senderName}
              </Text>
            )}
            <Text style={{ color: "#222", fontSize: 16, lineHeight: 1.6 }}>
              {item.content?.text || item.text}
            </Text>
            <div
              style={{
                marginTop: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: isSender ? "flex-end" : "flex-start",
                gap: 8,
              }}
            >
              <Text
                style={{
                  fontSize: "13px",
                  color: isSender ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.45)",
                }}
              >
                {new Date(item.timestamp || item.createdAt).toLocaleTimeString(
                  [],
                  { hour: "numeric", minute: "2-digit" }
                )}
              </Text>
              {isSender && (
                <span style={{ marginLeft: 8 }}>
                  {item.pending && (
                    <LoadingOutlined
                      style={{
                        fontSize: 14,
                        color: "rgba(0,0,0,0.45)",
                      }}
                    />
                  )}
                  {item.failed && (
                    <Tooltip title="Failed to send">
                      <InfoCircleOutlined
                        style={{
                          fontSize: 14,
                          color: "#ff4d4f",
                          marginLeft: 5,
                        }}
                      />
                    </Tooltip>
                  )}
                </span>
              )}
            </div>
          </Space>
        </MessageContainer>
      </div>
    );
  };

  const renderSystemMessage = (item) => (
    <MessageContainer style={{ textAlign: "center", width: "100%" }}>
      <Text type="secondary" style={{ fontStyle: "italic" }}>
        {item.content?.text || item.text}
      </Text>
      <Divider style={{ margin: "5px 0" }} />
    </MessageContainer>
  );

  return (
    <StyledChatContainer>
      <MessagesArea>
        {loadingMessages && (
          <div style={{ textAlign: "center" }}>
            <Spin tip="Loading messages..." />
          </div>
        )}
        {!loadingMessages && activeConversationMessages.length === 0 && (
          <Empty description="No messages yet. Start the conversation!" />
        )}
        <List
          dataSource={activeConversationMessages}
          renderItem={(item) =>
            item.content?.type === "SYSTEM_NOTIFICATION"
              ? renderSystemMessage(item)
              : renderMessageItem(item)
          }
          split={false}
        />
        {isTypingInThisChat && typingUserInThisChat && (
          <div
            style={{ paddingLeft: "10px", fontStyle: "italic", color: "gray" }}
          >
            {typingUserInThisChat.name} is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </MessagesArea>
      <InputContainer
        style={{
          boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
          borderRadius: "0 0 16px 16px",
          marginTop: 8,
        }}
      >
        <div style={{ position: "relative", width: "100%" }}>
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              style={{
                position: "absolute",
                bottom: "100%",
                right: 0,
                zIndex: 1000,
                marginBottom: "8px",
              }}
            >
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
          <Input
            size="large"
            value={newMessage}
            onChange={handleTextChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            style={{
              width: "100%",
              borderRadius: 12,
              fontSize: 16,
              padding: "14px 18px",
            }}
            suffix={
              <div
                style={{ display: "flex", gap: "16px", alignItems: "center" }}
              >
                <SmileOutlined
                  ref={emojiButtonRef}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  style={{ color: "#1976d2", cursor: "pointer", fontSize: 26 }}
                />
                <SendOutlined
                  onClick={handleSendMessage}
                  style={{ color: "#1976d2", cursor: "pointer", fontSize: 26 }}
                />
              </div>
            }
          />
        </div>
      </InputContainer>
    </StyledChatContainer>
  );
};

export default ChatContainer;
