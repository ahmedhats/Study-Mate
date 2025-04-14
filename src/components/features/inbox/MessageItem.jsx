import React from "react";
import { Typography } from "antd";
import { MessageContainer } from "../../../styles/InboxStyles";

const { Text } = Typography;

const MessageItem = ({ message }) => {
  return (
    <MessageContainer isSender={message.isSender}>
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
  );
};

export default MessageItem;
 