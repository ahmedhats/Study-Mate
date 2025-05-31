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

// Store user metadata
const localUserMetadata = {};
const remoteUserMetadata = {};

// Track connection attempts
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

// Agora Service
const agoraService = {
  /**
   * Get a valid channel name from the session ID
   * IMPORTANT: If using a token, the channel name MUST match the one used to generate the token
   */
  getChannelName(sessionId) {
    if (!sessionId) {
      // If no session ID provided, use the default channel name from config
      // This ensures we're using the channel name that matches our token
      console.log(
        "No sessionId provided, using default channel:",
        agoraConfig.defaultChannelName
      );
      return agoraConfig.defaultChannelName;
    }

    // If the session ID is the same as our default channel name, use it directly
    // This ensures we use the exact name that matches our token
    if (sessionId === agoraConfig.defaultChannelName) {
      return sessionId;
    }

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

      // IMPORTANT: Warn if the channel doesn't match the expected default channel
      if (channelName !== agoraConfig.defaultChannelName) {
        console.warn(
          `WARNING: You are trying to join channel "${channelName}" but your token was generated for "${agoraConfig.defaultChannelName}"`
        );
        console.warn(
          "This will likely cause an authentication error. Generate a new token for this specific channel."
        );

        // To avoid the token error, we can use the default channel instead
        console.log(
          "Forcing use of the default channel that matches your token:",
          agoraConfig.defaultChannelName
        );
        return {
          token: agoraConfig.temporaryToken,
          forceChannel: agoraConfig.defaultChannelName,
        };
      }

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
   * Clear any existing connection before joining a new channel
   */
  async clearExistingConnection() {
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

        // Add a small delay to ensure resources are released
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error("Error clearing existing connection:", error);
    }
  },

  /**
   * Join the Agora channel with retry mechanism
   */
  async join(sessionId, token = null, uid = null, userMetadata = null) {
    try {
      // Clear any existing connection
      await this.clearExistingConnection();

      // Reset connection attempts on new join call
      connectionAttempts = 0;

      return await this._joinWithRetry(sessionId, token, uid, userMetadata);
    } catch (error) {
      console.error("Error joining Agora channel:", error);

      // Handle specific errors for a better user experience
      if (error.message && error.message.includes("OPERATION_ABORTED")) {
        console.log("Connection was aborted, possibly due to network issues");

        // If we hit this error, try using the mock mode as fallback
        if (agoraConfig.useMockFallback) {
          console.log("Switching to mock mode due to connection issues");
          const mockSessionId = `mock-${Date.now()}`;
          sessionStorage.setItem("usingMockMode", "true");
          sessionStorage.setItem("mockSessionId", mockSessionId);

          return {
            isMockMode: true,
            mockSessionId,
            error: "Connection aborted, using mock mode",
          };
        }
      } else if (
        error.message &&
        error.message.includes("dynamic use static key")
      ) {
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
      } else if (error.message && error.message.includes("invalid token")) {
        console.error("Invalid token error. This typically happens when:");
        console.error(
          "1. The token has expired (tokens usually last 24 hours)"
        );
        console.error(
          "2. The token was generated for a different channel name"
        );
        console.error("3. The App ID and token don't correspond");
        console.error(
          "Create a new token from the Agora Console for channel:",
          agoraConfig.defaultChannelName
        );
      }

      throw error;
    }
  },

  /**
   * Internal method to join with retry logic
   */
  async _joinWithRetry(
    sessionId,
    token = null,
    uid = null,
    userMetadata = null,
    attemptNumber = 0
  ) {
    try {
      connectionAttempts++;
      console.log(
        `Connection attempt ${connectionAttempts} of ${MAX_CONNECTION_ATTEMPTS}`
      );

      if (connectionAttempts > MAX_CONNECTION_ATTEMPTS) {
        throw new Error(
          `Failed to connect after ${MAX_CONNECTION_ATTEMPTS} attempts`
        );
      }

      const channelName = this.getChannelName(sessionId);
      if (!channelName) {
        throw new Error("Invalid session ID or channel name");
      }

      console.log("Joining Agora channel:", channelName);

      // Handle token authentication if needed
      let tokenToUse = token || agoraConfig.temporaryToken;
      let finalChannelName = channelName; // The channel we'll actually join

      // If token auth is required but no token is provided, try to get one
      if (agoraConfig.useTokenAuth && !tokenToUse) {
        console.log(
          "Token authentication required. Attempting to get token..."
        );
        try {
          // Generate a uid if not provided
          const uidToUse = uid || Math.floor(Math.random() * 100000);
          const tokenResult = await this.getToken(channelName, uidToUse);

          // Check if we got back an object with a token and forceChannel
          if (
            tokenResult &&
            typeof tokenResult === "object" &&
            tokenResult.token
          ) {
            tokenToUse = tokenResult.token;

            // If we need to force a specific channel name to match the token
            if (tokenResult.forceChannel) {
              console.log(
                `Forcing channel name to "${tokenResult.forceChannel}" to match the token`
              );
              finalChannelName = tokenResult.forceChannel;
            }
          } else {
            tokenToUse = tokenResult; // Simple token string
          }

          if (tokenToUse) {
            console.log(
              "Successfully obtained token for channel:",
              finalChannelName
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

      // Generate a unique string ID if not provided
      const clientUid = uid || Math.floor(Math.random() * 10000);

      // Store user metadata for retrieval when remote users connect
      if (userMetadata) {
        // We can't set uid directly as it's a read-only property
        // Instead, store the metadata separately
        console.log("Storing user metadata for retrieval:", userMetadata);
        // We'll attach metadata another way when we publish tracks
        client._metadataToAttach = userMetadata;
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
          finalChannelName, // Use the potentially modified channel name
          agoraConfig.useTokenAuth ? tokenToUse : null,
          clientUid
        ),
        timeoutPromise,
      ]);

      console.log("Joined Agora channel:", finalChannelName, "with UID:", uid);

      // Create local audio and video tracks
      try {
        // First check if we have camera access
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideoDevice = devices.some(device => device.kind === 'videoinput');

        if (!hasVideoDevice) {
          throw new Error('No camera device found');
        }

        // Try to create tracks with enhanced error handling
        try {
          // First try to get a test stream to verify camera access
          const testStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user"
            }
          });

          // Stop the test stream
          testStream.getTracks().forEach(track => track.stop());

          // Now create the Agora tracks
          [localAudioTrack, localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks({
            microphoneConfig: {
              AEC: true,
              AGC: true,
              ANS: true,
            },
            cameraConfig: {
              facingMode: "user",
              optimizationMode: "detail",
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });

          // Verify the video track is working
          if (localVideoTrack) {
            const videoElement = document.createElement('video');
            videoElement.style.display = 'none';
            document.body.appendChild(videoElement);

            try {
              await localVideoTrack.play(videoElement);
              videoElement.remove();
              console.log('Video track verified successfully');
            } catch (playError) {
              console.error('Video track verification failed:', playError);
              throw new Error('Failed to initialize video track');
            }
          }
        } catch (trackError) {
          console.error('Error creating media tracks:', trackError);

          // Try to recover with just audio if video fails
          try {
            localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            console.log('Created audio-only track after video failure');
          } catch (audioError) {
            console.error('Could not access microphone:', audioError);
            throw new Error('Failed to access any media devices');
          }
        }
      } catch (mediaError) {
        console.error('Error accessing media devices:', mediaError);
        throw mediaError;
      }

      // Ensure local-video element exists before trying to play
      if (localVideoTrack) {
        try {
          // Let's use our enhanced play method
          await this.playLocalVideoTrack();
        } catch (playError) {
          console.error("Error playing local video:", playError);
        }
      }

      // Publish local tracks to the channel
      const tracksToPublish = [];
      if (localAudioTrack) tracksToPublish.push(localAudioTrack);
      if (localVideoTrack) tracksToPublish.push(localVideoTrack);

      if (tracksToPublish.length > 0) {
        try {
          // Store metadata in the client object for retrieval
          if (client._metadataToAttach) {
            // Store local user metadata
            Object.assign(localUserMetadata, client._metadataToAttach);
            console.log("Local user metadata stored:", localUserMetadata);

            // We'll emit an event that our components can listen to
            setTimeout(() => {
              // This simulates sending the metadata to other users
              // In a production app, you would use Agora RTM or a custom signaling server
              const event = new CustomEvent("agora-metadata-ready", {
                detail: {
                  uid: uid,
                  metadata: localUserMetadata,
                },
              });
              window.dispatchEvent(event);
            }, 1000);
          }

          await client.publish(tracksToPublish);
          console.log("Published local tracks to Agora channel");
        } catch (publishError) {
          console.error("Error publishing tracks:", publishError);
          // Continue with the connection even if publishing fails
        }
      } else {
        console.warn("No local tracks to publish");
      }

      // Set up event listeners
      this.setupEventListeners();

      // Reset connection attempts on success
      connectionAttempts = 0;

      return {
        localAudioTrack,
        localVideoTrack,
        uid,
      };
    } catch (error) {
      // Handle connection errors with retry logic
      console.error(`Connection attempt ${connectionAttempts} failed:`, error);

      // For specific errors that might benefit from a retry
      if (
        (error.message && error.message.includes("OPERATION_ABORTED")) ||
        (error.message && error.message.includes("timeout")) ||
        (error.message && error.message.includes("network"))
      ) {
        // Implement exponential backoff for retries
        const backoffTime = Math.min(
          1000 * Math.pow(2, connectionAttempts - 1),
          8000
        );
        console.log(`Retrying in ${backoffTime}ms...`);

        // Wait with exponential backoff before retrying
        await new Promise((resolve) => setTimeout(resolve, backoffTime));

        // Try again if we haven't exceeded max attempts
        if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
          return this._joinWithRetry(sessionId, token, uid, userMetadata);
        }
      }

      // If we reach here, either we've exceeded max retries or it's an error we don't retry for
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

  /**
   * Play local video track with enhanced element detection
   */
  async playLocalVideoTrack() {
    if (!localVideoTrack) {
      console.warn("No local video track to play");
      return false;
    }

    try {
      // First try to use the direct video element that we added
      const directVideoElement = document.getElementById("direct-local-video");
      if (directVideoElement) {
        console.log("Found direct-local-video element, using it");

        try {
          // Stop any existing playback
          localVideoTrack.stop();

          // Play directly on the video element
          if (localVideoTrack._mediaStreamTrack) {
            directVideoElement.srcObject = new MediaStream([
              localVideoTrack._mediaStreamTrack,
            ]);
            await directVideoElement.play();
            console.log("Successfully playing on direct video element");
            return true;
          }
        } catch (directPlayError) {
          console.warn("Direct play method failed:", directPlayError);
          // Fall through to traditional methods
        }
      }

      // Try multiple approaches to find the container
      let localVideoContainer = document.getElementById("local-video");

      // Try alternative query methods if not found
      if (!localVideoContainer) {
        localVideoContainer = document.querySelector("#local-video");
      }

      if (!localVideoContainer) {
        console.warn(
          "local-video container not found by ID, looking for it in DOM..."
        );
        // Look for our main container first
        const mainContainer = document.getElementById(
          "local-video-main-container"
        );
        if (mainContainer) {
          // Create a child div with id="local-video"
          const videoDiv = document.createElement("div");
          videoDiv.id = "local-video";
          videoDiv.style.width = "100%";
          videoDiv.style.height = "100%";
          videoDiv.style.position = "absolute";
          videoDiv.style.top = "0";
          videoDiv.style.left = "0";

          // Clear and add
          mainContainer.innerHTML = "";
          mainContainer.appendChild(videoDiv);
          localVideoContainer = videoDiv;
        } else {
          // Look for any div that might have been created for this purpose
          const possibleContainers = document.querySelectorAll(
            "div[ref=localVideoRef]"
          );
          if (possibleContainers.length > 0) {
            localVideoContainer = possibleContainers[0];
            localVideoContainer.id = "local-video"; // Ensure it has the right ID
          }
        }
      }

      if (localVideoContainer) {
        console.log("Found local-video element, playing track");

        // Stop any existing playback
        try {
          localVideoTrack.stop();
        } catch (e) {
          // Ignore errors from stopping
        }

        // Empty the container first to avoid stacking
        localVideoContainer.innerHTML = "";

        // Try direct play first
        try {
          localVideoTrack.play("local-video");
          console.log("Successfully played local video in container");
          return true;
        } catch (playError) {
          console.warn(
            "Error with standard play method, trying alternative:",
            playError
          );

          // Alternative: manually create a video element
          const videoElement = document.createElement("video");
          videoElement.style.width = "100%";
          videoElement.style.height = "100%";
          videoElement.style.objectFit = "cover";
          videoElement.autoplay = true;
          videoElement.playsInline = true;
          videoElement.muted = true;
          localVideoContainer.appendChild(videoElement);

          // Manually play the track in this element
          if (localVideoTrack._mediaStreamTrack) {
            videoElement.srcObject = new MediaStream([
              localVideoTrack._mediaStreamTrack,
            ]);
            videoElement.play().catch(console.error);
            return true;
          }
          return false;
        }
      } else {
        console.warn("local-video container not found, creating element");

        // Create a fallback container if needed
        const container = document.createElement("div");
        container.id = "local-video";
        container.style.width = "100%";
        container.style.height = "100%";

        // Try to add it to the direct-local-video parent if it exists
        const directVideo = document.getElementById("direct-local-video");
        if (directVideo && directVideo.parentNode) {
          directVideo.style.display = "none"; // Hide the direct video
          directVideo.parentNode.appendChild(container);
        } else {
          // Add to body as last resort
          document.body.appendChild(container);
        }

        // Play in the newly created container
        try {
          localVideoTrack.play("local-video");
          return true;
        } catch (playError) {
          console.warn("Fallback play failed, trying direct play:", playError);
          localVideoTrack.play();
          return true;
        }
      }
    } catch (error) {
      console.error("Error playing local video track:", error);

      // Last resort, play without container
      try {
        console.log("Attempting to play video without container");
        localVideoTrack.play();
        return true;
      } catch (fallbackError) {
        console.error(
          "Failed to play video track even without container:",
          fallbackError
        );
        return false;
      }
    }
  },

  /**
   * Get or set metadata for a user
   */
  getUserMetadata(uid) {
    return remoteUserMetadata[uid] || null;
  },

  /**
   * Set metadata for a remote user
   */
  setUserMetadata(uid, metadata) {
    remoteUserMetadata[uid] = metadata;
    console.log(`Updated metadata for user ${uid}:`, metadata);

    // Notify listeners that metadata has been updated
    try {
      const event = new CustomEvent("agora-metadata-update", {
        detail: {
          uid: uid,
          metadata: metadata,
        },
      });
      window.dispatchEvent(event);
    } catch (e) {
      console.error("Could not dispatch metadata event:", e);
    }
  },

  /**
   * Get the local user's metadata
   */
  getLocalUserMetadata() {
    return localUserMetadata;
  },

  /**
   * Reset internal state - useful when retrying connections
   */
  resetState() {
    // Clear any metadata we tried to attach
    if (client._metadataToAttach) {
      delete client._metadataToAttach;
    }

    // Clear connection attempts
    connectionAttempts = 0;

    console.log("Reset internal agora service state");
  },
};

export default agoraService;
