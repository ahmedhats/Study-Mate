import React, { useState, useEffect, useRef } from "react";
import { Layout, message as antMessage, Spin, Empty, Button } from "antd";
import { UserAddOutlined, MessageOutlined } from "@ant-design/icons";
import { ChatContainer } from "../styles/InboxStyles";
import ConversationList from "../components/features/inbox/ConversationList";
import ChatHeader from "../components/features/inbox/ChatHeader";
import MessagesArea from "../components/features/inbox/MessagesArea";
import InputBox from "../components/features/inbox/InputBox";
import NoChat from "../components/features/inbox/NoChat";
import NewConversationModal from "../components/features/inbox/NewConversationModal";
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
  const [newMessage, setNewMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [isNewConversationModalVisible, setIsNewConversationModalVisible] =
    useState(false);
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

      // For development: Use mock data if API fails
      setConversations([
        {
          id: "1",
          name: "Penny Adi W",
          avatar: "https://xsgames.co/randomusers/avatar.php?g=male",
          lastMessage: "Thanks a lot Doctor",
          time: "14h",
          unread: 2,
          messages: [
            {
              id: 1,
              content:
                "I just updated the task management dashboard. Can you check if everything looks good?",
              sender: "Penny Adi W",
              isSender: false,
              time: "10:30 AM",
            },
            {
              id: 2,
              content:
                "Yes, lets focus on that. Also, can you review the timeline for the project integration?",
              sender: "Me",
              isSender: true,
              time: "10:35 AM",
            },
          ],
        },
        {
          id: "2",
          name: "Nina Kartika",
          avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
          lastMessage: "Add consultation with me",
          time: "2d",
          unread: 0,
          messages: [
            {
              id: 1,
              content: "Hi, can we schedule a consultation?",
              sender: "Nina Kartika",
              isSender: false,
              time: "09:15 AM",
            },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId) => {
    setMessageLoading(true);
    try {
      const response = await getMessages(conversationId);
      if (response.success) {
        // Update the conversation with fetched messages
        setConversations((prevConversations) => {
          return prevConversations.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages: response.data || [],
                unread: 0, // Mark as read when opening
              };
            }
            return conv;
          });
        });

        // Update active chat with messages
        setActiveChat((prev) => {
          if (prev && prev.id === conversationId) {
            return {
              ...prev,
              messages: response.data || [],
              unread: 0,
            };
          }
          return prev;
        });

        // Mark conversation as read
        try {
          await markConversationAsRead(conversationId);
        } catch (error) {
          console.error("Error marking conversation as read:", error);
        }
      } else {
        throw new Error(response.message || "Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      antMessage.error("Failed to load messages. Please try again.");
    } finally {
      setMessageLoading(false);
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    const messageContent = newMessage.trim();
    setNewMessage(""); // Clear input field immediately

    // Create temp message to show in UI
    const tempId = `temp-${Date.now()}`;
    const newMsg = {
      id: tempId,
      content: messageContent,
      sender: "Me",
      isSender: true,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      pending: true, // Mark as pending until confirmed
    };

    // Update UI with pending message
    setConversations((prevConversations) => {
      return prevConversations.map((conv) => {
        if (conv.id === activeChat.id) {
          const updatedConv = {
            ...conv,
            messages: [...(conv.messages || []), newMsg],
            lastMessage: messageContent,
            time: "Just now",
          };

          // Also update activeChat
          setActiveChat(updatedConv);

          return updatedConv;
        }
        return conv;
      });
    });

    // Send through WebSocket for real-time preview
    websocketService.sendChatMessage(activeChat.id, messageContent);

    // Send through API for persistence
    try {
      const response = await sendMessage(activeChat.id, messageContent);

      if (!response.success) {
        throw new Error(response.message || "Failed to send message");
      }

      // Replace temp message with confirmed message
      setConversations((prevConversations) => {
        return prevConversations.map((conv) => {
          if (conv.id === activeChat.id) {
            return {
              ...conv,
              messages: conv.messages.map((msg) => {
                if (msg.id === tempId) {
                  return {
                    ...msg,
                    id: response.data.id || msg.id,
                    pending: false,
                  };
                }
                return msg;
              }),
            };
          }
          return conv;
        });
      });

      // Also update activeChat
      setActiveChat((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: prev.messages.map((msg) => {
            if (msg.id === tempId) {
              return {
                ...msg,
                id: response.data.id || msg.id,
                pending: false,
              };
            }
            return msg;
          }),
        };
      });
    } catch (error) {
      console.error("Error sending message:", error);
      antMessage.error("Failed to send message. Please try again.");

      // Mark message as failed
      setConversations((prevConversations) => {
        return prevConversations.map((conv) => {
          if (conv.id === activeChat.id) {
            return {
              ...conv,
              messages: conv.messages.map((msg) => {
                if (msg.id === tempId) {
                  return {
                    ...msg,
                    pending: false,
                    failed: true,
                  };
                }
                return msg;
              }),
            };
          }
          return conv;
        });
      });
    }
  };

  // Handle typing indicator
  const handleTyping = (value) => {
    setNewMessage(value);

    // If there's already a timeout, clear it
    if (typingTimeoutId) {
      clearTimeout(typingTimeoutId);
    }

    // Send typing indicator if user is typing and the function exists
    if (
      value &&
      activeChat &&
      typeof websocketService.sendTypingStatus === "function"
    ) {
      try {
        websocketService.sendTypingStatus(activeChat.id, true);

        // Set timeout to clear typing status after 2 seconds of inactivity
        const timeoutId = setTimeout(() => {
          if (typeof websocketService.sendTypingStatus === "function") {
            websocketService.sendTypingStatus(activeChat.id, false);
          }
        }, 2000);

        setTypingTimeoutId(timeoutId);
      } catch (error) {
        console.error("Error sending typing status:", error);
      }
    }
  };

  // Handle emoji selection
  const onEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  // Handle selecting a chat
  const handleSelectChat = (chat) => {
    const conversationId = chat.id;

    // If we already have this chat's messages loaded and it's the same as activeChat
    if (activeChat?.id === conversationId) {
      return;
    }

    // Find the conversation
    const selectedChat = conversations.find(
      (conv) => conv.id === conversationId
    );
    if (!selectedChat) return;

    // Set as active chat
    setActiveChat(selectedChat);

    // Mark as read in UI
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unread: 0 } : conv
      )
    );

    // Fetch messages if they don't exist or refresh them
    fetchMessages(conversationId);
  };

  // Handle creating a new conversation
  const showNewConversationModal = () => {
    setIsNewConversationModalVisible(true);
  };

  // Handle creating a new conversation
  const handleCreateConversation = (newConversation) => {
    setIsNewConversationModalVisible(false);
    if (!newConversation) return;

    // Add to conversations list
    setConversations((prev) => [newConversation, ...prev]);

    // Select the new conversation
    handleSelectChat(newConversation);
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Sider
        width={300}
        theme="light"
        style={{
          borderRight: "1px solid #f0f0f0",
          height: "100%",
          overflow: "auto",
        }}
      >
        <div
          style={{
            padding: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0 }}>Messages</h2>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={showNewConversationModal}
          >
            New Chat
          </Button>
        </div>

        {loading ? (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <Spin />
            <p style={{ marginTop: 16 }}>Loading conversations...</p>
          </div>
        ) : conversations.length > 0 ? (
          <ConversationList
            conversations={conversations}
            activeChat={activeChat}
            onSelectChat={handleSelectChat}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No conversations yet"
            style={{ margin: "40px 0" }}
          >
            <Button
              type="primary"
              icon={<MessageOutlined />}
              onClick={showNewConversationModal}
            >
              Start a Conversation
            </Button>
          </Empty>
        )}
      </Sider>

      <Content style={{ background: "#fff", position: "relative" }}>
        {activeChat ? (
          <>
            <ChatHeader activeChat={activeChat} isTyping={isTyping} />
            <ChatContainer>
              {messageLoading ? (
                <div style={{ padding: "40px 0", textAlign: "center" }}>
                  <Spin />
                  <p style={{ marginTop: 16 }}>Loading messages...</p>
                </div>
              ) : (
                <>
                  <MessagesArea
                    messages={activeChat.messages || []}
                    messagesEndRef={messagesEndRef}
                  />
                  <InputBox
                    value={newMessage}
                    onChange={handleTyping}
                    onSend={handleSendMessage}
                    onEmojiClick={onEmojiClick}
                  />
                </>
              )}
            </ChatContainer>
          </>
        ) : (
          <NoChat onNewChat={showNewConversationModal} />
        )}
      </Content>

      <NewConversationModal
        visible={isNewConversationModalVisible}
        onCancel={() => setIsNewConversationModalVisible(false)}
        onCreateConversation={handleCreateConversation}
      />
    </Layout>
  );
};

export default Inbox;
