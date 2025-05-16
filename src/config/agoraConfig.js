/**
 * Agora configuration for video calls
 */
const agoraConfig = {
  // Your Agora App ID
  appId: "692b5038cd7d48e7840513b3dee89362",

  // Set to true for token authentication (required for your project)
  // Your Agora project is set to use token authentication (dynamic key)
  useTokenAuth: true,

  // DEFAULT CHANNEL NAME - IMPORTANT!
  // This MUST match the channel name used when generating your token
  defaultChannelName: "study-mate",

  // Temporary token for development - for channel 'study-mate'
  // Generate a fresh token from Agora Console for the defaultChannelName above
  temporaryToken:
    "007eJxTYBC46i/sEd625rKxy7FpfO8MEt2yWh2DJt55bT2lO8h8D58Cg5mlUZKpgbFFcop5iolFqrmFiYGpoXGScUpqqoWlsZnRrqtqGQ2BjAwMyenMjAwQCOJzMRSXlKZU6uYmlqQyMAAAYNYfQw==",

  // IMPORTANT: The token above is for the channel "study-mate" only
  // If you need to join a different channel, you'll need to generate a new token
  // The token will expire after 24 hours, generate a new one if needed

  // Connection settings
  mode: "rtc", // Use "rtc" for video calls (not "live" for broadcasting)
  codec: "vp8",

  // Additional configuration
  connectionRetries: 5, // Increased from 3 to 5 for better reliability

  // Fallback options when connection fails
  useMockFallback: true,

  // Connection timeout in milliseconds
  connectionTimeout: 30000, // Increased from 15000 to 30000 ms (30 seconds)

  // Network configurations
  enableDualStream: true, // Enable dual stream mode for better quality adaptation

  // ICE server configuration (can help with connection issues)
  turnServer: {
    forceTurn: false, // Set to true only if you're behind strict firewalls
    enableIceReconnection: true,
  },

  // Allows the SDK to work around certain network limitations
  enableCloudProxy: false, // Enable only if severe network restrictions exist
};

export default agoraConfig;
