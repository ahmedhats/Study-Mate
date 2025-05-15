import React, { useState, useRef } from "react";
import { Tabs, Card } from "antd";
import { UserOutlined, TeamOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import Friends from "./components/social/Friends";
import Teams from "./components/social/Teams";
import RecommendedFriends from "./components/social/RecommendedFriends";

const { TabPane } = Tabs;

const Social = () => {
  const [activeTab, setActiveTab] = useState("friends");
  const friendsRef = useRef();
  const recommendedRef = useRef();

  const handleFriendRequestSent = () => {
    // Switch to the friends tab to show sent requests
    setActiveTab("friends");
    
    // Refresh the friends list
    if (friendsRef.current) {
      friendsRef.current.fetchFriendsData();
    }
  };

  const handleFriendRequestCanceled = () => {
    // Refresh the recommended friends list
    if (recommendedRef.current) {
      recommendedRef.current.fetchRecommendations();
    }
  };

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
            <Friends 
              ref={friendsRef} 
              onFriendRequestCanceled={handleFriendRequestCanceled}
            />
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
            <RecommendedFriends 
              ref={recommendedRef}
              onFriendRequestSent={handleFriendRequestSent} 
            />
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
