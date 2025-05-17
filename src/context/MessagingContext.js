import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import websocketService from '../services/websocket/websocketService';
import {
  getUserConversations,
  markConversationAsRead,
  getOrCreateDMConversation,
  getConversationMessages
} from '../services/api/conversationService';
import axios from 'axios';
// import {
//   getMessages
// } from '../services/api/messageService';

const MessagingContext = createContext(null);

// Helper function to check auth (can be moved to a shared auth utility)
const checkAuth = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

// Helper to get/set active conversation from localStorage
const getStoredActiveConversation = () => {
  return localStorage.getItem('activeConversationId');
};

const setStoredActiveConversation = (conversationId) => {
  if (conversationId) {
    localStorage.setItem('activeConversationId', conversationId);
  } else {
    localStorage.removeItem('activeConversationId');
    // Also clear retry counter to prevent false negatives on next attempt
    localStorage.removeItem('conversationRetryAttempts');
  }
};

// Helper to get/set previously loaded conversations for smoother UX - THIS IS NO LONGER USED
/*
const getStoredConversations = () => {
  try {
    const stored = localStorage.getItem('cachedConversations');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Error parsing cached conversations:', err);
  }
  return [];
};
*/

const setStoredConversations = (conversations) => {
  if (Array.isArray(conversations) && conversations.length > 0) {
    try {
      localStorage.setItem('cachedConversations', JSON.stringify(conversations));
    } catch (err) {
      console.error('Error storing cached conversations:', err);
    }
  }
};

// Helper to clear all messaging-related localStorage items
const clearAllMessagingStorage = () => {
  localStorage.removeItem('activeConversationId');
  localStorage.removeItem('cachedConversations');
  localStorage.removeItem('conversationRetryAttempts');
};

export const MessagingProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(checkAuth()); // Store user data
  const [conversations, setConversations] = useState([]); // Always initialize as empty array
  const [activeConversationId, setActiveConversationId] = useState(getStoredActiveConversation());
  const [activeConversationMessages, setActiveConversationMessages] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false); // Start as false
  const [userPresenceMap, setUserPresenceMap] = useState({}); // { userId: 'online'/'offline' }
  const [loading, setLoading] = useState({
    initialConversations: false,
    messages: false,
    creatingDM: false,
  });
  const [error, setError] = useState(null);
  const subscriptionsActiveRef = useRef(false);
  const cancelTokenSourceRef = useRef(null);

  // Effect to update currentUser if localStorage changes (e.g., login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      const newAuthData = checkAuth();
      setCurrentUser(prevCurrentUser => {
        // Compare essential parts, like user ID, to prevent unnecessary updates
        // if the object reference changes but the actual user hasn't.
        const prevUserId = prevCurrentUser?.user?._id || prevCurrentUser?.user?.id || prevCurrentUser?._id || prevCurrentUser?.id;
        const newUserId = newAuthData?.user?._id || newAuthData?.user?.id || newAuthData?._id || newAuthData?.id;
        
        if (prevUserId !== newUserId) {
          console.log('MessagingContext: User data changed in storage, updating context.', newAuthData);
          // If user logged out (newAuthData is null), clear the active conversation
          if (!newAuthData) {
            clearAllMessagingStorage();
            setActiveConversationId(null);
          }
          return newAuthData;
        }
        // Also check token if that can change independently for the same user ID
        if (prevCurrentUser?.token !== newAuthData?.token) {
           console.log('MessagingContext: User token changed in storage, updating context.', newAuthData);
           return newAuthData;
        }

        // If critical parts haven't changed, return the previous state
        // to avoid re-running effects that depend on currentUser object reference.
        return prevCurrentUser;
      });
    };

    // Also run check on mount to initialize or update if needed
    const initialAuthData = checkAuth();
    setCurrentUser(prevCurrentUser => {
        const prevUserId = prevCurrentUser?.user?._id || prevCurrentUser?.user?.id || prevCurrentUser?._id || prevCurrentUser?.id;
        const initialUserId = initialAuthData?.user?._id || initialAuthData?.user?.id || initialAuthData?._id || initialAuthData?.id;
        if (prevUserId !== initialUserId || prevCurrentUser?.token !== initialAuthData?.token) {
            // If user logged out (initialAuthData is null), clear the active conversation
            if (!initialAuthData) {
              clearAllMessagingStorage();
              setActiveConversationId(null);
            }
            return initialAuthData;
        }
        return prevCurrentUser;
    });

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []); // Empty dependency array is correct here

  const fetchUserConversations = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, initialConversations: true }));
      const response = await getUserConversations(); // This is getUserConversations from conversationService
      
      // Validate response data and extract the conversations array
      // The actual array is likely nested, e.g., response.data.conversations or response.data.data
      const conversationsData = response?.data?.conversations || response?.data?.data || response?.data;
      
      if (!Array.isArray(conversationsData)) {
        console.error('Invalid conversations data received:', response?.data); // Log the actual received data for debugging
        setError({type: 'fetch', message: 'Invalid conversations data format received from server'});
        setConversations([]);
        return;
      }
      
      setConversations(conversationsData);
      
      // Check if the active conversation exists in the fetched list
      const storedId = localStorage.getItem('lastActiveConversation');
      if (storedId && !conversationsData.find(c => c._id === storedId)) {
        console.log('MessagingContext: Stored active conversation not found in newly fetched list.');
        // It might have been deleted, or access revoked.
        // Clearing it from localStorage will prevent trying to load a non-existent chat.
        localStorage.removeItem('lastActiveConversation');
        // Optionally, update activeConversationId in context if it matches storedId
        if (activeConversationId === storedId) {
          setActiveConversationId(null);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError({type: 'fetch', message: 'Failed to load conversations'});
      setConversations([]); // Reset to empty array on error
    } finally {
      setLoading(prev => ({ ...prev, initialConversations: false }));
    }
  }, [activeConversationId]); // Added activeConversationId to dependencies

  // --- Socket Event Handlers ---
  const handleNewMessage = useCallback((eventData) => {
    console.log('SERVER:NEW_MESSAGE received', eventData);
    const { conversationId, message } = eventData;

    if (conversationId === activeConversationId) {
      setActiveConversationMessages(prevMessages => [...prevMessages, message]);
    }

    setConversations(prevConvos => {
      const convoIndex = prevConvos.findIndex(c => c._id === conversationId);
      if (convoIndex > -1) {
        const updatedConvo = { ...prevConvos[convoIndex], lastMessage: message };
        if (message.sender && !updatedConvo.lastMessage.sender) {
           updatedConvo.lastMessage.sender = typeof message.sender === 'string' ? { _id: message.sender } : message.sender;
        }
        const newConvos = [updatedConvo, ...prevConvos.slice(0, convoIndex), ...prevConvos.slice(convoIndex + 1)];
        // Update the cached conversations
        setStoredConversations(newConvos);
        return newConvos;
      }
      if (currentUser) {
          fetchUserConversations(); 
      }
      return prevConvos;
    });
  }, [activeConversationId, currentUser, fetchUserConversations]);

  const handleUserStatusUpdate = useCallback((data) => {
    console.log('SERVER:USER_STATUS received', data);
    setUserPresenceMap(prevMap => ({ ...prevMap, [data.userId]: data.status }));
  }, []);

  const handleConversationUpdated = useCallback((conversation) => {
    console.log('SERVER:CONVERSATION_UPDATED received', conversation);
    setConversations(prevConvos => {
      const index = prevConvos.findIndex(c => c._id === conversation._id);
      if (index !== -1) {
        const newConvos = [...prevConvos];
        newConvos[index] = conversation;
        // Update the cached conversations
        setStoredConversations(newConvos);
        return newConvos;
      }
      const newConvos = [conversation, ...prevConvos];
      setStoredConversations(newConvos);
      return newConvos;
    });
  }, []);
  
  // Socket connection effect - only depends on currentUser
  useEffect(() => {
    if (!currentUser) {
      if (websocketService.isConnected) {
        console.log('MessagingContext: No current user, disconnecting socket.');
        websocketService.disconnect();
      }
      setSocketConnected(false);
      subscriptionsActiveRef.current = false; // Reset ref on logout
      setError(prev => (prev?.type === 'socket' ? null : prev)); 
      return;
    }

    // If user exists, try to connect if not already connected
    if (!websocketService.isConnected) {
      console.log('MessagingContext: User authenticated, attempting websocket connection...');
      websocketService.connect(); // This is async and updates websocketService.isConnected internally
    }

    // Start an interval to sync the socketConnected state with the actual websocket state
    const intervalId = setInterval(() => {
      const currentServiceConnected = websocketService.isConnected;
      
      // Sync context state with actual service state
      if (currentServiceConnected !== socketConnected) {
        console.log(`MessagingContext: Syncing socket status. Service: ${currentServiceConnected}, Context: ${socketConnected} -> ${currentServiceConnected}`);
        setSocketConnected(currentServiceConnected);
      }
    }, 1000);

    return () => {
      console.log('MessagingContext: Cleaning up connection effect.');
      clearInterval(intervalId);
      // Do NOT disconnect the socket here
    };
  }, [currentUser, socketConnected]); // socketConnected needed because we read its value

  // Subscription management effect - depends on socketConnected and handlers
  useEffect(() => {
    if (!currentUser || !socketConnected) {
      // If not connected or no user, ensure subscriptions are cleared
      if (subscriptionsActiveRef.current) {
        console.log('MessagingContext: Not connected or no user, cleaning up subscriptions.');
        websocketService.unsubscribe('SERVER:NEW_MESSAGE', handleNewMessage);
        websocketService.unsubscribe('SERVER:USER_STATUS', handleUserStatusUpdate);
        websocketService.unsubscribe('SERVER:CONVERSATION_UPDATED', handleConversationUpdated);
        subscriptionsActiveRef.current = false;
      }
      return;
    }

    // Only set up subscriptions if they aren't already active
    if (!subscriptionsActiveRef.current) {
      console.log('MessagingContext: Socket connected and subscriptions not active, setting up subscriptions.');
      websocketService.subscribe('SERVER:NEW_MESSAGE', handleNewMessage);
      websocketService.subscribe('SERVER:USER_STATUS', handleUserStatusUpdate);
      websocketService.subscribe('SERVER:CONVERSATION_UPDATED', handleConversationUpdated);
      subscriptionsActiveRef.current = true;
    }

    return () => {
      // Only clean up subscriptions when component unmounts or currentUser/socketConnected change
      if (subscriptionsActiveRef.current) {
        console.log('MessagingContext: Cleaning up subscription effect.');
        websocketService.unsubscribe('SERVER:NEW_MESSAGE', handleNewMessage);
        websocketService.unsubscribe('SERVER:USER_STATUS', handleUserStatusUpdate);
        websocketService.unsubscribe('SERVER:CONVERSATION_UPDATED', handleConversationUpdated);
        subscriptionsActiveRef.current = false;
      }
    };
  }, [
    currentUser, 
    socketConnected, 
    handleNewMessage, 
    handleUserStatusUpdate, 
    handleConversationUpdated
  ]);

  // Fetch initial conversations
  useEffect(() => {
    if (currentUser) { // Only fetch if user is authenticated
      fetchUserConversations();
    } else {
      setConversations([]);
      clearAllMessagingStorage(); // Clear all stored data when no user is authenticated
    }
  }, [currentUser, fetchUserConversations]);

  // Fetch messages when activeConversationId changes
  const fetchMessagesForConversation = useCallback(async (conversationId) => {
    if (!currentUser || !conversationId) { // Check auth
        setActiveConversationMessages([]);
        return;
    }
    
    // Cancel any ongoing request before making a new one
    if (cancelTokenSourceRef.current) {
      cancelTokenSourceRef.current.cancel('Operation canceled due to new request.');
    }
    
    // Create a new cancel token for this request
    cancelTokenSourceRef.current = axios.CancelToken.source();
    
    setLoading(prev => ({ ...prev, messages: true }));
    setError(null);
    setActiveConversationMessages([]); // Clear previous messages before fetching new ones
    
    try {
      // Set a timeout of 8 seconds for the request
      const timeoutId = setTimeout(() => {
        if (cancelTokenSourceRef.current) {
          cancelTokenSourceRef.current.cancel('Request timed out');
        }
      }, 8000);
      
      const response = await getConversationMessages(conversationId, {
        cancelToken: cancelTokenSourceRef.current.token
      });
      
      clearTimeout(timeoutId);
      const messagesArray = response.data?.messages || response.data?.data || response.data;
      
      setActiveConversationMessages(Array.isArray(messagesArray) ? messagesArray : []);
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Messages request canceled', err.message);
      } else {
        console.error('Error fetching messages for conversation:', conversationId, err);
        setError({ type: 'fetch', message: `Failed to fetch messages for ${conversationId}.` });
        setActiveConversationMessages([]);
      }
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  }, [currentUser]);
  
  useEffect(() => {
    if (currentUser && activeConversationId) { // Check auth
      fetchMessagesForConversation(activeConversationId);
    } else {
      setActiveConversationMessages([]);
    }
  }, [currentUser, activeConversationId, fetchMessagesForConversation]);

  // Clean up CancelToken source on unmount
  useEffect(() => {
    return () => {
      if (cancelTokenSourceRef.current) {
        cancelTokenSourceRef.current.cancel('Component unmounted');
      }
    };
  }, []);

  // --- Actions ---
  const selectConversation = useCallback((conversationId) => {
    if (activeConversationId === conversationId) return;
    
    setActiveConversationId(conversationId);
    
    // Only store valid conversations
    if (conversationId && conversations.some(c => c._id === conversationId)) {
      setStoredActiveConversation(conversationId);
    } else if (!conversationId) {
      setStoredActiveConversation(null);
    }
  }, [activeConversationId, conversations]);

  const sendMessage = useCallback(async (conversationId, messageContent) => {
    if (!currentUser || !socketConnected) { // Check auth and connection
      console.error('User not authenticated or socket not connected. Cannot send message.');
      setError({ type: 'auth/socket', message: 'Cannot send message. Login or check connection.' });
      return;
    }
    if (!conversationId || !messageContent.text) {
      console.error('Cannot send message: conversationId or content.text missing');
      return;
    }
    try {
      await websocketService.sendMessage('CLIENT:SEND_MESSAGE', { conversationId, content: messageContent });
    } catch (error) {
      console.error('Error in sendMessage action:', error);
      setError({ type: 'send', message: 'Failed to send message.' });
    }
  }, [currentUser, socketConnected]); // Depend on currentUser and socketConnected

  const markConversationAsReadAction = useCallback(async (conversationId) => {
    if (!currentUser || !conversationId) return; // Check auth
    try {
      await markConversationAsRead(conversationId);
      setConversations(prevConvos => {
        if (!Array.isArray(prevConvos)) {
          console.error('MessagingContext: prevConvos in markConversationAsReadAction is not an array!', prevConvos);
          // Fallback to an empty array to prevent map error, though this signals a deeper state issue.
          return []; 
        }
        const newConvos = prevConvos.map(convo =>
          convo._id === conversationId
            ? { ...convo, unreadCount: 0, lastReadTimestamp: new Date().toISOString() } 
            : convo
        );
        // Update cached conversations
        setStoredConversations(newConvos);
        return newConvos;
      });
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  }, [currentUser]); // Depend on currentUser
  
  const createDMConversationAction = useCallback(async (otherUserId) => {
    if (!currentUser) { // Check auth
        setError({ type: 'auth', message: 'Login required to create DM.'});
        throw new Error('Login required to create DM.');
    }
    
    // Cancel any ongoing request before making a new one
    if (cancelTokenSourceRef.current) {
      cancelTokenSourceRef.current.cancel('Operation canceled due to new request.');
    }
    
    // Create a new cancel token for this request
    cancelTokenSourceRef.current = axios.CancelToken.source();
    
    setLoading(prev => ({...prev, creatingDM: true}));
    setError(null);
    
    try {
      // Set a timeout of 10 seconds for the request
      const timeoutId = setTimeout(() => {
        if (cancelTokenSourceRef.current) {
          cancelTokenSourceRef.current.cancel('Request timed out');
        }
      }, 10000);
      
      const response = await getOrCreateDMConversation(otherUserId, {
        cancelToken: cancelTokenSourceRef.current.token
      });
      
      clearTimeout(timeoutId);
      
      // Adjust to safely access the conversation object based on new log information
      const newConversation = response.data?.data;

      if (!newConversation || !newConversation._id) {
        console.error("MessagingContext: Failed to extract newConversation from API response in createDMConversationAction. Full API Response:", response);
        throw new Error("Failed to get or create conversation object from API response. Check console for response structure.");
      }

      setConversations(prevConvos => {
        const existing = prevConvos.find(c => c._id === newConversation._id);
        if (existing) {
          return prevConvos.map(c => c._id === newConversation._id ? newConversation : c);
        }
        const newConvos = [newConversation, ...prevConvos];
        // Update cached conversations
        setStoredConversations(newConvos);
        return newConvos;
      });
      setActiveConversationId(newConversation._id);
      setStoredActiveConversation(newConversation._id);
      return newConversation;
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Create DM request canceled', err.message);
        throw new Error('Request to create DM was canceled.');
      } else {
        console.error('Error creating DM conversation:', err);
        setError({ type: 'create_dm', message: 'Failed to create DM.'});
        throw err;
      }
    } finally {
      setLoading(prev => ({...prev, creatingDM: false}));
    }
  }, [currentUser]); // Depend on currentUser

  const contextValue = {
    conversations,
    activeConversationId,
    activeConversationMessages,
    socketConnected,
    userPresenceMap,
    loading,
    error,
    currentUser, // Expose currentUser
    actions: {
      selectConversation,
      sendMessage,
      markConversationAsRead: markConversationAsReadAction,
      fetchUserConversations,
      createDMConversation: createDMConversationAction,
      clearMessagingStorage: clearAllMessagingStorage
    },
  };

  return (
    <MessagingContext.Provider value={contextValue}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (context === undefined && process.env.NODE_ENV !== 'production') {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}; 