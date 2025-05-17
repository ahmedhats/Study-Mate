import React from "react";
import { Card, List, Tag, Typography, Empty } from "antd";
import {
  BookOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  MessageOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const RecentActivity = ({ userData }) => {
  // Safely access recentActivities with proper array check
  const activities = Array.isArray(userData?.recentActivities) 
    ? userData.recentActivities 
    : [];

  const getActivityIcon = (type) => {
    switch (type) {
      case "study":
        return <BookOutlined style={{ color: "#1890ff" }} />;
      case "team":
        return <TeamOutlined style={{ color: "#52c41a" }} />;
      case "task":
        return <CheckCircleOutlined style={{ color: "#722ed1" }} />;
      case "message":
        return <MessageOutlined style={{ color: "#faad14" }} />;
      default:
        return null;
    }
  };

  const getActivityTag = (type) => {
    switch (type) {
      case "study":
        return <Tag color="blue">Study</Tag>;
      case "team":
        return <Tag color="green">Team</Tag>;
      case "task":
        return <Tag color="purple">Task</Tag>;
      case "message":
        return <Tag color="gold">Message</Tag>;
      default:
        return null;
    }
  };

  return (
    <Card
      className="recent-activity-card content-card"
      title="Recent Activity"
      bordered={false}
    >
      {activities.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={activities}
          renderItem={(activity) => (
            <List.Item>
              <List.Item.Meta
                avatar={getActivityIcon(activity.type)}
                title={
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {getActivityTag(activity.type)}
                    <Text>{activity.description}</Text>
                  </div>
                }
                description={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {new Date(activity.timestamp).toLocaleString()}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description="No recent activities" />
      )}
    </Card>
  );
};

export default RecentActivity;
