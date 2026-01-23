require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Member = require('../models/Member');
const Event = require('../models/Event');
const Finance = require('../models/Finance');
const Sponsor = require('../models/Sponsor');
const Attendance = require('../models/Attendance');
const Report = require('../models/Report');

// Connect to database
connectDB();

const seedData = async () => {
  try {
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
    console.log('');

    // Create Users
    console.log('👥 Creating users...');
    const users = await User.create([
      {
        name: 'System Admin',
        email: 'admin@acik.com',
        password: 'password123',
        role: 'Admin',
        department: 'IT',
        phone: '+1-555-0100',
        avatar: 'https://ui-avatars.com/api/?name=System+Admin&background=059669&color=fff',
        isDemo: false
      },
      {
        name: 'John President',
        email: 'president@acik.com',
        password: 'password123',
        role: 'President',
        department: 'Executive',
        phone: '+1-555-0101',
        avatar: 'https://ui-avatars.com/api/?name=John+President&background=4F46E5&color=fff',
        isDemo: false
      },
      {
        name: 'Sarah VP',
        email: 'vp@acik.com',
        password: 'password123',
        role: 'Vice President',
        department: 'Executive',
        phone: '+1-555-0102',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+VP&background=7C3AED&color=fff',
        isDemo: true
      },
      {
        name: 'Michael CEO',
        email: 'ceo@acik.com',
        password: 'password123',
        role: 'CEO',
        department: 'Executive',
        phone: '+1-555-0103',
        avatar: 'https://ui-avatars.com/api/?name=Michael+CEO&background=DC2626&color=fff',
        isDemo: false
      },
      {
        name: 'Emily CFO',
        email: 'cfo@acik.com',
        password: 'password123',
        role: 'CFO',
        department: 'Finance',
        phone: '+1-555-0104',
        avatar: 'https://ui-avatars.com/api/?name=Emily+CFO&background=059669&color=fff',
        isDemo: false
      },
      {
        name: 'David PM',
        email: 'pm@acik.com',
        password: 'password123',
        role: 'Project Manager',
        department: 'Projects',
        phone: '+1-555-0105',
        avatar: 'https://ui-avatars.com/api/?name=David+PM&background=D97706&color=fff',
        isDemo: true
      },
      {
        name: 'Lisa Marketing',
        email: 'marketing@acik.com',
        password: 'password123',
        role: 'Marketing Manager',
        department: 'Marketing',
        phone: '+1-555-0106',
        avatar: 'https://ui-avatars.com/api/?name=Lisa+Marketing&background=DB2777&color=fff',
        isDemo: true
      }
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create Members
    console.log('👤 Creating members...');
    const memberData = [];
    const firstNames = ['James', 'Emma', 'Robert', 'Olivia', 'William', 'Ava', 'Benjamin', 'Isabella', 'Lucas', 'Sophia', 'Henry', 'Mia', 'Alexander', 'Charlotte', 'Daniel', 'Amelia', 'Matthew', 'Harper', 'Joseph', 'Evelyn'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
    const categories = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];

    for (let i = 0; i < 180; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];

      memberData.push({
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
        phone: `+1-555-${String(i).padStart(4, '0')}`,
        category,
        status: Math.random() > 0.1 ? 'Active' : 'Inactive',
        joinDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        address: {
          city,
          state: 'CA',
          country: 'USA'
        },
        skills: ['Leadership', 'Communication', 'Project Management'].slice(0, Math.floor(Math.random() * 3) + 1)
      });
    }

    const members = await Member.create(memberData);
    console.log(`✅ Created ${members.length} members`);

    // Create Projects
    console.log('📂 Creating projects...');
    const projectNames = [
      'AI Innovation Lab', 'Community Outreach Program', 'Tech Education Initiative',
      'Smart City Development', 'Healthcare Analytics Platform', 'Green Energy Research',
      'Digital Marketing Campaign', 'Mobile App Development', 'Data Science Workshop',
      'Cybersecurity Training', 'Cloud Infrastructure', 'Blockchain Research',
      'IoT Smart Home', 'E-commerce Platform', 'Social Media Analytics',
      'Virtual Reality Lab', 'Machine Learning Pipeline', 'Web3 Development',
      'Sustainability Initiative', 'Youth Mentorship Program', 'Innovation Summit 2024',
      'Startup Incubator', 'Research Partnership', 'Conference Planning'
    ];

    const projectData = [];
    const categories = ['Technology', 'Innovation', 'Research', 'Community', 'Education', 'Business'];
    const statuses = ['Planning', 'Active', 'On Hold', 'Completed'];
    const priorities = ['Low', 'Medium', 'High', 'Critical'];

    for (let i = 0; i < projectNames.length; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const startDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const budget = Math.floor(Math.random() * 90000) + 10000;
      const spent = status === 'Completed' ? budget : Math.floor(budget * Math.random() * 0.8);

      projectData.push({
        name: projectNames[i],
        description: `${projectNames[i]} - A comprehensive initiative focusing on innovation and excellence`,
        category: categories[Math.floor(Math.random() * categories.length)],
        status,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        startDate,
        endDate: new Date(startDate.getTime() + (90 + Math.floor(Math.random() * 180)) * 24 * 60 * 60 * 1000),
        budget: {
          allocated: budget,
          spent,
          remaining: budget - spent
        },
        progress: status === 'Completed' ? 100 : Math.floor(Math.random() * 80) + 10,
        manager: users[Math.floor(Math.random() * users.length)]._id,
        team: [
          { user: users[Math.floor(Math.random() * users.length)]._id, role: 'Lead Developer' },
          { user: users[Math.floor(Math.random() * users.length)]._id, role: 'Designer' }
        ],
        tags: ['Innovation', 'Strategic', '2024'].slice(0, Math.floor(Math.random() * 3) + 1)
      });
    }

    const projects = await Project.create(projectData);
    console.log(`✅ Created ${projects.length} projects`);

    // Create Tasks
    console.log('✅ Creating tasks...');
    const taskTitles = [
      'Design System Setup', 'API Integration', 'Database Schema Design', 'User Authentication',
      'Frontend Development', 'Backend Optimization', 'Security Audit', 'Performance Testing',
      'Documentation Update', 'Code Review', 'Bug Fixes', 'Feature Implementation',
      'UI/UX Improvements', 'Testing Suite', 'Deployment Setup', 'Data Migration'
    ];
    const taskStatuses = ['TODO', 'In Progress', 'Review', 'Done', 'Blocked'];

    const taskData = [];
    for (const project of projects) {
      const numTasks = Math.floor(Math.random() * 8) + 4;
      for (let i = 0; i < numTasks; i++) {
        const status = taskStatuses[Math.floor(Math.random() * taskStatuses.length)];
        taskData.push({
          title: `${taskTitles[Math.floor(Math.random() * taskTitles.length)]} - ${project.name}`,
          description: 'Detailed task description and requirements',
          project: project._id,
          status,
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          assignedTo: users[Math.floor(Math.random() * users.length)]._id,
          createdBy: users[0]._id,
          dueDate: new Date(Date.now() + Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000),
          estimatedHours: Math.floor(Math.random() * 20) + 5,
          actualHours: status === 'Done' ? Math.floor(Math.random() * 15) + 5 : 0,
          tags: ['Priority', 'Sprint-1'],
          completedAt: status === 'Done' ? new Date() : null
        });
      }
    }

    const tasks = await Task.create(taskData);
    console.log(`✅ Created ${tasks.length} tasks`);

    // Create Events
    console.log('📅 Creating events...');
    const eventData = [
      {
        title: 'Annual Innovation Summit 2024',
        description: 'Join us for our biggest innovation event of the year featuring keynotes from industry leaders',
        type: 'Summit',
        status: 'Planned',
        startDate: new Date(2024, 8, 15, 9, 0),
        endDate: new Date(2024, 8, 17, 17, 0),
        location: {
          venue: 'Silicon Valley Convention Center',
          address: '123 Innovation Drive',
          city: 'San Jose',
          state: 'CA',
          country: 'USA',
          isVirtual: false
        },
        organizer: users[0]._id,
        capacity: 500,
        pricing: { isFree: false, memberPrice: 150, nonMemberPrice: 250 }
      },
      {
        title: 'Tech Workshop: AI & Machine Learning',
        description: 'Hands-on workshop covering latest AI and ML techniques',
        type: 'Workshop',
        status: 'Active',
        startDate: new Date(2024, 6, 20, 14, 0),
        endDate: new Date(2024, 6, 20, 18, 0),
        location: {
          venue: 'ACIK Training Center',
          address: '456 Tech Street',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          isVirtual: false
        },
        organizer: users[4]._id,
        capacity: 50,
        pricing: { isFree: true }
      },
      {
        title: 'Monthly Networking Mixer',
        description: 'Connect with fellow members and industry professionals',
        type: 'Networking',
        status: 'Planned',
        startDate: new Date(2024, 7, 10, 18, 0),
        endDate: new Date(2024, 7, 10, 21, 0),
        location: {
          venue: 'Downtown Business Club',
          city: 'San Francisco',
          state: 'CA',
          isVirtual: false
        },
        organizer: users[5]._id,
        capacity: 100,
        pricing: { isFree: true }
      }
    ];

    // Add more events
    const eventTypes = ['Conference', 'Workshop', 'Networking', 'Webinar', 'Training'];
    for (let i = 0; i < 22; i++) {
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      eventData.push({
        title: `${type} Event ${i + 4}`,
        description: `Engaging ${type.toLowerCase()} event for ACIK members`,
        type,
        status: ['Planned', 'Active', 'Completed'][Math.floor(Math.random() * 3)],
        startDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1, 10, 0),
        endDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1, 16, 0),
        location: {
          venue: 'ACIK Event Space',
          city: 'San Francisco',
          state: 'CA',
          isVirtual: Math.random() > 0.7
        },
        organizer: users[Math.floor(Math.random() * users.length)]._id,
        capacity: Math.floor(Math.random() * 200) + 50,
        pricing: { isFree: Math.random() > 0.5 }
      });
    }

    const events = await Event.create(eventData);
    console.log(`✅ Created ${events.length} events`);

    // Register members for events
    for (const event of events) {
      const numRegistrations = Math.min(Math.floor(Math.random() * 30) + 10, event.capacity);
      const selectedMembers = members.slice(0, numRegistrations);
      event.registrations = selectedMembers.map(member => ({
        member: member._id,
        attended: Math.random() > 0.3,
        paymentStatus: 'Paid'
      }));
      await event.save();
    }
    console.log('✅ Added event registrations');

    // Create Sponsors
    console.log('💼 Creating sponsors...');
    const sponsorData = [
      {
        name: 'TechCorp International',
        logo: 'https://via.placeholder.com/150/4F46E5/fff?text=TechCorp',
        level: 'Platinum',
        status: 'Active',
        type: 'Corporate',
        industry: 'Technology',
        contactPerson: {
          name: 'Robert Johnson',
          title: 'Corporate Relations Manager',
          email: 'robert.johnson@techcorp.com',
          phone: '+1-555-1001'
        },
        company: {
          website: 'https://techcorp.com',
          description: 'Leading technology solutions provider'
        },
        sponsorship: {
          amount: 50000,
          frequency: 'Yearly',
          startDate: new Date(2024, 0, 1),
          endDate: new Date(2024, 11, 31),
          totalCommitted: 50000,
          totalReceived: 50000
        },
        payments: [
          { amount: 50000, date: new Date(2024, 0, 15), method: 'Bank Transfer', reference: 'TC-2024-001', status: 'Received' }
        ]
      },
      {
        name: 'Innovation Ventures',
        logo: 'https://via.placeholder.com/150/7C3AED/fff?text=Innovation',
        level: 'Gold',
        status: 'Active',
        type: 'Corporate',
        industry: 'Venture Capital',
        contactPerson: {
          name: 'Jennifer Davis',
          title: 'Partnership Director',
          email: 'jennifer@innovationvc.com',
          phone: '+1-555-1002'
        },
        sponsorship: {
          amount: 25000,
          frequency: 'Yearly',
          startDate: new Date(2024, 0, 1),
          endDate: new Date(2024, 11, 31),
          totalCommitted: 25000,
          totalReceived: 25000
        }
      },
      {
        name: 'Green Energy Solutions',
        logo: 'https://via.placeholder.com/150/059669/fff?text=Green',
        level: 'Silver',
        status: 'Active',
        type: 'Corporate',
        industry: 'Clean Energy',
        contactPerson: {
          name: 'Michael Chen',
          title: 'Community Relations',
          email: 'michael@greenenergy.com',
          phone: '+1-555-1003'
        },
        sponsorship: {
          amount: 15000,
          frequency: 'Yearly',
          startDate: new Date(2024, 0, 1),
          totalCommitted: 15000,
          totalReceived: 10000
        }
      }
    ];

    // Add more sponsors
    const companyNames = ['Digital Dynamics', 'Smart Systems', 'Cloud Innovations', 'Data Insights', 'AI Solutions', 'Cyber Security Pro', 'Mobile First', 'Web Masters', 'Code Factory'];
    const levels = ['Bronze', 'Silver', 'Gold'];

    for (let i = 0; i < 9; i++) {
      sponsorData.push({
        name: companyNames[i],
        level: levels[Math.floor(Math.random() * levels.length)],
        status: 'Active',
        type: 'Corporate',
        industry: 'Technology',
        contactPerson: {
          name: `Contact ${i + 4}`,
          title: 'Manager',
          email: `contact${i + 4}@company.com`,
          phone: `+1-555-10${10 + i}`
        },
        sponsorship: {
          amount: [5000, 10000, 15000][Math.floor(Math.random() * 3)],
          frequency: 'Yearly',
          startDate: new Date(2024, 0, 1),
          totalCommitted: 10000,
          totalReceived: 8000
        }
      });
    }

    const sponsors = await Sponsor.create(sponsorData);
    console.log(`✅ Created ${sponsors.length} sponsors`);

    // Create Finance Transactions
    console.log('💰 Creating financial transactions...');
    const categories = {
      income: ['Sponsorship', 'Membership Fees', 'Event Revenue', 'Donations', 'Grants'],
      expense: ['Salaries', 'Office Rent', 'Utilities', 'Marketing', 'Events', 'Equipment', 'Software']
    };

    const financeData = [];

    // Income transactions
    for (let i = 0; i < 50; i++) {
      financeData.push({
        type: 'Income',
        category: categories.income[Math.floor(Math.random() * categories.income.length)],
        amount: Math.floor(Math.random() * 10000) + 1000,
        description: 'Income transaction for organization operations',
        date: new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1),
        paymentMethod: ['Bank Transfer', 'Check', 'Credit Card'][Math.floor(Math.random() * 3)],
        status: 'Completed',
        recordedBy: users[3]._id
      });
    }

    // Expense transactions
    for (let i = 0; i < 50; i++) {
      financeData.push({
        type: 'Expense',
        category: categories.expense[Math.floor(Math.random() * categories.expense.length)],
        amount: Math.floor(Math.random() * 5000) + 500,
        description: 'Expense transaction for organization operations',
        date: new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1),
        paymentMethod: ['Bank Transfer', 'Check', 'Credit Card'][Math.floor(Math.random() * 3)],
        status: 'Completed',
        recordedBy: users[3]._id,
        approvedBy: users[2]._id
      });
    }

    const finances = await Finance.create(financeData);
    console.log(`✅ Created ${finances.length} financial transactions`);

    // Create Attendance Records
    console.log('📊 Creating attendance records...');
    const attendanceData = [];
    const today = new Date();

    // Create attendance for past 30 days
    for (let day = 30; day >= 0; day--) {
      const date = new Date(today);
      date.setDate(date.getDate() - day);
      date.setHours(0, 0, 0, 0);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const user of users) {
        // 90% attendance rate
        if (Math.random() > 0.1) {
          const checkInHour = 8 + Math.floor(Math.random() * 2); // 8-9 AM
          const checkInMinute = Math.floor(Math.random() * 60);
          const checkOutHour = 17 + Math.floor(Math.random() * 2); // 5-6 PM
          const checkOutMinute = Math.floor(Math.random() * 60);

          const checkInTime = new Date(date);
          checkInTime.setHours(checkInHour, checkInMinute, 0);

          const checkOutTime = new Date(date);
          checkOutTime.setHours(checkOutHour, checkOutMinute, 0);

          const isLate = checkInHour >= 9;

          attendanceData.push({
            user: user._id,
            date,
            checkIn: {
              time: checkInTime,
              location: {
                coordinates: [-122.4194, 37.7749],
                address: 'ACIK Office, San Francisco'
              },
              method: 'Manual'
            },
            checkOut: {
              time: checkOutTime,
              location: {
                coordinates: [-122.4194, 37.7749],
                address: 'ACIK Office, San Francisco'
              },
              method: 'Manual'
            },
            status: isLate ? 'Late' : 'Present',
            workType: Math.random() > 0.8 ? 'Remote' : 'Office',
            project: projects[Math.floor(Math.random() * projects.length)]._id
          });
        }
      }
    }

    const attendance = await Attendance.create(attendanceData);
    console.log(`✅ Created ${attendance.length} attendance records`);

    // Create Reports
    console.log('📄 Creating reports...');
    const reportData = [
      {
        title: 'Q1 2024 Financial Report',
        type: 'Quarterly',
        category: 'Financial',
        status: 'Published',
        period: {
          startDate: new Date(2024, 0, 1),
          endDate: new Date(2024, 2, 31)
        },
        summary: 'Comprehensive financial overview for Q1 2024 showing strong growth',
        content: 'Detailed financial analysis with revenue growth of 25% compared to Q1 2023...',
        financials: {
          income: 250000,
          expenses: 180000,
          netIncome: 70000,
          budget: 300000,
          budgetVariance: 50000
        },
        createdBy: users[3]._id,
        approvedBy: users[2]._id,
        approvedAt: new Date(2024, 3, 5),
        publishedAt: new Date(2024, 3, 10)
      },
      {
        title: 'Monthly Operations Report - June 2024',
        type: 'Monthly',
        category: 'Operations',
        status: 'Approved',
        period: {
          startDate: new Date(2024, 5, 1),
          endDate: new Date(2024, 5, 30)
        },
        summary: 'Operations summary for June 2024 with key achievements and challenges',
        content: 'Detailed operations report covering all departments and initiatives...',
        createdBy: users[0]._id,
        approvedBy: users[2]._id
      },
      {
        title: 'Project Portfolio Review - 2024',
        type: 'Project',
        category: 'Projects',
        status: 'In Review',
        period: {
          startDate: new Date(2024, 0, 1),
          endDate: new Date(2024, 5, 30)
        },
        summary: 'Comprehensive review of all active projects and their status',
        content: 'Analysis of project performance, budget utilization, and timeline adherence...',
        createdBy: users[4]._id
      }
    ];

    const reports = await Report.create(reportData);
    console.log(`✅ Created ${reports.length} reports`);

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 SEED DATA CREATION COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`👥 Users: ${users.length}`);
    console.log(`📂 Projects: ${projects.length}`);
    console.log(`✅ Tasks: ${tasks.length}`);
    console.log(`👤 Members: ${members.length}`);
    console.log(`📅 Events: ${events.length}`);
    console.log(`💰 Finance Transactions: ${finances.length}`);
    console.log(`💼 Sponsors: ${sponsors.length}`);
    console.log(`📊 Attendance Records: ${attendance.length}`);
    console.log(`📄 Reports: ${reports.length}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('📝 DEFAULT LOGIN CREDENTIALS:');
    console.log('');
    console.log('Admin (Full Access):');
    console.log('  Email: admin@acik.com');
    console.log('  Password: password123');
    console.log('');
    console.log('President:');
    console.log('  Email: president@acik.com');
    console.log('  Password: password123');
    console.log('');
    console.log('CFO:');
    console.log('  Email: cfo@acik.com');
    console.log('  Password: password123');
    console.log('');
    console.log('Project Manager (DEMO):');
    console.log('  Email: pm@acik.com');
    console.log('  Password: password123');
    console.log('');
    console.log('Marketing Manager (DEMO):');
    console.log('  Email: marketing@acik.com');
    console.log('  Password: password123');
    console.log('');
    console.log('Note: DEMO users cannot be deleted');
    console.log('═══════════════════════════════════════════════════════════');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
