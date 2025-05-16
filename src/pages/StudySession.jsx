import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  List,
  Avatar,
  message,
  Modal,
  Form,
  Select,
  Tag,
  Tooltip,
  Badge,
  Empty,
  Spin,
  Typography,
  Space,
  Divider,
  Row,
  Col,
  Radio,
  DatePicker,
} from "antd";
import {
  UserOutlined,
  VideoCameraOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  SearchOutlined,
  FilterOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  getAllStudySessions,
  createStudySession,
  joinStudySession,
} from "../services/api/studySessionService";
import "../styles/StudySessions.css";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const StudySession = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sessionMode, setSessionMode] = useState("group");
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await getAllStudySessions();
      setSessions(response.data || mockSessions);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch study sessions:", error);
      // Use mock data in case of error
      setSessions(mockSessions);
      setLoading(false);
      message.error(
        "Failed to fetch study sessions. Using sample data instead."
      );
    }
  };

  const handleCreateSession = async (values) => {
    try {
      setLoading(true);

      // Save user info to localStorage if not already there
      try {
        let userData = localStorage.getItem("userData");
        if (!userData) {
          // Create basic user data if none exists
          const basicUserData = {
            id: `user-${Math.random().toString(36).substring(2, 9)}`,
            name: "Anonymous User",
          };
          localStorage.setItem("userData", JSON.stringify(basicUserData));
          console.log("Created basic user data in localStorage");
        } else {
          // Make sure existing data has ID and name
          const parsedData = JSON.parse(userData);
          if (!parsedData.id && !parsedData._id) {
            parsedData.id = `user-${Math.random()
              .toString(36)
              .substring(2, 9)}`;
            localStorage.setItem("userData", JSON.stringify(parsedData));
          }
          if (!parsedData.name && !parsedData.userName) {
            parsedData.name = "Anonymous User";
            localStorage.setItem("userData", JSON.stringify(parsedData));
          }
        }
      } catch (userDataError) {
        console.error("Error handling user data:", userDataError);
      }

      // Set the type based on sessionMode if it's individual/group
      const sessionData = {
        ...values,
        // Convert Moment objects to ISO strings
        startTime: values.startTime
          ? values.startTime.toISOString()
          : undefined,
        endTime: values.endTime ? values.endTime.toISOString() : undefined,
        type: values.sessionMode || values.type,
      };

      console.log("Creating session with data:", sessionData);

      // Create a mock session first to have as fallback
      const mockSession = {
        _id: `mock-${Date.now()}`,
        title: values.title,
        description: values.description,
        subject: values.subject,
        status: "active",
        participants: [{ _id: "current-user", name: "You" }],
        createdAt: new Date().toISOString(),
        scheduledFor: values.startTime ? values.startTime.toISOString() : null,
        maxParticipants: values.maxParticipants || 10,
        type: values.sessionMode || values.type,
        startTime: values.startTime
          ? values.startTime.toISOString()
          : undefined,
        endTime: values.endTime ? values.endTime.toISOString() : undefined,
      };

      try {
        // Real API call
        const response = await createStudySession(sessionData);
        const newSession = response.data;
        console.log("Session created successfully:", newSession);

        // Update sessions after creating a new one
        await fetchSessions();

        // Close modal
        setIsModalVisible(false);
        form.resetFields();

        // Show success message
        message.success(`Study session "${newSession.title}" created!`);

        // Navigate to the session regardless of type (both individual and group)
        setTimeout(() => {
          console.log("Navigating to new session:", newSession._id);
          navigate(`/study-session/${newSession._id}`);
          setLoading(false);
        }, 800); // Longer delay for more reliable session registration
      } catch (error) {
        console.error("Error creating session:", error);

        // Fallback to mock session
        message.warning(
          "Creating session in offline mode due to connection issues"
        );
        setIsModalVisible(false);
        form.resetFields();

        // Add mock session to state
        setSessions((prev) => [mockSession, ...prev]);

        // Navigate to mock session regardless of type
        setTimeout(() => {
          navigate(`/study-session/${mockSession._id}`);
          setLoading(false);
        }, 300);
      }
    } catch (error) {
      console.error("Unexpected error in create session:", error);
      message.error("Failed to create session");
      setLoading(false);
    }
  };

  const handleJoinSession = async (sessionId) => {
    try {
      await joinStudySession(sessionId);
      navigate(`/study-session/${sessionId}`);
      message.success("Joined study session successfully");
    } catch (error) {
      console.error("Failed to join study session:", error);
      // For demo purposes, navigate anyway
      navigate(`/study-session/${sessionId}`);
      message.warning("Joining session in demo mode");
    }
  };

  // Watch for changes to the sessionMode field and update state
  const handleSessionModeChange = (e) => {
    setSessionMode(e.target.value);

    // If switching to individual, set maxParticipants to 1
    if (e.target.value === "individual") {
      form.setFieldsValue({ maxParticipants: 1 });
    } else {
      // If switching back to group, reset to 10 if it was 1
      const currentMax = form.getFieldValue("maxParticipants");
      if (currentMax === 1) {
        form.setFieldsValue({ maxParticipants: 10 });
      }
    }
  };

  // Filter sessions based on search text and status
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchText.toLowerCase()) ||
      session.description.toLowerCase().includes(searchText.toLowerCase()) ||
      (session.subject &&
        session.subject.toLowerCase().includes(searchText.toLowerCase()));

    const matchesStatus =
      filterStatus === "all" || session.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge status="success" text="Active" />;
      case "scheduled":
        return <Badge status="processing" text="Scheduled" />;
      case "completed":
        return <Badge status="default" text="Completed" />;
      default:
        return <Badge status="default" text={status} />;
    }
  };

  // Mock data for testing
  const mockSessions = [
    {
      _id: "1",
      title: "Calculus Study Group",
      description:
        "Preparing for the midterm exam. We'll cover derivatives, integrals and applications.",
      subject: "Mathematics",
      status: "active",
      participants: [
        { _id: "u1", name: "John Doe" },
        { _id: "u2", name: "Jane Smith" },
        { _id: "u3", name: "Alex Johnson" },
      ],
      createdAt: "2023-05-15T10:30:00Z",
      scheduledFor: "2023-05-16T15:00:00Z",
      maxParticipants: 8,
      type: "exam-prep",
    },
    {
      _id: "2",
      title: "Physics Problem Solving",
      description:
        "Working through the problem set for Chapter 7: Electromagnetism",
      subject: "Physics",
      status: "active",
      participants: [
        { _id: "u2", name: "Jane Smith" },
        { _id: "u4", name: "Mike Wilson" },
      ],
      createdAt: "2023-05-14T14:20:00Z",
      scheduledFor: null,
      maxParticipants: 5,
      type: "homework",
    },
    {
      _id: "3",
      title: "Literature Discussion: Shakespeare",
      description:
        "Analyzing themes in Hamlet and Macbeth for the upcoming essay",
      subject: "English Literature",
      status: "scheduled",
      participants: [
        { _id: "u1", name: "John Doe" },
        { _id: "u5", name: "Emily Clark" },
        { _id: "u6", name: "David Brown" },
        { _id: "u7", name: "Sarah Lee" },
      ],
      createdAt: "2023-05-15T09:15:00Z",
      scheduledFor: "2023-05-18T17:30:00Z",
      maxParticipants: 10,
      type: "discussion",
    },
    {
      _id: "4",
      title: "Programming: Data Structures",
      description:
        "Implementation of trees, graphs and their algorithms in Python",
      subject: "Computer Science",
      status: "completed",
      participants: [
        { _id: "u3", name: "Alex Johnson" },
        { _id: "u4", name: "Mike Wilson" },
        { _id: "u8", name: "Chris Taylor" },
      ],
      createdAt: "2023-05-10T16:45:00Z",
      scheduledFor: "2023-05-12T19:00:00Z",
      maxParticipants: 6,
      type: "coding-practice",
    },
  ];

  const sessionTypes = [
    { value: "individual", label: "Individual Study" },
    { value: "group", label: "Group Study" },
    { value: "general", label: "General Study" },
    { value: "exam-prep", label: "Exam Preparation" },
    { value: "homework", label: "Homework Help" },
    { value: "discussion", label: "Discussion" },
    { value: "project", label: "Project Work" },
    { value: "coding-practice", label: "Coding Practice" },
    { value: "language-practice", label: "Language Practice" },
    { value: "other", label: "Other" },
  ];

  // Add some styling for the session type options
  const sessionTypeStyles = {
    individual: {
      color: "#1890ff",
      background: "#e6f7ff",
      borderColor: "#91d5ff",
    },
    group: {
      color: "#52c41a",
      background: "#f6ffed",
      borderColor: "#b7eb8f",
    },
  };

  // Function to get session type tag color
  const getSessionTypeTagColor = (type) => {
    switch (type) {
      case "individual":
        return "blue";
      case "group":
        return "green";
      case "exam-prep":
        return "red";
      case "homework":
        return "orange";
      case "discussion":
        return "purple";
      case "project":
        return "cyan";
      case "coding-practice":
        return "geekblue";
      case "language-practice":
        return "magenta";
      default:
        return "default";
    }
  };

  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "English Literature",
    "History",
    "Geography",
    "Economics",
    "Psychology",
    "Sociology",
    "Art",
    "Music",
    "Foreign Languages",
    "Physical Education",
    "Other",
  ];

  return (
    <div className="session-page">
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>Study Sessions</Title>
          <Text type="secondary">
            Join or create virtual study sessions with other students
          </Text>
        </Col>
        <Col>
          <Button
            type="primary"
            onClick={() => setIsModalVisible(true)}
            icon={<VideoCameraOutlined />}
            size="large"
          >
            Create Session
          </Button>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Input
            placeholder="Search sessions"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            placeholder="Filter by status"
            style={{ width: "100%" }}
            value={filterStatus}
            onChange={(value) => setFilterStatus(value)}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">All Sessions</Option>
            <Option value="active">Active</Option>
            <Option value="scheduled">Scheduled</Option>
            <Option value="completed">Completed</Option>
          </Select>
        </Col>
      </Row>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "40px 0",
          }}
        >
          <Spin size="large" />
        </div>
      ) : filteredSessions.length > 0 ? (
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 1,
            md: 2,
            lg: 2,
            xl: 3,
            xxl: 3,
          }}
          dataSource={filteredSessions}
          renderItem={(session) => (
            <List.Item>
              <Card
                hoverable
                className="session-card"
                title={session.title}
                extra={getStatusBadge(session.status)}
                actions={[
                  <Tooltip title="Join Session">
                    <Button
                      type="primary"
                      icon={<VideoCameraOutlined />}
                      onClick={() => handleJoinSession(session._id)}
                      disabled={session.status === "completed"}
                    >
                      Join
                    </Button>
                  </Tooltip>,
                ]}
              >
                <div style={{ minHeight: "120px" }}>
                  <Text type="secondary" className="session-description">
                    {session.description}
                  </Text>

                  <Divider style={{ margin: "12px 0" }} />

                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    {session.subject && (
                      <Tag color="blue">{session.subject}</Tag>
                    )}

                    {session.type && (
                      <Tag color={getSessionTypeTagColor(session.type)}>
                        {sessionTypes.find((t) => t.value === session.type)
                          ?.label || session.type}
                      </Tag>
                    )}

                    <div className="session-meta">
                      <Space>
                        <TeamOutlined />
                        <Text>
                          {session.participants.length} /{" "}
                          {session.maxParticipants || "∞"} participants
                        </Text>
                      </Space>
                    </div>

                    {session.scheduledFor && (
                      <div>
                        <Space>
                          <CalendarOutlined />
                          <Text>
                            {new Date(session.scheduledFor).toLocaleString()}
                          </Text>
                        </Space>
                      </div>
                    )}
                  </Space>
                </div>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Empty
          description={
            <span>
              No study sessions found.{" "}
              {searchText || filterStatus !== "all"
                ? "Try adjusting your filters."
                : "Create your first session!"}
            </span>
          }
        />
      )}

      <Modal
        title="Create Study Session"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          onFinish={handleCreateSession}
          layout="vertical"
          initialValues={{
            maxParticipants: 10,
            type: "general",
            sessionMode: "group",
          }}
        >
          <Form.Item
            name="title"
            label="Session Title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input placeholder="Enter session title" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <TextArea rows={4} placeholder="Enter session description" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="subject"
                label="Subject"
                rules={[{ required: true, message: "Please select a subject" }]}
              >
                <Select placeholder="Select subject">
                  {subjects.map((subject) => (
                    <Option key={subject} value={subject}>
                      {subject}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="type" label="Session Type">
                <Select placeholder="Select session type">
                  {sessionTypes.map((type) => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="Start Time"
                rules={[
                  { required: true, message: "Please select a start time" },
                ]}
              >
                <DatePicker showTime style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endTime"
                label="End Time"
                rules={[
                  { required: true, message: "Please select an end time" },
                ]}
              >
                <DatePicker showTime style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="sessionMode"
            label="Session Mode"
            initialValue="group"
            rules={[{ required: true }]}
          >
            <Radio.Group
              buttonStyle="solid"
              size="large"
              style={{ width: "100%", marginBottom: "20px" }}
              onChange={handleSessionModeChange}
            >
              <Radio.Button
                value="individual"
                style={{
                  width: "50%",
                  textAlign: "center",
                  height: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div>
                  <UserOutlined
                    style={{ fontSize: "20px", marginRight: "8px" }}
                  />
                  <span style={{ fontSize: "16px" }}>Individual Study</span>
                </div>
              </Radio.Button>
              <Radio.Button
                value="group"
                style={{
                  width: "50%",
                  textAlign: "center",
                  height: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div>
                  <TeamOutlined
                    style={{ fontSize: "20px", marginRight: "8px" }}
                  />
                  <span style={{ fontSize: "16px" }}>Group Study</span>
                </div>
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maxParticipants"
                label="Maximum Participants"
                rules={[
                  {
                    required: true,
                    message: "Please enter maximum participants",
                  },
                ]}
                extra={
                  sessionMode === "individual"
                    ? "Individual sessions are limited to 1 participant"
                    : ""
                }
              >
                <Input
                  type="number"
                  min={sessionMode === "individual" ? 1 : 2}
                  max={50}
                  disabled={sessionMode === "individual"}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Create Session
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudySession;
