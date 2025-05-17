import React, { useState, useEffect, useCallback } from "react";
import {
  Tabs,
  Card,
  Typography,
  Space,
  Button,
  Badge,
  Avatar,
  Tag,
  Row,
  Col,
  Spin,
  Divider,
  Modal,
  Statistic,
  Progress,
  Tooltip,
  message,
  Empty,
} from "antd";
import {
  TeamOutlined,
  MessageOutlined,
  CalendarOutlined,
  StarOutlined,
  StarFilled,
  BookOutlined,
  BranchesOutlined,
  PlusOutlined,
  CrownOutlined,
  UserOutlined,
  TrophyOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import CommunityChat from "./CommunityChat";
import StudySessionList from "./StudySessionList";
import StudySessionModal from "./StudySessionModal";
import {
  getCommunityDetails,
  joinCommunitySession,
  joinCommunity,
  toggleFavoriteCommunity,
} from "../../../services/api/communityService";
import DirectMessageButton from "../messaging/DirectMessageButton";
import { useMessaging } from "../../../context/MessagingContext";

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;

const CommunityDetail = ({ communityId }) => {
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studySessionsLoading, setStudySessionsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [studySessionModalVisible, setStudySessionModalVisible] =
    useState(false);
  const [joiningCommunity, setJoiningCommunity] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const { conversations: contextConversations, actions: messagingActions } = useMessaging();
  const [communityConversationId, setCommunityConversationId] = useState(null);

  useEffect(() => {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const parsed = JSON.parse(userData);
        setCurrentUser(parsed.user || parsed);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, []);

  useEffect(() => {
    if (communityId) {
      fetchCommunityDetails();
    }
  }, [communityId]);

  useEffect(() => {
    if (community && community._id && contextConversations && contextConversations.length > 0) {
      const foundConv = contextConversations.find(
        (conv) => conv.type === "COMMUNITY" && conv.communityId === community._id
      );
      if (foundConv) {
        setCommunityConversationId(foundConv._id);
        if (activeTab === "chat" && foundConv._id) {
           messagingActions.selectConversation(foundConv._id);
        }
      } else {
        console.warn(`Conversation for community ${community._id} not found in context.`);
        setCommunityConversationId(null); 
        if (activeTab === "chat") {
            messagingActions.selectConversation(null);
        }
      }
    }
  }, [community, contextConversations, activeTab, messagingActions]);
  
  const handleTabChange = useCallback((key) => {
    setActiveTab(key);
    if (key === "chat" && communityConversationId) {
      messagingActions.selectConversation(communityConversationId);
    } else if (key !== "chat") {
    }
  }, [communityConversationId, messagingActions]);

  const fetchCommunityDetails = async () => {
    setLoading(true);
    try {
      const response = await getCommunityDetails(communityId);
      if (response.success) {
        setCommunity(response.data);
      }
    } catch (error) {
      console.error("Error fetching community details:", error);
    } finally {
      setLoading(false);
      setStudySessionsLoading(false);
    }
  };

  const handleCreateStudySession = () => {
    setStudySessionModalVisible(true);
  };

  const handleStudySessionCreated = (session) => {
    setCommunity((prev) => ({
      ...prev,
      studySessions: [session, ...(prev.studySessions || [])],
    }));
  };

  const handleJoinSession = async (sessionId) => {
    try {
      const response = await joinCommunitySession(communityId, sessionId);
      if (response.success) {
        setCommunity((prev) => ({
          ...prev,
          studySessions: prev.studySessions.map((session) =>
            session.id === sessionId ? response.data : session
          ),
        }));
      }
    } catch (error) {
      console.error("Error joining study session:", error);
    }
  };

  const handleJoinCommunity = async () => {
    setJoiningCommunity(true);
    try {
      const response = await joinCommunity(communityId);
      if (response.success) {
        setCommunity((prev) => ({ ...prev, isMember: true, members: (prev.members || 0) + 1 }));
        message.success("Successfully joined the community!");
        messagingActions.fetchUserConversations();
      } else {
        message.error(response.message || "Failed to join community");
      }
    } catch (error) {
      console.error("Error joining community:", error);
      message.error("Failed to join community. Please try again later.");
    } finally {
      setJoiningCommunity(false);
    }
  };

  const handleToggleFavorite = async () => {
    setFavoriteLoading(true);
    try {
      const response = await toggleFavoriteCommunity(communityId);
      if (response.success) {
        setCommunity((prev) => ({
          ...prev,
          isFavorite: !prev.isFavorite,
        }));
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      message.error("Failed to update favorite status");
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading || (!currentUser && communityId)) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Loading community details...</p>
      </div>
    );
  }

  if (!community) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Text type="danger">Community not found</Text>
      </div>
    );
  }

  const calculateEngagement = () => {
    const totalPossibleEngagement = community.members * 10;
    const currentEngagement =
      (community.studySessions?.length || 0) * 5 +
      (community.membersList?.length || 0) * 2;

    return Math.min(
      Math.round((currentEngagement / totalPossibleEngagement) * 100),
      100
    );
  };

  const engagementPercent = calculateEngagement();

  return (
    <div>
      <Card>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div style={{ position: "relative" }}>
              <img
                src={community.image}
                alt={community.name}
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  height: "200px",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1,
                }}
              >
                <Tooltip title={community.isFavorite ? "Remove from favorites" : "Add to favorites"}>
                  <Button
                    shape="circle"
                    icon={community.isFavorite ? <StarFilled style={{color: 'gold'}} /> : <StarOutlined />}
                    onClick={handleToggleFavorite}
                    loading={favoriteLoading}
                  />
                </Tooltip>
              </div>
            </div>
          </Col>
          <Col xs={24} md={16}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Row justify="space-between" align="top">
                <Title level={2} style={{ marginBottom: 0 }}>{community.name}</Title>
                {!community.isMember && (
                  <Button 
                    type="primary" 
                    onClick={handleJoinCommunity} 
                    loading={joiningCommunity} 
                    icon={<UserAddOutlined />}
                  >
                    Join Community
                  </Button>
                )}
              </Row>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <Statistic title="Members" value={community.members} prefix={<TeamOutlined />} />
                <Statistic title="Study Sessions" value={community.studySessions?.length || 0} prefix={<BookOutlined />} />
                <Statistic title="Engagement" value={`${engagementPercent}%`} prefix={<BranchesOutlined />} /> 
              </div>

              {community.admin && (
                <Space size="small" style={{ marginTop: 8}}>
                  <Avatar src={community.admin.avatar} size="small" icon={<CrownOutlined />} />
                  <Text strong>Admin:</Text>
                  <Text>{community.admin.name}</Text>
                </Space>
              )}
              
              <Divider style={{margin: '12px 0'}}/>
              
              <Title level={5}>About this Community</Title>
              <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}>
                {community.description}
              </Paragraph>

              <div>
                {community.tags && community.tags.map(tag => 
                  <Tag color="blue" key={tag} style={{margin: '0 8px 8px 0'}}>{tag}</Tag>
                )}
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      <div style={{ marginTop: 24 }}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          tabBarExtraContent={
            activeTab === "study-sessions" && community.isMember ? (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateStudySession}
              >
                Create Study Session
              </Button>
            ) : null
          }
        >
          <TabPane
            tab={
              <span>
                <MessageOutlined />
                Community Chat
              </span>
            }
            key="chat"
          >
            {communityConversationId ? (
              <CommunityChat
                communityId={community._id}
                communityName={community.name}
                isMember={community.isMember}
                onJoinCommunity={handleJoinCommunity}
                currentUser={currentUser}
              />
            ) : (
              <div style={{textAlign: 'center', padding: '50px'}}>
                { activeTab === 'chat' && (!community || loading) ? <Spin tip="Loading community details..."/> : 
                  <Empty description={
                      community && !community.isMember 
                        ? "Join the community to access the chat."
                        : "Community chat not available or you are not a participant."
                    }/>
                }
              </div>
            )}
          </TabPane>
          <TabPane
            tab={
              <span>
                <CalendarOutlined />
                <Badge
                  count={
                    community.studySessions?.filter((s) => {
                      const now = new Date();
                      const end = new Date(s.endTime);
                      return now <= end;
                    }).length || 0
                  }
                  offset={[5, -3]}
                >
                  Study Sessions
                </Badge>
              </span>
            }
            key="study-sessions"
          >
            <StudySessionList
              sessions={community.studySessions || []}
              loading={studySessionsLoading}
              onJoinSession={handleJoinSession}
              isMember={community.isMember}
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                <TeamOutlined />
                Members
              </span>
            }
            key="members"
          >
            <Card>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                {community.membersList?.map((member) => (
                  <Card.Grid
                    key={member.id}
                    style={{ width: "200px", textAlign: "center", padding: 16 }}
                  >
                    <Space direction="vertical" align="center">
                      <Avatar size={64} src={member.avatar}>
                        {member.name[0].toUpperCase()}
                      </Avatar>
                      <Text strong>{member.name}</Text>
                      {member.role && (
                        <Tag color={member.role === "admin" ? "red" : "blue"}>
                          {member.role.charAt(0).toUpperCase() +
                            member.role.slice(1)}
                        </Tag>
                      )}
                      <DirectMessageButton 
                        userId={member.id}
                        size="small"
                        showText={true}
                      />
                    </Space>
                  </Card.Grid>
                ))}
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </div>

      <StudySessionModal
        visible={studySessionModalVisible}
        onCancel={() => setStudySessionModalVisible(false)}
        onSuccess={handleStudySessionCreated}
        communityId={communityId}
        communityName={community.name}
      />
    </div>
  );
};

export default CommunityDetail;
