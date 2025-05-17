import React, { useState } from 'react';
import { Button, message } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getOrCreateDMConversation } from '../../../services/api/conversationService';

/**
 * A reusable button component that starts a direct message conversation with a user
 * 
 * @param {Object} props - Component props
 * @param {string} props.userId - The ID of the user to message
 * @param {boolean} props.showText - Whether to show "Message" text on the button
 * @param {string} props.type - Button type (default, primary, etc.)
 * @param {string} props.size - Button size (small, default, large)
 * @param {React.CSSProperties} props.style - Additional styles
 * @param {Function} props.onClick - Optional callback after conversation is created
 */
const DirectMessageButton = ({ 
  userId, 
  showText = true, 
  type = 'default', 
  size = 'default',
  style = {},
  onClick = null
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    e.stopPropagation(); // Prevent parent click events
    
    if (!userId) {
      message.error('Cannot start conversation: Missing user ID');
      return;
    }

    setLoading(true);
    try {
      // Get or create a DM conversation with this user
      const response = await getOrCreateDMConversation(userId);
      
      if (response.success) {
        if (onClick) {
          onClick(response.data);
        }
        // Navigate to the conversation
        navigate(`/messages/${response.data._id}`);
      } else {
        message.error('Could not start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      message.error('Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      icon={<MessageOutlined />}
      onClick={handleClick}
      type={type}
      size={size}
      loading={loading}
      style={style}
    >
      {showText && 'Message'}
    </Button>
  );
};

export default DirectMessageButton; 