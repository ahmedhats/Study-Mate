/**
 * Agora configuration for live video calls
 */
const agoraConfig = {
  // Your Agora App ID
  appId: "692b5038cd7d48e7840513b3dee89362",

  // Set to true for token authentication (required for your project)
  // Your Agora project is set to use token authentication (dynamic key)
  useTokenAuth: true,

  // Temporary token for development - for channel 'study-mate'
  // Replace this with a fresh token from Agora Console
  temporaryToken:
    "007eJxTYGDNOL2WO5kx7Yd3vM0vVmHfqzxzppbstvK49LTYuODIG2MFBjNLoyRTA2OL5BTzFBOLVHMLEwNTQ+Mk45TUVAtLYzMjlxlqGQ2BjAyW3PtYGRkgEMTnYiguKU2p1M1NLEllYAAAW6sfHA==",

  // Connection settings
  mode: "rtc",
  codec: "vp8",

  // Additional configuration
  connectionRetries: 3,

  // Fallback options when connection fails
  useMockFallback: true,

  // Connection timeout in milliseconds
  connectionTimeout: 15000,
};

export default agoraConfig;
