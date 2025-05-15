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
} from "antd";
import {
  UserAddOutlined,
  UserOutlined,
  BookOutlined,
  EnvironmentOutlined,
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { sendFriendRequest, getRecommendedFriends } from "../../../../services/api/socialService";
import "./RecommendedFriends.css";

const { Text, Title } = Typography;
const { Option } = Select;

const RecommendedFriends = forwardRef(({ onFriendRequestSent }, ref) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCriteria, setFilterCriteria] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [displayedRecommendations, setDisplayedRecommendations] = useState([]);

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
    if (!majorValue) return "Not Specified";
    
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
      other: "Other"
    };

    return majorMap[majorValue] || majorValue
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatEducation = (educationValue) => {
    if (!educationValue) return "Not Specified";

    const educationMap = {
      high_school: "High School",
      bachelors: "Bachelor's Degree",
      masters: "Master's Degree",
      phd: "Ph.D.",
      other: "Other"
    };

    return educationMap[educationValue] || educationValue;
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
    <div className="recommended-friends">
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={4}>
            <FilterOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            Study Mate Recommendations
          </Title>
        </Col>
        <Col>
          <Space size="middle">
            <Input
              placeholder="Search by name, major, or interests"
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              defaultValue="all"
              style={{ width: 150 }}
              onChange={setFilterCriteria}
            >
              <Option value="all">All Matches</Option>
              <Option value="high">High Match (≥75%)</Option>
              <Option value="medium">Medium Match (50-74%)</Option>
              <Option value="low">Low Match (&lt;50%)</Option>
            </Select>
          </Space>
        </Col>
      </Row>

      <Row style={{ marginBottom: 16 }}>
        <Col>
          <Text type="secondary">
            Showing {displayedRecommendations.length} potential study mates
          </Text>
        </Col>
      </Row>
      
      <List
        grid={{
          gutter: [24, 24],
          xs: 1,
          sm: 2,
          md: 3,
          lg: 3,
          xl: 4,
          xxl: 4,
        }}
        dataSource={displayedRecommendations}
        renderItem={(recommendation) => (
          <List.Item>
            <Card
              hoverable
              className="friend-card"
              style={{ height: "100%" }}
            >
              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <Progress
                  type="circle"
                  percent={Math.round(recommendation.matchPercentage)}
                  strokeColor={getMatchColor(recommendation.matchPercentage)}
                  size={80}
                  format={(percent) => (
                    <div className="match-percentage">
                      <div>{Math.round(percent)}%</div>
                      <div className="match-label">Match</div>
                    </div>
                  )}
                />
              </div>

              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <Avatar
                  size={64}
                  icon={<UserOutlined />}
                  src={recommendation.user.profileImage}
                />
                <Title level={5} style={{ margin: "12px 0 4px" }}>
                  {recommendation.user.name}
                </Title>
                <Text type="secondary">
                  <BookOutlined /> {formatMajor(recommendation.user.major)}
                </Text>
              </div>

              <div style={{ marginBottom: "16px", textAlign: "center" }}>
                {recommendation.user.interests?.slice(0, 3).map((interest, index) => (
                  <Tag 
                    color="blue" 
                    key={index} 
                    style={{ margin: "0 4px 4px 0" }}
                  >
                    {interest}
                  </Tag>
                ))}
                {(!recommendation.user.interests || recommendation.user.interests.length === 0) && (
                  <Text type="secondary">No interests specified</Text>
                )}
              </div>

              <div style={{ marginBottom: "16px", textAlign: "center" }}>
                <Text type="secondary">
                  <EnvironmentOutlined /> {formatEducation(recommendation.user.education)}
                </Text>
              </div>

              <Button
                type="primary"
                icon={<UserAddOutlined />}
                block
                onClick={() => handleSendRequest(recommendation.user._id)}
              >
                Connect
              </Button>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
});

export default RecommendedFriends; 