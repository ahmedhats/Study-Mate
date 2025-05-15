import React from "react";
import { Button } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import { NoChat as StyledNoChat } from "../../../styles/InboxStyles";

const NoChat = ({ onNewChat }) => {
  return (
    <StyledNoChat>
      <MessageOutlined style={{ fontSize: 48 }} />
      <p>Select a conversation or start a new one</p>
      <Button type="primary" icon={<MessageOutlined />} onClick={onNewChat}>
        New Conversation
      </Button>
    </StyledNoChat>
  );
};

export default NoChat;
