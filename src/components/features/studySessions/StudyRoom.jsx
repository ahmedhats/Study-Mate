import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Card,
  Button,
  Input,
  Tabs,
  Space,
  Typography,
  Divider,
  notification,
  Modal,
  Spin,
  Alert,
} from "antd";
import {
  SendOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  SettingOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import JitsiVideoRoom from "./JitsiVideoRoom";
import {
  getStudySessionDetails,
  leaveStudySession,
} from "../../../services/api/studySessionService";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { confirm } = Modal;

const StudyRoom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  // State variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("video");
  const [studyNotes, setStudyNotes] = useState("");
  const [studyTime, setStudyTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [userName, setUserName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [userId, setUserId] = useState("");
  const [videoAvailable, setVideoAvailable] = useState(true);
  const [isIndividualSession, setIsIndividualSession] = useState(false);
  const [nicknameModalVisible, setNicknameModalVisible] = useState(false);
  const [leaveSessionModalVisible, setLeaveSessionModalVisible] =
    useState(false);

  // Refs
  const timerRef = useRef(null);
  const lastTimestampRef = useRef(null);

  useEffect(() => {
    // Load user information from localStorage
    loadUserInfo();

    // Fetch session details
    fetchSessionDetails();

    // Load saved timer state and notes if they exist
    loadSavedTimerState();

    // Cleanup function
    return () => {
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Save timer state on dismount
      saveTimerState();
    };
  }, []);

  // Save timer state when timer changes
  useEffect(() => {
    if (timerActive) {
      setupStudyTimer();
    } else {
      // Save state when timer is paused
      saveTimerState();
    }
  }, [timerActive]);

  // Save timer state when study time changes
  useEffect(() => {
    // Only save if there's actual study time to avoid overwriting with 0
    if (studyTime > 0) {
      saveTimerState();
    }
  }, [studyTime]);

  // Load saved timer state and notes from localStorage
  const loadSavedTimerState = () => {
    try {
      const savedTimerState = localStorage.getItem(`timer_state_${sessionId}`);
      if (savedTimerState) {
        const { time, notes } = JSON.parse(savedTimerState);
        setStudyTime(time || 0);

        // Only set notes if they're not empty and we don't already have notes
        if (notes && notes.trim() !== "") {
          setStudyNotes(notes);
        }
      }
    } catch (error) {
      console.error("Error loading saved timer state:", error);
    }
  };

  // Save timer state to localStorage
  const saveTimerState = () => {
    try {
      const timerState = {
        time: studyTime,
        notes: studyNotes,
        sessionId: sessionId,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(
        `timer_state_${sessionId}`,
        JSON.stringify(timerState)
      );
    } catch (error) {
      console.error("Error saving timer state:", error);
    }
  };

  // Load user info from localStorage
  const loadUserInfo = () => {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(
          user.id ||
            user._id ||
            `user-${Math.random().toString(36).substring(2, 9)}`
        );
        setUserName(user.name || user.userName || "Study Mate User");
        setDisplayName(
          user.displayName || user.name || user.userName || "Study Mate User"
        );
      } else {
        // Generate fallback values
        const fallbackId = `user-${Math.random().toString(36).substring(2, 9)}`;
        setUserId(fallbackId);
        setUserName("Study Mate User");
        setDisplayName("Study Mate User");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      // Set fallback values
      const fallbackId = `user-${Math.random().toString(36).substring(2, 9)}`;
      setUserId(fallbackId);
      setUserName("Study Mate User");
      setDisplayName("Study Mate User");
    }
  };

  // Fetch session details from API
  const fetchSessionDetails = async () => {
    try {
      setLoading(true);

      // Fetch from API
      console.log("Fetching session details for:", sessionId);

      try {
        const response = await getStudySessionDetails(sessionId);

        if (response && response.data) {
          console.log("Session data retrieved:", response.data);

          // Store session data
          setSessionDetails(response.data);

          // Check if this is an individual session
          const isIndividual =
            response.data.type === "individual" ||
            (response.data.participants &&
              response.data.participants.length === 1);
          setIsIndividualSession(isIndividual);

          setLoading(false);
        } else {
          throw new Error("Invalid response data");
        }
      } catch (apiError) {
        console.error(
          "Error fetching from API, creating temporary session:",
          apiError
        );

        // Create temporary session when backend is unavailable
        const isMockId = sessionId.includes("mock-");
        const isIndividual = sessionId.includes("individual");

        const temporarySession = {
          _id: sessionId,
          title: isIndividual
            ? "Personal Study Session"
            : "Group Study Session",
          description:
            "This session is temporary and will not be saved to the server.",
          subject: "Temporary Session",
          createdAt: new Date().toISOString(),
          status: "active",
          participants: [{ _id: userId, name: userName || displayName }],
        };

        // Store temporary session data
        setSessionDetails(temporarySession);
        setIsIndividualSession(isIndividual);
        setLoading(false);

        // Show notification about temporary session
        notification.info({
          message: "Using Temporary Session",
          description:
            "Connected to a temporary study session. Your data won't be saved to the server.",
          duration: 6,
        });
      }
    } catch (error) {
      console.error("Error in fetchSessionDetails:", error);
      setError("Failed to load session details. Please try again.");
      setLoading(false);
    }
  };

  // Setup study timer
  const setupStudyTimer = () => {
    // Clear existing timer if it exists
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Start a new timer that uses performance.now() for more accuracy
    lastTimestampRef.current = Date.now();

    timerRef.current = setInterval(() => {
      if (timerActive) {
        const now = Date.now();
        const elapsed = now - lastTimestampRef.current;
        lastTimestampRef.current = now;

        // Only update if elapsed time is reasonable (less than 2 seconds)
        // This prevents huge jumps if the tab was inactive
        if (elapsed > 0 && elapsed < 2000) {
          setStudyTime((prevTime) => prevTime + Math.floor(elapsed / 1000));
        }
      }
    }, 1000);
  };

  // Format time for display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (num) => num.toString().padStart(2, "0");

    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  };

  // Toggle timer
  const toggleTimer = () => {
    const newTimerState = !timerActive;
    setTimerActive(newTimerState);

    // If starting timer, reset lastTimestampRef
    if (newTimerState) {
      lastTimestampRef.current = Date.now();
    } else {
      // If stopping, save the state
      saveTimerState();
    }
  };

  // Reset timer
  const resetTimer = () => {
    // Stop timer first
    setTimerActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Reset time to 0
    setStudyTime(0);

    // Save the reset state
    saveTimerState();

    notification.info({
      message: "Timer Reset",
      description: "Study timer has been reset to zero.",
      duration: 3,
    });
  };

  // Send chat message
  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        text: newMessage.trim(),
        sender: userName || displayName,
        senderId: userId,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    }
  };

  // Handle notes change
  const handleNotesChange = (e) => {
    setStudyNotes(e.target.value);
  };

  // Download notes
  const downloadNotes = () => {
    if (!studyNotes.trim()) {
      notification.info({
        message: "No Notes",
        description: "There are no notes to download.",
        duration: 3,
      });
      return;
    }

    try {
      const sessionName = sessionDetails?.title || "Study Session";
      const date = new Date().toISOString().split("T")[0];
      const filename = `${sessionName}_Notes_${date}.txt`;

      const noteContent =
        `STUDY SESSION NOTES\n\n` +
        `Session: ${sessionName}\n` +
        `Date: ${date}\n` +
        `Duration: ${formatTime(studyTime)}\n\n` +
        `${studyNotes}`;

      const blob = new Blob([noteContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      notification.success({
        message: "Notes Downloaded",
        description: "Your study notes have been downloaded successfully.",
        duration: 3,
      });
    } catch (error) {
      console.error("Error downloading notes:", error);
      notification.error({
        message: "Download Failed",
        description:
          "There was an error downloading your notes. Please try again.",
        duration: 3,
      });
    }
  };

  // Leave session
  const leaveSession = () => {
    setLeaveSessionModalVisible(true);
  };

  // Perform leave session action
  const performLeaveSession = async (shouldDownloadNotes = false) => {
    try {
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Download notes if requested
      if (shouldDownloadNotes && studyNotes.trim()) {
        await downloadNotes();
      }

      // Note: No need to leave video channel as it's handled by the iframe

      // Notify backend (if not in offline mode)
      if (!sessionDetails?.isOfflineMode && sessionId) {
        try {
          await leaveStudySession(sessionId);
        } catch (leaveError) {
          console.error("Error notifying backend about leaving:", leaveError);
        }
      }

      // Navigate back to sessions list
      navigate("/study-sessions");

      notification.success({
        message: "Session Left",
        description: "You have successfully left the study session.",
        duration: 3,
      });
    } catch (error) {
      console.error("Error leaving session:", error);
      notification.error({
        message: "Error Leaving Session",
        description:
          "There was an error leaving the session. Please try again.",
        duration: 3,
      });
      // Still navigate away to prevent user from being stuck
      navigate("/study-sessions");
    }
  };

  // Cancel leave session
  const cancelLeaveSession = () => {
    setLeaveSessionModalVisible(false);
  };

  // Handle video error
  const handleVideoError = (error) => {
    console.error("Video error:", error);

    setVideoAvailable(false);
    notification.error({
      message: "Video Connection Failed",
      description:
        "Could not connect to video. You can still use the chat and notes features.",
      duration: 5,
    });
  };

  // Open nickname modal
  const openNicknameModal = () => {
    setNicknameModalVisible(true);
  };

  // Handle save nickname
  const handleSaveNickname = (name) => {
    if (name && name.trim()) {
      setDisplayName(name.trim());

      // Update localStorage
      try {
        const userData = localStorage.getItem("userData");
        if (userData) {
          const user = JSON.parse(userData);
          user.displayName = name.trim();
          localStorage.setItem("userData", JSON.stringify(user));
        }
      } catch (error) {
        console.error("Error updating display name in localStorage:", error);
      }

      notification.success({
        message: "Display Name Updated",
        description: "Your display name has been updated successfully.",
        duration: 3,
      });
    }

    setNicknameModalVisible(false);
  };

  // Render loading spinner
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert
        type="error"
        message="Error Loading Session"
        description={error}
        showIcon
        action={
          <Button type="primary" onClick={() => navigate("/study-sessions")}>
            Return to Sessions
          </Button>
        }
      />
    );
  }

  return (
    <Content style={{ padding: "20px" }}>
      {/* Header with session info and actions */}
      <Card style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space>
            <Title level={4} style={{ margin: 0 }}>
              {sessionDetails?.title || "Study Session"}
            </Title>
          </Space>
          <Space>
            <Button icon={<UserOutlined />} onClick={openNicknameModal}>
              {displayName}
            </Button>
            <Button type="primary" danger onClick={leaveSession}>
              Leave Session
            </Button>
          </Space>
        </div>
      </Card>

      {/* Main content with tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* Video Tab */}
        <TabPane tab="Video" key="video">
          <Card>
            {videoAvailable ? (
              <JitsiVideoRoom
                sessionId={sessionId}
                userName={displayName || userName}
                onError={handleVideoError}
              />
            ) : (
              <Alert
                type="warning"
                message="Video Unavailable"
                description="Video connection is unavailable. You can still use chat and notes."
                showIcon
              />
            )}
          </Card>
        </TabPane>

        {/* Chat Tab */}
        <TabPane tab="Chat" key="chat">
          <Card
            style={{
              height: "calc(100vh - 280px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ flex: 1, overflowY: "auto", marginBottom: "16px" }}>
              {messages.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#999",
                    marginTop: "30px",
                  }}
                >
                  <p>No messages yet</p>
                  <p>Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems:
                        msg.senderId === userId ? "flex-end" : "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        background:
                          msg.senderId === userId ? "#1890ff" : "#f0f0f0",
                        color:
                          msg.senderId === userId
                            ? "white"
                            : "rgba(0, 0, 0, 0.85)",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        maxWidth: "80%",
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.text}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#999",
                        marginTop: "4px",
                      }}
                    >
                      {msg.senderId !== userId && `${msg.sender}, `}
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div>
              <Input.Group compact>
                <Input
                  style={{ width: "calc(100% - 40px)" }}
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onPressEnter={sendMessage}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={sendMessage}
                />
              </Input.Group>
            </div>
          </Card>
        </TabPane>

        {/* Notes Tab */}
        <TabPane tab="Notes" key="notes">
          <Card
            style={{
              height: "calc(100vh - 280px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                marginBottom: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Space>
                <Button
                  type={timerActive ? "default" : "primary"}
                  icon={
                    timerActive ? (
                      <PauseCircleOutlined />
                    ) : (
                      <PlayCircleOutlined />
                    )
                  }
                  onClick={toggleTimer}
                >
                  {timerActive ? "Pause Timer" : "Start Timer"}
                </Button>
                <Button icon={<RedoOutlined />} onClick={resetTimer} danger>
                  Reset
                </Button>
                <Text>
                  <ClockCircleOutlined /> Study Time: {formatTime(studyTime)}
                </Text>
              </Space>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={downloadNotes}
                disabled={!studyNotes.trim()}
              >
                Download Notes
              </Button>
            </div>
            <TextArea
              style={{ flex: 1, resize: "none" }}
              placeholder="Take notes during your study session here..."
              value={studyNotes}
              onChange={handleNotesChange}
              onBlur={saveTimerState}
            />
          </Card>
        </TabPane>

        {/* Info Tab */}
        <TabPane tab="Info" key="info">
          <Card>
            <Title level={4}>{sessionDetails?.title || "Study Session"}</Title>

            <Paragraph>
              {sessionDetails?.description || "No description available."}
            </Paragraph>

            <Divider />

            <div>
              <Title level={5}>Session Details</Title>
              <p>
                <strong>Subject:</strong>{" "}
                {sessionDetails?.subject || "Not specified"}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {sessionDetails?.createdAt
                  ? new Date(sessionDetails.createdAt).toLocaleString()
                  : "Unknown"}
              </p>
              <p>
                <strong>Session ID:</strong> {sessionId}
              </p>
              <p>
                <strong>Session Type:</strong>{" "}
                {isIndividualSession || sessionId.includes("individual")
                  ? "Individual"
                  : "Group"}
              </p>
              <p>
                <strong>Video Platform:</strong> Jitsi Meet
              </p>
              <p>
                <strong>Mode:</strong>{" "}
                {sessionDetails?.isOfflineMode
                  ? "Offline (Limited Connectivity)"
                  : "Online"}
              </p>
            </div>

            {sessionDetails?.participants &&
              sessionDetails.participants.length > 0 && (
                <>
                  <Divider />
                  <div>
                    <Title level={5}>Participants</Title>
                    <ul>
                      {sessionDetails.participants.map((participant) => (
                        <li key={participant._id}>
                          {participant.name || "Unknown User"}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
          </Card>
        </TabPane>
      </Tabs>

      {/* Nickname Modal */}
      <Modal
        title="Change Display Name"
        open={nicknameModalVisible}
        onCancel={() => setNicknameModalVisible(false)}
        footer={null}
      >
        <Input
          placeholder="Enter your display name"
          defaultValue={displayName}
          onPressEnter={(e) => handleSaveNickname(e.target.value)}
        />
        <div style={{ marginTop: "16px", textAlign: "right" }}>
          <Button
            onClick={() => setNicknameModalVisible(false)}
            style={{ marginRight: "8px" }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={(e) => handleSaveNickname(e.target.value)}
          >
            Save
          </Button>
        </div>
      </Modal>

      {/* Leave Session Confirmation Modal */}
      <Modal
        title="Leave Study Session"
        open={leaveSessionModalVisible}
        onCancel={cancelLeaveSession}
        footer={null}
        centered
      >
        <div style={{ marginBottom: "16px" }}>
          <ExclamationCircleOutlined
            style={{ fontSize: "24px", color: "#faad14", marginRight: "8px" }}
          />
          <span>Are you sure you want to leave this study session?</span>
        </div>

        {studyNotes.trim() && (
          <div style={{ marginBottom: "16px" }}>
            <p>
              You have notes that haven't been downloaded. Would you like to
              download them?
            </p>
          </div>
        )}

        <div style={{ textAlign: "right" }}>
          <Button onClick={cancelLeaveSession} style={{ marginRight: "8px" }}>
            Cancel
          </Button>

          <Button
            danger
            onClick={() => performLeaveSession(false)}
            style={{ marginRight: "8px" }}
          >
            Leave Without Saving
          </Button>

          {studyNotes.trim() && (
            <Button type="primary" onClick={() => performLeaveSession(true)}>
              Download Notes & Leave
            </Button>
          )}

          {!studyNotes.trim() && (
            <Button type="primary" onClick={() => performLeaveSession(false)}>
              Leave Session
            </Button>
          )}
        </div>
      </Modal>
    </Content>
  );
};

export default StudyRoom;
