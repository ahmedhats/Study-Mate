import React from "react";
import { MessageOutlined } from "@ant-design/icons";
import { NoChat as StyledNoChat } from "../../../styles/InboxStyles";

const NoChat = () => {
  return (
    <StyledNoChat>
      <MessageOutlined style={{ fontSize: "32px", opacity: 0.5 }} />
      <p>Select a conversation to start chatting</p>
    </StyledNoChat>
  );
};

export default NoChat; 