# Statement of Work: Messaging Feature for StudyMate

## 1. Introduction

This document outlines the scope, architecture, and implementation plan for the new Messaging Feature in the StudyMate application. The goal is to provide users with real-time communication capabilities, including direct messages, community chats, and temporary chats within study sessions.

## 2. Requirements

### 2.1. Functional Requirements:

- **F1: Send/Receive Messages:** Users can send and receive messages across different chat types.
- **F2: Community Chat:**
  - **F2.1:** Non-members can view messages; only members can send.
  - **F2.2:** Display study session announcements within the community chat.
  - **F2.3:** "Create Study Session" from community chat UI.
  - **F2.4:** "Join Study Session" from announcements in community chat.
- **F3: User Identification:** Messages clearly indicate the sender.
- **F4: Real-time Updates:** Messages appear in real-time.
- **F5: Direct Messaging (1-on-1):** Implemented.
- **F6: Study Session Chat:**
  - **F6.1:** Distinct chat room for participants of a specific study session.
  - **F6.2:** Messages are associated with an active study session. Upon session end, these messages are deleted from persistent storage.
  - **F6.3:** Assumed self-contained dedicated view for MVP.
- **F7: Conversation List:** Users can see a list of their ongoing community chats, study session chats (active ones), and direct messages.
- **F8: Message History:** Users can view past messages (for DMs and Community Chats; for Study Session chats, history is limited to the session's duration).
- **F9: User Presence:** Online/offline status indicators (via Socket.IO for active chat users, supplemented by existing `lastActive` polling).
- **F10: Typing Indicators:** Recommended if feasible within MVP, otherwise post-MVP.
- **F11: Read Receipts/Unread Indicators:** Implemented via a `lastReadTimestamp` per user per conversation. Client highlights messages newer than this or shows a "new messages" line.
- **F12: Notifications (In-app):** In-app notifications for new messages when the specific chat is not active/visible.
- **F13: Message Content (MVP):** Text-based messages and system notifications (e.g., "User X created study session"). Image/file sharing is post-MVP.
- **F14: Message Deletion/Editing by User:** Out of scope for MVP.

### 2.2. Non-Functional Requirements:

- **NF1: Performance:** Low latency message delivery (<2s), fast history loading.
- **NF2: Scalability:** Handle growing users/messages (initial focus on single server instance, plan for future scaling).
- **NF3: Security:** Authorization for chat access, input sanitization (basic).
- **NF4: Maintainability:** Well-structured, commented code.
- **NF5: Reliability:** Minimize message loss, robust to minor connection issues.
- **NF6: Data Integrity:** Accurate storage/retrieval of messages.

## 3. Tech Stack

- **Backend:** Node.js, Express.js, **Socket.IO** (migrating from `ws`), MongoDB.
- **Frontend:** React, **socket.io-client** (updating `websocketService.js`), Ant Design, `dayjs`.
- **Authentication:** JWT.
- **State Management (Frontend Messaging):** React Context initially.

## 4. Architecture Design

### 4.1. Backend Components:

- **Models (Mongoose):**
  - `user.model.js` (existing, minor touch for `lastReadTimestamp` if needed directly on user).
  - `conversation.model.js` (New): Tracks conversations (DM, Community, Study Session), participants (with `lastReadTimestamp`), `lastMessage`.
  - `message.model.js` (New): Stores individual messages (content type 'TEXT' or 'SYSTEM_NOTIFICATION' for MVP), `senderId`, `conversationId`, `timestamp`.
- **Services:**
  - `conversation.service.js`: Logic for managing conversations.
  - `message.service.js`: Logic for managing messages (saving, retrieving, deleting session chats).
- **Controllers:**
  - `conversation.controller.js`: HTTP API for conversation management.
  - `message.controller.js`: HTTP API for message history.
- **Real-time:**
  - `socket.handler.js`: Manages all Socket.IO server-side logic (authentication, rooms, message broadcasting, presence, typing, read receipts).
  - `server.js`: Initializes Socket.IO.

### 4.2. Frontend Components:

- **Services:**
  - `websocketService.js` (Refactored for `socket.io-client`): Handles WebSocket communication.
  - `conversationService.js` (New): HTTP calls for conversations.
  - `messageService.js` (New): HTTP calls for messages.
- **Context:**
  - `MessagingContext.js` (New): Manages global messaging state (conversations, active messages, unread status, socket connection).
- **UI Components (React with Ant Design):**
  - `ConversationList.jsx` (New): Displays user's chats.
  - `DirectMessageView.jsx` (New): UI for 1-on-1 chats.
  - `CommunityChat.jsx` (Enhanced): Integrates with new services/context.
  - `StudySessionChatView.jsx` (New): UI for temporary study session chats.
  - `NotificationManager.jsx` (New/Integrated): Handles in-app new message notifications.

### 4.3. Database Schema Highlights:

- **`conversations`:**
  - `_id`, `type`, `participants: [{userId, joinedAt, lastReadTimestamp}]`, `communityId?`, `studySessionId?`, `lastMessage: {text, senderId, timestamp}`, `createdAt`, `updatedAt`.
- **`messages`:**
  - `_id`, `conversationId`, `senderId`, `content: {type, text}`, `timestamp`.

### 4.4. Socket.IO Events (Conceptual):

- **Client -> Server:** `JOIN_ROOM`, `LEAVE_ROOM`, `SEND_MESSAGE`, `TYPING_START`, `TYPING_STOP`, `MESSAGE_READ_CONFIRMATION` (to update `lastReadTimestamp`).
- **Server -> Client:** `NEW_MESSAGE`, `TYPING_EVENT`, `USER_PRESENCE_UPDATE` (broadcast to all, client filters), `CONVERSATION_UPDATED`, `ERROR`.

## 5. Implementation Plan (Phased Checklist)

**Phase 1: Backend Foundation & Core Models (Parallel with Frontend Setup)**

- [ ] **Task 1.1 (Backend):** Project Setup for `Socket.IO`.
  - [ ] Install `socket.io` package.
  - [ ] Refactor `Backend/server.js`: Initialize `Socket.IO` server instead of `ws`.
  - [ ] Create `Backend/socket.handler.js` and move/adapt Socket.IO connection & JWT authentication logic.
- [ ] **Task 1.2 (Backend):** Define Mongoose Models.
  - [ ] Create `Backend/models/conversation.model.js` schema.
  - [ ] Create `Backend/models/message.model.js` schema (MVP: 'TEXT' & 'SYSTEM_NOTIFICATION').
- [ ] **Task 1.3 (Backend):** Implement core `conversation.service.js`.
  - [ ] Function: `getOrCreateDMConversation(userId1, userId2)`.
  - [ ] Function: `getUserConversations(userId)` (basic: IDs, participants, type, lastMessage).
  - [ ] Function: `addParticipantToConversation(conversationId, userId, isStudySessionContext?)`.
  - [ ] Function: `updateUserLastReadTimestamp(conversationId, userId, timestamp)`.
  - [ ] Function: `updateConversationLastMessage(conversationId, messageObject)`.
- [ ] **Task 1.4 (Backend):** Implement core `message.service.js`.
  - [ ] Function: `saveMessage(conversationId, senderId, content)` returns new message.
  - [ ] Function: `getMessagesForConversation(conversationId, paginationOptions)` returns messages.
  - [ ] Function: `deleteMessagesForConversation(conversationId)` (for study sessions).
- [ ] **Task 1.5 (Frontend):** Setup `socket.io-client`.
  - [ ] Install `socket.io-client` package.
  - [ ] Refactor `src/services/websocket/websocketService.js` to use `socket.io-client`, connect to backend, handle basic connect/disconnect, and manage JWT token for connection.

**Phase 2: Direct Messaging (DM) - Backend & Frontend**

- [ ] **Task 2.1 (Backend):** Socket.IO - DM Functionality in `socket.handler.js`.
  - [ ] Event Listener: `CLIENT:JOIN_ROOM` (`socket.join(data.conversationId)`).
  - [ ] Event Listener: `CLIENT:SEND_MESSAGE` (for DM type):
    - [ ] Call `message.service.saveMessage()`.
    - [ ] Call `conversation.service.updateLastMessage()`.
    - [ ] `io.to(data.conversationId).emit('SERVER:NEW_MESSAGE', savedMessage)`.
  - [ ] Presence: On socket connect/disconnect, store `userId` to `socketId(s)` mapping. Emit `SERVER:USER_PRESENCE_UPDATE {userId, status}` to all clients.
- [ ] **Task 2.2 (Backend):** HTTP API for DM.
  - [ ] `conversation.routes.js` (New) & `message.routes.js` (New).
  - [ ] `conversation.controller.js` (New):
    - [ ] `POST /api/conversations/dm` (body: `{otherUserId}`): Uses `conversation.service.getOrCreateDMConversation()`.
    - [ ] `GET /api/conversations`: Uses `conversation.service.getUserConversations()`.
    - [ ] `POST /api/conversations/:conversationId/read`: Uses `conversation.service.updateUserLastReadTimestamp()`.
  - [ ] `message.controller.js` (New):
    - [ ] `GET /api/messages/:conversationId`: Uses `message.service.getMessagesForConversation()`.
- [x] **Task 2.3 (Frontend):** Create `MessagingContext.js`.
  - [x] State: `conversations`, `activeConversationId`, `activeConversationMessages`, `socketConnected`, `userPresenceMap` (Initial structure created).
  - [x] Handlers for socket events (`SERVER:NEW_MESSAGE`, `SERVER:USER_STATUS`, `SERVER:CONVERSATION_UPDATED`) (Initial structure created).
  - [x] Actions: `selectConversation(conversationId)`, `sendMessage(conversationId, content)`, `markConversationAsRead(conversationId)` (Initial structure created).
- [ ] **Task 2.4 (Frontend):** API Services (`conversationService.js`, `messageService.js`).
  - [ ] `conversationService.js`: `fetchConversations()`, `createDMConversation(otherUserId)`, `markAsRead(conversationId)`.
  - [ ] `messageService.js`: `fetchMessages(conversationId, paginationOptions)`.
- [ ] **Task 2.5 (Frontend):** Create `ConversationList.jsx`.
  - [ ] Fetch and display DMs from `MessagingContext`.
  - [ ] Handle selection to update `activeConversationId` in context.
  - [ ] Indicate unread messages based on `lastReadTimestamp` vs `lastMessage.timestamp`.
- [ ] **Task 2.6 (Frontend):** Create `DirectMessageView.jsx`.
  - [ ] Get `activeConversationId` from context; fetch messages if `activeConversationId` changes & messages not loaded.
  - [ ] Display messages from `MessagingContext.activeConversationMessages`.
  - [ ] Input to send messages via `MessagingContext.sendMessage()`.
  - [ ] Call `MessagingContext.markConversationAsRead()` on view focus or new message received for current chat.
  - [ ] Display online status of other participant from `MessagingContext.userPresenceMap`.

**Phase 3: Community Chat Integration**

- [ ] **Task 3.1 (Backend):** Link `Conversation` model to Communities.
  - [ ] When a community is created (or via a migration script), ensure a corresponding `Conversation` document (type: `COMMUNITY`, `communityId` set) is created.
  - [ ] When a user joins/leaves a community, update their participation in the corresponding `Conversation` document (for `lastReadTimestamp` tracking).
- [ ] **Task 3.2 (Backend):** Socket.IO - Community Chat in `socket.handler.js`.
  - [ ] `CLIENT:JOIN_ROOM`: Allow joining community chat rooms (e.g., `community_${communityId}`).
  - [ ] `CLIENT:SEND_MESSAGE`: Handle messages for community type (similar to DM, but room is community-based).
- [ ] **Task 3.3 (Backend):** HTTP API - Ensure `GET /api/conversations` returns community conversations.
- [ ] **Task 3.4 (Frontend):** Enhance `CommunityChat.jsx`.
  - [ ] Integrate with `MessagingContext` and `websocketService.js` for real-time messages, sending, and history.
  - [ ] Use `activeConversationId` from context (set when user selects a community chat from `ConversationList.jsx`).
- [ ] **Task 3.5 (Frontend):** `ConversationList.jsx` to display community chats.
- [ ] **Task 3.6 (Backend/Frontend):** System Notifications in Community Chat (e.g., "User X created study session").
  - [ ] Backend: Mechanism to inject system messages into a community conversation.
  - [ ] Frontend: Display system messages with a distinct style.

**Phase 4: Study Session Chat**

- [ ] **Task 4.1 (Backend):** Study Session Chat Lifecycle.
  - [ ] When a study session is created/starts: Create a `Conversation` (type: `STUDY_SESSION`, `studySessionId` set, participants added).
  - [ ] `socket.handler.js`: Handle joining/leaving study session chat rooms (e.g., `session_${studySessionId}`). Message sending similar to other types.
  - [ ] When a study session status changes to ended/completed/cancelled:
    - [ ] Trigger `message.service.deleteMessagesForConversation(studySessionConversationId)`.
    - [ ] Optionally, delete or mark the `STUDY_SESSION` conversation document as inactive.
    - [ ] Emit a socket event to notify clients in the room that the session chat has ended.
- [ ] **Task 4.2 (Frontend):** `StudySessionChatView.jsx`.
  - [ ] UI for temporary session chat.
  - [ ] Fetches active study session chat from `MessagingContext` (based on `activeConversationId`).
  - [ ] Handles display and sending of messages.
  - [ ] Handles socket event for session chat end (e.g., clear messages, show "chat ended" message).
- [ ] **Task 4.3 (Frontend):** `ConversationList.jsx` to display _active_ study session chats.

**Phase 5: Polish & Stretch Goals (If time permits for MVP)**

- [ ] **Task 5.1 (Backend & Frontend):** Typing Indicators.
  - [ ] Socket events: `CLIENT:TYPING_START`/`STOP`, `SERVER:TYPING_EVENT`.
  - [ ] Frontend UI: Display "User is typing..."
- [ ] **Task 5.2 (Frontend):** In-app notifications.
  - [ ] `NotificationManager.jsx` or logic in `MessagingContext` to show a toast/notification if a new message arrives for a non-active chat.
- [ ] **Task 5.3 (General):** Thorough testing and bug fixing.
- [ ] **Task 5.4 (Backend):** Refine presence updates (if broadcasting to all is too noisy, make it more targeted, e.g., to friends or room members only).

## 6. Success Criteria (MVP)

- Users can reliably send/receive DMs, Community Chat messages, and Study Session Chat messages in real-time.
- Conversation list correctly displays all chat types the user is part of.
- Unread message indication (via `lastReadTimestamp`) functions correctly.
- Basic online/offline presence is visible for users in chat contexts.
- Study session chats are ephemeral and their messages are deleted post-session.
- The system is secure against unauthorized access.

---

This SOW.md should be updated as tasks are worked on to show progress. Mark checkboxes as tasks are completed.
