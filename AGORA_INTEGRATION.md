# Agora Integration for Study-Mate

This guide explains how we've implemented Agora's video calling solution in the Study-Mate application to replace the previous WebRTC implementation.

## Overview

The Agora SDK has been integrated to provide more reliable video calling, especially for group study sessions. The key benefits include:

- Better connection reliability across different networks
- Improved browser compatibility without the need for polyfills
- Scalable multi-user video calls
- Reduced server load for signaling
- Simplified implementation that works with both real and mock sessions

## Setup Instructions

### 1. Install Agora SDK

```bash
npm install agora-rtc-sdk-ng
```

### 2. Create an Agora Account

1. Sign up at [Agora.io](https://www.agora.io/)
2. Create a new project in the Agora Console
3. Copy your App ID

### 3. Configure Agora

Open `src/services/agora/agoraService.js` and replace the placeholder App ID:

```javascript
const appId = "your-agora-app-id"; // Replace with your actual App ID
```

## Project Structure

The Agora implementation consists of the following files:

1. **src/services/agora/agoraService.js**

   - Core service that manages Agora connections
   - Handles mock session IDs
   - Manages audio/video tracks and remote users

2. **src/components/features/studySessions/AgoraVideo.jsx**

   - React components for video display
   - LocalVideo component for the current user
   - RemoteVideo component for other participants
   - AgoraVideoRoom component to orchestrate the video call

3. **src/components/features/studySessions/AgoraStudyRoom.jsx**

   - Main study room component
   - Uses Agora for video calls
   - Provides chat, notes, and session information

4. **src/App.jsx**
   - Updated to use the new AgoraStudyRoom component

## How It Works

### Agora Service

The `agoraService.js` file provides methods to:

1. Join a channel based on session ID
2. Leave a channel
3. Toggle audio and video
4. Get remote users
5. Handle mock sessions

It automatically converts mock session IDs (starting with "mock-") to valid Agora channel names.

### Video Components

The `AgoraVideo.jsx` file contains:

1. **LocalVideo**: Shows the current user's camera feed with audio/video controls
2. **RemoteVideo**: Shows other participants' video feeds
3. **AgoraVideoRoom**: Container component that initializes Agora and manages the video grid

### Study Room

The `AgoraStudyRoom.jsx` file is a complete replacement for the old WebRTC-based study room. It provides:

1. Video calling with Agora
2. Text chat between participants
3. Note-taking functionality
4. Session information display
5. Fallback mechanisms for offline mode

## How to Test

1. **Create a New Session**:

   - Go to the Study Sessions page
   - Click "Create Session"
   - Fill in the session details and create
   - You'll be automatically redirected to the session

2. **Join Another Session**:

   - Go to the Study Sessions page
   - Find a session in the list
   - Click "Join Session"

3. **Test with Multiple Users**:

   - Open the application in multiple browser windows
   - Join the same session with different accounts
   - Verify that you can see and hear each other

4. **Test Mock Sessions**:
   - Disconnect from the internet or stop the backend server
   - Try creating a new session
   - The application should fall back to a mock session with Agora still functioning

## Troubleshooting

### Common Issues

1. **No video appears**:

   - Check browser camera/microphone permissions
   - Ensure the App ID is correctly set in agoraService.js
   - Check browser console for error messages

2. **"Cannot read property 'play' of undefined"**:

   - This usually means Agora couldn't access the camera
   - Make sure camera permissions are granted
   - Check if another application is using the camera

3. **Connection errors**:
   - Verify the App ID is correct
   - Check internet connection
   - Ensure ports are not blocked by a firewall

### Browser Compatibility

Agora SDK supports the following browsers:

- Chrome 58+
- Firefox 56+
- Safari 11+
- Edge 80+

## Future Improvements

Potential enhancements to the Agora implementation:

1. **Screen Sharing**: Add capability to share screen using Agora's screen sharing API
2. **Recording**: Implement server or cloud recording of study sessions
3. **Authentication Tokens**: Replace null tokens with server-generated tokens for security
4. **Participant Status**: Show when users are speaking, muted, or away
5. **Network Quality Indicator**: Display the quality of each participant's connection

## Resources

- [Agora Web SDK Documentation](https://docs.agora.io/en/video-calling/get-started/get-started-sdk)
- [Agora API Reference](https://api-ref.agora.io/en/video-sdk/web/4.x/index.html)
- [Agora Developer Portal](https://www.agora.io/en/developer-resources/)
