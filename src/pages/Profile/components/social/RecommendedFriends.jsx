import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  List,
  Avatar,
  Button,
  Tag,
  Empty,
  Spin,
  message,
  Progress,
  Card,
  Typography,
  notification,
  Row,
  Col,
  Select,
  Space,
  Input,
  Badge,
  Modal,
  Descriptions,
  Divider,
} from "antd";
import {
  UserAddOutlined,
  UserOutlined,
  BookOutlined,
  EnvironmentOutlined,
  FilterOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { sendFriendRequest, getRecommendedFriends } from "../../../../services/api/socialService";
import { formatLastActive, isUserOnline } from "../../../../utils/dateFormatter";
import "./RecommendedFriends.css";
import DirectMessageButton from "../../../../components/features/messaging/DirectMessageButton";

const { Text, Title, Paragraph } = Typography;
const { Option } = Select;

const RecommendedFriends = forwardRef(({ onFriendRequestSent }, ref) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCriteria, setFilterCriteria] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [displayedRecommendations, setDisplayedRecommendations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  // Expose fetchRecommendations through ref
  useImperativeHandle(ref, () => ({
    fetchRecommendations
  }));

  useEffect(() => {
    fetchRecommendations();
  }, []);

  useEffect(() => {
    filterRecommendations();
  }, [recommendations, filterCriteria, searchText]);

  const filterRecommendations = () => {
    let filtered = [...recommendations];

    // Apply percentage filter
    switch (filterCriteria) {
      case 'high':
        filtered = filtered.filter(rec => rec.matchPercentage >= 75);
        break;
      case 'medium':
        filtered = filtered.filter(rec => rec.matchPercentage >= 50 && rec.matchPercentage < 75);
        break;
      case 'low':
        filtered = filtered.filter(rec => rec.matchPercentage < 50);
        break;
      default:
        break;
    }

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(rec => 
        rec.user.name.toLowerCase().includes(searchLower) ||
        rec.user.major?.toLowerCase().includes(searchLower) ||
        rec.user.interests?.some(interest => interest.toLowerCase().includes(searchLower)) ||
        rec.user.education?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by match percentage
    filtered.sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    setDisplayedRecommendations(filtered);
  };

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await getRecommendedFriends();
      
      if (response.matches) {
        console.log('Received recommendations:', response.matches);
        if (response.matchingMethod) {
          console.log('Matching method used:', response.matchingMethod);
        }
        setRecommendations(response.matches);
      } else if (response.error) {
        console.error('Error from API:', response.error);
        message.error(response.error);
        setRecommendations([]);
      } else {
        console.error('Invalid response format:', response);
        message.error('Invalid response format from server');
        setRecommendations([]);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      message.error("Failed to load recommended friends");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      console.log('Sending friend request to user:', userId);
      const response = await sendFriendRequest(userId);
      
      if (response.error) {
        throw new Error(response.error);
      }

      notification.success({
        message: "Friend Request Sent",
        description: "Your friend request has been sent successfully!",
        placement: "topRight",
      });

      // Remove the user from recommendations
      setRecommendations((prev) =>
        prev.filter((rec) => rec.user._id !== userId)
      );
      
      // Also update displayed recommendations
      setDisplayedRecommendations((prev) =>
        prev.filter((rec) => rec.user._id !== userId)
      );

      // Notify parent component that a friend request was sent
      if (onFriendRequestSent) {
        onFriendRequestSent();
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      notification.error({
        message: "Failed to Send Request",
        description: error.message || "Unable to send friend request. Please try again later.",
        placement: "topRight",
      });
    }
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 75) return "#52c41a"; // Ant Design success color
    if (percentage >= 50) return "#1890ff"; // Ant Design primary color
    return "#ff4d4f"; // Ant Design error color
  };

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

  const formatStudyPreference = (preference) => {
    const preferenceMap = {
      morning: "Morning Person",
      evening: "Evening Person",
      flexible: "Flexible",
      night: "Night Owl",
    };
    return preferenceMap[preference] || preference || "Not specified";
  };

  const showUserProfile = (user) => {
    setSelectedUser(user);
    setProfileModalVisible(true);
  };

  const renderDetailedProfile = (user) => {
    if (!user) return null;

    return (
      <div className="detailed-profile">
        <div className="profile-header">
          <Avatar size={100}>{user.name ? user.name[0] : "U"}</Avatar>
          <Title level={2}>{user.name}</Title>
          <Text type="secondary">{user.email}</Text>
          <div style={{ marginTop: '12px' }}>
            <DirectMessageButton 
              userId={user._id} 
              type="primary" 
              showText={true}
            />
          </div>
        </div>

        <Divider />

        <Descriptions title="Academic Information" bordered>
          <Descriptions.Item label="Major" span={3}>
            {formatMajor(user.major)}
          </Descriptions.Item>
          <Descriptions.Item label="Education Level" span={3}>
            {formatEducation(user.education)}
          </Descriptions.Item>
          <Descriptions.Item label="Study Preference" span={3}>
            {formatStudyPreference(user.studyPreference)}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Title level={4}>
          <TeamOutlined /> Interests
        </Title>
        <div className="tag-container">
          {user.interests?.map((interest, index) => (
            <Tag key={index} color="green" style={{ margin: '4px' }}>
              {interest}
            </Tag>
          ))}
        </div>

        <Divider />

        <Title level={4}>
          <TrophyOutlined /> Hobbies
        </Title>
        <div className="tag-container">
          {user.hobbies?.map((hobby, index) => (
            <Tag key={index} color="orange" style={{ margin: '4px' }}>
              {hobby}
            </Tag>
          ))}
        </div>

        {user.bio && (
          <>
            <Divider />
            <Title level={4}>About Me</Title>
            <Paragraph>{user.bio}</Paragraph>
          </>
        )}

        {user.achievements && user.achievements.length > 0 && (
          <>
            <Divider />
            <Title level={4}>
              <TrophyOutlined /> Achievements
            </Title>
            <List
              dataSource={user.achievements}
              renderItem={(achievement) => (
                <List.Item>
                  <Text>{achievement}</Text>
                </List.Item>
              )}
            />
          </>
        )}

        {user.statistics && (
          <>
            <Divider />
            <Title level={4}>Study Statistics</Title>
            <Descriptions bordered>
              <Descriptions.Item label="Total Study Hours">
                {user.statistics.totalHours || 0} hours
              </Descriptions.Item>
              <Descriptions.Item label="Completed Tasks">
                {user.statistics.completedTasks || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Study Streak">
                {user.statistics.studyStreak || 0} days
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </div>
    );
  };

  const renderUserCard = (user, matchPercentage, onAddFriend) => {
    const isOnline = user.statistics?.lastActive
      ? isUserOnline(user.statistics.lastActive)
      : false;

    return (
      <Card 
        className="recommended-friend-card"
        hoverable
        onClick={() => showUserProfile(user)}
        actions={[
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click when clicking button
              onAddFriend(user._id);
            }}
          >
            Add Friend
          </Button>
        ]}
      >
        <Card.Meta
          avatar={
            <Badge
              dot
              status={isOnline ? "success" : "default"}
              offset={[-4, 36]}
            >
              <Avatar size={64}>{user.name ? user.name[0] : "U"}</Avatar>
            </Badge>
          }
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {user.name}
                {isOnline && (
                  <Tag color="success" style={{ marginLeft: 8 }}>Online</Tag>
                )}
              </div>
              <Progress
                type="circle"
                percent={Math.round(matchPercentage)}
                width={40}
                format={(percent) => `${percent}%`}
                status={
                  matchPercentage >= 75 ? "success" :
                  matchPercentage >= 50 ? "normal" :
                  "exception"
                }
              />
            </div>
          }
          description={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <div style={{ color: '#666' }}>{user.email}</div>
                {!isOnline && user.statistics?.lastActive && (
                  <div style={{ color: '#888', fontSize: '12px' }}>
                    <ClockCircleOutlined style={{ marginRight: 5 }} />
                    Last active: {formatLastActive(user.statistics.lastActive)}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                {user.major && (
                  <Tag color="blue">
                    <BookOutlined /> {formatMajor(user.major)}
                  </Tag>
                )}
                {user.education && (
                  <Tag color="cyan">
                    {formatEducation(user.education)}
                  </Tag>
                )}
                {user.studyPreference && (
                  <Tag color="purple">
                    {formatStudyPreference(user.studyPreference)}
                  </Tag>
                )}
              </div>

              {user.interests && user.interests.length > 0 && (
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>Interests:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {user.interests.map((interest, index) => (
                      <Tag key={index} color="green">{interest}</Tag>
                    ))}
                  </div>
                </div>
              )}

              {user.hobbies && user.hobbies.length > 0 && (
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>Hobbies:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {user.hobbies.map((hobby, index) => (
                      <Tag key={index} color="orange">{hobby}</Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>
          }
        />
      </Card>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!recommendations.length) {
    return (
      <Empty
        description={
          <div>
            <p>No recommendations available at the moment</p>
            <p style={{ fontSize: '14px', color: '#666' }}>
              This could be because:
              <ul>
                <li>You haven't completed your profile</li>
                <li>There aren't enough users with matching interests</li>
                <li>You're already connected with all potential matches</li>
              </ul>
            </p>
          </div>
        }
        style={{ padding: "50px" }}
      />
    );
  }

  return (
    <div className="recommended-friends-container">
      <div className="recommended-friends-header">
        <Title level={4}>Recommended Friends</Title>
        <Space>
          <Select
            value={filterCriteria}
            onChange={setFilterCriteria}
            style={{ width: 120 }}
            placeholder="Filter by"
          >
            <Option value="all">All</Option>
            <Option value="high">High Match (75%+)</Option>
            <Option value="medium">Medium Match (50-74%)</Option>
            <Option value="low">Low Match (&lt;50%)</Option>
          </Select>
          <Input
            placeholder="Search by name or field"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
        </Space>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : displayedRecommendations.length > 0 ? (
        <Row gutter={[16, 16]}>
          {displayedRecommendations.map((recommendation) => (
            <Col xs={24} sm={24} md={12} lg={8} xl={8} key={recommendation.user._id}>
              {renderUserCard(
                recommendation.user,
                recommendation.matchPercentage,
                handleSendRequest
              )}
            </Col>
          ))}
        </Row>
      ) : (
        <Empty
          description={
            <span>
              No recommended friends found
              {searchText && " matching your search"}
              {filterCriteria !== "all" && " with selected match criteria"}
            </span>
          }
        />
      )}

      <Modal
        title="User Profile"
        open={profileModalVisible}
        onCancel={() => setProfileModalVisible(false)}
        width={800}
        footer={[
          <Button 
            key="close" 
            onClick={() => setProfileModalVisible(false)}
          >
            Close
          </Button>,
          <Button
            key="add"
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => {
              handleSendRequest(selectedUser._id);
              setProfileModalVisible(false);
            }}
          >
            Add Friend
          </Button>
        ]}
      >
        {renderDetailedProfile(selectedUser)}
      </Modal>
    </div>
  );
});

export default RecommendedFriends; 