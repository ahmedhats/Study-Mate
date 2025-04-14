import React from "react";
import { List, Input, Avatar, Typography, Badge } from "antd";
import { ConversationItem } from "../../../styles/InboxStyles";

const { Search } = Input;
const { Text } = Typography;

const ConversationList = ({ conversations, activeChat, onSelectChat }) => {
  return (
    <>
      <div style={{ padding: "20px 16px" }}>
        <Search placeholder="Search messages" />
      </div>
      <List
        dataSource={conversations}
        renderItem={(item) => (
          <ConversationItem
            active={activeChat?.id === item.id}
            onClick={() => onSelectChat(item)}
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
    </>
  );
};

export default ConversationList;
