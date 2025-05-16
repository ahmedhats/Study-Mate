import AgoraRTC from "agora-rtc-sdk-ng";
import agoraConfig from "../../config/agoraConfig";

// Get Agora App ID and config
const { appId, mode, codec } = agoraConfig;

// Initialize Agora client
const client = AgoraRTC.createClient({
  mode: mode || "rtc",
  codec: codec || "vp8",
});

// Tracks for local user
let localAudioTrack = null;
let localVideoTrack = null;

// Store remote users
const remoteUsers = {};

// Agora Service
const agoraService = {
  /**
   * Get a valid channel name from the session ID
   */
  getChannelName(sessionId) {
    if (!sessionId) return null;

    // Convert sessionId to a valid channel name (alphanumeric only)
    // For mock IDs, create a predictable but unique channel name
    if (sessionId.startsWith("mock-")) {
      // Extract any numbers from the mock ID to use as a unique identifier
      const matches = sessionId.match(/\d+/);
      const uniqueId =
        matches && matches[0] ? matches[0] : Date.now().toString();

      // Create a valid channel name with the unique ID
      return `channel${uniqueId}`;
    }

    // For normal session IDs, sanitize to ensure Agora compatibility
    // Agora requires channel names to be alphanumeric only
    // Replace any non-alphanumeric characters with 'x'
    const sanitizedName = sessionId.replace(/[^a-zA-Z0-9]/g, "x");

    // Ensure it's not too long - Agora has a maximum channel name length
    return sanitizedName.substring(0, 64);
  },

  /**
   * Get a token for the Agora channel
   * In a production environment, this should request a token from your server
   */
  async getToken(channelName, uid) {
    // First check if we have a temporary token configured
    if (agoraConfig.temporaryToken) {
      console.log("Using the configured temporary token");
      return agoraConfig.temporaryToken;
    }

    // In a production app, you should fetch a token from your backend service
    // Example:
    // const response = await fetch(`${API_URL}/agora/token?channelName=${channelName}&uid=${uid}`);
    // const data = await response.json();
    // return data.token;

    // For development/testing when useTokenAuth is true but no token server is available,
    // we'll use a fallback approach: switch to mock mode
    console.warn(
      "Token authentication is required but no token server is configured."
    );
    console.warn(
      "In production, implement a token server and fetch a token here."
    );

    // Return null to trigger the fallback to mock mode
    return null;
  },

  /**
   * Join the Agora channel
   */
  async join(sessionId, token = null, uid = null) {
    try {
      // Reset if already connected
      if (
        client.connectionState === "CONNECTED" ||
        client.connectionState === "CONNECTING"
      ) {
        console.log(
          "Already connected to Agora. Leaving current channel first..."
        );
        await this.leave();
      }

      const channelName = this.getChannelName(sessionId);
      if (!channelName) {
        throw new Error("Invalid session ID or channel name");
      }

      console.log("Joining Agora channel:", channelName);

      // Handle token authentication if needed
      let tokenToUse = token || agoraConfig.temporaryToken;

      // If token auth is required but no token is provided, try to get one
      if (agoraConfig.useTokenAuth && !tokenToUse) {
        console.log(
          "Token authentication required. Attempting to get token..."
        );
        try {
          // Generate a uid if not provided
          const uidToUse = uid || Math.floor(Math.random() * 100000);
          tokenToUse = await this.getToken(channelName, uidToUse);

          if (tokenToUse) {
            console.log(
              "Successfully obtained token for channel:",
              channelName
            );
          } else {
            console.warn(
              "No token obtained. Connection may fail if token authentication is required."
            );
            if (agoraConfig.useMockFallback) {
              console.log("Switching to mock mode as fallback");
              // Create a mock session ID
              const mockSessionId = `mock-${Date.now()}`;
              // Store in session storage for reference
              sessionStorage.setItem("usingMockMode", "true");
              sessionStorage.setItem("mockSessionId", mockSessionId);

              // Instead of throwing error, return mock info
              return {
                isMockMode: true,
                mockSessionId,
              };
            }
          }
        } catch (tokenError) {
          console.error("Error getting token:", tokenError);
          throw new Error(
            "Failed to get authentication token: " + tokenError.message
          );
        }
      }

      // Add timeout to prevent hanging if connection takes too long
      const timeout = agoraConfig.connectionTimeout || 15000;

      // Create a promise that will be rejected after the timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Connection to Agora timed out after ${timeout}ms`));
        }, timeout);
      });

      // Join the channel with timeout - use token based on useTokenAuth config
      uid = await Promise.race([
        client.join(
          appId,
          channelName,
          agoraConfig.useTokenAuth ? tokenToUse : null,
          uid
        ),
        timeoutPromise,
      ]);

      console.log("Joined Agora channel:", channelName, "with UID:", uid);

      // Create local audio and video tracks
      try {
        [localAudioTrack, localVideoTrack] =
          await AgoraRTC.createMicrophoneAndCameraTracks();
      } catch (mediaError) {
        console.error("Error accessing media devices:", mediaError);

        // Try to continue with just audio if video fails
        try {
          localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          console.log("Created audio-only track");
        } catch (audioError) {
          console.error("Could not access microphone:", audioError);
          // Continue without media tracks
        }
      }

      // Play local video track if available
      if (localVideoTrack) {
        try {
          localVideoTrack.play("local-video");
        } catch (playError) {
          console.error("Error playing local video:", playError);
        }
      }

      // Publish local tracks to the channel
      const tracksToPublish = [];
      if (localAudioTrack) tracksToPublish.push(localAudioTrack);
      if (localVideoTrack) tracksToPublish.push(localVideoTrack);

      if (tracksToPublish.length > 0) {
        await client.publish(tracksToPublish);
        console.log("Published local tracks to Agora channel");
      } else {
        console.warn("No local tracks to publish");
      }

      // Set up event listeners
      this.setupEventListeners();

      return {
        localAudioTrack,
        localVideoTrack,
        uid,
      };
    } catch (error) {
      console.error("Error joining Agora channel:", error);

      // Handle specific errors
      if (error.message && error.message.includes("dynamic use static key")) {
        // This is an authentication issue - Agora is configured to require token
        console.error("Authentication error: Token required");

        // If mockFallback is enabled, create a mock session
        if (agoraConfig.useMockFallback) {
          console.log("Switching to mock mode as fallback due to auth error");
          const mockSessionId = `mock-${Date.now()}`;
          sessionStorage.setItem("usingMockMode", "true");
          sessionStorage.setItem("mockSessionId", mockSessionId);

          return {
            isMockMode: true,
            mockSessionId,
            error: "Authentication failed, using mock mode",
          };
        }
      }

      throw error;
    }
  },

  /**
   * Set up event listeners for remote users
   */
  setupEventListeners() {
    // When a remote user publishes a track
    client.on("user-published", async (user, mediaType) => {
      // Subscribe to the remote user
      await client.subscribe(user, mediaType);
      console.log(
        "Subscribed to remote user:",
        user.uid,
        "mediaType:",
        mediaType
      );

      // If it's a video track
      if (mediaType === "video") {
        // Store the remote user
        remoteUsers[user.uid] = user;

        // Play the remote video in the container with ID `remote-video-${user.uid}`
        user.videoTrack.play(`remote-video-${user.uid}`);
      }

      // If it's an audio track
      if (mediaType === "audio") {
        // Play the audio
        user.audioTrack.play();
      }
    });

    // When a remote user unpublishes a track
    client.on("user-unpublished", (user, mediaType) => {
      console.log(
        "Remote user unpublished:",
        user.uid,
        "mediaType:",
        mediaType
      );

      // If it's a video track, clear the container
      if (mediaType === "video") {
        const playerContainer = document.getElementById(
          `remote-video-${user.uid}`
        );
        if (playerContainer) {
          playerContainer.textContent = "";
        }
      }
    });

    // When a remote user leaves the channel
    client.on("user-left", (user) => {
      console.log("Remote user left:", user.uid);

      // Remove the user from our remoteUsers object
      delete remoteUsers[user.uid];

      // Clean up the video container
      const playerContainer = document.getElementById(
        `remote-video-${user.uid}`
      );
      if (playerContainer) {
        playerContainer.remove();
      }
    });
  },

  /**
   * Leave the Agora channel
   */
  async leave() {
    try {
      // Close and release local audio and video tracks
      if (localAudioTrack) {
        localAudioTrack.close();
        localAudioTrack = null;
      }

      if (localVideoTrack) {
        localVideoTrack.close();
        localVideoTrack = null;
      }

      // Clear remote users
      Object.keys(remoteUsers).forEach((uid) => {
        delete remoteUsers[uid];
      });

      // Leave the channel
      if (
        client &&
        (client.connectionState === "CONNECTED" ||
          client.connectionState === "CONNECTING")
      ) {
        await client.leave();
        console.log("Left Agora channel successfully");
      }
    } catch (error) {
      console.error("Error leaving Agora channel:", error);
      // Continue execution even if there's an error during leave
    }
  },

  /**
   * Toggle local audio track
   */
  toggleAudio() {
    if (localAudioTrack) {
      if (localAudioTrack.enabled) {
        localAudioTrack.setEnabled(false);
        return true; // Muted
      } else {
        localAudioTrack.setEnabled(true);
        return false; // Unmuted
      }
    }
    return true; // Default to muted if no track
  },

  /**
   * Toggle local video track
   */
  toggleVideo() {
    if (localVideoTrack) {
      if (localVideoTrack.enabled) {
        localVideoTrack.setEnabled(false);
        return true; // Video off
      } else {
        localVideoTrack.setEnabled(true);
        return false; // Video on
      }
    }
    return true; // Default to off if no track
  },

  /**
   * Get the client instance
   */
  getClient() {
    return client;
  },

  /**
   * Get local audio track
   */
  getLocalAudioTrack() {
    return localAudioTrack;
  },

  /**
   * Get local video track
   */
  getLocalVideoTrack() {
    return localVideoTrack;
  },

  /**
   * Get all remote users
   */
  getRemoteUsers() {
    return remoteUsers;
  },
};

export default agoraService;
