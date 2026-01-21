require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Connect to database
connectDB();

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Body parser
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression()); // Compress responses

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Socket.io connection handling
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log(`✅ New client connected: ${socket.id}`);

  // User joins
  socket.on('user:join', (userId) => {
    activeUsers.set(userId, socket.id);
    socket.userId = userId;
    io.emit('users:active', Array.from(activeUsers.keys()));
    console.log(`👤 User ${userId} joined`);
  });

  // Project updates
  socket.on('project:update', (data) => {
    socket.broadcast.emit('project:updated', data);
  });

  // Task updates
  socket.on('task:update', (data) => {
    socket.broadcast.emit('task:updated', data);
  });

  // New notification
  socket.on('notification:send', (data) => {
    if (data.userId) {
      const recipientSocket = activeUsers.get(data.userId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('notification:new', data);
      }
    } else {
      // Broadcast to all
      io.emit('notification:new', data);
    }
  });

  // Chat messages
  socket.on('message:send', (data) => {
    socket.broadcast.emit('message:received', data);
  });

  // Attendance updates
  socket.on('attendance:update', (data) => {
    io.emit('attendance:updated', data);
  });

  // User disconnects
  socket.on('disconnect', () => {
    if (socket.userId) {
      activeUsers.delete(socket.userId);
      io.emit('users:active', Array.from(activeUsers.keys()));
      console.log(`👋 User ${socket.userId} disconnected`);
    }
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/members', require('./routes/members'));
app.use('/api/events', require('./routes/events'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/sponsors', require('./routes/sponsors'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/marketing', require('./routes/marketing'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/admin', require('./routes/admin'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ACIK Management System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    activeConnections: activeUsers.size
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to ACIK Management System API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      tasks: '/api/tasks',
      members: '/api/members',
      events: '/api/events',
      finance: '/api/finance',
      sponsors: '/api/sponsors',
      attendance: '/api/attendance',
      marketing: '/api/marketing',
      reports: '/api/reports',
      admin: '/api/admin'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 ACIK Management System API Server');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`🔌 Socket.io: Enabled`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = { app, server, io };
