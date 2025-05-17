import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Input,
  Button,
  List,
  Avatar,
  Typography,
  Spin,
  Empty,
  Alert,
  Card,
  Space,
} from 'antd';
import { SendOutlined, UserOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useMessaging } from '../../../context/MessagingContext';
import websocketService from '../../../services/websocket/websocketService';

const { Text } = Typography;
const { TextArea } = Input;

// Avatar color utility (can be moved to a shared utils file)
const getAvatarColor = (name) => {
  if (!name) return "#1890ff";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#f56a00", "#7265e6", "#ffbf00", "#00a2ae", "#1890ff", "#52c41a"];
  return colors[Math.abs(hash) % colors.length];
};

const StudySessionChatView = ({ studySessionId, currentUser, onChatEnd }) => {
  const {
    activeConversationId, // This should correspond to the study session's conversation
    activeConversationMessages,
    loading,
    error,
    actions,
  } = useMessaging();

  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const messagesEndRef = useRef(null);

  const handleChatEnded = useCallback((data) => {
    if (data.studySessionId === studySessionId || data.conversationId === activeConversationId) {
      setChatEnded(true);
      if (onChatEnd) {
        onChatEnd(data.status); // Notify parent component
      }
    }
  }, [studySessionId, activeConversationId, onChatEnd]);

  useEffect(() => {
    websocketService.subscribe('SERVER:STUDY_SESSION_CHAT_ENDED', handleChatEnded);
    return () => {
      websocketService.unsubscribe('SERVER:STUDY_SESSION_CHAT_ENDED', handleChatEnded);
    };
  }, [handleChatEnded]);

  useEffect(() => {
    // Reset chat ended state if the active conversation changes to a new, active one
    // or if the component is for a different study session
    setChatEnded(false);
  }, [activeConversationId, studySessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversationMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !activeConversationId || chatEnded) return;

    setIsSending(true);
    const messageContent = {
      type: 'TEXT',
      text: newMessage.trim(),
    };

    try {
      await actions.sendMessage(activeConversationId, messageContent);
      setNewMessage('');
    } catch (sendError) {
      // Error state is set in context by actions.sendMessage
    } finally {
      setIsSending(false);
    }
  };

  const renderMessageItem = (item) => {
    if (!currentUser) return null;
    const isSender = item.senderId === currentUser._id || item.senderId === currentUser.id;
    const avatarColor = getAvatarColor(item.senderName);

    return (
      <List.Item
        key={item._id || `pending-${item.timestamp}`}
        style={{
          textAlign: isSender ? 'right' : 'left',
          marginBottom: '10px',
          paddingRight: isSender ? 0 : '20%',
          paddingLeft: isSender ? '20%' : 0,
        }}
        className={isSender ? 'message-sent' : 'message-received'}
      >
        <Space direction="vertical" align={isSender ? 'end' : 'start'} style={{ width: '100%' }}>
          <Space align="start">
            {!isSender && (
              <Avatar
                src={item.senderAvatar}
                style={{ backgroundColor: !item.senderAvatar ? avatarColor : undefined }}
                icon={!item.senderAvatar && <UserOutlined />}
              >
                {!item.senderAvatar && item.senderName ? item.senderName[0].toUpperCase() : null}
              </Avatar>
            )}
            <Card
              size="small"
              bodyStyle={{
                padding: '8px 12px',
                backgroundColor: isSender ? '#1890ff' : '#f0f0f0',
                color: isSender ? 'white' : 'black',
                borderRadius: isSender ? '15px 15px 0 15px' : '15px 15px 15px 0',
              }}
              style={{ border: 'none' }}
            >
              {!isSender && <Text strong style={{display: 'block', marginBottom: '2px'}}>{item.senderName}</Text>}
              <Text style={{ color: isSender ? 'white' : 'black' }}>
                {item.content?.text || item.text}
              </Text>
            </Card>
            {isSender && (
              <Avatar
                src={currentUser.avatar}
                style={{ backgroundColor: !currentUser.avatar ? getAvatarColor(currentUser.name) : undefined }}
                icon={!currentUser.avatar && <UserOutlined />}
              >
                {!currentUser.avatar && currentUser.name ? currentUser.name[0].toUpperCase() : null}
              </Avatar>
            )}
          </Space>
          <Text type="secondary" style={{ fontSize: '11px', padding: '0 5px' }}>
            {new Date(item.timestamp || item.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            {item.pending && <Spin size="small" style={{marginLeft: 5}}/>}
          </Text>
        </Space>
      </List.Item>
    );
  };

  if (loading.messages && !activeConversationMessages.length && !chatEnded) {
    return <div style={{textAlign: 'center', padding: '50px'}}><Spin tip="Loading chat..." size="large"/></div>;
  }

  if (error && error.type === 'fetch' && error.message.includes(activeConversationId) && !chatEnded) {
      return <Alert message="Error" description={`Failed to load messages: ${error.message}`} type="error" showIcon style={{margin: 20}}/>;
  }

  if (chatEnded) {
    return (
      <Empty 
        description="This study session chat has ended." 
        image={Empty.PRESENTED_IMAGE_SIMPLE} 
        style={{padding: '50px'}}
      />
    );
  }
  
  if (!activeConversationId) {
    return (
        <Empty 
            description="Study session chat not selected or available."
            style={{padding: '50px'}}
        />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '500px' /* Example max height */ }}>
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '10px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
        {activeConversationMessages.length === 0 && !loading.messages && (
          <Empty description="No messages yet. Be the first to say something!" />
        )}
        <List
          dataSource={activeConversationMessages}
          renderItem={renderMessageItem}
          split={false}
        />
        <div ref={messagesEndRef} />
      </div>
      <div style={{ padding: '10px 0 0 0', borderTop: '1px solid #f0f0f0', marginTop: '10px' }}>
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            autoSize={{ minRows: 1, maxRows: 3 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isSending || chatEnded}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={isSending}
            disabled={chatEnded}
          />
        </Space.Compact>
      </div>
    </div>
  );
};

export default StudySessionChatView; 