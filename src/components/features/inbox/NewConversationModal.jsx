import React, { useState, useEffect } from "react";
import {
  Modal,
  Input,
  List,
  Avatar,
  Typography,
  Spin,
  Empty,
  Button,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import {
  searchUsers,
  createConversation,
} from "../../../services/api/messageService";

const { Text } = Typography;
const { Search } = Input;

/**
 * Modal for creating a new conversation with another user
 */
const NewConversationModal = ({ visible, onCancel, onCreateConversation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setSearchQuery("");
      setSearchResults([]);
      setError(null);
    }
  }, [visible]);

  // Handle search query change
  const handleSearch = async (value) => {
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setError(null);

    try {
      const response = await searchUsers(value);
      if (response.success) {
        setSearchResults(response.data || []);
      } else {
        throw new Error(response.message || "Failed to search users");
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setError("Failed to search users. Please try again.");

      // Mock data for development
      setSearchResults([
        {
          _id: "user1",
          name: "John Doe",
          email: "john@example.com",
          avatar: "https://xsgames.co/randomusers/avatar.php?g=male",
        },
        {
          _id: "user2",
          name: "Jane Smith",
          email: "jane@example.com",
          avatar: "https://xsgames.co/randomusers/avatar.php?g=female",
        },
      ]);
    } finally {
      setSearching(false);
    }
  };

  // Start conversation with selected user
  const startConversation = async (user) => {
    setCreating(true);

    try {
      const response = await createConversation(user._id);
      if (response.success) {
        onCreateConversation(response.data);
      } else {
        throw new Error(response.message || "Failed to create conversation");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      setError("Failed to start conversation. Please try again.");

      // Mock data for development
      const mockConversation = {
        id: user._id,
        name: user.name,
        avatar:
          user.avatar || "https://xsgames.co/randomusers/avatar.php?g=male",
        lastMessage: "",
        time: "Just now",
        unread: 0,
        messages: [],
      };

      onCreateConversation(mockConversation);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      title="New Conversation"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
    >
      <Search
        placeholder="Search for users..."
        allowClear
        enterButton={<SearchOutlined />}
        size="large"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onSearch={handleSearch}
        style={{ marginBottom: 20 }}
      />

      {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}

      {searching ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <Spin />
          <p style={{ marginTop: 8 }}>Searching...</p>
        </div>
      ) : searchResults.length > 0 ? (
        <List
          dataSource={searchResults}
          renderItem={(user) => (
            <List.Item
              actions={[
                <Button
                  key="message"
                  type="primary"
                  icon={<MessageOutlined />}
                  onClick={() => startConversation(user)}
                  loading={creating}
                >
                  Message
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={user.avatar}
                    icon={!user.avatar && <UserOutlined />}
                    size={40}
                  />
                }
                title={user.name}
                description={user.email || ""}
              />
            </List.Item>
          )}
        />
      ) : searchQuery ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No users found"
        />
      ) : (
        <div style={{ textAlign: "center", padding: "20px 0", color: "#999" }}>
          <UserOutlined style={{ fontSize: 32 }} />
          <p style={{ marginTop: 8 }}>
            Search for users to start a conversation
          </p>
        </div>
      )}
    </Modal>
  );
};

export default NewConversationModal;
