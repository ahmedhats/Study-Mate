import React, { useState } from 'react';
import { Button, Tooltip, message, Modal } from 'antd';
import { MessageOutlined, UserAddOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { createStudySessionConversation } from '../../../services/api/conversationService';

/**
 * Component for study session actions like starting a group chat
 */
const StudySessionActions = ({ session, onChatCreated }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const handleCreateChat = async () => {
    setLoading(true);
    try {
      const response = await createStudySessionConversation(
        session._id, 
        session.participants.map(p => p._id)
      );
      
      if (response.success) {
        message.success('Study session chat created successfully!');
        
        if (onChatCreated) {
          onChatCreated(response.data);
        }
        
        // Navigate to the conversation
        navigate(`/messages/${response.data._id}`);
      } else {
        throw new Error(response.message || 'Failed to create study session chat');
      }
    } catch (error) {
      console.error('Error creating study session chat:', error);
      message.error('Failed to create study session chat: ' + error.message);
    } finally {
      setLoading(false);
      setConfirmModalVisible(false);
    }
  };

  // No need to create a chat if one already exists
  if (session.conversationId) {
    return (
      <Button 
        type="primary" 
        icon={<MessageOutlined />}
        onClick={() => navigate(`/messages/${session.conversationId}`)}
      >
        Open Chat
      </Button>
    );
  }

  return (
    <>
      <Tooltip title="Create a group chat for this study session">
        <Button 
          type="primary" 
          icon={<MessageOutlined />}
          onClick={() => setConfirmModalVisible(true)}
          loading={loading}
        >
          Create Chat
        </Button>
      </Tooltip>

      <Modal
        title="Create Study Session Chat"
        open={confirmModalVisible}
        onCancel={() => setConfirmModalVisible(false)}
        onOk={handleCreateChat}
        okText="Create Chat"
        cancelText="Cancel"
        confirmLoading={loading}
      >
        <p>
          Do you want to create a group chat for this study session?
        </p>
        <p>
          All session participants will be added to the conversation automatically.
        </p>
      </Modal>
    </>
  );
};

export default StudySessionActions; 