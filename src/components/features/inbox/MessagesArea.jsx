import React from "react";
import { MessagesArea as StyledMessagesArea } from "../../../styles/InboxStyles";
import MessageItem from "./MessageItem";

const MessagesArea = ({ messages }) => {
  return (
    <StyledMessagesArea>
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </StyledMessagesArea>
  );
};

export default MessagesArea;
 