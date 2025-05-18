const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const httpStatus = require("http-status");
const cookieParser = require("cookie-parser");
const config = require("./config/config");
const ApiError = require("./utils/ApiError");
const {
  errorConverter,
  errorHandler,
} = require("./middlewares/error.middleware");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Import models
require("./models/user.model");
require("./models/friendRequest.model");
require("./models/conversation.model");
require("./models/message.model");

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3002"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  },
  transports: ['websocket', 'polling']
});

// Import routes
const auth = require("./routers/auth.routes");
const tasks = require("./routers/task.routes");
const users = require("./routers/user.routes");
const email = require("./routers/email.route");
const studySessions = require("./routers/studySession.routes");
const stats = require("./routers/stats.routes");
const social = require("./routers/social.routes");
const userRouter = require("./routers/user.routes");
// const adminRouter = require("./routers/admin.routes");
// const qsRouter = require("./routers/qs.routes");
// const communityRouter = require("./routers/community.routes");
const messageRouter = require("./routers/message.routes");
const conversationRouter = require("./routers/conversation.routes");

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API routes
app.use("/api/auth", auth);
app.use("/api/tasks", tasks);
app.use("/api/users", users);
app.use("/api/email", email);
app.use("/api/study-sessions", studySessions);
app.use("/api/stats", stats);
app.use("/api/social", social);
app.use("/api/user", userRouter);
// app.use("/api/admin", adminRouter);
// app.use("/api/qs", qsRouter);
// app.use("/api/community", communityRouter);
app.use("/api/conversations", conversationRouter);
app.use("/api", messageRouter);

// 404 handler
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// Convert error to ApiError if needed
app.use(errorConverter);

// Handle error
app.use(errorHandler);

// Initialize Socket.IO Authentication Middleware
io.use((socket, next) => {
  // Attempt to get token from handshake query (preferred for Socket.IO)
  // Fallback to auth header if needed, though query is more common for initial WS connection
  const token = socket.handshake.query.token || socket.handshake.auth?.token;

  if (!token) {
    // Allow connection without auth for now, with limited functionality
    socket.user = { _id: null, anonymous: true };
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = { _id: decoded.id, anonymous: false };
    next();
  } catch (error) {
    // Allow connection without auth for now, with limited functionality
    socket.user = { _id: null, anonymous: true };
    next();
  }
});

// Import and use the main socket handler
const initializeSocketHandler = require('./socket.handler'); 
initializeSocketHandler(io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Keep track of user's current room
  let currentRoom = null;

  // Handle room joining for study sessions
  socket.on("join-room", (data) => {
    const { roomId, userId, userName, showName } = data;

    // Generate values if missing
    const userIdToUse = userId || `user-${socket.id}`;
    const userNameToUse = userName || "Study Mate User";
    const showNameValue = showName !== undefined ? showName : true;

    console.log(
      `Join room request: User ${userNameToUse} (${userIdToUse}) trying to join room ${roomId}`
    );

    if (!roomId) {
      console.error("Join room failed: No roomId provided");
      return;
    }

    // Leave previous room if any
    if (currentRoom) {
      socket.leave(currentRoom);
      console.log(`User ${userNameToUse} left room ${currentRoom}`);
    }

    // Join the new room
    socket.join(roomId);
    currentRoom = roomId;

    // Store user info
    socket.userId = userIdToUse;
    socket.userName = userNameToUse;
    socket.roomId = roomId;
    socket.showName = showNameValue;

    // Get all users in this room
    const clients = io.sockets.adapter.rooms.get(roomId);
    const numClients = clients ? clients.size : 0;

    console.log(`Room ${roomId} now has ${numClients} client(s)`);

    // Notify others in the room
    socket.to(roomId).emit("user-connected", {
      userId: userIdToUse,
      userName: userNameToUse,
      showName: showNameValue,
    });

    console.log(
      `User ${userNameToUse} (${userIdToUse}) joined room ${roomId} successfully`
    );

    // If this is a study session room, send list of all participants to the new user
    try {
      // Get list of all sockets in the room
      const socketsInRoom = io.sockets.adapter.rooms.get(roomId);

      if (socketsInRoom) {
        console.log(`Sending room participants to new user ${userIdToUse}`);

        // For each socket in the room, compile user info
        const participants = [];
        for (const clientId of socketsInRoom) {
          if (clientId !== socket.id) {
            // Don't include the new user
            const clientSocket = io.sockets.sockets.get(clientId);
            if (clientSocket) {
              participants.push({
                userId: clientSocket.userId || `user-${clientId}`,
                userName: clientSocket.userName || "Study Mate User",
                showName: clientSocket.showName,
              });
            }
          }
        }

        // Send the list to the new user if there are other participants
        if (participants.length > 0) {
          socket.emit("room-participants", participants);

          // Also send a welcome message
          socket.emit("receive-message", {
            text: `Welcome to the study session! There ${participants.length === 1 ? "is" : "are"
              } ${participants.length} other ${participants.length === 1 ? "participant" : "participants"
              } online.`,
            sender: "System",
            senderId: "system",
            timestamp: new Date().toISOString(),
          });
        } else {
          // Send a different message for solo users
          const isIndividual = roomId.includes("individual");
          socket.emit("receive-message", {
            text: isIndividual
              ? "Welcome to your personal study session!"
              : "Welcome to the group study session! You're the first one here.",
            sender: "System",
            senderId: "system",
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error("Error sending room participants:", error);
    }
  });

  // Handle WebRTC signaling
  socket.on("sending-signal", (payload) => {
    console.log(
      `Signal being sent from ${socket.id} to ${payload.userToSignal}`
    );
    const { userToSignal, callerID, signal } = payload;
    io.to(userToSignal).emit("user-joined", { signal, callerID });
  });

  socket.on("returning-signal", (payload) => {
    console.log(`Return signal from ${socket.id} to ${payload.callerID}`);
    const { signal, callerID } = payload;
    io.to(callerID).emit("receiving-returned-signal", {
      signal,
      id: socket.id,
    });
  });

  // Handle chat messages
  socket.on("send-message", (message) => {
    if (socket.roomId) {
      console.log(
        `Message in room ${socket.roomId} from ${socket.userName
        }: ${message.text.substring(0, 20)}...`
      );

      // Broadcast to all in the room
      io.to(socket.roomId).emit("receive-message", {
        ...message,
        senderId: socket.userId,
        sender: socket.userName,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log(`Message received but user not in a room: ${socket.id}`);
    }
  });

  // Handle user display name update
  socket.on("update-user-info", (userInfo) => {
    console.log(`User ${socket.id} updated display info:`, userInfo);

    // Update the socket's user information
    if (userInfo.displayName) {
      const oldName = socket.userName;
      socket.userName = userInfo.displayName;

      if (userInfo.showName !== undefined) {
        socket.showName = userInfo.showName;
      }

      // Notify others in the room if the user is in a room
      if (socket.roomId) {
        socket.to(socket.roomId).emit("user-updated", {
          userId: socket.userId,
          userName: socket.userName,
          showName: socket.showName,
          previousName: oldName,
        });

        // Send a system message about the name change
        io.to(socket.roomId).emit("receive-message", {
          text: `${oldName} changed their name to ${socket.userName}`,
          sender: "System",
          senderId: "system",
          timestamp: new Date().toISOString(),
        });
      }
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(
      `User disconnected: ${socket.id}, was in room: ${socket.roomId}`
    );

    if (socket.roomId) {
      // Notify others the user has left
      socket.to(socket.roomId).emit("user-disconnected", socket.userId);

      // Send a system message about the user leaving
      socket.to(socket.roomId).emit("receive-message", {
        text: `${socket.userName} has left the session`,
        sender: "System",
        senderId: "system",
        timestamp: new Date().toISOString(),
      });

      // Get updated count of users in the room
      const clients = io.sockets.adapter.rooms.get(socket.roomId) || {
        size: 0,
      };
      console.log(
        `Room ${socket.roomId} now has ${clients.size} client(s) after disconnect`
      );
    }
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("CORS allowed origin:", process.env.CORS_ORIGIN || "http://localhost:3000");
});
