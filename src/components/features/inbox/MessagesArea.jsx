import React from "react";
import { MessagesArea as StyledMessagesArea } from "../../../styles/InboxStyles";
import MessageItem from "./MessageItem";

const MessagesArea = ({ messages, messagesEndRef }) => {
  return (
    <StyledMessagesArea>
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} style={{ float: "left", clear: "both" }} />
    </StyledMessagesArea>
  );
};

export default MessagesArea;
