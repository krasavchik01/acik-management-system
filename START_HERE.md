# START HERE - ACIK Management System

Welcome! This document will get you up and running in 5 minutes.

## What You Have

A **COMPLETE, FULLY FUNCTIONAL** management system with:
- Backend API (Node.js + Express + MongoDB)
- Frontend Web App (React)
- 85+ API endpoints
- 11 fully functional pages
- 500+ sample data records
- Real-time features with Socket.io
- Docker deployment ready

## Quick Start Options

### Option 1: Docker (Easiest - Recommended)

**Requirements:**
- Docker Desktop installed

**Steps:**
```bash
# 1. Open terminal in ACIK directory
cd c:\Users\UserPC\ACIK\ACIK

# 2. Start everything
docker-compose up -d

# 3. Wait 30 seconds, then seed data
docker exec -it acik-backend npm run seed

# 4. Open browser
http://localhost:3000
```

**Login:**
- Email: `president@acik.com`
- Password: `password123`

Done! Skip to "What to Explore" section.

---

### Option 2: Manual Setup

**Requirements:**
- Node.js v18+ installed
- MongoDB v7+ installed and running

#### Step 1: Start MongoDB
```bash
# Windows: Start MongoDB service from Services
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

#### Step 2: Setup Backend
```bash
# Open terminal in backend directory
cd c:\Users\UserPC\ACIK\ACIK\backend

# Install dependencies
npm install

# Seed database
npm run seed

# Start backend
npm run dev
```

Keep this terminal open. Backend runs on http://localhost:5000

#### Step 3: Setup Frontend
```bash
# Open NEW terminal in frontend directory
cd c:\Users\UserPC\ACIK\ACIK\frontend

# Install dependencies
npm install

# Start frontend
npm start
```

Browser opens automatically at http://localhost:3000

**Login:**
- Email: `president@acik.com`
- Password: `password123`

---

## What to Explore

### 1. Dashboard
- View statistics for all modules
- See quick action cards
- Check recent activities

### 2. Projects (24 Projects)
- Browse all projects
- View different categories
- Check project statuses

### 3. Tasks (150+ Tasks)
- View task list
- See status badges
- Check priorities and due dates

### 4. Members (180+ Members)
- Browse member directory
- See member categories
- View contact information

### 5. Events (25+ Events)
- View upcoming events
- Check event types
- See registrations

### 6. Finance
- View financial dashboard
- See monthly income/expenses
- Check net income

### 7. Sponsors (12 Sponsors)
- View sponsor list
- See sponsorship levels
- Check payment amounts

### 8. Attendance
- View today's attendance
- Check present/absent stats
- Monitor late arrivals

### 9. Reports (3 Reports)
- View available reports
- Check report status
- Read summaries

### 10. Settings
- View your profile
- Check your role
- See your department

---

## Test Different Roles

Try logging in with different accounts to see role-based features:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| President | president@acik.com | password123 | Full Access |
| Vice President | vp@acik.com | password123 | High Access |
| CEO | ceo@acik.com | password123 | Full Access |
| CFO | cfo@acik.com | password123 | Finance Focus |
| Project Manager | pm@acik.com | password123 | Project Focus |
| Marketing Manager | marketing@acik.com | password123 | Marketing Focus |

---

## Verify Everything Works

### Backend Check
1. Open http://localhost:5000
2. Should see: "Welcome to ACIK Management System API"
3. Try: http://localhost:5000/api/health
4. Should see: `{"success":true,"message":"ACIK Management System API is running"}`

### Frontend Check
1. Open http://localhost:3000
2. Should see: Beautiful login page
3. Click "Quick Login" buttons
4. Should navigate to dashboard

### Database Check
```bash
# Docker
docker exec -it acik-mongodb mongosh
use acik_management
db.users.countDocuments()
# Should show: 6

# Manual
mongosh
use acik_management
db.users.countDocuments()
# Should show: 6
```

---

## Common Issues & Solutions

### "Cannot connect to database"
**Docker:**
```bash
docker-compose restart mongodb
```

**Manual:**
- Start MongoDB service
- Check if mongod is running: `ps aux | grep mongod`

### "Port already in use"
**Backend (5000):**
```bash
# Find process
netstat -ano | findstr :5000

# Kill it
taskkill /PID <PID> /F

# Or change port in backend/.env
```

**Frontend (3000):**
```bash
# Find process
netstat -ano | findstr :3000

# Kill it
taskkill /PID <PID> /F
```

### "No data showing"
**Run seed script again:**
```bash
# Docker
docker exec -it acik-backend npm run seed

# Manual
cd backend
npm run seed
```

### "npm install fails"
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules

# Reinstall
npm install
```

---

## Key Features to Test

### 1. Authentication
- [x] Login with different users
- [x] Logout
- [x] Check profile in settings

### 2. Real-time Updates
- [x] Open two browser tabs
- [x] Login in both
- [x] Make changes in one
- [x] See updates in other (Socket.io)

### 3. API Testing
Use Postman or curl:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"president@acik.com","password":"password123"}'

# Get projects (use token from login)
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Data Operations
- [x] View lists (projects, tasks, members)
- [x] Filter and search
- [x] View details
- [x] Create new items (if role allows)

---

## Project Structure Quick Reference

```
ACIK/
├── backend/              # Node.js + Express API
│   ├── models/          # 9 Mongoose models
│   ├── routes/          # 11 route files (85+ endpoints)
│   ├── middleware/      # Auth & error handling
│   ├── seeds/           # Database seeding
│   └── server.js        # Main server file
│
├── frontend/            # React application
│   ├── src/
│   │   ├── pages/      # 11 page components
│   │   ├── components/ # Reusable components
│   │   ├── context/    # Auth context
│   │   └── services/   # API services
│   └── public/
│
├── docker-compose.yml   # Docker orchestration
├── PROJECT_README.md    # Full documentation
├── QUICKSTART.md        # Quick start guide
└── START_HERE.md        # This file
```

---

## Next Steps

1. **Explore the UI** - Click through all pages
2. **Test Features** - Try creating, editing, deleting
3. **Check API** - Use Postman to test endpoints
4. **Read Docs** - See PROJECT_README.md for details
5. **Customize** - Modify to your needs

---

## Documentation Files

- `START_HERE.md` - This quick start (you are here)
- `QUICKSTART.md` - Quick start with troubleshooting
- `PROJECT_README.md` - Complete documentation
- `PROJECT_SUMMARY.md` - Technical overview

---

## Support Commands

### Docker
```bash
# View logs
docker-compose logs -f

# Restart service
docker-compose restart backend

# Stop all
docker-compose down

# Start all
docker-compose up -d
```

### Development
```bash
# Backend (in backend/)
npm run dev      # Start development server
npm run seed     # Seed database
npm start        # Start production server

# Frontend (in frontend/)
npm start        # Start development server
npm run build    # Build for production
```

---

## Need Help?

1. Check PROJECT_README.md for detailed docs
2. Review error messages in terminal
3. Check browser console for frontend errors
4. Verify MongoDB is running
5. Ensure all dependencies are installed

---

## System Requirements Met

- [x] Complete backend with all features
- [x] Complete frontend with all pages
- [x] Database with seed data
- [x] Authentication system
- [x] Real-time features
- [x] Docker deployment
- [x] Comprehensive documentation

---

**You're ready to go! Start exploring your ACIK Management System!** 🚀

**Pro Tip:** Login as different users to see how the interface changes based on roles!
