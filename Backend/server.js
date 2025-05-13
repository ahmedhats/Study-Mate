const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const httpStatus = require('http-status');
const cookieParser = require('cookie-parser');
const config = require('./config/config');
const ApiError = require('./utils/ApiError');
const { errorConverter, errorHandler } = require('./middlewares/error.middleware');
const mongoose = require('mongoose');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Import routes
const auth = require('./routers/auth.routes');
const tasks = require('./routers/task.routes');
const users = require('./routers/user.routes');
const email = require('./routers/email.route');
const studySessions = require('./routers/studySession.routes');
const stats = require('./routers/stats.routes');


// Security middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API routes
app.use('/api/auth', auth);
app.use('/api/tasks', tasks);
app.use('/api/users', users);
app.use('/api/email', email);
app.use('/api/study-sessions', studySessions);
app.use('/api/stats', stats);

// 404 handler
app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// Convert error to ApiError if needed
app.use(errorConverter);

// Handle error
app.use(errorHandler);

// WebSocket authentication middleware
const authenticateWebSocket = (info, callback) => {
    const token = info.req.url.split('token=')[1];
    if (!token) {
        callback(false, 401, 'Unauthorized');
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        info.req.user = decoded;
        callback(true);
    } catch (error) {
        callback(false, 401, 'Unauthorized');
    }
};

// WebSocket connection handling
wss.on('connection', (ws, req) => {
    const userId = req.user._id;

    // Store user's WebSocket connection
    if (!wss.clients) wss.clients = new Map();
    wss.clients.set(userId, ws);

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'chat':
                    // Handle chat messages
                    const recipientWs = wss.clients.get(data.recipientId);
                    if (recipientWs) {
                        recipientWs.send(JSON.stringify({
                            type: 'chat',
                            senderId: userId,
                            message: data.message,
                            timestamp: new Date()
                        }));
                    }
                    break;

                case 'task_update':
                    // Handle task updates
                    wss.clients.forEach((client) => {
                        if (client !== ws && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({
                                type: 'task_update',
                                taskId: data.taskId,
                                update: data.update
                            }));
                        }
                    });
                    break;
            }
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    });

    ws.on('close', () => {
        wss.clients.delete(userId);
    });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
