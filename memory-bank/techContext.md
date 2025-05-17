# StudyMate Technical Context

## Technology Stack

### Backend

- **Runtime**: Node.js
- **Web Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time Communication**: Socket.IO (migrating from native WebSockets)
- **Authentication**: JWT (JSON Web Tokens)
- **API Pattern**: RESTful with WebSocket enhancement for real-time features

### Frontend

- **Framework**: React (Create React App)
- **UI Library**: Ant Design
- **State Management**: React Context API
- **Real-time Client**: socket.io-client
- **HTTP Client**: Custom fetch-based service
- **Date/Time Handling**: dayjs

### Development Tools

- **Version Control**: Git
- **Linting**: ESLint
- **Package Management**: npm
- **Environment Variables**: dotenv

## Architecture Pattern

The application follows a client-server architecture with:

1. **Backend**: RESTful API + WebSocket server

   - Express.js routes for CRUD operations
   - Socket.IO for real-time events
   - MongoDB for persistent storage
   - JWT for API authentication

2. **Frontend**: React Single Page Application (SPA)
   - Component-based UI architecture
   - Context API for state management
   - Service modules for API communication
   - Responsive design with Ant Design

## Database Schema

The MongoDB database includes these key collections:

- **Users**: User accounts, profiles, authentication info
- **Tasks**: Study tasks and assignments
- **StudySessions**: Scheduled and active study sessions
- **Communities**: Study groups and interest communities
- **FriendRequests**: Social connection requests
- **Conversations**: Message groupings (DM, community, study session)
- **Messages**: Individual chat messages

## Technical Constraints

1. **Authentication**: All API endpoints require JWT authentication except for auth routes
2. **Real-time Events**: Socket.IO connections also require JWT authentication
3. **Data Protection**: User data is isolated with proper access controls
4. **Mongoose Models**: Strong typing and validation at the model level
5. **Error Handling**: Standardized error responses across the API
6. **Stateless Backend**: No server-side sessions (JWT-based auth)

## Development Environment

- **Backend Server**: Runs on port 5000 by default
- **Frontend Development Server**: Runs on port 3000 by default
- **MongoDB**: Local development typically uses a local MongoDB instance or MongoDB Atlas
- **Environment Variables**: Stored in .env files (not committed to version control)

## API Structure

The API is organized into these main areas:

- `/api/auth`: Authentication (login, register, token refresh)
- `/api/users`: User management
- `/api/tasks`: Task management
- `/api/study-sessions`: Study session management
- `/api/social`: Social connections (friends)
- `/api/community`: Community management
- `/api`: Message and conversation management

## Frontend Organization

The frontend codebase is organized as:

- `/src/components`: UI components (organized by feature)
- `/src/services`: API and utility services
- `/src/contexts`: React Context providers
- `/src/hooks`: Custom React hooks
- `/src/utils`: Utility functions
- `/src/pages`: Page components that compose from smaller components
