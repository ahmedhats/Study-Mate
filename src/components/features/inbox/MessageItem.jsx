import React from "react";
import { Typography, Tooltip } from "antd";
import { MessageContainer } from "../../../styles/InboxStyles";
import { LoadingOutlined, WarningOutlined } from "@ant-design/icons";

const { Text } = Typography;

const MessageItem = ({ message }) => {
  const { isSender, content, sender, time, pending, failed } = message;

  return (
    <MessageContainer isSender={isSender}>
      <div style={{ marginBottom: 4 }}>
        <Text
          strong
          style={{
            color: isSender ? "white" : "inherit",
          }}
        >
          {sender}
        </Text>
      </div>
      {content}
      <div
        style={{
          marginTop: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontSize: "12px",
            color: isSender ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.45)",
          }}
        >
          {time}
        </Text>

        {isSender && (
          <span style={{ marginLeft: 8 }}>
            {pending && (
              <Tooltip title="Sending...">
                <LoadingOutlined
                  style={{
                    fontSize: 12,
                    color: isSender
                      ? "rgba(255,255,255,0.8)"
                      : "rgba(0,0,0,0.45)",
                  }}
                />
              </Tooltip>
            )}
            {failed && (
              <Tooltip title="Failed to send. Click to retry.">
                <WarningOutlined
                  style={{
                    fontSize: 12,
                    color: "#ff4d4f",
                  }}
                />
              </Tooltip>
            )}
          </span>
        )}
      </div>
    </MessageContainer>
  );
};

export default MessageItem;
