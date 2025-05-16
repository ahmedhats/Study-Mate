class WebSocketService {
  constructor() {
    this.ws = null;
    this.messageHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.connectionFailed = false;
    this.onConnectionFailed = null;
  }

  connect() {
    let token = "";
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        token = JSON.parse(userData).token;
      } catch {}
    }
    if (!token) {
      token = localStorage.getItem("token");
    }
    if (!token) {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        console.error("No authentication token found");
      }
      return;
    }
    const wsUrl = `${
      process.env.REACT_APP_WS_URL || "ws://localhost:5001"
    }?token=${token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
      this.connectionFailed = false;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const handlers = this.messageHandlers.get(data.type) || [];
        handlers.forEach((handler) => handler(data));
      } catch (error) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          console.error("Error processing WebSocket message:", error);
        }
      }
    };

    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log("WebSocket disconnected");
      }
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        console.error("WebSocket error:", error);
      }
    };
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        if (this.reconnectAttempts <= this.maxReconnectAttempts) {
          console.log(
            `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
          );
        }
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      if (!this.connectionFailed) {
        this.connectionFailed = true;
        console.error(
          "WebSocket connection failed after maximum attempts. No further attempts will be made."
        );
        if (typeof this.onConnectionFailed === "function") {
          this.onConnectionFailed();
        }
      }
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  subscribe(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type).push(handler);
  }

  unsubscribe(type, handler) {
    if (this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type);
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  sendMessage(type, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    } else {
      if (!this.connectionFailed) {
        console.error("WebSocket is not connected");
      }
    }
  }

  // Helper methods for specific message types
  sendChatMessage(recipientId, message) {
    this.sendMessage("chat", {
      recipientId,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  sendTaskUpdate(taskId, update) {
    this.sendMessage("task_update", { taskId, update });
  }

  sendTypingStatus(conversationId, isTyping) {
    this.sendMessage("typing", { conversationId, isTyping });
  }

  sendReadReceipt(conversationId, messageId) {
    this.sendMessage("read_receipt", { conversationId, messageId });
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();
export default websocketService;
