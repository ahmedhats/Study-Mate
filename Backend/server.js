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
    origin: true, // Allow any origin
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
    origin: true, // Allow any origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

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
    return next(new Error("Authentication error: Token not provided"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id; // Attach userId to the socket object
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
});

// Import and use the main socket handler
const initializeSocketHandler = require('./socket.handler'); 
initializeSocketHandler(io);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
