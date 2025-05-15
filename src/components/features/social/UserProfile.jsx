import React, { useState, useEffect } from "react";
import {
  Card,
  Avatar,
  Button,
  Tag,
  Spin,
  message,
  Tooltip,
  Row,
  Col,
  Divider,
} from "antd";
import {
  UserAddOutlined,
  CheckOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { sendFriendRequest } from "../../../services/api/socialService";
import { formatLastActive, isUserOnline } from "../../../utils/dateFormatter";

const UserProfile = ({ user, onAddFriend }) => {
  const [connectionStatus, setConnectionStatus] = useState("none"); // none, pending, connected
  const [loading, setLoading] = useState(false);

  // Format the major field
  const formatMajor = (majorValue) => {
    const majorMap = {
      computer_science: "Computer Science",
      biology: "Biology",
      engineering: "Engineering",
      mathematics: "Mathematics",
      business: "Business",
      literature: "Literature",
      physics: "Physics",
      chemistry: "Chemistry",
      psychology: "Psychology",
      medicine: "Medicine",
      arts: "Arts",
      other: "Other",
    };
    return majorMap[majorValue] || majorValue || "Not specified";
  };

  // Format education value
  const formatEducation = (educationValue) => {
    const educationMap = {
      high_school: "High School",
      bachelors: "Bachelor's",
      masters: "Master's",
      phd: "PhD",
      other: "Other",
    };
    return educationMap[educationValue] || educationValue || "Not specified";
  };

  // Check if user is online
  const isOnline = user?.statistics?.lastActive
    ? isUserOnline(user.statistics.lastActive)
    : false;

  const handleAddFriend = async () => {
    try {
      setLoading(true);

      // Call API to send friend request
      const response = await sendFriendRequest(user._id);

      if (response?.error) {
        throw new Error(response.error);
      }

      // Update UI state
      setConnectionStatus("pending");
      message.success("Friend request sent successfully!");

      // Call parent component callback if provided
      if (onAddFriend) {
        onAddFriend(user._id, "pending");
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      message.error("Failed to send friend request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get connection button style based on state
  const getConnectionButton = () => {
    if (connectionStatus === "connected") {
      return (
        <Button icon={<CheckOutlined />} type="default" disabled>
          Friends
        </Button>
      );
    } else if (connectionStatus === "pending") {
      return (
        <Button icon={<CheckOutlined />} type="default" disabled>
          Request Sent
        </Button>
      );
    } else {
      return (
        <Button
          icon={<UserAddOutlined />}
          type="primary"
          onClick={handleAddFriend}
          loading={loading}
        >
          Add
        </Button>
      );
    }
  };

  return (
    <Card className="user-profile-card">
      <Row gutter={[16, 16]} align="middle">
        <Col
          span={24}
          md={6}
          className="user-avatar-container"
          style={{ textAlign: "center" }}
        >
          <Avatar
            size={80}
            style={{
              backgroundColor: isOnline ? "#52c41a" : "#1890ff",
              fontSize: "2rem",
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </Avatar>
          {isOnline && <div className="online-indicator">Online</div>}
        </Col>

        <Col span={24} md={12} className="user-info-container">
          <h2 className="user-name">{user?.name}</h2>
          <p className="user-email">{user?.email}</p>

          <div className="user-tags">
            <Tag color="blue">{formatMajor(user?.major)}</Tag>
            <Tag color="green">{formatEducation(user?.education)}</Tag>
            {user?.studyPreference && (
              <Tag color="purple">
                {user.studyPreference === "individual"
                  ? "Individual Study"
                  : user.studyPreference === "group"
                  ? "Group Study"
                  : "Both"}
              </Tag>
            )}
          </div>

          {user?.statistics?.lastActive && !isOnline && (
            <div className="last-active">
              <ClockCircleOutlined style={{ marginRight: 5 }} />
              Last active: {formatLastActive(user.statistics.lastActive)}
            </div>
          )}
        </Col>

        <Col
          span={24}
          md={6}
          className="user-actions-container"
          style={{ textAlign: "center" }}
        >
          {getConnectionButton()}
        </Col>
      </Row>

      {user?.interests && user.interests.length > 0 && (
        <>
          <Divider />
          <div className="user-interests">
            <h4>Academic Interests</h4>
            <div>
              {user.interests.map((interest, index) => (
                <Tag key={index} color="blue">
                  {interest}
                </Tag>
              ))}
            </div>
          </div>
        </>
      )}

      {user?.hobbies && user.hobbies.length > 0 && (
        <div className="user-hobbies" style={{ marginTop: "10px" }}>
          <h4>Hobbies</h4>
          <div>
            {user.hobbies.map((hobby, index) => (
              <Tag key={index} color="cyan">
                {hobby}
              </Tag>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default UserProfile;
