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
  Typography,
  Modal,
} from "antd";
import {
  AudioOutlined,
  AudioMutedOutlined,
  VideoCameraOutlined,
  UserOutlined,
  ReloadOutlined,
  VideoCameraAddOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import agoraService from "../../../services/agora/agoraService";
import deviceManager from "../../../services/agora/deviceManager";
import agoraTokenDebugger from "../../../utils/agoraTokenDebugger";
import agoraConfig from "../../../config/agoraConfig";

const { Text, Paragraph } = Typography;

// Local Video Component
export const LocalVideo = ({ userName, showControls = true }) => {
  const localVideoRef = useRef(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Start camera directly
    startCamera();

    return () => {
      // Clean up on unmount
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Requesting camera access directly...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      console.log("Camera access granted, setting up video element");
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        console.log("Video stream successfully attached to element");
      } else {
        console.error("No video element reference available");
        setError("Video element not found");
      }

      setVideoEnabled(true);
      setAudioEnabled(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(`Camera access error: ${err.message || "Unknown error"}`);
      setVideoEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      setStream(null);
      console.log("Camera stopped");
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        const enabled = !videoTracks[0].enabled;
        videoTracks[0].enabled = enabled;
        setVideoEnabled(enabled);

        // Also inform Agora service if available
        try {
          agoraService.toggleVideo();
        } catch (error) {
          console.warn("Could not sync video state with Agora:", error);
        }
      }
    } else {
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
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        const enabled = !audioTracks[0].enabled;
        audioTracks[0].enabled = enabled;
        setAudioEnabled(enabled);

        // Also inform Agora service if available
        try {
          agoraService.toggleAudio();
        } catch (error) {
          console.warn("Could not sync audio state with Agora:", error);
        }
      }
    } else {
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
    }
  };

  const refreshDevices = async () => {
    setIsLoading(true);

    // Stop existing streams
    stopCamera();

    // Short delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Restart camera
    await startCamera();

    // Try to reconnect to Agora if needed
    try {
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
          width: "100%",
          paddingBottom: "100%" /* Creates a square aspect ratio */,
          background: "#f0f0f0",
          borderRadius: "8px",
          overflow: "hidden",
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

        {error && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(255,0,0,0.05)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 4,
              borderRadius: "8px",
              padding: "20px",
            }}
          >
            <Alert
              type="error"
              message="Camera Error"
              description={error}
              style={{ width: "100%" }}
            />
          </div>
        )}

        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: videoEnabled && !error ? "block" : "none",
          }}
        />

        {(!videoEnabled || error) && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              zIndex: 3,
            }}
          >
            <Avatar size={84} icon={<UserOutlined />} />
            <div style={{ marginTop: "10px", fontSize: "16px" }}>
              {userName}
            </div>
            {!videoEnabled && !error && <div>Camera off</div>}
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
  const [displayName, setDisplayName] = useState(
    userName || `User ${user.uid.toString().substring(0, 5)}`
  );

  useEffect(() => {
    // Update display name when userName prop changes
    if (userName) {
      setDisplayName(userName);
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.id = `remote-video-${user.uid}`;

      if (user.videoTrack) {
        try {
          user.videoTrack.play(`remote-video-${user.uid}`);
          setHasVideo(true);
        } catch (error) {
          console.error("Error playing remote video:", error);
          setHasVideo(false);

          // Try alternative playback method
          try {
            const videoElement = document.createElement("video");
            videoElement.style.width = "100%";
            videoElement.style.height = "100%";
            videoElement.style.objectFit = "cover";
            videoElement.autoplay = true;
            videoElement.playsInline = true;

            if (remoteVideoRef.current) {
              remoteVideoRef.current.innerHTML = "";
              remoteVideoRef.current.appendChild(videoElement);

              if (user.videoTrack._mediaStreamTrack) {
                videoElement.srcObject = new MediaStream([
                  user.videoTrack._mediaStreamTrack,
                ]);
                videoElement.play().catch(console.error);
                setHasVideo(true);
              }
            }
          } catch (fallbackError) {
            console.error("Fallback playback failed:", fallbackError);
          }
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
  }, [user, userName]);

  return (
    <Card
      className="video-card"
      style={{ marginBottom: "20px" }}
      title={<Badge status="processing" text={displayName} />}
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
          width: "100%",
          paddingBottom: "100%" /* Creates a square aspect ratio */,
          background: "#f0f0f0",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <div
          ref={remoteVideoRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        {!hasVideo && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              zIndex: 5,
            }}
          >
            <Avatar size={84} icon={<UserOutlined />} />
            <div style={{ marginTop: "10px", fontSize: "16px" }}>
              {displayName}
            </div>
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
  const [connecting, setConnecting] = useState(false);
  const [connectionErrors, setConnectionErrors] = useState(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [usingMockMode, setUsingMockMode] = useState(false);
  const [tokenDebugVisible, setTokenDebugVisible] = useState(false);
  const [tokenValidation, setTokenValidation] = useState(null);
  const [configValidation, setConfigValidation] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [participantNames, setParticipantNames] = useState({});
  const maxRetries = 3;
  const localVideoRef = useRef(null);

  // Function to update a participant's display name
  const updateParticipantName = (uid, name) => {
    setParticipantNames((prev) => ({
      ...prev,
      [uid]: name,
    }));
  };

  // Run agora initialization after local-video is ready
  useEffect(() => {
    // Run config validation on mount
    const configCheck = agoraTokenDebugger.validateConfiguration();
    setConfigValidation(configCheck);

    // Validate the token format
    const tokenCheck = agoraTokenDebugger.analyzeToken(
      agoraConfig.temporaryToken
    );
    setTokenValidation(tokenCheck);

    // Save session ID for device refresh
    sessionStorage.setItem("currentSessionId", sessionId);

    // Add the local user to participant names
    updateParticipantName("local", userName);

    // Short delay to ensure DOM is ready
    const initTimer = setTimeout(() => {
      // Ensure we're not already connecting
      if (!isConnecting) {
        // Double-check local-video exists before proceeding
        const localVideoElement = document.getElementById("local-video");
        if (!localVideoElement) {
          console.warn(
            "local-video element still not available before init, creating it again"
          );

          // Create it if not found
          const videoContainer = document.createElement("div");
          videoContainer.id = "local-video";
          videoContainer.style.width = "100%";
          videoContainer.style.height = "100%";
          videoContainer.style.minHeight = "240px";

          // Try to add it to our ref first
          if (localVideoRef.current) {
            localVideoRef.current.innerHTML = "";
            localVideoRef.current.appendChild(videoContainer);
          } else {
            // Add it to the body as a fallback
            document.body.appendChild(videoContainer);
          }
        }

        // Initialize Agora
        initAgora();
      }
    }, 500);

    // Cleanup
    return () => {
      clearTimeout(initTimer);
      if (joined) {
        agoraService.leave().catch(console.error);
      }
      // Clear session ID
      sessionStorage.removeItem("currentSessionId");
    };
  }, [sessionId, userName]); // Add userName dependency to refresh when name changes

  // Add event listener for metadata updates
  useEffect(() => {
    // Function to handle metadata updates
    const handleMetadataUpdate = (event) => {
      const { uid, metadata } = event.detail;
      console.log("Received metadata update for user:", uid, metadata);

      if (metadata && metadata.userName) {
        // Update user name in our participants list
        updateParticipantName(uid, metadata.userName);
      }
    };

    // Listen for custom metadata events
    window.addEventListener("agora-metadata-ready", handleMetadataUpdate);
    window.addEventListener("agora-metadata-update", handleMetadataUpdate);

    // Clean up
    return () => {
      window.removeEventListener("agora-metadata-ready", handleMetadataUpdate);
      window.removeEventListener("agora-metadata-update", handleMetadataUpdate);
    };
  }, []);

  const initAgora = async () => {
    // Prevent multiple simultaneous connection attempts
    if (isConnecting) {
      console.log("Connection already in progress, skipping duplicate attempt");
      return;
    }

    try {
      setIsConnecting(true);
      setConnecting(true);
      setConnectionErrors(null);

      // Log for debugging
      console.log("Starting Agora initialization...");

      // Ensure local-video element is properly set up
      const localVideoElement = document.getElementById("local-video");
      const directVideoElement = document.getElementById("direct-local-video");

      console.log("Local video elements check:", {
        localVideoElement: !!localVideoElement,
        directVideoElement: !!directVideoElement,
      });

      // Sanitize channel name properly to avoid errors
      // This is critical for Agora channel name requirements
      const channelId = agoraService.getChannelName(sessionId);
      console.log("Using Agora channel name:", channelId);

      // Log whether we're using the default channel name that matches our token
      const usingDefaultChannel = channelId === agoraConfig.defaultChannelName;
      console.log(
        `Using default channel that matches token: ${
          usingDefaultChannel ? "Yes" : "No"
        }`
      );

      if (!usingDefaultChannel && agoraConfig.useTokenAuth) {
        console.warn(
          "WARNING: You are trying to join a channel that doesn't match your token's channel"
        );
      }

      // Join the channel with the processed ID
      // If we have a temporary token, it will be used automatically in agoraService
      console.log("Joining Agora channel with ID:", channelId);

      // Add user metadata for name
      const userMetadata = {
        userName: userName,
      };

      // Join with metadata
      const result = await agoraService.join(
        channelId,
        null,
        null,
        userMetadata
      );
      console.log("Join result:", result);

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

        setIsConnecting(false);
        return;
      }

      // We've joined successfully
      console.log("Joined Agora successfully, setting up video");
      setUsingMockMode(false);
      setJoined(true);
      setConnecting(false);
      setConnectionAttempts(0);

      // Attempt to play local video directly on our direct-local-video element
      const localVideoTrack = agoraService.getLocalVideoTrack();
      if (localVideoTrack && directVideoElement) {
        console.log(
          "Trying to directly play local video to direct-local-video element"
        );
        try {
          // Attempt to manually set up the stream
          if (localVideoTrack._mediaStreamTrack) {
            directVideoElement.srcObject = new MediaStream([
              localVideoTrack._mediaStreamTrack,
            ]);
            await directVideoElement.play();
            console.log(
              "Successfully playing video on direct-local-video element"
            );
            setVideoEnabled(true);
          }
        } catch (directPlayError) {
          console.warn(
            "Direct video element play failed, falling back to Agora play:",
            directPlayError
          );
          // Use regular playback method as fallback
          await agoraService.playLocalVideoTrack();
        }
      } else {
        console.log("Using Agora play method for local video");
        // Use regular Agora play method
        await agoraService.playLocalVideoTrack();
      }

      // Set initial state of audio/video
      const localAudioTrack = agoraService.getLocalAudioTrack();

      if (localAudioTrack) {
        setAudioEnabled(localAudioTrack.enabled);
      }

      if (localVideoTrack) {
        setVideoEnabled(localVideoTrack.enabled);

        // Set up listener for video state changes
        localVideoTrack.on &&
          localVideoTrack.on("track-ended", () => {
            setVideoEnabled(false);
            notification.warn({
              message: "Video Ended",
              description: "Your camera has been disconnected or stopped.",
            });
          });
      }

      // Watch for user changes and connection state
      const client = agoraService.getClient();

      // Handle remote user updates and track their metadata/names
      const updateRemoteUsers = async (user, mediaType) => {
        // Get the updated list of remote users
        const updatedRemoteUsers = { ...agoraService.getRemoteUsers() };
        setRemoteUsers(updatedRemoteUsers);

        // Try to get username for this user
        try {
          // If this is a new user joining, use a default name
          if (!participantNames[user.uid]) {
            let displayName = `User ${user.uid.toString().substring(0, 5)}`;

            // Check if we have metadata for this user in the agora service
            if (
              agoraService.remoteUserMetadata &&
              agoraService.remoteUserMetadata[user.uid]
            ) {
              const userData = agoraService.remoteUserMetadata[user.uid];
              if (userData.userName) {
                displayName = userData.userName;
              }
            }

            // Update participant names
            updateParticipantName(user.uid, displayName);
            console.log(`User ${user.uid} joined with name: ${displayName}`);
          }
        } catch (err) {
          console.warn("Could not get user attributes:", err);
          // Use a default name if we can't get the actual name
          if (!participantNames[user.uid]) {
            updateParticipantName(
              user.uid,
              `User ${user.uid.toString().substring(0, 5)}`
            );
          }
        }
      };

      // Set up event handlers for user state changes
      client.on("user-published", updateRemoteUsers);
      client.on("user-unpublished", updateRemoteUsers);

      client.on("user-joined", (user) => {
        console.log("User joined:", user);
        updateRemoteUsers(user);
      });

      client.on("user-left", (user) => {
        console.log("User left:", user.uid);
        // Remove the user from our participants list
        setParticipantNames((prev) => {
          const updated = { ...prev };
          delete updated[user.uid];
          return updated;
        });
        updateRemoteUsers(user);
      });

      client.on("connection-state-change", (state) => {
        console.log("Agora connection state:", state);
        if (state === "DISCONNECTED") {
          setConnectionErrors("You were disconnected from the video call.");
          setJoined(false);
          setIsConnecting(false);
        } else if (state === "CONNECTED") {
          setConnectionErrors(null);
          setJoined(true);
          setIsConnecting(false);
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

      setIsConnecting(false);
    } catch (error) {
      console.error("Failed to initialize Agora:", error);
      setConnecting(false);
      setIsConnecting(false);

      // Handle specific errors more gracefully
      let errorMessage =
        "Could not connect to video. Please check your camera and microphone settings.";

      if (error.message && error.message.includes("Cannot set property uid")) {
        console.log(
          "Encountered uid setter error, trying to reconnect with a different approach"
        );
        // This is a known issue with the client uid property
        errorMessage = "Connection issue detected. Attempting to reconnect...";

        // Add a delay and retry with a different approach
        setTimeout(() => {
          retryConnection();
        }, 1000);
      } else if (
        error.message &&
        error.message.includes("dynamic use static key")
      ) {
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
      } else if (error.message && error.message.includes("INVALID_OPERATION")) {
        // Handle the case where a connection is already in progress
        errorMessage = (
          <>
            <div>Operation Error: Connection already in progress</div>
            <div style={{ marginTop: "8px" }}>
              <small>
                The application is trying to connect while another connection is
                already in progress.
                <ul>
                  <li>This is usually a temporary issue</li>
                  <li>Try refreshing the page and trying again</li>
                </ul>
              </small>
            </div>
          </>
        );
      } else if (error.message && error.message.includes("OPERATION_ABORTED")) {
        // Handle the specific abort operation error that occurs due to network issues
        errorMessage = (
          <>
            <div>Connection Error: Operation Aborted</div>
            <div style={{ marginTop: "8px" }}>
              <small>
                This usually happens when:
                <ul>
                  <li>There are network connectivity issues</li>
                  <li>A firewall is blocking the connection</li>
                  <li>You have a slow or unstable internet connection</li>
                </ul>
                <div style={{ marginTop: "10px" }}>
                  <strong>Troubleshooting steps:</strong>
                  <ol>
                    <li>Check your internet connection</li>
                    <li>
                      Try using a different network (e.g., mobile hotspot)
                    </li>
                    <li>Disable VPN if you're using one</li>
                    <li>Clear browser cookies and cache</li>
                  </ol>
                </div>
                <Button
                  type="link"
                  size="small"
                  onClick={() => setTokenDebugVisible(true)}
                  icon={<InfoCircleOutlined />}
                >
                  Debug Connection Issues
                </Button>
              </small>
            </div>
          </>
        );

        // After showing the error, try to use mock mode
        setTimeout(() => {
          console.log("Switching to local mock mode due to connection issues");
          setUsingMockMode(true);
          setJoined(true);
        }, 2000);
      } else if (error.message && error.message.includes("invalid token")) {
        errorMessage = (
          <>
            <div>Authentication failed: Invalid token</div>
            <div style={{ marginTop: "8px" }}>
              <small>
                This usually happens when:
                <ul>
                  <li>The token has expired (tokens last ~24 hours)</li>
                  <li>The token was generated for a different channel name</li>
                  <li>The App ID and token don't match</li>
                </ul>
                <Button
                  type="link"
                  size="small"
                  onClick={() => setTokenDebugVisible(true)}
                  icon={<InfoCircleOutlined />}
                >
                  Debug Token Issues
                </Button>
              </small>
            </div>
          </>
        );
      } else if (error.message && error.message.includes("permission")) {
        errorMessage =
          "Camera or microphone permission denied. Please allow access to your devices.";
      }

      setConnectionErrors(errorMessage);

      notification.error({
        message: "Video Connection Failed",
        description:
          typeof errorMessage === "string"
            ? errorMessage
            : "Connection failed. Please check your network and try again.",
        duration: 5,
      });

      if (onError) onError(error);
    }
  };

  const retryConnection = async () => {
    if (connectionAttempts >= maxRetries || isConnecting) {
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
      setIsConnecting(true);
      // Make sure we fully leave the existing session
      await agoraService.leave();
      // Reset any internal state that might be causing issues
      agoraService.resetState();
      // Add a small delay before reconnecting
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Try again
      initAgora();
    } catch (error) {
      console.error("Error during reconnection attempt:", error);
      setConnectionErrors("Failed to reconnect. Please refresh the page.");
      setIsConnecting(false);
    }
  };

  // Get the remote users as an array
  const remoteUsersArray = Object.values(remoteUsers);

  // Render the token debugging modal
  const renderTokenDebugModal = () => {
    return (
      <Modal
        title="Token Debugging Assistant"
        open={tokenDebugVisible}
        onCancel={() => setTokenDebugVisible(false)}
        footer={[
          <Button key="close" onClick={() => setTokenDebugVisible(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Alert
            type="info"
            message="Token Authentication Troubleshooting"
            description="This tool will help you understand and fix token issues with your Agora implementation."
            showIcon
          />

          <Card title="Configuration Status" size="small">
            {configValidation?.isValid ? (
              <Alert
                type="success"
                message="Configuration appears valid"
                showIcon
              />
            ) : (
              <Alert
                type="error"
                message="Configuration Issues Detected"
                description={
                  <ul>
                    {configValidation?.issues?.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                }
                showIcon
              />
            )}
          </Card>

          <Card title="Token Analysis" size="small">
            {tokenValidation?.isValid ? (
              <Alert
                type="success"
                message={tokenValidation.message}
                showIcon
              />
            ) : (
              <Alert
                type="error"
                message={tokenValidation?.error || "Token issue detected"}
                description={tokenValidation?.suggestion}
                showIcon
              />
            )}

            <div style={{ marginTop: 16 }}>
              <Text strong>Token:</Text>
              <Paragraph
                copyable={{ text: agoraConfig.temporaryToken }}
                ellipsis={{ rows: 2 }}
              >
                {agoraConfig.temporaryToken || "No token configured"}
              </Paragraph>
            </div>

            <div>
              <Text strong>Channel Name:</Text>
              <Paragraph>
                {agoraConfig.defaultChannelName ||
                  "No default channel configured"}
              </Paragraph>
              <Text type="secondary">
                The token must be generated specifically for this channel name
              </Text>
            </div>
          </Card>

          <Card title="How to Fix Token Issues" size="small">
            <Paragraph>
              <ol>
                <li>
                  Go to the{" "}
                  <a
                    href="https://console.agora.io/projects"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Agora Console
                  </a>
                </li>
                <li>Select your project</li>
                <li>Navigate to the "Project Management" tab</li>
                <li>Click "Generate Temp Token"</li>
                <li>
                  Enter <Text code>{agoraConfig.defaultChannelName}</Text> as
                  the Channel Name
                </li>
                <li>Make sure to select "RTC" not "RTM"</li>
                <li>Copy the generated token</li>
                <li>Update the temporaryToken in src/config/agoraConfig.js</li>
              </ol>
            </Paragraph>
          </Card>
        </Space>
      </Modal>
    );
  };

  return (
    <div className="agora-video-container">
      {renderTokenDebugModal()}

      {connectionErrors && (
        <Alert
          type="warning"
          message="Connection Issue"
          description={connectionErrors}
          showIcon
          action={
            <Space>
              <Button
                size="small"
                type="primary"
                onClick={retryConnection}
                disabled={connectionAttempts >= maxRetries || isConnecting}
              >
                Try Again
              </Button>
              <Button
                size="small"
                onClick={() => setTokenDebugVisible(true)}
                icon={<InfoCircleOutlined />}
              >
                Debug Token
              </Button>
            </Space>
          }
          style={{ marginBottom: "16px" }}
        />
      )}

      {usingMockMode && (
        <Alert
          type="info"
          message="Using Local Mode"
          description="You're using local mock mode. Video will work locally but won't connect to the Agora network."
          showIcon
          style={{ marginBottom: "16px" }}
          action={
            <Button
              size="small"
              onClick={() => setTokenDebugVisible(true)}
              icon={<InfoCircleOutlined />}
            >
              Fix This
            </Button>
          }
        />
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            remoteUsersArray.length === 0
              ? "minmax(300px, 400px)"
              : remoteUsersArray.length === 1
              ? "repeat(2, minmax(300px, 400px))"
              : "repeat(auto-fill, minmax(300px, 400px))",
          gap: "20px",
          justifyContent: "center",
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Local user video */}
        {joined ? (
          <LocalVideo userName={participantNames["local"] || userName} />
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
                minHeight: "300px",
                height: "300px",
                background: "#f0f0f0",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Avatar size={84} icon={<UserOutlined />} />
              <div style={{ marginTop: "16px", fontSize: "16px" }}>
                Video unavailable
                <Button
                  type="primary"
                  size="small"
                  onClick={retryConnection}
                  style={{ marginLeft: "8px" }}
                  disabled={connectionAttempts >= maxRetries || isConnecting}
                >
                  Retry
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Remote users' videos */}
        {remoteUsersArray.map((user) => (
          <RemoteVideo
            key={user.uid}
            user={user}
            userName={participantNames[user.uid] || `User ${user.uid}`}
          />
        ))}
      </div>
    </div>
  );
};

export default AgoraVideoRoom;
