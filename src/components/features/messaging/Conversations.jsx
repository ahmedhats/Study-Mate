import React, { useState, useMemo } from 'react';
import { List, Typography, Badge, Avatar, Skeleton, Empty, Tabs, Spin, Button } from 'antd';
import { UserOutlined, TeamOutlined, BookOutlined, MessageOutlined } from '@ant-design/icons';
import { useMessaging } from '../../../context/MessagingContext';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

// Helper function to generate an avatar color based on name (reused from ChatContainer)
const getAvatarColor = (name) => {
  if (!name) return "#1890ff";

  // Simple hash function for the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert hash to a color
  const colors = [
    "#f56a00", "#7265e6", "#ffbf00", "#00a2ae",
    "#1890ff", "#52c41a", "#722ed1", "#eb2f96", "#faad14"
  ];

  return colors[Math.abs(hash) % colors.length];
};

// Helper to get the conversation title
const getConversationTitle = (conversation, currentUserId) => {
  if (!conversation || !currentUserId) return "Chat";
  if (conversation.type === "DM") {
    const otherParticipant = conversation.participants.find(
      p => {
        const participantId = p.userId?._id || p.userId;
        return participantId !== currentUserId;
      }
    );
    return otherParticipant?.userId?.name || "Unknown User";
  } 
  return conversation.title || conversation.communityName || "Untitled Conversation";
};

// Helper to get the conversation avatar
const getConversationAvatar = (conversation, currentUserId) => {
  if (!conversation || !currentUserId) return null;
  if (conversation.type === "DM") {
    const otherParticipant = conversation.participants.find(
      p => {
        const participantId = p.userId?._id || p.userId; 
        return participantId !== currentUserId;
      }
    );
    return otherParticipant?.userId?.avatar;
  }
  
  return null; // For other types, we'll use icon instead of avatar
};

const ConversationList = ({ onConversationSelect, selectedConversationId, currentUser }) => {
  const { 
    conversations: allConversations,
    loading,
    error,
    activeConversationId
  } = useMessaging();
  
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  // If selectedConversationId is passed from the URL, it should be used
  // Otherwise fall back to the activeConversationId from context (which might come from localStorage)
  const currentlySelectedId = selectedConversationId || activeConversationId;

  const handleTabChange = (key) => {
    setActiveTab(key);
  };
  
  const filteredConversations = useMemo(() => {
    if (!allConversations) return [];
    if (activeTab === "all") return allConversations;
    const typeMap = {
      dm: "DM",
      community: "COMMUNITY",
      studySession: "STUDY_SESSION"
    };
    return allConversations.filter(c => c.type === typeMap[activeTab]);
  }, [allConversations, activeTab]);

  // Check if user has unread messages
  const hasUnreadMessages = (conversation) => {
    if (!currentUser || !conversation || !conversation.participants) return false;
    
    const userParticipant = conversation.participants.find(
      p => {
        const participantId = p.userId?._id || p.userId;
        const currentUserId = currentUser?.user?._id || currentUser?._id || currentUser?.id || currentUser?.user?.id;
        return participantId === currentUserId;
      }
    );
    
    if (!userParticipant || !conversation.lastMessage) return false;
    
    const lastMessageTime = new Date(conversation.lastMessage.timestamp).getTime();
    const lastReadTime = userParticipant.lastReadTimestamp ? new Date(userParticipant.lastReadTimestamp).getTime() : 0;
    
    return lastMessageTime > lastReadTime;
  };

  // Handle conversation selection
  const handleConversationClick = (conversationId) => {
    if (onConversationSelect) {
      onConversationSelect(conversationId);
    }
  };

  // Define tab items
  const tabItems = [
    { key: 'all', label: 'All' },
    { key: 'dm', label: 'DM' },
    { key: 'community', label: 'Communities' },
    { key: 'studySession', label: 'Study Sessions' }
  ];

  if (loading.initialConversations) {
    // If we have a selected conversation ID but are still loading, show a more focused loading state
    if (currentlySelectedId) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Tabs 
            defaultActiveKey="all" 
            onChange={handleTabChange} 
            centered 
            style={{padding: '0 16px', flexShrink: 0}}
            items={tabItems}
          />
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <Spin />
            <div style={{ marginTop: '10px' }}>Loading conversations...</div>
            <div style={{ marginTop: '10px', color: '#1890ff' }}>
              Selected conversation: {currentlySelectedId}
              <br />
              <small style={{ color: '#888' }}>
                If this persists, the conversation may no longer exist
              </small>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '20px' }}>
          <Skeleton avatar paragraph={{ rows: 1 }} active />
          <Skeleton avatar paragraph={{ rows: 1 }} active />
          <Skeleton avatar paragraph={{ rows: 1 }} active />
        </div>
      </div>
    );
  }

  if (error && error.type === 'fetch' && error.message.includes('conversations')) {
    return <Empty description={error.message || "Failed to load conversations"} style={{ marginTop: 20}} />;
  }

  // If not loading and no conversations from context after fetch attempt (and no specific error caught above)
  if (!loading.initialConversations && (!allConversations || allConversations.length === 0) && !error) {
    return <Empty description="You have no conversations yet." style={{ marginTop: 20}} />;
  }
  
  // If there are conversations, but the current filter yields none
  if (filteredConversations.length === 0 && activeTab !== 'all') {
     // Keep rendering tabs, but the list below will be empty or show a specific empty message for the tab
  }

  const renderConversationItem = (conversation) => {
    if (!currentUser) return null;
    
    // Get current user ID consistently
    const currentUserId = currentUser?.user?._id || currentUser?._id || currentUser?.id || currentUser?.user?.id;
    if (!currentUserId) return null;
    
    const title = getConversationTitle(conversation, currentUserId);
    const avatarSrc = getConversationAvatar(conversation, currentUserId);
    const isUnread = hasUnreadMessages(conversation);
    
    // Use currentlySelectedId which combines URL param and localStorage value
    const isSelected = currentlySelectedId === conversation._id;
    
    let avatarComponent;
    if (conversation.type === "DM") {
      const avatarColor = getAvatarColor(title);
      avatarComponent = (
        <Avatar 
          src={avatarSrc} 
          style={{ backgroundColor: !avatarSrc ? avatarColor : undefined }}
          icon={!avatarSrc && <UserOutlined />}
        >
          {!avatarSrc && title ? title.charAt(0).toUpperCase() : null}
        </Avatar>
      );
    } else if (conversation.type === "COMMUNITY") {
      avatarComponent = (
        <Avatar style={{ backgroundColor: '#1890ff' }} icon={<TeamOutlined />} />
      );
    } else {
      avatarComponent = (
        <Avatar style={{ backgroundColor: '#52c41a' }} icon={<BookOutlined />} />
      );
    }
    
    return (
      <List.Item
        key={conversation._id}
        className={`conversation-item ${isSelected ? 'selected' : ''}`}
        onClick={() => handleConversationClick(conversation._id)}
        style={{padding: '12px 16px'}}
      >
        <List.Item.Meta
          avatar={isUnread ? <Badge dot>{avatarComponent}</Badge> : avatarComponent}
          title={<Text strong={isUnread} style={{marginBottom: 0}}>{title}</Text>}
          description={
            conversation.lastMessage && conversation.lastMessage.text ? (
              <Text 
                type="secondary" 
                ellipsis
                style={{ 
                  fontWeight: isUnread ? 'bold' : 'normal',
                  fontSize: '12px'
                }}
              >
                {conversation.type === 'DM' && conversation.lastMessage.senderId !== currentUserId ? `${conversation.lastMessage.senderName || 'User'}: ` : ''}
                {conversation.lastMessage.text}
              </Text>
            ) : (
              <Text type="secondary" style={{fontSize: '12px'}}>No messages yet</Text>
            )
          }
        />
        {conversation.lastMessage && conversation.lastMessage.timestamp && (
          <Text type="secondary" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
            {new Date(conversation.lastMessage.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        )}
      </List.Item>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Tabs 
        defaultActiveKey="all" 
        onChange={handleTabChange} 
        centered 
        style={{padding: '0 16px', flexShrink: 0}}
        items={tabItems}
      />
      <List
        dataSource={filteredConversations}
        renderItem={renderConversationItem}
        style={{ flex: '1 1 auto', overflowY: 'auto' /* any other list specific styles */ }}
      />
      <div style={{ padding: '10px 16px', borderTop: '1px solid #f0f0f0', flexShrink: 0 }}>
        <Button 
          type="primary" 
          icon={<MessageOutlined />} 
          block
          onClick={() => navigate('/users')}
        >
          Start New Conversation
        </Button>
      </div>
    </div>
  );
};

export default ConversationList; 