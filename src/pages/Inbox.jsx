import React, { useState } from "react";
import { Layout, List, Input, Avatar, Typography, Badge, Popover } from "antd";
import {
  SendOutlined,
  SmileOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import EmojiPicker from "emoji-picker-react";
import {
  MessageContainer,
  ChatContainer,
  MessagesArea,
  InputContainer,
  ConversationItem,
  ChatHeader,
  NoChat,
} from "../styles/InboxStyles";

const { Content, Sider } = Layout;
const { Search } = Input;
const { Text } = Typography;

const Inbox = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [conversations, setConversations] = useState([
    {
      id: 1,
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
      id: 2,
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
    {
      id: 3,
      name: "Arvin Deniawan",
      avatar: "https://xsgames.co/randomusers/avatar.php?g=male",
      lastMessage: "Just need one by the way",
      time: "Yesterday",
      unread: 1,
      messages: [
        {
          id: 1,
          content: "Just need one by the way",
          sender: "Arvin Deniawan",
          isSender: false,
          time: "Yesterday",
        },
      ],
    },
  ]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChat) return;

    const newMsg = {
      id: Date.now(),
      content: newMessage,
      sender: "Me",
      isSender: true,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === activeChat.id) {
          return {
            ...conv,
            messages: [...conv.messages, newMsg],
            lastMessage: newMessage,
            time: "Just now",
          };
        }
        return conv;
      })
    );

    setNewMessage("");
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Sider
        width={300}
        theme="light"
        style={{ borderRight: "1px solid #f0f0f0" }}
      >
        <div style={{ padding: "20px 16px" }}>
          <Search placeholder="Search messages" />
        </div>
        <List
          dataSource={conversations}
          renderItem={(item) => (
            <ConversationItem
              active={activeChat?.id === item.id}
              onClick={() => {
                setActiveChat(item);
                // Clear unread count when opening chat
                setConversations((prev) =>
                  prev.map((conv) =>
                    conv.id === item.id ? { ...conv, unread: 0 } : conv
                  )
                );
              }}
            >
              <Badge count={item.unread}>
                <Avatar src={item.avatar} size={40} />
              </Badge>
              <div style={{ marginLeft: 12, flex: 1 }}>
                <Text strong>{item.name}</Text>
                <div>
                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    {item.lastMessage}
                  </Text>
                </div>
              </div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {item.time}
              </Text>
            </ConversationItem>
          )}
        />
      </Sider>
      <Content style={{ background: "#fff" }}>
        {activeChat ? (
          <>
            <ChatHeader>
              <Avatar src={activeChat.avatar} size={40} />
              <div>
                <Text strong style={{ fontSize: "16px", display: "block" }}>
                  {activeChat.name}
                </Text>
                <Text type="secondary">Online</Text>
              </div>
            </ChatHeader>
            <ChatContainer>
              <MessagesArea>
                {activeChat.messages.map((message) => (
                  <MessageContainer
                    key={message.id}
                    isSender={message.isSender}
                  >
                    <div style={{ marginBottom: 4 }}>
                      <Text
                        strong
                        style={{
                          color: message.isSender ? "white" : "inherit",
                        }}
                      >
                        {message.sender}
                      </Text>
                    </div>
                    {message.content}
                    <div style={{ marginTop: 4 }}>
                      <Text
                        style={{
                          fontSize: "12px",
                          color: message.isSender
                            ? "rgba(255,255,255,0.8)"
                            : "rgba(0,0,0,0.45)",
                        }}
                      >
                        {message.time}
                      </Text>
                    </div>
                  </MessageContainer>
                ))}
              </MessagesArea>
              <InputContainer>
                <Input
                  size="large"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  style={{ flex: 1 }}
                  suffix={
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Popover
                        content={<EmojiPicker onEmojiClick={onEmojiClick} />}
                        trigger="click"
                        placement="topRight"
                      >
                        <SmileOutlined
                          style={{ color: "#1890ff", cursor: "pointer" }}
                        />
                      </Popover>
                      <SendOutlined
                        onClick={handleSendMessage}
                        style={{ color: "#1890ff", cursor: "pointer" }}
                      />
                    </div>
                  }
                />
              </InputContainer>
            </ChatContainer>
          </>
        ) : (
          <NoChat>
            <MessageOutlined style={{ fontSize: "32px", opacity: 0.5 }} />
            <Text>Select a conversation to start messaging</Text>
          </NoChat>
        )}
      </Content>
    </Layout>
  );
};

export default Inbox;
