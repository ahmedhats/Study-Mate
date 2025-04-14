// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Breadcrumb,
  Typography,
  Space,
  Button,
  Card,
  Descriptions,
} from "antd";
import {
  SearchOutlined,
  BellOutlined,
  SunOutlined,
  AppstoreAddOutlined,
  EditOutlined,
  // Remove MenuFoldOutlined, MenuUnfoldOutlined
} from "@ant-design/icons";
import Sidebar from "../components/layout/sidebar";
// Import the REWRITTEN CSS for the dashboard content
import "../styles/DashboardPage.css"; // Ensure this file contains the new styles below

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const formatEducation = (edu) => {
  /* ... */
};
const formatStudyPreference = (pref) => {
  /* ... */
};
const lineupData = [
  /* ... */
];
const myWorkData = [
  /* ... */
];
const assignedCommentsData = [
  /* ... */
];

const DashboardPage = () => {
  const [collapsed, setCollapsed] = useState(false); // Keep state here
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    /* ... effect to load data ... */
  }, []);

  const handleLogout = () => {
    navigate("/");
  };
  const handleEditProfile = () => {
    navigate("/profile-setup");
  };

  return (
    <Layout style={{ minHeight: "100vh" }} className="dashboard-layout">
      {/* Pass setCollapsed down */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed} // Pass the setter function
        userData={userData}
        onLogout={handleLogout}
      />
      <Layout
        className="site-layout"
        style={{
          marginLeft: collapsed ? 80 : 250,
          transition: "margin-left 0.2s",
        }}
      >
        <Header className="site-layout-background content-header">
          {/* Header Left - Trigger button removed */}
          <div className="header-left">
            <Breadcrumb
              separator=">"
              style={
                {
                  /* marginLeft: '16px' -- adjust if needed */
                }
              }
            >
              <Breadcrumb.Item>Main Menu</Breadcrumb.Item>
              <Breadcrumb.Item style={{ color: "#7c3aed" }}>
                Dashboard
              </Breadcrumb.Item>
            </Breadcrumb>
            <Title level={4} className="page-title">
              Dashboard
            </Title>
          </div>
          {/* Header Right - Kept as is */}
          <div className="header-right">
            <Space size="middle">
              <Button shape="circle" icon={<SearchOutlined />} />
              <Button shape="circle" icon={<SunOutlined />} />
              <Button shape="circle" icon={<BellOutlined />} />
              <Button
                type="primary"
                icon={<AppstoreAddOutlined />}
                className="add-widget-btn"
              >
                Add Widget
              </Button>
            </Space>
          </div>
        </Header>

        <Content className="main-content">
          <Title level={4} className="welcome-title">
            Welcome Back{userData ? `, ${userData.firstName}!` : "!"}
          </Title>

          {/* Profile Section Card */}
          <Card
            className="profile-section-card content-card" // Add base class 'content-card'
            title="Your Profile"
            bordered={false} // Cleaner look without border
            extra={
              <Button onClick={handleEditProfile} icon={<EditOutlined />}>
                {" "}
                Edit Profile{" "}
              </Button>
            }
          >
            {profileData ? (
              <Descriptions layout="horizontal" column={1} size="small">
                <Descriptions.Item label="Education Level">
                  {formatEducation(profileData.education)}
                </Descriptions.Item>
                <Descriptions.Item label="Field of Study">
                  {profileData.major || "Not specified"}
                </Descriptions.Item>
                <Descriptions.Item label="Interests">
                  <Paragraph className="profile-text">
                    {profileData.interests || "Not specified"}
                  </Paragraph>
                </Descriptions.Item>
                <Descriptions.Item label="Hobbies">
                  <Paragraph className="profile-text">
                    {profileData.hobbies || "Not specified"}
                  </Paragraph>
                </Descriptions.Item>
                <Descriptions.Item label="Study Preference">
                  {formatStudyPreference(profileData.studyPreference)}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <div className="profile-incomplete">
                <Text type="secondary">
                  Your profile is incomplete. Please complete your profile...
                </Text>
                <Button
                  type="primary"
                  className="complete-profile-btn"
                  onClick={handleEditProfile}
                >
                  Complete Profile
                </Button>
              </div>
            )}
          </Card>

          {/* Dashboard Actions Card */}
          <Card
            className="dashboard-actions-card content-card"
            bordered={false}
          >
            <Title level={5} className="card-subtitle">
              Quick Actions
            </Title>
            <Space wrap size="middle">
              <Button type="primary" className="action-btn">
                Start Studying
              </Button>
              <Button type="primary" className="action-btn">
                Join Study Group
              </Button>
              <Button type="primary" className="action-btn">
                Set Study Goals
              </Button>
            </Space>
          </Card>

          {/* Optional: Keep other widgets if needed */}
          {/* Example:
            <Card title="LineUp" className="content-card" bordered={false}> ... </Card>
            <div className="widgets-row">
               <Card title="My Work" className="content-card" bordered={false}> ... </Card>
               <Card title="Assigned Comments" className="content-card" bordered={false}> ... </Card>
            </div>
            */}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardPage;
