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
} from "@ant-design/icons";
import CommunityChat from "./CommunityChat";
import StudySessionList from "./StudySessionList";
import StudySessionModal from "./StudySessionModal";
import {
  getCommunityDetails,
  joinCommunitySession,
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
              <Row gutter={[16, 16]}>
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
