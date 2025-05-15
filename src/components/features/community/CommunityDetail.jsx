import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    if (communityId) {
      fetchCommunityDetails();
    }
  }, [communityId]);

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
    // Add new session to the list
    setCommunity((prev) => ({
      ...prev,
      studySessions: [session, ...(prev.studySessions || [])],
    }));
  };

  const handleJoinSession = async (sessionId) => {
    try {
      const response = await joinCommunitySession(communityId, sessionId);
      if (response.success) {
        // Update the session in the list with the new participant
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
        // Update community state to reflect the user has joined
        setCommunity((prev) => ({
          ...prev,
          isMember: true,
          members: prev.members + 1,
        }));
        message.success("Successfully joined the community!");
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
        // Toggle the favorite status in the UI
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

  if (loading) {
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

  // Calculate community engagement percentage
  const calculateEngagement = () => {
    // This is a simplified calculation - in a real app you might use more complex metrics
    const totalPossibleEngagement = community.members * 10; // Assuming 10 points per member is max engagement
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
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "20px 16px 12px",
                  background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                  borderBottomLeftRadius: "8px",
                  borderBottomRightRadius: "8px",
                }}
              >
                <Title level={4} style={{ color: "white", margin: 0 }}>
                  {community.name}
                </Title>
              </div>
            </div>
          </Col>
          <Col xs={24} md={16}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Row gutter={[16, 16]} style={{ flex: 1 }}>
                  <Col xs={8}>
                    <Statistic
                      title="Members"
                      value={community.members}
                      prefix={<TeamOutlined />}
                    />
                  </Col>
                  <Col xs={8}>
                    <Statistic
                      title="Study Sessions"
                      value={community.studySessions?.length || 0}
                      prefix={<CalendarOutlined />}
                    />
                  </Col>
                  <Col xs={8}>
                    <Statistic
                      title="Topics"
                      value={community.tags?.length || 0}
                      prefix={<BookOutlined />}
                    />
                  </Col>
                </Row>
                <Space>
                  <Button
                    type={community.isMember ? "default" : "primary"}
                    icon={<UserAddOutlined />}
                    onClick={handleJoinCommunity}
                    loading={joiningCommunity}
                    disabled={community.isMember}
                  >
                    {community.isMember ? "Joined" : "Join Community"}
                  </Button>
                  <Button
                    type="text"
                    icon={
                      community.isFavorite ? (
                        <StarFilled style={{ color: "#faad14" }} />
                      ) : (
                        <StarOutlined />
                      )
                    }
                    onClick={handleToggleFavorite}
                    loading={favoriteLoading}
                  />
                </Space>
              </div>

              {/* Progress Bar for Community Engagement */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text strong>Community Engagement</Text>
                  <Text>{engagementPercent}%</Text>
                </div>
                <Progress
                  percent={engagementPercent}
                  status={
                    engagementPercent > 80
                      ? "success"
                      : engagementPercent > 50
                      ? "active"
                      : "normal"
                  }
                  strokeColor={
                    engagementPercent > 80
                      ? "#52c41a"
                      : engagementPercent > 50
                      ? "#1890ff"
                      : engagementPercent > 30
                      ? "#faad14"
                      : "#ff4d4f"
                  }
                />
              </div>

              {/* Team Members and Admin Icons */}
              <div>
                <Text strong style={{ marginBottom: 8, display: "block" }}>
                  Team Members:
                </Text>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {community.membersList
                    ?.filter((member) => member.role === "admin")
                    .map((admin) => (
                      <Tooltip key={admin.id} title={`${admin.name} (Admin)`}>
                        <Avatar
                          src={admin.avatar}
                          style={{
                            backgroundColor: "#f56a00",
                            cursor: "pointer",
                          }}
                          icon={!admin.avatar && <UserOutlined />}
                        >
                          {admin.name[0].toUpperCase()}
                        </Avatar>
                        <CrownOutlined
                          style={{
                            color: "gold",
                            position: "relative",
                            top: -10,
                            left: -8,
                          }}
                        />
                      </Tooltip>
                    ))}
                  {community.membersList
                    ?.filter((member) => member.role === "moderator")
                    .map((mod) => (
                      <Tooltip key={mod.id} title={`${mod.name} (Moderator)`}>
                        <Avatar
                          src={mod.avatar}
                          style={{
                            backgroundColor: "#1890ff",
                            cursor: "pointer",
                          }}
                          icon={!mod.avatar && <UserOutlined />}
                        >
                          {mod.name[0].toUpperCase()}
                        </Avatar>
                        <TrophyOutlined
                          style={{
                            color: "#1890ff",
                            position: "relative",
                            top: -10,
                            left: -8,
                          }}
                        />
                      </Tooltip>
                    ))}
                  {community.membersList
                    ?.filter((member) => !member.role)
                    .slice(0, 5)
                    .map((member) => (
                      <Tooltip key={member.id} title={member.name}>
                        <Avatar
                          src={member.avatar}
                          style={{ cursor: "pointer" }}
                          icon={!member.avatar && <UserOutlined />}
                        >
                          {member.name[0].toUpperCase()}
                        </Avatar>
                      </Tooltip>
                    ))}
                  {community.membersList &&
                    community.membersList.filter((member) => !member.role)
                      .length > 5 && (
                      <Avatar
                        style={{ backgroundColor: "#f0f2f5", color: "#666" }}
                      >
                        +
                        {community.membersList.filter((member) => !member.role)
                          .length - 5}
                      </Avatar>
                    )}
                </div>
              </div>

              <Paragraph>{community.description}</Paragraph>

              <div>
                {community.tags &&
                  community.tags.map((tag) => (
                    <Tag
                      key={tag}
                      color="blue"
                      style={{ margin: "0 8px 8px 0" }}
                    >
                      {tag}
                    </Tag>
                  ))}
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      <div style={{ marginTop: 24 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={
            activeTab === "study-sessions" ? (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateStudySession}
                disabled={!community.isMember}
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
            <CommunityChat
              communityId={communityId}
              communityName={community.name}
              isMember={community.isMember}
              onJoinCommunity={handleJoinCommunity}
            />
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
