import React, { useEffect, useState } from "react";
import { Layout, Card, Button, Row, Col, message } from "antd";
import {
  ClockCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "../services/api/userService";
import StudyStats from "../components/features/dashboard/StudyStats";
import RecentActivity from "../components/features/dashboard/RecentActivity";
import ProfileModal from "../components/features/dashboard/ProfileModal";
import "../styles/Dashboard.css";

const { Content } = Layout;

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const data = await getUserProfile();
      setUserData(data);
    } catch (error) {
      message.error("Failed to fetch user data");
    }
  };

  const handleProfileUpdate = (updatedData) => {
    setUserData({ ...userData, ...updatedData });
    setIsProfileModalVisible(false);
  };

  // Default mock data with zeros
  const defaultUserData = {
    name: "User",
    email: "",
    education: "",
    major: "",
    interests: "",
    hobbies: "",
    studyPreference: "",
    studyStats: {
      totalHours: 0,
      completedTasks: 0,
      studyStreak: 0,
      weeklyGoal: 0,
    },
    recentActivities: [],
  };

  const displayUserData = userData || defaultUserData;

  const actionCards = [
    {
      title: "Focus Time",
      icon: (
        <ClockCircleOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
      ),
      description: "2h 30m / 4h Goal",
      buttonText: "Start Timer",
      onClick: () => navigate("/timer"),
    },
    {
      title: "Study Streak",
      icon: <TrophyOutlined style={{ fontSize: "24px", color: "#52c41a" }} />,
      description: "7 Days",
      buttonText: "View Stats",
      onClick: () => navigate("/stats"),
    },
    {
      title: "Study Partners",
      icon: <TeamOutlined style={{ fontSize: "24px", color: "#722ed1" }} />,
      description: "3 New Matches",
      buttonText: "Join Session",
      onClick: () => navigate("/study-group"),
    },
  ];

  return (
    <Layout className="dashboard-layout">
      <Content className="dashboard-content">
        <div className="dashboard-container">
          <h1>Welcome back, {displayUserData.name.split(" ")[0]}!</h1>

          <Row gutter={[24, 24]} className="action-cards">
            {actionCards.map((card, index) => (
              <Col xs={24} sm={8} key={index}>
                <Card className="action-card">
                  <div className="action-icon">{card.icon}</div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                  <Button type="primary" onClick={card.onClick}>
                    {card.buttonText}
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="profile-section">
            <div className="profile-header">
              <h2>Your prefrences</h2>
              <button
                className="edit-profile-btn"
                onClick={() => setIsProfileModalVisible(true)}
              >
                Edit Profile
              </button>
            </div>
            <div className="profile-details">
              <div className="detail-item">
                <span className="label">Education Level:</span>
                <span className="value">{displayUserData.education}</span>
              </div>
              <div className="detail-item">
                <span className="label">Field of Study:</span>
                <span className="value">{displayUserData.major}</span>
              </div>
              <div className="detail-item">
                <span className="label">Interests:</span>
                <span className="value">{displayUserData.interests}</span>
              </div>
              <div className="detail-item">
                <span className="label">Hobbies:</span>
                <span className="value">{displayUserData.hobbies}</span>
              </div>
              <div className="detail-item">
                <span className="label">Study Preference:</span>
                <span className="value">{displayUserData.studyPreference}</span>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-main">
              <StudyStats userData={displayUserData} />
            </div>
            <div className="dashboard-side">
              <RecentActivity userData={displayUserData} />
            </div>
          </div>
        </div>

        <ProfileModal
          visible={isProfileModalVisible}
          onCancel={() => setIsProfileModalVisible(false)}
          onFinish={handleProfileUpdate}
          initialValues={displayUserData}
        />
      </Content>
    </Layout>
  );
};

export default Dashboard;
