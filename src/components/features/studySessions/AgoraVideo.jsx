import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  Button,
  Space,
  Avatar,
  Badge,
  notification,
  Alert,
  Spin,
} from "antd";
import {
  AudioOutlined,
  AudioMutedOutlined,
  VideoCameraOutlined,
  UserOutlined,
  ReloadOutlined,
  VideoCameraAddOutlined,
} from "@ant-design/icons";
import agoraService from "../../../services/agora/agoraService";
import deviceManager from "../../../services/agora/deviceManager";

// Local Video Component
export const LocalVideo = ({ userName, showControls = true }) => {
  const localVideoRef = useRef(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.id = "local-video";
    }
  }, []);

  const toggleVideo = () => {
    try {
      const isVideoOff = agoraService.toggleVideo();
      setVideoEnabled(!isVideoOff);
    } catch (error) {
      console.error("Error toggling video:", error);
      notification.error({
        message: "Video Error",
        description:
          "Couldn't toggle video. Please check your camera permissions.",
      });
    }
  };

  const toggleAudio = () => {
    try {
      const isAudioMuted = agoraService.toggleAudio();
      setAudioEnabled(!isAudioMuted);
    } catch (error) {
      console.error("Error toggling audio:", error);
      notification.error({
        message: "Audio Error",
        description:
          "Couldn't toggle audio. Please check your microphone permissions.",
      });
    }
  };

  const refreshDevices = async () => {
    setIsLoading(true);
    try {
      // Get current tracks to reestablish
      const client = agoraService.getClient();
      if (client) {
        // We'll try to recreate the tracks with the same settings
        await agoraService.leave();

        // Small delay to ensure everything is cleaned up
        setTimeout(() => {
          // Rejoin with the same session ID
          agoraService
            .join(
              sessionStorage.getItem("currentSessionId") || "default-session"
            )
            .then(() => {
              setVideoEnabled(true);
              setAudioEnabled(true);
              notification.success({
                message: "Devices Refreshed",
                description:
                  "Your audio and video devices have been refreshed.",
              });
            })
            .catch((error) => {
              console.error("Error rejoining after refresh:", error);
              notification.error({
                message: "Refresh Failed",
                description: "Couldn't refresh your devices. Please try again.",
              });
            })
            .finally(() => {
              setIsLoading(false);
            });
        }, 500);
      }
    } catch (error) {
      console.error("Error refreshing devices:", error);
      notification.error({
        message: "Refresh Error",
        description:
          "Couldn't refresh your devices. Please try rejoining the session.",
      });
      setIsLoading(false);
    }
  };

  return (
    <Card
      className="video-card"
      title={
        <Badge
          status={videoEnabled ? "success" : "error"}
          text={`${userName} (You)`}
        />
      }
      extra={
        showControls && (
          <Space>
            <Button
              type={audioEnabled ? "primary" : "default"}
              icon={audioEnabled ? <AudioOutlined /> : <AudioMutedOutlined />}
              onClick={toggleAudio}
              danger={!audioEnabled}
              size="small"
              disabled={isLoading}
            />
            <Button
              type={videoEnabled ? "primary" : "default"}
              icon={<VideoCameraOutlined />}
              onClick={toggleVideo}
              danger={!videoEnabled}
              size="small"
              disabled={isLoading}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={refreshDevices}
              size="small"
              title="Refresh video/audio devices"
              disabled={isLoading}
            />
          </Space>
        )
      }
    >
      <div
        style={{
          position: "relative",
          minHeight: "240px",
          background: "#f0f0f0",
          borderRadius: "8px",
        }}
      >
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.2)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 5,
              borderRadius: "8px",
            }}
          >
            <Spin size="large" />
          </div>
        )}
        <div
          ref={localVideoRef}
          style={{ width: "100%", height: "100%", minHeight: "240px" }}
        />
        {!videoEnabled && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <Avatar size={64} icon={<UserOutlined />} />
            <div style={{ marginTop: "10px" }}>{userName}</div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Remote Video Component
export const RemoteVideo = ({ user, userName }) => {
  const remoteVideoRef = useRef(null);
  const [hasVideo, setHasVideo] = useState(!!user.videoTrack);
  const [hasAudio, setHasAudio] = useState(!!user.audioTrack);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.id = `remote-video-${user.uid}`;

      if (user.videoTrack) {
        try {
          user.videoTrack.play(`remote-video-${user.uid}`);
          setHasVideo(true);
        } catch (error) {
          console.error("Error playing remote video:", error);
          setHasVideo(false);
        }
      } else {
        setHasVideo(false);
      }

      setHasAudio(!!user.audioTrack);
    }

    return () => {
      if (user && user.videoTrack) {
        try {
          user.videoTrack.stop();
        } catch (error) {
          console.error("Error stopping remote video:", error);
        }
      }
    };
  }, [user]);

  return (
    <Card
      className="video-card"
      title={
        <Badge status="processing" text={userName || `User ${user.uid}`} />
      }
      extra={
        <Space>
          {hasAudio ? (
            <Badge status="success" text="Audio" />
          ) : (
            <Badge status="error" text="No Audio" />
          )}
        </Space>
      }
    >
      <div
        style={{
          position: "relative",
          minHeight: "240px",
          background: "#f0f0f0",
          borderRadius: "8px",
        }}
      >
        <div
          ref={remoteVideoRef}
          style={{ width: "100%", height: "100%", minHeight: "240px" }}
        />
        {!hasVideo && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <Avatar size={64} icon={<UserOutlined />} />
            <div style={{ marginTop: "10px" }}>Video disabled</div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Main Agora Room Component
const AgoraVideoRoom = ({ sessionId, userName, onError }) => {
  const [remoteUsers, setRemoteUsers] = useState({});
  const [joined, setJoined] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [connectionErrors, setConnectionErrors] = useState(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [usingMockMode, setUsingMockMode] = useState(false);
  const maxRetries = 3;

  useEffect(() => {
    // Save session ID for device refresh
    sessionStorage.setItem("currentSessionId", sessionId);

    // Initialize Agora
    initAgora();

    // Cleanup
    return () => {
      if (joined) {
        agoraService.leave().catch(console.error);
      }
      // Clear session ID
      sessionStorage.removeItem("currentSessionId");
    };
  }, [sessionId]);

  const initAgora = async () => {
    try {
      setConnecting(true);
      setConnectionErrors(null);

      // Sanitize channel name properly to avoid errors
      // This is critical for Agora channel name requirements
      const channelId = agoraService.getChannelName(sessionId);
      console.log("Using Agora channel name:", channelId);

      // Join the channel with the processed ID
      // If we have a temporary token, it will be used automatically in agoraService
      const result = await agoraService.join(channelId);

      // Check if we got a mock mode result
      if (result && result.isMockMode) {
        console.log("Using mock mode for the session", result.mockSessionId);
        setUsingMockMode(true);
        setJoined(true);
        setConnecting(false);
        setConnectionAttempts(0);

        notification.info({
          message: "Using Local Mode",
          description:
            "Connected in local mode due to authentication issues. Video/audio will work but is not connected to Agora servers.",
          duration: 5,
        });

        // If there's an error message, show it
        if (result.error) {
          setConnectionErrors(`Note: ${result.error}`);
        }

        return;
      }

      setUsingMockMode(false);
      setJoined(true);
      setConnecting(false);
      setConnectionAttempts(0);

      // Watch for user changes and connection state
      const client = agoraService.getClient();

      const updateRemoteUsers = () => {
        setRemoteUsers({ ...agoraService.getRemoteUsers() });
      };

      client.on("user-published", updateRemoteUsers);
      client.on("user-unpublished", updateRemoteUsers);
      client.on("user-left", updateRemoteUsers);
      client.on("connection-state-change", (state) => {
        console.log("Agora connection state:", state);
        if (state === "DISCONNECTED") {
          setConnectionErrors("You were disconnected from the video call.");
          setJoined(false);
        } else if (state === "CONNECTED") {
          setConnectionErrors(null);
          setJoined(true);
        }
      });

      // Handle token-related errors
      client.on("token-privilege-did-expire", async () => {
        setConnectionErrors(
          "Your session has expired. Attempting to reconnect..."
        );
        retryConnection();
      });

      client.on("token-privilege-will-expire", async () => {
        console.log("Agora token will expire soon");
        // In a production app, this is where you would refresh the token
      });

      notification.success({
        message: "Connected to Video",
        description: "Successfully connected to the video call.",
        duration: 3,
      });
    } catch (error) {
      console.error("Failed to initialize Agora:", error);
      setConnecting(false);

      // Handle specific errors more gracefully
      let errorMessage =
        "Could not connect to video. Please check your camera and microphone settings.";

      if (error.message && error.message.includes("dynamic use static key")) {
        console.error(
          "Agora authentication error: Dynamic key required. Switching to mock mode."
        );
        // This error means our Agora project requires token authentication
        // For development, we'll use a mock session instead
        setConnectionErrors(
          "Authentication issue with video service. Using local mock mode."
        );
        setUsingMockMode(true);
        setJoined(true);

        // Create a mock session ID to use for local-only testing
        const mockSessionId = `mock-${Date.now()}`;
        sessionStorage.setItem("usingMockMode", "true");
        sessionStorage.setItem("mockSessionId", mockSessionId);

        // Notify the parent component about the fallback
        if (onError) onError(new Error("MOCK_MODE_ACTIVATED"));
        return;
      } else if (error.message && error.message.includes("invalid token")) {
        errorMessage =
          "Authentication failed: Invalid token. Please refresh the page and try again.";
      } else if (error.message && error.message.includes("permission")) {
        errorMessage =
          "Camera or microphone permission denied. Please allow access to your devices.";
      }

      setConnectionErrors(errorMessage);

      notification.error({
        message: "Video Connection Failed",
        description: errorMessage,
        duration: 5,
      });

      if (onError) onError(error);
    }
  };

  const retryConnection = async () => {
    if (connectionAttempts >= maxRetries) {
      setConnectionErrors(
        `Failed to connect after ${maxRetries} attempts. Please try again later or check your internet connection.`
      );
      return;
    }

    setConnectionAttempts((prev) => prev + 1);
    setConnectionErrors(
      `Attempting to reconnect... (Try ${connectionAttempts + 1}/${maxRetries})`
    );

    try {
      // Leave the channel first if needed
      if (agoraService.getClient().connectionState !== "DISCONNECTED") {
        await agoraService.leave();
      }

      // Wait a moment before reconnecting - increase delay with each attempt
      await new Promise((resolve) =>
        setTimeout(resolve, 500 + connectionAttempts * 500)
      );

      // Try joining again
      await initAgora();

      notification.success({
        message: "Reconnected",
        description: "Successfully reconnected to video call.",
        duration: 3,
      });
    } catch (error) {
      console.error("Failed to reconnect:", error);

      if (connectionAttempts < maxRetries) {
        // Auto-retry with exponential backoff
        setTimeout(
          () => retryConnection(),
          2000 * Math.pow(2, connectionAttempts)
        );
      } else {
        setConnectionErrors(
          "Maximum connection attempts reached. Please try again later."
        );

        notification.error({
          message: "Reconnection Failed",
          description:
            "Could not reconnect to the video call. Please try again later.",
          duration: 5,
        });
      }
    }
  };

  if (connecting) {
    return (
      <Card style={{ textAlign: "center", padding: "20px" }}>
        <Space direction="vertical">
          <Avatar
            size={64}
            icon={<VideoCameraOutlined />}
            style={{ backgroundColor: "#1890ff" }}
          />
          <div>
            <h3>Connecting to video...</h3>
            <p>Please wait while we establish your connection.</p>
          </div>
          <Spin />
        </Space>
      </Card>
    );
  }

  return (
    <div className="agora-video-container">
      {connectionErrors && (
        <Alert
          type="warning"
          message="Connection Issue"
          description={connectionErrors}
          showIcon
          action={
            <Button
              size="small"
              type="primary"
              onClick={retryConnection}
              disabled={connectionAttempts >= maxRetries}
            >
              Try Again
            </Button>
          }
          style={{ marginBottom: "16px" }}
        />
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "16px",
        }}
      >
        {joined ? (
          <LocalVideo userName={userName} />
        ) : (
          <Card
            className="video-card"
            title={
              <Badge status="error" text={`${userName} (You - Disconnected)`} />
            }
          >
            <div
              style={{
                position: "relative",
                minHeight: "240px",
                background: "#f0f0f0",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Avatar size={64} icon={<UserOutlined />} />
              <div style={{ marginTop: "16px" }}>
                Video unavailable
                <Button
                  type="primary"
                  size="small"
                  onClick={retryConnection}
                  style={{ marginLeft: "8px" }}
                  disabled={connectionAttempts >= maxRetries}
                >
                  Retry
                </Button>
              </div>
            </div>
          </Card>
        )}

        {Object.values(remoteUsers).map((user) => (
          <RemoteVideo
            key={user.uid}
            user={user}
            userName={`Participant ${user.uid}`}
          />
        ))}

        {Object.keys(remoteUsers).length === 0 && joined && (
          <Card style={{ textAlign: "center", padding: "20px" }}>
            <Space direction="vertical">
              <Avatar
                size={64}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#f56a00" }}
              />
              <div>
                <h3>Waiting for others to join</h3>
                <p>Share your session ID with others to invite them.</p>
              </div>
            </Space>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AgoraVideoRoom;
