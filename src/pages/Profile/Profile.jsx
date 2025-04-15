import React, { useState } from "react";
import { Tabs, Layout } from "antd";
import MyProfile from "./MyProfile";
import Team from "./Team";
import Setting from "./Setting";
import "./Profile.css";

const { Content } = Layout;

const Profile = () => {
  const [activeTab, setActiveTab] = useState("myProfile");

  const items = [
    {
      key: "myProfile",
      label: "My Profile",
      children: <MyProfile />,
    },
    {
      key: "team",
      label: "Team",
      children: <Team />,
    },
    {
      key: "setting",
      label: "Setting",
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
