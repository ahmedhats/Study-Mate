import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Button,
  Space,
  notification,
  Alert,
  Spin,
  Typography,
} from "antd";
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const JitsiVideoRoom = ({ sessionId, userName, onError }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  // Generate a clean room name from sessionId
  const getRoomName = (sessionId) => {
    if (!sessionId) return "study-mate-default";

    // Clean the session ID to make it Jitsi-compatible
    // Jitsi room names should be URL-safe
    const cleanId = sessionId
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    return `study-mate-${cleanId}`;
  };

  // Generate display name for the user
  const getDisplayName = (userName) => {
    // Try to get the user's actual name from localStorage first
    let actualUserName = userName;

    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const storedName =
        userData.name || userData.username || userData.user?.name;
      if (storedName) {
        actualUserName = storedName;
      }
    } catch (e) {
      console.log(
        "Could not get user name from localStorage, using provided name"
      );
    }

    // If still no name, use default
    if (!actualUserName) actualUserName = "StudyMateUser";

    // Clean the name to be URL-safe but preserve readability
    return actualUserName
      .trim()
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, " ");
  };

  const roomName = getRoomName(sessionId);
  const displayName = getDisplayName(userName);

  // Build a simple, working Jitsi Meet URL
  const jitsiUrl = `https://meet.jit.si/${roomName}`;

  console.log("Jitsi URL:", jitsiUrl);
  console.log("Room Name:", roomName);
  console.log("Display Name:", displayName);

  useEffect(() => {
    // Set a shorter loading time
    const loadingTimer = setTimeout(() => {
      setLoading(false);
      setConnectionStatus("connected");
    }, 3000);

    // Listen for iframe load events
    const iframe = iframeRef.current;
    if (iframe) {
      const handleLoad = () => {
        console.log("Jitsi iframe loaded successfully");
        setLoading(false);
        setConnectionStatus("connected");
        setError(null);
      };

      const handleError = (e) => {
        console.error("Jitsi iframe error:", e);
        setError(
          "Failed to load video conference. Please check your internet connection."
        );
        setLoading(false);
        setConnectionStatus("error");
        if (onError) {
          onError(new Error("Jitsi iframe failed to load"));
        }
      };

      iframe.addEventListener("load", handleLoad);
      iframe.addEventListener("error", handleError);

      return () => {
        iframe.removeEventListener("load", handleLoad);
        iframe.removeEventListener("error", handleError);
        clearTimeout(loadingTimer);
      };
    }

    return () => {
      clearTimeout(loadingTimer);
    };
  }, [jitsiUrl, roomName, displayName, onError]);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      // Enter fullscreen
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.mozRequestFullScreen) {
        containerRef.current.mozRequestFullScreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!(
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement
        )
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, []);

  // Reload the video conference
  const reloadConference = () => {
    setLoading(true);
    setError(null);
    setConnectionStatus("connecting");

    if (iframeRef.current) {
      // Force reload by changing the src
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = "about:blank";
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 100);
    }

    notification.info({
      message: "Reloading Video Conference",
      description: "Reconnecting to the video conference...",
      duration: 2,
    });
  };

  if (error) {
    return (
      <Card>
        <Alert
          type="error"
          message="Video Conference Error"
          description={error}
          showIcon
          action={
            <Space>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={reloadConference}
              >
                Retry
              </Button>
            </Space>
          }
        />
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <Text>Video Conference</Text>
          {connectionStatus === "connected" && (
            <CheckCircleOutlined style={{ color: "#52c41a" }} />
          )}
          {connectionStatus === "connecting" && <Spin size="small" />}
        </Space>
      }
      extra={
        <Space>
          <Button
            icon={<InfoCircleOutlined />}
            onClick={() => {
              notification.info({
                message: "Jitsi Meet",
                description: `Room: ${roomName}\nUser: ${displayName}\nPowered by Jitsi Meet`,
                duration: 5,
              });
            }}
          >
            Info
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={reloadConference}
            title="Reload video conference"
          >
            Reload
          </Button>
          <Button
            icon={
              isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />
            }
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>
        </Space>
      }
    >
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          height: isFullscreen ? "100vh" : "600px",
          background: "#000",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {loading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
              color: "white",
              flexDirection: "column",
            }}
          >
            <Spin size="large" />
            <div style={{ marginTop: "16px", fontSize: "16px" }}>
              Loading video conference...
            </div>
            <div style={{ marginTop: "8px", fontSize: "14px", opacity: 0.8 }}>
              Connecting to Jitsi Meet...
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={jitsiUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          style={{
            border: "none",
            borderRadius: "8px",
          }}
          title={`Study Session - ${roomName}`}
        />
      </div>

      {connectionStatus === "connected" && (
        <div style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
          <InfoCircleOutlined style={{ marginRight: "4px" }} />
          Connected to room: <strong>{roomName}</strong> as{" "}
          <strong>{displayName}</strong>
        </div>
      )}
    </Card>
  );
};

export default JitsiVideoRoom;
