import React, { useState, useEffect } from "react";
import { Tabs, Layout } from "antd";
import { useLocation } from "react-router-dom";
import { UserOutlined, TeamOutlined, SettingOutlined } from "@ant-design/icons";
import MyProfile from "./MyProfile";
import Social from "./Social";
import Setting from "./Setting";
import "./Profile.css";

const { Content } = Layout;

const Profile = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("myProfile");

  // Set active tab based on the URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/social")) {
      setActiveTab("social");
    } else if (path.includes("/setting")) {
      setActiveTab("setting");
    } else {
      setActiveTab("myProfile");
    }
  }, [location.pathname]);

  const items = [
    {
      key: "myProfile",
      label: "My Profile",
      icon: <UserOutlined />,
      children: <MyProfile />,
    },
    {
      key: "social",
      label: "Social",
      icon: <TeamOutlined />,
      children: <Social />,
    },
    {
      key: "setting",
      label: "Setting",
      icon: <SettingOutlined />,
      children: <Setting />,
    },
  ];

  return (
    <Layout className="profile-layout">
      <Content className="profile-content">
        <div className="profile-container">
          <div className="profile-header">
            <h1>Profile</h1>
            <p>Let's try to manage your activity and build your future</p>
          </div>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={items}
            className="profile-tabs"
          />
        </div>
      </Content>
    </Layout>
  );
};

export default Profile;
