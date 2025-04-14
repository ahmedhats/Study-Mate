import React from "react";
import { Avatar, Typography } from "antd";
import { ChatHeader as StyledChatHeader } from "../../../styles/InboxStyles";

const { Text } = Typography;

const ChatHeader = ({ activeChat }) => {
  if (!activeChat) return null;

  return (
    <StyledChatHeader>
      <Avatar src={activeChat.avatar} size={40} />
      <div>
        <Text strong style={{ fontSize: "16px", display: "block" }}>
          {activeChat.name}
        </Text>
        <Text type="secondary">Online</Text>
      </div>
    </StyledChatHeader>
  );
};

export default ChatHeader;
