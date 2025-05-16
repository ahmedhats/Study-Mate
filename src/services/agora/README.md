# Agora Video Integration for Study-Mate

This folder contains the Agora RTM/RTC SDK implementation for video calls in Study-Mate. This implementation replaces the previous WebRTC solution to provide more reliable video calling, especially for group study sessions.

## Setup Instructions

### 1. Create an Agora Account

1. Sign up for a free account at [Agora.io](https://www.agora.io/)
2. Create a new project in the Agora Console
3. Get your App ID from the project dashboard

### 2. Update App ID in agoraService.js

Open `agoraService.js` and replace the placeholder with your Agora App ID:

```javascript
const appId = "your-agora-app-id"; // Replace this with your actual App ID
```

## Features

- **Reliable Video Calling**: Uses Agora's global network for better connections
- **Audio/Video Controls**: Mute/unmute audio, enable/disable video
- **Mock Session Support**: Works with offline/mock sessions
- **Multiple Participants**: Supports group video calls with multiple users
- **Error Handling**: Gracefully handles connection errors

## How It Works

The Agora integration consists of:

1. **agoraService.js**: Core service that manages Agora connections and state
2. **AgoraVideo.jsx**: React components for video display
3. **AgoraStudyRoom.jsx**: Main study room component using Agora

### Mock Session Handling

A key feature of this implementation is its ability to work with mock sessions. When the backend is unavailable:

1. The system detects if the sessionId starts with "mock-"
2. It converts this to a valid Agora channel name
3. The session continues to work in offline mode

## Troubleshooting

Common issues and solutions:

1. **No video/audio**: Check browser permissions for camera and microphone
2. **Connection failures**: Verify your App ID is correct
3. **"Cannot read property play of undefined"**: Usually means Agora couldn't access your camera
4. **Blank video frames**: Try refreshing the browser or checking if camera is in use by another application

## Browser Compatibility

- Chrome 58+
- Firefox 56+
- Safari 11+
- Edge 80+

## Resources

- [Agora Web SDK Documentation](https://docs.agora.io/en/video-calling/get-started/get-started-sdk)
- [Agora API Reference](https://api-ref.agora.io/en/video-sdk/web/4.x/index.html)

## License

Agora SDK has its own license terms. Make sure to review them at [Agora's website](https://www.agora.io/en/terms-of-service/).

## Improvements Over Previous Implementation

The Agora implementation solves several key issues from the previous WebRTC approach:

1. **Connection Reliability**: Avoids peer-to-peer connection failures
2. **Browser Compatibility**: Works across all modern browsers without polyfills
3. **Scalability**: Better handles multiple participants
4. **Server Load**: Reduces server-side signaling complexity
