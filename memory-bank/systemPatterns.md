# StudyMate System Patterns

## Architectural Overview

StudyMate follows a layered architecture separated into distinct backend and frontend components:

```
Frontend (React SPA)
┌─────────────────────────────────────┐
│                                     │
│  ┌───────────┐      ┌───────────┐  │
│  │ Components│◄────►│  Contexts │  │
│  └───────────┘      └───────────┘  │
│         ▲                  ▲       │
│         │                  │       │
│         ▼                  ▼       │
│  ┌───────────┐      ┌───────────┐  │
│  │  Services │◄────►│   Hooks   │  │
│  └───────────┘      └───────────┘  │
│         │                          │
└─────────┼──────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│        API (HTTP + WebSocket)       │
└─────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│    Backend (Express + Socket.IO)    │
│                                     │
│  ┌───────────┐      ┌───────────┐  │
│  │  Routes   │◄────►│Controllers│  │
│  └───────────┘      └───────────┘  │
│         │                  ▲       │
│         ▼                  │       │
│  ┌───────────┐      ┌───────────┐  │
│  │ Services  │◄────►│   Models  │  │
│  └───────────┘      └───────────┘  │
│                                     │
└─────────────────────────────────────┘
```

## Key Design Patterns

### 1. Service-Oriented Architecture

- **Backend Services**: Encapsulate business logic separate from controllers
- **Frontend Services**: Handle API calls and data transformation

### 2. Repository Pattern

- Mongoose models act as repositories for data access
- Service layer calls repository methods rather than direct DB operations

### 3. Singleton Pattern

- WebSocket service is implemented as a singleton
- Ensures a single WebSocket connection per client

### 4. Observer Pattern

- WebSocket event system uses observers (subscribers)
- Components subscribe to specific message types

### 5. Context Provider Pattern

- React Context API for state management
- Provides application state to component tree without prop drilling

### 6. Component Composition

- UI built from nested, reusable components
- Higher-order components for shared functionality

## Key Technical Decisions

### 1. Authentication Strategy

- JWT-based authentication for both REST API and WebSockets
- Token stored in localStorage and included in API/WebSocket requests
- Token refresh mechanism to maintain sessions

### 2. Real-time Communication

- Socket.IO chosen over raw WebSockets for:
  - Built-in reconnection handling
  - Room-based message broadcasting
  - Cross-browser compatibility
  - Fallback to polling when WebSockets unavailable

### 3. Data Flow Patterns

- **Frontend to Backend**:
  - HTTP for CRUD operations
  - WebSocket for real-time events
- **Backend to Frontend**:
  - HTTP responses for data fetching
  - WebSocket events for real-time updates

### 4. Error Handling

- Standardized API error responses
- Centralized error handling middleware
- Client-side error boundary components

## Messaging System Architecture

The messaging system follows these specific patterns:

### 1. Conversation Model

- **Types**: DM, COMMUNITY, STUDY_SESSION
- Participants tracked with user references and metadata
- Last message stored for preview/summary

### 2. Socket.IO Room Pattern

- Each conversation has a corresponding Socket.IO room
- Users join/leave rooms based on active conversations
- Messages broadcasted to all users in a room

### 3. Message Persistence Rules

- **DM & Community Messages**: Persistent storage
- **Study Session Messages**: Temporary, deleted after session ends

### 4. Real-time Event System

```
Client → Server Events:
┌───────────────────┐  ┌───────────────────┐
│ CLIENT:SEND_MESSAGE│  │CLIENT:TYPING_START│
└───────────────────┘  └───────────────────┘
┌───────────────────┐  ┌───────────────────┐
│ CLIENT:TYPING_STOP │  │ CLIENT:JOIN_ROOM  │
└───────────────────┘  └───────────────────┘

Server → Client Events:
┌───────────────────┐  ┌───────────────────┐
│ SERVER:NEW_MESSAGE │  │SERVER:TYPING_START│
└───────────────────┘  └───────────────────┘
┌───────────────────┐  ┌───────────────────┐
│ SERVER:TYPING_STOP │  │SERVER:USER_UPDATE │
└───────────────────┘  └───────────────────┘
```

## Frontend UI Component Relationships

```
MessagingPage
├── ConversationList
│   └── ConversationItem (for each conversation)
└── ChatContainer (selected conversation)
    ├── ChatHeader
    ├── MessageList
    │   └── MessageItem (for each message)
    └── ChatInput
```

## Backend API Structure for Messaging

```
/api/conversations
├── GET / - List user's conversations
├── GET /:conversationId/messages - Get messages
├── POST /:conversationId/messages - Send message
├── GET /dm/:userId - Get/create DM conversation
├── POST /:conversationId/read - Mark as read
├── POST /study-session/:sessionId - Create study session chat
└── DELETE /study-session/:sessionId - End study session chat
```

## Scaling Considerations

The architecture is designed with future scaling in mind:

- Models separated from business logic
- Socket handlers modularized by feature
- Database indexes on frequently queried fields
- Message pagination to handle large conversation history
