import React from "react";
import { Typography, Card, Avatar, List, Tag, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Title } = Typography;

const TeamPage = () => {
  const [teamMembers] = React.useState([
    {
      id: 1,
      name: "John Doe",
      role: "Team Lead",
      email: "john.doe@example.com",
      status: "online",
    },
    {
      id: 2,
      name: "Jane Smith",
      role: "Developer",
      email: "jane.smith@example.com",
      status: "offline",
    },
    {
      id: 3,
      name: "Mike Johnson",
      role: "Designer",
      email: "mike.johnson@example.com",
      status: "online",
    },
  ]);

  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={2}>Team Members</Title>
        <Card>
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
        </Card>
      </Space>
    </div>
  );
};

export default TeamPage;
