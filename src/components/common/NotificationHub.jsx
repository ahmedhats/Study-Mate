import React, { useEffect, useState } from 'react';
import { notification } from 'antd';
import { MessageOutlined, UserAddOutlined, BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import websocketService from '../../services/websocket/websocketService';

/**
 * NotificationHub component that listens for real-time events and shows notifications
 * This component doesn't render any UI and should be mounted at the app root level
 */
const NotificationHub = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  // Get user data on component mount
  useEffect(() => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        setCurrentUser(parsed.user || parsed);
      }
    } catch (error) {
      console.error('Error parsing user data in NotificationHub:', error);
    }
  }, []);

  // Setup websocket listeners for real-time notifications
  useEffect(() => {
    if (!currentUser) return;

    // Handler for new message notifications
    const handleNewMessage = (data) => {
      // Don't show notification for messages from the current user
      if (data.message.senderId === currentUser._id) return;

      // Don't show notification if user is already on this conversation page
      const currentPath = window.location.pathname;
      if (currentPath.includes(`/messages/${data.conversationId}`)) return;

      notification.open({
        message: `New message from ${data.message.senderName}`,
        description: data.message.content.text,
        icon: <MessageOutlined style={{ color: '#1890ff' }} />,
        onClick: () => {
          navigate(`/messages/${data.conversationId}`);
        },
        placement: 'topRight',
        duration: 5,
      });
    };

    // Handler for friend request notifications
    const handleFriendRequest = (data) => {
      notification.open({
        message: 'New Friend Request',
        description: `${data.senderName} sent you a friend request`,
        icon: <UserAddOutlined style={{ color: '#52c41a' }} />,
        onClick: () => {
          navigate('/profile/social');
        },
        placement: 'topRight',
        duration: 5,
      });
    };

    // Subscribe to websocket events using the new Socket.IO-based service
    websocketService.subscribe('SERVER:NEW_MESSAGE', handleNewMessage);
    websocketService.subscribe('SERVER:FRIEND_REQUEST', handleFriendRequest);

    // Connect to the WebSocket server if not already connected
    if (!websocketService.socket || !websocketService.socket.connected) {
      websocketService.connect();
    }

    // Cleanup function
    return () => {
      websocketService.unsubscribe('SERVER:NEW_MESSAGE', handleNewMessage);
      websocketService.unsubscribe('SERVER:FRIEND_REQUEST', handleFriendRequest);
    };
  }, [currentUser, navigate]);

  // This component doesn't render anything
  return null;
};

export default NotificationHub; 