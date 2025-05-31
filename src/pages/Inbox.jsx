import React, { useState, useEffect, useRef } from "react";
import { Layout, message as antMessage, Spin, Empty, Button } from "antd";
import { UserAddOutlined, MessageOutlined } from "@ant-design/icons";
import { StyledChatContainer } from "../styles/InboxStyles";
import ConversationList from "../components/features/messaging/Conversations";
import ChatContainer from "../components/features/messaging/ChatContainer";
import websocketService from "../services/websocket/websocketService";
import {
  getConversations,
  getMessages,
  sendMessage,
  markConversationAsRead,
} from "../services/api/messageService";

const { Content, Sider } = Layout;

const Inbox = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeoutId, setTypingTimeoutId] = useState(null);
  const messagesEndRef = useRef(null);
  const typingIndicatorTimeoutRef = useRef(null);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();

    // Connect to WebSocket when component mounts
    websocketService.connect();

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

  // Subscribe to WebSocket events
  useEffect(() => {
    // Handle incoming chat messages
    const handleChatMessage = (data) => {
      // Update conversation list with new message
      setConversations((prevConversations) => {
        const existingConversationIndex = prevConversations.findIndex(
          (conv) => conv.id === data.senderId || conv.id === data.conversationId
        );

        if (existingConversationIndex >= 0) {
          // Update existing conversation
          const updatedConversations = [...prevConversations];
          const conversation = updatedConversations[existingConversationIndex];

          const newMsg = {
            id: data.id || Date.now(),
            content: data.message,
            sender: conversation.name,
            isSender: false,
            time: new Date(data.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };

          // Add message to conversation
          if (conversation.messages) {
            conversation.messages.push(newMsg);
          } else {
            conversation.messages = [newMsg];
          }

          // Update last message
          conversation.lastMessage = data.message;
          conversation.time = "Just now";

          // Update unread count if this isn't the active conversation
          if (activeChat?.id !== conversation.id) {
            conversation.unread = (conversation.unread || 0) + 1;
          }

          return updatedConversations;
        } else {
          // If conversation doesn't exist yet, fetch all conversations
          fetchConversations();
          return prevConversations;
        }
      });

      // If this is the active chat, scroll to bottom
      if (messagesEndRef.current && activeChat?.id === data.conversationId) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    // Handle typing indicators
    const handleTypingStatus = (data) => {
      if (activeChat?.id === data.conversationId) {
        setIsTyping(data.isTyping);

        // Clear any existing timeout
        if (typingIndicatorTimeoutRef.current) {
          clearTimeout(typingIndicatorTimeoutRef.current);
        }

        // Set a timeout to clear typing indicator after 5 seconds
        if (data.isTyping) {
          typingIndicatorTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 5000);
        }
      }
    };

    // Subscribe to WebSocket events
    websocketService.subscribe("chat", handleChatMessage);
    websocketService.subscribe("typing", handleTypingStatus);

    // Cleanup subscriptions on unmount
    return () => {
      websocketService.unsubscribe("chat", handleChatMessage);
      websocketService.unsubscribe("typing", handleTypingStatus);

      if (typingIndicatorTimeoutRef.current) {
        clearTimeout(typingIndicatorTimeoutRef.current);
      }
    };
  }, [activeChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && activeChat?.messages?.length > 0) {
      messagesEndRef.current.scrollIntoView();
    }
  }, [activeChat?.messages]);

  // Fetch conversations from API
  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await getConversations();
      if (response.success) {
        setConversations(response.data || []);
      } else {
        throw new Error(response.message || "Failed to fetch conversations");
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      antMessage.error("Failed to load conversations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    if (chat.unread > 0) {
      markConversationAsRead(chat.id);
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.id === chat.id ? { ...conv, unread: 0 } : conv
        )
      );
    }
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Sider
        width={300}
        style={{
          background: "#fff",
          borderRight: "1px solid #f0f0f0",
        }}
      >
        <ConversationList
          conversations={conversations}
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
          loading={loading}
        />
      </Sider>
      <Content style={{ background: "#fff" }}>
        {activeChat ? (
          <ChatContainer
            conversationId={activeChat.id}
            conversationType={activeChat.type}
            title={activeChat.name}
            participants={activeChat.participants}
            currentUser={activeChat.currentUser}
            loadingMessages={messageLoading}
          />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <MessageOutlined style={{ fontSize: 48, color: "#bfbfbf" }} />
            <p style={{ color: "#bfbfbf", marginTop: 16 }}>
              Select a conversation to start messaging
            </p>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default Inbox;
