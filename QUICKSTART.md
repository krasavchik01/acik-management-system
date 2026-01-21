# Quick Start Guide - ACIK Management System

Get your ACIK Management System up and running in minutes!

## Option 1: Docker (Recommended - Fastest)

### Prerequisites
- Docker Desktop installed
- Docker Compose installed

### Steps
```bash
# 1. Navigate to project directory
cd ACIK

# 2. Start all services
docker-compose up -d

# 3. Wait for services to start (30 seconds)

# 4. Seed the database with sample data
docker exec -it acik-backend npm run seed

# 5. Open your browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

### Login
Use any of these demo accounts:
- Email: `president@acik.com` | Password: `password123`
- Email: `cfo@acik.com` | Password: `password123`
- Email: `pm@acik.com` | Password: `password123`

---

## Option 2: Manual Setup

### Prerequisites
- Node.js v18+
- MongoDB v7.0+
- npm or yarn

### Backend Setup
```bash
# 1. Install MongoDB and start it
# Windows: Start MongoDB service
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# 2. Navigate to backend
cd backend

# 3. Install dependencies
npm install

# 4. Create .env file
cp .env.example .env

# 5. Edit .env with your settings
# MONGODB_URI=mongodb://localhost:27017/acik_management
# JWT_SECRET=your_secret_key_here

# 6. Seed the database
npm run seed

# 7. Start backend
npm run dev
```

Backend runs on http://localhost:5000

### Frontend Setup (New Terminal)
```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Start frontend
npm start
```

Frontend runs on http://localhost:3000

---

## What You Get

After setup, your system includes:

### Data
- 6 users (President, VP, CEO, CFO, PM, Marketing Manager)
- 24 projects across different categories
- 150+ tasks in various states
- 180+ members with different membership levels
- 25+ events (conferences, workshops, etc.)
- 100+ financial transactions
- 12 sponsors at different levels
- 30 days of attendance records
- 3 comprehensive reports

### Features
- Full authentication system
- Role-based access control
- Real-time updates via Socket.io
- Project management with Kanban boards
- Task tracking and assignment
- Member database
- Event management with registrations
- Financial tracking and reporting
- Sponsor management
- Attendance system with check-in/out
- Comprehensive reporting

---

## Testing the System

### 1. Login
- Go to http://localhost:3000
- Click any "Quick Login" button
- Or enter: `president@acik.com` / `password123`

### 2. Explore Dashboard
- View statistics cards
- Check recent activities
- Use quick action cards to navigate

### 3. Try Different Modules
- **Projects**: View and manage 24 sample projects
- **Tasks**: See 150+ tasks with Kanban board
- **Members**: Browse 180+ member profiles
- **Events**: Explore 25+ events
- **Finance**: Check financial dashboard
- **Attendance**: View attendance statistics

### 4. Test Different Roles
- Logout and login with different accounts
- Notice different permissions per role
- President and Admin have full access
- CFO has finance access
- PM has project management access

---

## Common Commands

### Docker
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart backend

# Seed database
docker exec -it acik-backend npm run seed
```

### Manual
```bash
# Backend
npm run dev          # Development mode
npm start           # Production mode
npm run seed        # Seed database

# Frontend
npm start           # Development mode
npm run build       # Build for production
```

---

## Troubleshooting

### "Cannot connect to database"
**Solution:**
- Ensure MongoDB is running
- Check MONGODB_URI in backend/.env
- Run: `mongod` or start MongoDB service

### "Port 5000 already in use"
**Solution:**
- Change PORT in backend/.env
- Or kill process: `npx kill-port 5000`

### "Port 3000 already in use"
**Solution:**
- Change port when prompted
- Or kill process: `npx kill-port 3000`

### "Login not working"
**Solution:**
- Make sure backend is running
- Run seed script: `npm run seed`
- Clear browser cache
- Check browser console for errors

### "No data showing"
**Solution:**
- Run seed script: `npm run seed` (or `docker exec -it acik-backend npm run seed`)
- Refresh the page
- Check API connection in browser console

---

## Next Steps

1. **Explore the UI**
   - Navigate through all pages
   - Try creating new projects/tasks
   - Test filters and search

2. **Check API**
   - Visit http://localhost:5000
   - View API documentation
   - Test endpoints with Postman

3. **Customize**
   - Modify user roles
   - Add new features
   - Customize styling

4. **Deploy**
   - See PROJECT_README.md for deployment guide
   - Configure production environment
   - Set up domain and SSL

---

## Quick Reference

### URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api

### Default Accounts
| Role | Email | Password |
|------|-------|----------|
| President | president@acik.com | password123 |
| CFO | cfo@acik.com | password123 |
| PM | pm@acik.com | password123 |
| Marketing | marketing@acik.com | password123 |

### Key Directories
- Backend code: `./backend`
- Frontend code: `./frontend`
- MongoDB data: Docker volume or /data/db

---

## Need Help?

- Read the full documentation in PROJECT_README.md
- Check the code comments
- Review API documentation
- Open an issue on GitHub

---

**You're all set! Enjoy using ACIK Management System!** 🚀
