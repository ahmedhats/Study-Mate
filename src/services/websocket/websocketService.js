import io from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.messageQueue = [];
    this.isProcessingQueue = false;
  }

  async processMessageQueue() {
    if (this.isProcessingQueue || !this.isConnected || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    
    while (this.messageQueue.length > 0 && this.isConnected) {
      const { event, data, resolve, reject } = this.messageQueue.shift();
      try {
        await this.sendMessage(event, data);
        resolve();
      } catch (error) {
        console.error('Error processing queued message:', error);
        reject(error);
        // If we fail to send a message, stop processing queue
        break;
      }
    }
    
    this.isProcessingQueue = false;
  }

  connect() {
    if (this.socket && this.isConnected) {
      console.log("Socket already connected");
      return;
    }

    try {
      const token = JSON.parse(localStorage.getItem('userData'))?.token;
      if (!token) {
        console.error("No auth token found");
        return;
      }

      this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: {
          token
        },
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('Socket.IO connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        // Process any queued messages when connection is established
        this.processMessageQueue();
      });

      this.socket.on('disconnect', () => {
        console.log('Socket.IO disconnected');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        this.isConnected = false;
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
          this.socket.disconnect();
        }
      });

    } catch (error) {
      console.error("Error initializing socket:", error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  subscribe(event, handler) {
    if (!this.socket) {
      this.connect();
    }

    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    
    this.eventHandlers.get(event).add(handler);
    this.socket.on(event, handler);
  }

  unsubscribe(event, handler) {
    if (!this.socket) return;

    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).delete(handler);
    }
    
    this.socket.off(event, handler);
  }

  sendMessage(event, data) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        console.log("Socket disconnected, queueing message");
        this.messageQueue.push({ event, data, resolve, reject });
        this.connect(); // Attempt to reconnect
        return;
      }

      try {
        this.socket.emit(event, data);
        resolve();
      } catch (error) {
        console.error("Error sending message:", error);
        // Queue the message if sending fails
        this.messageQueue.push({ event, data, resolve, reject });
        reject(error);
      }
    });
  }

  joinRoom(roomId) {
    if (!this.socket || !this.isConnected) {
      this.connect();
    }
    this.socket.emit('JOIN_ROOM', { roomId });
  }

  leaveRoom(roomId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('LEAVE_ROOM', { roomId });
    }
  }
}

const websocketService = new WebSocketService();
export default websocketService;
