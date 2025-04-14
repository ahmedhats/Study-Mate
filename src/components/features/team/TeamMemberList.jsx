import React from "react";
import { List, Avatar, Tag, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";

const TeamMemberList = ({ teamMembers }) => {
  return (
    <List
      itemLayout="horizontal"
      dataSource={teamMembers}
      renderItem={(member) => (
        <List.Item
          actions={[
            <Tag color={member.status === "online" ? "green" : "default"}>
              {member.status.toUpperCase()}
            </Tag>,
          ]}
        >
          <List.Item.Meta
            avatar={<Avatar icon={<UserOutlined />} />}
            title={member.name}
            description={
              <Space direction="vertical">
                <span>{member.role}</span>
                <a href={`mailto:${member.email}`}>{member.email}</a>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default TeamMemberList;
 