import React, { useState } from "react";
import { List, Input, Avatar, Typography, Badge, Empty } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { ConversationItem } from "../../../styles/InboxStyles";

const { Search } = Input;
const { Text } = Typography;

const ConversationList = ({ conversations, activeChat, onSelectChat }) => {
  const [searchText, setSearchText] = useState("");

  // Filter conversations by search text
  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (conversation.lastMessage &&
        conversation.lastMessage
          .toLowerCase()
          .includes(searchText.toLowerCase()))
  );

  return (
    <>
      <div style={{ padding: "0 16px 16px" }}>
        <Search
          placeholder="Search messages"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          suffix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
          allowClear
        />
      </div>

      {filteredConversations.length > 0 ? (
        <List
          dataSource={filteredConversations}
          renderItem={(item) => (
            <ConversationItem
              active={activeChat?.id === item.id}
              onClick={() => onSelectChat(item)}
            >
              <Badge count={item.unread || 0} offset={[-5, 5]}>
                <Avatar src={item.avatar} size={40} />
              </Badge>
              <div style={{ marginLeft: 12, flex: 1, overflow: "hidden" }}>
                <Text strong style={{ display: "block" }}>
                  {item.name}
                </Text>
                <div>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "14px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "block",
                      maxWidth: "180px",
                    }}
                  >
                    {item.lastMessage || "No messages yet"}
                  </Text>
                </div>
              </div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {item.time}
              </Text>
            </ConversationItem>
          )}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            searchText
              ? "No conversations match your search"
              : "No conversations found"
          }
          style={{ margin: "40px 0" }}
        />
      )}
    </>
  );
};

export default ConversationList;
