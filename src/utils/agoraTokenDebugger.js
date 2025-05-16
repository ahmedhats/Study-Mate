/**
 * Agora Token Debugger Utility
 *
 * This utility helps diagnose common token issues with Agora
 */
import agoraConfig from "../config/agoraConfig";

const agoraTokenDebugger = {
  /**
   * Analyze the token and provide debugging information
   * @param {string} token The token to analyze
   * @returns {Object} Analysis results
   */
  analyzeToken(token) {
    if (!token) {
      return {
        isValid: false,
        error: "No token provided",
        suggestion: "Generate a token in the Agora Console",
      };
    }

    // Check if token appears to be the correct format (starts with "006" or "007")
    // Agora tokens typically start with these prefixes
    if (!token.startsWith("006") && !token.startsWith("007")) {
      return {
        isValid: false,
        error: "Invalid token format",
        suggestion: "The token doesn't appear to be a valid Agora token",
      };
    }

    // Check if token is truncated (less than expected minimum length)
    if (token.length < 20) {
      return {
        isValid: false,
        error: "Token appears to be truncated",
        suggestion: "Make sure you copied the entire token",
      };
    }

    return {
      isValid: true,
      message: "Token format appears valid",
      note: "Even if the format is valid, the token may still fail if it's expired or for the wrong channel",
    };
  },

  /**
   * Check if the current configuration is valid
   * @returns {Object} Configuration validation results
   */
  validateConfiguration() {
    const issues = [];

    // Check App ID
    if (!agoraConfig.appId || agoraConfig.appId === "your-app-id-here") {
      issues.push("Invalid App ID - Check agoraConfig.js");
    }

    // Check Token Configuration
    if (agoraConfig.useTokenAuth && !agoraConfig.temporaryToken) {
      issues.push("Token authentication is enabled but no token is provided");
    }

    // Check if default channel is specified
    if (!agoraConfig.defaultChannelName) {
      issues.push("No default channel name is specified");
    }

    // Return validation results
    if (issues.length === 0) {
      return {
        isValid: true,
        message: "Configuration appears to be valid",
      };
    } else {
      return {
        isValid: false,
        issues: issues,
        suggestion: "Update your configuration in src/config/agoraConfig.js",
      };
    }
  },

  /**
   * Generate a link to the Agora Console for creating a new token
   * @returns {string} URL to Agora console
   */
  getTokenGenerationUrl() {
    return "https://console.agora.io/projects";
  },

  /**
   * Get instructions for fixing token issues
   * @returns {string} Instructions
   */
  getTokenInstructions() {
    return `
      To fix token issues:
      
      1. Go to the Agora Console at ${this.getTokenGenerationUrl()}
      2. Select your project
      3. Navigate to the "Project Management" tab
      4. Click "Generate Temp Token"
      5. Enter "${agoraConfig.defaultChannelName}" as the Channel Name
      6. Make sure to select "RTC" not "RTM"
      7. Copy the generated token
      8. Update the temporaryToken in src/config/agoraConfig.js
    `;
  },
};

export default agoraTokenDebugger;
