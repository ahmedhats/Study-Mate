# StudyMate Project Brief

## Project Overview

StudyMate is a comprehensive study platform designed to help students manage their study sessions, connect with peers, form communities, and collaborate effectively. The platform combines task management, study session scheduling, community features, and real-time messaging to create a complete ecosystem for effective studying.

## Core Project Goals

1. Provide a centralized platform for students to organize and track their study activities
2. Enable community formation around subjects, interests, or study goals
3. Facilitate real-time and asynchronous communication between students
4. Create structured study session experiences with built-in tools
5. Promote accountability and consistency in study habits

## Key Features

- **Task Management**: Create, organize, and track study tasks
- **Study Sessions**: Schedule, join, and participate in focused study sessions
- **Communities**: Create and join groups based on subjects or interests
- **Messaging**: Direct messages, community chats, and study session chats
- **User Profiles**: Track progress, statistics, and social connections
- **Real-time Collaboration**: Synchronous interaction during study sessions

## Technical Requirements

- **Backend**: Node.js, Express.js, MongoDB, Socket.IO
- **Frontend**: React, Ant Design, socket.io-client
- **Authentication**: JWT-based auth system
- **Real-time Communication**: WebSockets/Socket.IO
- **Responsive Design**: Mobile and desktop support

## Current Focus: Messaging System

The project is currently focused on implementing a comprehensive messaging system with the following capabilities:

- Direct messaging between users (1-on-1)
- Community chat rooms for group discussions
- Ephemeral study session chats that exist only for the duration of a session
- Real-time message delivery with typing indicators and read receipts
- Message history with appropriate persistence rules
- User presence indicators (online/offline status)

This messaging system is critical to the platform's success as it enables the social and collaborative aspects that differentiate StudyMate from simple productivity tools.
