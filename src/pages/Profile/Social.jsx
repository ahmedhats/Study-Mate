import React, { useState } from "react";
import { Tabs, Card } from "antd";
import { UserOutlined, TeamOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import Friends from "./components/social/Friends";
import Teams from "./components/social/Teams";
import RecommendedFriends from "./components/social/RecommendedFriends";

const { TabPane } = Tabs;

const Social = () => {
  const [activeTab, setActiveTab] = useState("friends");

  return (
    <div className="social-container">
      <Card bordered={false}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="social-tabs"
        >
          <TabPane
            tab={
              <span>
                <UserOutlined />
                Friends
              </span>
            }
            key="friends"
          >
            <Friends />
          </TabPane>
          <TabPane
            tab={
              <span>
                <UsergroupAddOutlined />
                Recommended
              </span>
            }
            key="recommended"
          >
            <RecommendedFriends />
          </TabPane>
          <TabPane
            tab={
              <span>
                <TeamOutlined />
                Teams
              </span>
            }
            key="teams"
          >
            <Teams />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Social;
