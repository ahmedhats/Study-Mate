import AgoraRTC from "agora-rtc-sdk-ng";

/**
 * Utility for managing media devices with Agora
 */
const deviceManager = {
  /**
   * Get available audio and video devices
   * @returns {Promise<Object>} Object containing audio and video devices
   */
  async getDevices() {
    try {
      const devices = await AgoraRTC.getDevices();
      const audioDevices = devices.filter(
        (device) => device.kind === "audioinput"
      );
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      return {
        audioDevices,
        videoDevices,
      };
    } catch (error) {
      console.error("Error getting devices:", error);
      return {
        audioDevices: [],
        videoDevices: [],
      };
    }
  },

  /**
   * Check if the browser supports Agora
   * @returns {boolean} True if Agora is supported
   */
  isBrowserSupported() {
    return AgoraRTC.checkSystemRequirements().result;
  },

  /**
   * Get information about browser compatibility
   * @returns {Object} Details about browser compatibility
   */
  getBrowserCompatibilityInfo() {
    const support = AgoraRTC.checkSystemRequirements();
    return {
      isSupported: support.result,
      details: support.supportedBrowser,
    };
  },

  /**
   * Check if user has granted media permissions
   * @returns {Promise<Object>} Status of audio and video permissions
   */
  async checkMediaPermissions() {
    try {
      const permissionStatus = {
        audio: false,
        video: false,
      };

      try {
        // Check audio permissions
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        audioStream.getTracks().forEach((track) => track.stop());
        permissionStatus.audio = true;
      } catch (audioError) {
        console.warn("Audio permission denied:", audioError);
      }

      try {
        // Check video permissions
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoStream.getTracks().forEach((track) => track.stop());
        permissionStatus.video = true;
      } catch (videoError) {
        console.warn("Video permission denied:", videoError);
      }

      return permissionStatus;
    } catch (error) {
      console.error("Error checking permissions:", error);
      return { audio: false, video: false };
    }
  },
};

export default deviceManager;
