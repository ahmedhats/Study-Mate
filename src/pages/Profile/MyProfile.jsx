import React, { useState, useEffect } from "react";
import {
  Tabs,
  Avatar,
  Tag,
  Progress,
  Button,
  Calendar,
  Badge,
  List,
  Card,
  message,
  Divider,
  Row,
  Col,
  Spin,
} from "antd";
import {
  CalendarOutlined,
  MoreOutlined,
  ClockCircleOutlined,
  BookOutlined,
  ApartmentOutlined,
  HeartOutlined,
  StarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import EditProfileModal from "./components/EditProfileModal";
import { getUserProfile } from "../../services/api/userService";
import { formatLastActive } from "../../utils/dateFormatter";

const MyProfile = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("preferences");
  const [userData, setUserData] = useState(null);
  const [localUserData, setLocalUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First, get the data from localStorage for immediate display
    try {
      const localData = localStorage.getItem("userData");
      if (localData) {
        const parsedData = JSON.parse(localData);
        console.log("Local storage data:", parsedData);

        // Try to get user data from both possible structures
        const userInfo = parsedData.user || parsedData;
        console.log("User info from localStorage:", userInfo);

        // Ensure we have the education, major and preferences data
        if (userInfo.education || userInfo.major || userInfo.studyPreference) {
          console.log("User preferences found in localStorage");
        } else {
          console.warn("User preferences not found in localStorage");
        }

        setLocalUserData(userInfo);
      }
    } catch (error) {
      console.error("Error parsing local user data:", error);
    }

    // Then fetch from API
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await getUserProfile();
      console.log("API user profile response:", response);

      // Check both possible data structures from the API
      const apiData = response.data || response;
      console.log("API user profile data:", apiData);

      setUserData(apiData);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      message.error("Failed to load profile data from server");
    } finally {
      setLoading(false);
    }
  };

  // Default mock user data with zeros/empty fields
  const defaultUserData = {
    name: "User",
    email: "",
    birthday: "",
    firstSeen: "",
    type: "Regular",
    status: "Online",
    workItems: [],
    assignedTasks: [],
    calendarEvents: [],
    education: "",
    major: "",
    interests: [],
    hobbies: [],
    studyPreference: "",
  };

  // Merge remote and local data, prioritizing remote
  const displayUserData = {
    ...defaultUserData,
    ...localUserData,
    ...userData,
  };

  console.log("Final display user data:", displayUserData);

  // Make sure we have the correct study preference format
  if (displayUserData.studyPreference === "both") {
    console.log("Study preference is 'both'");
  }

  const workItems = displayUserData.workItems || [];
  const assignedTasks = displayUserData.assignedTasks || [];
  const calendarEvents = displayUserData.calendarEvents || [];

  // Helper function to format education value
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

  // Helper function to format major value
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

  // Helper function to format study preference
  const formatStudyPreference = (preference) => {
    const preferenceMap = {
      individual: "Individual Study",
      group: "Group Study",
      both: "Both Individual & Group",
    };
    return preferenceMap[preference] || preference || "Not specified";
  };

  const getEventTypeColor = (type) => {
    const colors = {
      meeting: "blue",
      deadline: "red",
      task: "green",
    };
    return colors[type] || "default";
  };

  if (loading && !localUserData) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <p>Loading profile data...</p>
      </div>
    );
  }

  const items = [
    {
      key: "preferences",
      label: "Preferences",
      children: (
        <div className="preferences-content">
          <Row gutter={[24, 24]}>
            <Col span={24} md={12}>
              <Card title="Academic Information" className="profile-card">
                <div className="profile-detail-item">
                  <div className="profile-detail-icon">
                    <BookOutlined />
                  </div>
                  <div className="profile-detail-content">
                    <h4>Education Level</h4>
                    <p>{formatEducation(displayUserData.education)}</p>
                  </div>
                </div>
                <Divider />
                <div className="profile-detail-item">
                  <div className="profile-detail-icon">
                    <ApartmentOutlined />
                  </div>
                  <div className="profile-detail-content">
                    <h4>Field of Study</h4>
                    <p>{formatMajor(displayUserData.major)}</p>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={24} md={12}>
              <Card title="Study Preferences" className="profile-card">
                <div className="profile-detail-item">
                  <div className="profile-detail-icon">
                    <TeamOutlined />
                  </div>
                  <div className="profile-detail-content">
                    <h4>Study Preference</h4>
                    <p>
                      {formatStudyPreference(displayUserData.studyPreference)}
                    </p>
                  </div>
                </div>
                <Divider />
                <div className="profile-detail-item">
                  <div className="profile-detail-icon">
                    <StarOutlined />
                  </div>
                  <div className="profile-detail-content">
                    <h4>Study Goals</h4>
                    <p>{displayUserData.studyGoals || "No goals specified"}</p>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={24}>
              <Card title="Interests & Hobbies" className="profile-card">
                <div className="profile-detail-item">
                  <div className="profile-detail-icon">
                    <HeartOutlined />
                  </div>
                  <div className="profile-detail-content">
                    <h4>Academic Interests</h4>
                    <div>
                      {displayUserData.interests &&
                      displayUserData.interests.length > 0 ? (
                        displayUserData.interests.map((interest, index) => (
                          <Tag color="blue" key={index}>
                            {interest}
                          </Tag>
                        ))
                      ) : (
                        <p>No interests specified</p>
                      )}
                    </div>
                  </div>
                </div>
                <Divider />
                <div className="profile-detail-item">
                  <div className="profile-detail-icon">
                    <StarOutlined />
                  </div>
                  <div className="profile-detail-content">
                    <h4>Hobbies</h4>
                    <div>
                      {displayUserData.hobbies &&
                      displayUserData.hobbies.length > 0 ? (
                        displayUserData.hobbies.map((hobby, index) => (
                          <Tag color="green" key={index}>
                            {hobby}
                          </Tag>
                        ))
                      ) : (
                        <p>No hobbies specified</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: "activity",
      label: "Activity",
      children: (
        <div className="activity-content">
          {workItems.length > 0 ? (
            workItems.map((item, index) => (
              <div key={index} className="work-item">
                <div className="work-info">
                  <div className="work-title">{item.title}</div>
                  <div className="work-date">{item.date}</div>
                </div>
                <Progress percent={item.progress} />
              </div>
            ))
          ) : (
            <p>No activity data available</p>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="my-profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <Avatar size={100}>
            {displayUserData.name
              ? displayUserData.name.charAt(0).toUpperCase()
              : "U"}
          </Avatar>
        </div>
        <div className="profile-info">
          <h2>{displayUserData.name}</h2>
          <p>{displayUserData.email}</p>
          <p>
            <Tag color="blue">{formatMajor(displayUserData.major)}</Tag>
            <Tag color="green">
              {formatEducation(displayUserData.education)}
            </Tag>
          </p>
          <Button type="primary" onClick={() => setIsEditModalVisible(true)}>
            Edit Profile
          </Button>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="profile-tabs"
        items={items}
      />

      {isEditModalVisible && (
        <EditProfileModal
          visible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          onSave={() => {
            setIsEditModalVisible(false);
            fetchUserData(); // Refresh data after saving
          }}
          userData={displayUserData}
        />
      )}
    </div>
  );
};

export default MyProfile;
