import React from "react";
import { List, Avatar, Tag, Space, Tooltip, Badge } from "antd";
import { UserOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { formatLastActive, isUserOnline } from "../../../utils/dateFormatter";

const TeamMemberList = ({ teamMembers }) => {
  return (
    <List
      itemLayout="horizontal"
      dataSource={teamMembers}
      renderItem={(member) => {
        const isOnline = member.lastActive
          ? isUserOnline(member.lastActive)
          : member.status === "online";

        return (
          <List.Item
            actions={[
              <Space>
                <Tag color={isOnline ? "green" : "default"}>
                  {isOnline ? "ONLINE" : "OFFLINE"}
                </Tag>
                {member.lastActive && !isOnline && (
                  <Tooltip
                    title={`Last seen: ${formatLastActive(member.lastActive)}`}
                  >
                    <ClockCircleOutlined style={{ color: "#8c8c8c" }} />
                  </Tooltip>
                )}
              </Space>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Badge
                  dot
                  status={isOnline ? "success" : "default"}
                  offset={[-4, 36]}
                >
                  <Avatar icon={<UserOutlined />} />
                </Badge>
              }
              title={member.name}
              description={
                <Space direction="vertical" size={0}>
                  <span>{member.role}</span>
                  <a href={`mailto:${member.email}`}>{member.email}</a>
                  {member.lastActive && (
                    <span style={{ fontSize: "12px", color: "#8c8c8c" }}>
                      {isOnline
                        ? "Active now"
                        : `Last active: ${formatLastActive(member.lastActive)}`}
                    </span>
                  )}
                </Space>
              }
            />
          </List.Item>
        );
      }}
    />
  );
};

export default TeamMemberList;
