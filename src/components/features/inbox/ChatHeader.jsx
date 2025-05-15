import React from "react";
import { Avatar, Typography, Badge } from "antd";
import { ChatHeader as StyledChatHeader } from "../../../styles/InboxStyles";

const { Text } = Typography;

const ChatHeader = ({ activeChat, isTyping }) => {
  if (!activeChat) return null;

  return (
    <StyledChatHeader>
      <Badge color={isTyping ? "#52c41a" : undefined} dot>
        <Avatar src={activeChat.avatar} size={40} />
      </Badge>
      <div>
        <Text strong style={{ fontSize: "16px", display: "block" }}>
          {activeChat.name}
        </Text>
        <Text type="secondary">
          {isTyping ? (
            <span style={{ color: "#52c41a" }}>Typing...</span>
          ) : (
            "Online"
          )}
        </Text>
      </div>
    </StyledChatHeader>
  );
};

export default ChatHeader;
