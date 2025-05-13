import React, { useState, useEffect } from "react";
import {
  Tabs,
  Avatar,
  Tag,
  Progress,
  Button,
  Calendar,
  Badge,
  List,
  Card,
  message,
} from "antd";
import {
  CalendarOutlined,
  MoreOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import EditProfileModal from "./components/EditProfileModal";
import { getUserProfile } from "../../services/api/userService";

const MyProfile = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("activity");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const data = await getUserProfile();
      setUserData(data);
    } catch (error) {
      message.error("Failed to fetch user profile");
    }
  };

  // Default mock user data with zeros/empty fields
  const defaultUserData = {
    name: "User",
    email: "",
    birthday: "",
    firstSeen: "",
    type: "Regular",
    status: "Online",
    workItems: [],
    assignedTasks: [],
    calendarEvents: [],
  };

  const displayUserData = userData || defaultUserData;
  const workItems = displayUserData.workItems || [];
  const assignedTasks = displayUserData.assignedTasks || [];
  const calendarEvents = displayUserData.calendarEvents || [];

  const getEventTypeColor = (type) => {
    const colors = {
      meeting: "blue",
      deadline: "red",
      task: "green",
    };
    return colors[type] || "default";
  };

  const items = [
    {
      key: "activity",
      label: "Activity",
      children: (
        <div className="activity-content">
          {workItems.map((item, index) => (
            <div key={index} className="work-item">
              <div className="work-info">
                <h4>{item.title}</h4>
                <Progress percent={item.progress} size="small" />
              </div>
              <div className="work-meta">
                <Tag color={item.status === "To-Do" ? "purple" : "orange"}>
                  {item.status}
                </Tag>
                <Avatar.Group>
                  {item.assignees &&
                    item.assignees.map((user, i) => (
                      <Avatar key={i} size="small">
                        U
                      </Avatar>
                    ))}
                </Avatar.Group>
                <Tag color="blue">{item.priority}</Tag>
                <Button type="text" icon={<MoreOutlined />} />
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "myWork",
      label: "My Work",
      children: (
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={workItems}
          renderItem={(item) => (
            <List.Item>
              <Card>
                <div className="work-item">
                  <div className="work-info">
                    <h4>{item.title}</h4>
                    <Progress percent={item.progress} size="small" />
                  </div>
                  <div className="work-meta">
                    <Tag color={item.status === "To-Do" ? "purple" : "orange"}>
                      {item.status}
                    </Tag>
                    <Tag color="blue">{item.priority}</Tag>
                    <Tag icon={<ClockCircleOutlined />}>{item.dueDate}</Tag>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      ),
    },
    {
      key: "assigned",
      label: "Assigned",
      children: (
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={assignedTasks}
          renderItem={(item) => (
            <List.Item>
              <Card>
                <div className="work-item">
                  <div className="work-info">
                    <h4>{item.title}</h4>
                    <Progress percent={item.progress} size="small" />
                    <div style={{ marginTop: 8 }}>
                      <small>Assigned by: {item.assignedBy}</small>
                    </div>
                  </div>
                  <div className="work-meta">
                    <Tag color={item.status === "In Review" ? "blue" : "gold"}>
                      {item.status}
                    </Tag>
                    <Tag color={item.priority === "High" ? "red" : "blue"}>
                      {item.priority}
                    </Tag>
                    <Tag icon={<ClockCircleOutlined />}>{item.dueDate}</Tag>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      ),
    },
    {
      key: "calendar",
      label: "Calendar",
      children: (
        <div className="calendar-section">
          <Calendar
            cellRender={(date) => {
              const events = calendarEvents.filter(
                (event) => event.date === date.format("YYYY-MM-DD")
              );
              return events.length > 0 ? (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {events.map((event, index) => (
                    <li key={index}>
                      <Badge
                        color={getEventTypeColor(event.type)}
                        text={event.title}
                        style={{ fontSize: "12px" }}
                      />
                    </li>
                  ))}
                </ul>
              ) : null;
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="my-profile">
      <div className="profile-info">
        <div className="profile-header">
          <Avatar size={64} className="profile-avatar">
            {displayUserData.name ? displayUserData.name[0] : "U"}
          </Avatar>
          <div className="profile-details">
            <h2>{displayUserData.name}</h2>
            <p>{displayUserData.email}</p>
            <Button type="link" onClick={() => setIsEditModalVisible(true)}>
              Edit Profile
            </Button>
          </div>
          <div className="profile-meta">
            <div className="meta-item">
              <span className="label">Birthday</span>
              <span className="value">{displayUserData.birthday}</span>
            </div>
            <div className="meta-item">
              <span className="label">First seen</span>
              <span className="value">{displayUserData.firstSeen}</span>
            </div>
            <div className="meta-item">
              <span className="label">Type</span>
              <span className="value">{displayUserData.type}</span>
            </div>
            <div className="meta-item">
              <span className="label">User</span>
              <Tag color="success">{displayUserData.status}</Tag>
            </div>
          </div>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        className="profile-content-tabs"
      />

      <EditProfileModal
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        userData={displayUserData}
        onProfileUpdated={fetchUserData}
      />
    </div>
  );
};

export default MyProfile;
