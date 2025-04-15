import React, { useState } from "react";
import { Layout } from "antd";
import { ChatContainer } from "../styles/InboxStyles";
import ConversationList from "../components/features/inbox/ConversationList";
import ChatHeader from "../components/features/inbox/ChatHeader";
import MessagesArea from "../components/features/inbox/MessagesArea";
import InputBox from "../components/features/inbox/InputBox";
import NoChat from "../components/features/inbox/NoChat";

const { Content, Sider } = Layout;

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

    const updatedConversations = conversations.map((conv) => {
      if (conv.id === activeChat.id) {
        const updatedConv = {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessage: newMessage,
          time: "Just now",
        };
        return updatedConv;
      }
      return conv;
    });

    setConversations(updatedConversations);
    setActiveChat(
      updatedConversations.find((conv) => conv.id === activeChat.id)
    );
    setNewMessage("");
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  const handleSelectChat = (chat) => {
    const selectedChat = conversations.find((conv) => conv.id === chat.id);
    setActiveChat(selectedChat);
    setConversations((prev) =>
      prev.map((conv) => (conv.id === chat.id ? { ...conv, unread: 0 } : conv))
    );
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Sider
        width={300}
        theme="light"
        style={{ borderRight: "1px solid #f0f0f0" }}
      >
        <ConversationList
          conversations={conversations}
          activeChat={activeChat}
          onSelectChat={handleSelectChat}
        />
      </Sider>
      <Content style={{ background: "#fff" }}>
        {activeChat ? (
          <>
            <ChatHeader activeChat={activeChat} />
            <ChatContainer>
              <MessagesArea messages={activeChat.messages} />
              <InputBox
                value={newMessage}
                onChange={setNewMessage}
                onSend={handleSendMessage}
                onEmojiClick={onEmojiClick}
              />
            </ChatContainer>
          </>
        ) : (
          <NoChat />
        )}
      </Content>
    </Layout>
  );
};

export default Inbox;
