import React, { useState, useEffect } from "react";
import {
  Input,
  Space,
  Spin,
  Empty,
  Row,
  Col,
  Pagination,
  Card,
  Select,
  Typography,
  Alert,
  message,
} from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import UserProfile from "../components/features/social/UserProfile";
import { searchUsers, getUserFriends } from "../services/api/userService";

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const Users = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [educationFilter, setEducationFilter] = useState("");
  const [majorFilter, setMajorFilter] = useState("");
  const [error, setError] = useState(null);

  // Get initial data
  useEffect(() => {
    fetchUsers();
    fetchFriends();
  }, [currentPage, pageSize, educationFilter, majorFilter]);

  // Fetch users with filters
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare query parameters
      const params = {
        page: currentPage,
        limit: pageSize,
      };

      if (educationFilter) params.education = educationFilter;
      if (majorFilter) params.major = majorFilter;
      if (searchQuery) params.query = searchQuery;

      // Call API to search users
      const response = await searchUsers(params);

      if (response?.error) {
        throw new Error(response.error);
      }

      // Set users and pagination data
      setUsers(response.users || []);
      setTotalUsers(response.totalCount || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again later.");

      // Set mock data for development and testing
      setUsers([
        {
          _id: "mock1",
          name: "Ahmed Medhat",
          email: "ahmedhatdev@gmail.com",
          major: "computer_science",
          education: "bachelors",
          studyPreference: "both",
          interests: ["Programming", "AI", "Web Development"],
          hobbies: ["Gaming", "Reading"],
          statistics: { lastActive: new Date() },
        },
        {
          _id: "mock2",
          name: "Sarah Johnson",
          email: "sarah@example.com",
          major: "psychology",
          education: "masters",
          studyPreference: "group",
          interests: ["Psychology", "Research"],
          hobbies: ["Photography", "Hiking"],
          statistics: { lastActive: new Date(Date.now() - 30 * 60000) },
        },
      ]);
      setTotalUsers(2);
    } finally {
      setLoading(false);
    }
  };

  // Fetch friends to know connection status
  const fetchFriends = async () => {
    try {
      const response = await getUserFriends();
      if (response?.error) {
        console.error("Error fetching friends:", response.error);
        return;
      }

      setFriends(response.data || []);

      // Set mock data for development and testing
      if (!response.data || response.data.length === 0) {
        setFriends([
          {
            _id: "friend1",
            name: "John Doe",
            email: "john@example.com",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on new search
    fetchUsers();
  };

  // Handle add friend
  const handleAddFriend = (userId, status) => {
    // Update local state to reflect the new connection status
    setUsers(
      users.map((user) =>
        user._id === userId ? { ...user, connectionStatus: status } : user
      )
    );

    // If you need to refresh friend list after adding
    fetchFriends();
  };

  // Get connection status for a user
  const getConnectionStatus = (userId) => {
    if (friends.some((friend) => friend._id === userId)) {
      return "connected";
    }
    if (friendRequests.some((request) => request._id === userId)) {
      return "pending";
    }
    return "none";
  };

  // Filter options
  const educationOptions = [
    { value: "high_school", label: "High School" },
    { value: "bachelors", label: "Bachelor's" },
    { value: "masters", label: "Master's" },
    { value: "phd", label: "PhD" },
  ];

  const majorOptions = [
    { value: "computer_science", label: "Computer Science" },
    { value: "biology", label: "Biology" },
    { value: "engineering", label: "Engineering" },
    { value: "mathematics", label: "Mathematics" },
    { value: "business", label: "Business" },
    { value: "literature", label: "Literature" },
    { value: "physics", label: "Physics" },
    { value: "chemistry", label: "Chemistry" },
    { value: "psychology", label: "Psychology" },
    { value: "medicine", label: "Medicine" },
    { value: "arts", label: "Arts" },
  ];

  return (
    <div className="users-page">
      <Card style={{ marginBottom: "20px" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col span={24} lg={8}>
            <Title level={3}>
              <UserOutlined /> Browse Users
            </Title>
          </Col>
          <Col span={24} lg={16}>
            <Space
              direction="horizontal"
              size="middle"
              style={{ width: "100%", justifyContent: "flex-end" }}
            >
              <Search
                placeholder="Search users"
                allowClear
                enterButton={<SearchOutlined />}
                onSearch={handleSearch}
                style={{ width: 250 }}
              />
              <Select
                placeholder="Education"
                allowClear
                style={{ width: 150 }}
                onChange={(value) => {
                  setEducationFilter(value || "");
                  setCurrentPage(1);
                }}
                value={educationFilter || undefined}
              >
                {educationOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Field of Study"
                allowClear
                style={{ width: 180 }}
                onChange={(value) => {
                  setMajorFilter(value || "");
                  setCurrentPage(1);
                }}
                value={majorFilter || undefined}
              >
                {majorOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
        </Row>
      </Card>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: "20px" }}
        />
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
          <p>Loading users...</p>
        </div>
      ) : users.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {users.map((user) => (
              <Col span={24} key={user._id}>
                <UserProfile
                  user={user}
                  onAddFriend={handleAddFriend}
                  connectionStatus={getConnectionStatus(user._id)}
                />
              </Col>
            ))}
          </Row>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalUsers}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger
              onShowSizeChange={(current, size) => {
                setCurrentPage(1);
                setPageSize(size);
              }}
              showTotal={(total) => `Total ${total} users`}
            />
          </div>
        </>
      ) : (
        <Empty
          description={
            searchQuery || educationFilter || majorFilter
              ? "No users match your search criteria"
              : "No users found"
          }
        />
      )}
    </div>
  );
};

export default Users;
