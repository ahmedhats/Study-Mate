# Agora Token Authentication Setup for Study-Mate

This guide explains how to properly configure Agora token authentication in the Study-Mate application.

## Understanding Agora Authentication

Agora provides two authentication mechanisms:

1. **App ID Authentication** - simple but less secure
2. **Token Authentication** - more secure, required for production

Our app is configured to use Token Authentication, which means:

- Each user connecting to an Agora channel needs a valid token
- Tokens are temporary and expire after a set period (usually 24 hours)
- Tokens are specific to a channel name and user ID

## Token Configuration

### 1. In the Config File

The token is configured in: `src/config/agoraConfig.js`

```javascript
const agoraConfig = {
  // Your Agora App ID
  appId: "692b5038cd7d48e7840513b3dee89362",

  // This must be true for token authentication
  useTokenAuth: true,

  // Temporary token from Agora dashboard
  temporaryToken: "your-token-here",

  // ...other settings
};
```

### 2. Getting a Temporary Token

For development and testing, you can generate a temporary token:

1. Go to [Agora Console](https://console.agora.io/)
2. Select your project
3. Click on the "Project Management" tab
4. Look for "Temporary Token"
5. Enter a channel name (must match the channel name used in the app)
6. Generate the token and copy it
7. Paste the token into the `temporaryToken` field in agoraConfig.js

### 3. Production Setup

For production, you should set up a token server:

1. Create a backend endpoint that generates tokens using Agora's server SDK
2. Modify `agoraService.js` to fetch tokens from your server
3. Uncomment and update the token fetching code in the `getToken` method

## Troubleshooting Common Issues

### "Dynamic key required" Error

This error occurs when:

- Your Agora project is set to use token authentication
- But your code is trying to connect without a token

**Solution:**

1. Set `useTokenAuth: true` in agoraConfig.js
2. Provide a valid token in the `temporaryToken` field
3. Make sure your token hasn't expired

### "Invalid token" Error

This error occurs when:

- The token is incorrectly formatted
- The token has expired
- The token was generated for a different channel or user ID

**Solution:**

1. Generate a new token for the specific channel
2. Make sure the channel name in the app matches the one used to generate the token
3. Check that the token wasn't truncated when copied

### Fallback to Mock Mode

If authentication fails, the app will fall back to "mock mode" where:

- The app continues to function locally
- Video/audio will be available only to the current user
- No connection to Agora servers is established

This provides a graceful degradation of service during authentication issues.

## Advanced Configuration

### Refreshing Tokens

Tokens expire after a set period. To handle this:

1. Listen for the `token-privilege-will-expire` event
2. When triggered, request a new token from your server
3. Call `client.renewToken(newToken)` with the new token

This is already implemented in the `AgoraVideo.jsx` component.

### Security Considerations

- Never hardcode permanent tokens in client-side code
- In production, always use a server to generate tokens
- Implement proper user authentication before providing Agora tokens

## Need Help?

If you encounter issues with Agora authentication:

1. Check the browser console for specific error messages
2. Verify your App ID and Token are correct
3. Make sure token authentication is properly configured in the Agora Console
4. Try clearing browser cache and cookies if settings were recently changed
