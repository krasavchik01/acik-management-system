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
  origin: [
    'http://localhost:3000',
    'https://app-acik.netlify.app'
  ],
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

// Seed route (for initial database setup)
app.get('/api/seed', async (req, res) => {
  try {
    const User = require('./models/User');
    const Project = require('./models/Project');
    const Task = require('./models/Task');
    const Member = require('./models/Member');
    const Event = require('./models/Event');
    const Finance = require('./models/Finance');
    const Sponsor = require('./models/Sponsor');
    const Attendance = require('./models/Attendance');
    const Report = require('./models/Report');

    console.log('🗑️  Clearing existing data...');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Member.deleteMany({});
    await Event.deleteMany({});
    await Finance.deleteMany({});
    await Sponsor.deleteMany({});
    await Attendance.deleteMany({});
    await Report.deleteMany({});

    console.log('✅ Existing data cleared');

    // Create Users
    console.log('👥 Creating users...');
    const users = await User.create([
      {
        name: 'John President',
        email: 'president@acik.com',
        password: 'password123',
        role: 'President',
        department: 'Executive',
        phone: '+1-555-0101',
        avatar: 'https://ui-avatars.com/api/?name=John+President&background=4F46E5&color=fff'
      },
      {
        name: 'Sarah VP',
        email: 'vp@acik.com',
        password: 'password123',
        role: 'Vice President',
        department: 'Executive',
        phone: '+1-555-0102',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+VP&background=7C3AED&color=fff'
      },
      {
        name: 'Michael CEO',
        email: 'ceo@acik.com',
        password: 'password123',
        role: 'CEO',
        department: 'Executive',
        phone: '+1-555-0103',
        avatar: 'https://ui-avatars.com/api/?name=Michael+CEO&background=DC2626&color=fff'
      },
      {
        name: 'Emily CFO',
        email: 'cfo@acik.com',
        password: 'password123',
        role: 'CFO',
        department: 'Finance',
        phone: '+1-555-0104',
        avatar: 'https://ui-avatars.com/api/?name=Emily+CFO&background=059669&color=fff'
      },
      {
        name: 'David PM',
        email: 'pm@acik.com',
        password: 'password123',
        role: 'Project Manager',
        department: 'Projects',
        phone: '+1-555-0105',
        avatar: 'https://ui-avatars.com/api/?name=David+PM&background=D97706&color=fff'
      },
      {
        name: 'Lisa Marketing',
        email: 'marketing@acik.com',
        password: 'password123',
        role: 'Marketing Manager',
        department: 'Marketing',
        phone: '+1-555-0106',
        avatar: 'https://ui-avatars.com/api/?name=Lisa+Marketing&background=DB2777&color=fff'
      }
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create Members (simplified - just 50)
    console.log('👤 Creating members...');
    const memberData = [];
    const firstNames = ['James', 'Emma', 'Robert', 'Olivia', 'William', 'Ava', 'Benjamin', 'Isabella', 'Lucas', 'Sophia'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const categories = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];

    for (let i = 0; i < 50; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      memberData.push({
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
        phone: `+1-555-${String(i).padStart(4, '0')}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        status: Math.random() > 0.1 ? 'Active' : 'Inactive',
        joinDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
      });
    }

    const members = await Member.create(memberData);
    console.log(`✅ Created ${members.length} members`);

    // Create Projects (simplified)
    console.log('📂 Creating projects...');
    const projectNames = ['AI Innovation Lab', 'Community Outreach', 'Tech Education', 'Smart City Development'];
    const projectData = [];
    const priorities = ['Low', 'Medium', 'High', 'Critical'];

    for (let i = 0; i < projectNames.length; i++) {
      const budget = Math.floor(Math.random() * 50000) + 10000;
      projectData.push({
        name: projectNames[i],
        description: `${projectNames[i]} - Innovation initiative`,
        category: 'Technology',
        status: 'Active',
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 11, 31),
        budget: { allocated: budget, spent: Math.floor(budget * 0.5), remaining: Math.floor(budget * 0.5) },
        progress: Math.floor(Math.random() * 60) + 20,
        manager: users[Math.floor(Math.random() * users.length)]._id,
        team: [{ user: users[0]._id, role: 'Lead' }]
      });
    }

    const projects = await Project.create(projectData);
    console.log(`✅ Created ${projects.length} projects`);

    // Create basic Events
    console.log('📅 Creating events...');
    const eventData = [{
      title: 'Annual Summit 2024',
      description: 'Annual innovation summit',
      type: 'Summit',
      status: 'Planned',
      startDate: new Date(2024, 8, 15, 9, 0),
      endDate: new Date(2024, 8, 17, 17, 0),
      location: { venue: 'Convention Center', city: 'San Jose', state: 'CA', country: 'USA', isVirtual: false },
      organizer: users[0]._id,
      capacity: 500,
      pricing: { isFree: false, memberPrice: 150, nonMemberPrice: 250 }
    }];

    const events = await Event.create(eventData);
    console.log(`✅ Created ${events.length} events`);

    // Create Sponsors
    console.log('💼 Creating sponsors...');
    const sponsorData = [{
      name: 'TechCorp International',
      level: 'Platinum',
      status: 'Active',
      type: 'Corporate',
      industry: 'Technology',
      contactPerson: { name: 'Robert Johnson', title: 'Manager', email: 'robert@techcorp.com', phone: '+1-555-1001' },
      sponsorship: { amount: 50000, frequency: 'Yearly', startDate: new Date(2024, 0, 1), totalCommitted: 50000, totalReceived: 50000 }
    }];

    const sponsors = await Sponsor.create(sponsorData);
    console.log(`✅ Created ${sponsors.length} sponsors`);

    // Create Finance transactions
    console.log('💰 Creating finance...');
    const financeData = [];
    for (let i = 0; i < 20; i++) {
      financeData.push({
        type: i % 2 === 0 ? 'Income' : 'Expense',
        category: i % 2 === 0 ? 'Sponsorship' : 'Salaries',
        amount: Math.floor(Math.random() * 5000) + 1000,
        description: 'Transaction',
        date: new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1),
        paymentMethod: 'Bank Transfer',
        status: 'Completed',
        recordedBy: users[3]._id
      });
    }

    const finances = await Finance.create(financeData);
    console.log(`✅ Created ${finances.length} finance transactions`);

    res.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        users: users.length,
        members: members.length,
        projects: projects.length,
        events: events.length,
        sponsors: sponsors.length,
        finances: finances.length
      },
      credentials: {
        president: { email: 'president@acik.com', password: 'password123' },
        cfo: { email: 'cfo@acik.com', password: 'password123' },
        pm: { email: 'pm@acik.com', password: 'password123' },
        marketing: { email: 'marketing@acik.com', password: 'password123' }
      }
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding database',
      error: error.message
    });
  }
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
