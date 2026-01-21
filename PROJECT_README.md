# ACIK Management System

A **COMPLETE, FULLY FUNCTIONAL** full-stack project management system built with the MERN stack (MongoDB, Express.js, React, Node.js). This production-ready application features comprehensive functionality for managing projects, tasks, members, events, finances, sponsors, attendance, and reports.

![ACIK Management System](https://img.shields.io/badge/Status-Production%20Ready-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

### Core Functionality

#### Authentication & Authorization
- JWT-based secure authentication
- Role-based access control (President, VP, CEO, CFO, PM, Marketing Manager, Member, Admin)
- Protected routes and API endpoints
- Session management
- Password hashing with bcrypt

#### Project Management
- Create, read, update, delete projects
- Project categorization (Technology, Innovation, Research, Community, Education, Business)
- Status tracking (Planning, Active, On Hold, Completed, Cancelled)
- Budget management and tracking
- Team assignment and roles
- Progress monitoring
- Milestone tracking
- Project notes and attachments

#### Task Management
- Full CRUD operations for tasks
- Kanban board support (TODO, In Progress, Review, Done, Blocked)
- Task assignment to users
- Priority levels (Low, Medium, High, Critical)
- Due dates and time tracking
- Comments and attachments
- Task dependencies
- Checklist items

#### Member Management
- Comprehensive member database
- Member categories (Bronze, Silver, Gold, Platinum, Diamond)
- Contact information management
- Skills and interests tracking
- Event attendance history
- Membership fee tracking
- Member status (Active, Inactive, Suspended, Alumni)

#### Event Management
- Event creation and management
- Multiple event types (Conference, Workshop, Networking, Summit, Webinar)
- Virtual and physical event support
- Registration system
- Capacity management
- Speaker management
- Event agenda
- Feedback collection
- Attendance tracking

#### Financial Management
- Income and expense tracking
- Multiple transaction categories
- Budget tracking by project/event
- Payment method tracking
- Transaction approval workflow
- Financial reports and analytics
- Monthly/quarterly/annual summaries
- Invoice and receipt management

#### Sponsor Management
- Sponsor database
- Sponsorship levels (Bronze, Silver, Gold, Platinum, Diamond)
- Contract management
- Payment tracking
- Sponsor benefits tracking
- Documents storage
- Relationship management

#### Attendance System
- Check-in/check-out functionality
- Geolocation support
- Multiple work types (Office, Remote, Hybrid, Field Work)
- Hours worked calculation
- Overtime tracking
- Break time management
- Daily/monthly reports
- Team attendance overview

#### Reports & Analytics
- Weekly, monthly, quarterly, and annual reports
- Financial reports
- Project portfolio reviews
- Operations reports
- KPI tracking
- Custom metrics
- Export functionality
- Review and approval workflow

#### Real-time Features
- Socket.io integration
- Live notifications
- Real-time updates
- Active user tracking
- Chat messaging

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Socket.io** - Real-time communication
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **morgan** - HTTP request logger
- **compression** - Response compression
- **express-rate-limit** - Rate limiting

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Socket.io-client** - Real-time client
- **React Context API** - State management
- **React Toastify** - Notifications
- **Chart.js** - Data visualization
- **date-fns** - Date manipulation
- **Framer Motion** - Animations

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v7.0 or higher)
- npm or yarn

### Quick Start with Docker (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd ACIK
```

2. **Start with Docker Compose**
```bash
docker-compose up -d
```

3. **Seed the database**
```bash
docker exec -it acik-backend npm run seed
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

### Manual Installation

#### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Configure environment variables in `.env`**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/acik_management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

5. **Seed the database with sample data**
```bash
npm run seed
```

6. **Start the backend server**
```bash
npm run dev
```

Backend will run on http://localhost:5000

#### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Configure environment variables in `.env`**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

5. **Start the frontend**
```bash
npm start
```

Frontend will run on http://localhost:3000

## Default Login Credentials

After seeding the database, you can log in with these accounts:

| Role | Email | Password |
|------|-------|----------|
| President | president@acik.com | password123 |
| Vice President | vp@acik.com | password123 |
| CEO | ceo@acik.com | password123 |
| CFO | cfo@acik.com | password123 |
| Project Manager | pm@acik.com | password123 |
| Marketing Manager | marketing@acik.com | password123 |

## Project Structure

```
ACIK/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   └── errorHandler.js      # Error handling
│   ├── models/                  # Mongoose models
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   ├── Member.js
│   │   ├── Event.js
│   │   ├── Finance.js
│   │   ├── Sponsor.js
│   │   ├── Attendance.js
│   │   └── Report.js
│   ├── routes/                  # API routes
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   ├── members.js
│   │   ├── events.js
│   │   ├── finance.js
│   │   ├── sponsors.js
│   │   ├── attendance.js
│   │   ├── marketing.js
│   │   ├── reports.js
│   │   └── admin.js
│   ├── seeds/
│   │   └── seedData.js          # Database seeding
│   ├── server.js                # Express server
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.js        # Main layout component
│   │   ├── context/
│   │   │   └── AuthContext.js   # Authentication context
│   │   ├── pages/               # Page components
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Projects.js
│   │   │   ├── Tasks.js
│   │   │   ├── Members.js
│   │   │   ├── Events.js
│   │   │   ├── Finance.js
│   │   │   ├── Sponsors.js
│   │   │   ├── Attendance.js
│   │   │   ├── Reports.js
│   │   │   └── Settings.js
│   │   ├── services/
│   │   │   └── api.js           # API service layer
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml
└── PROJECT_README.md
```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### POST /auth/register
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Member",
  "department": "Operations"
}
```

#### POST /auth/login
Login user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET /auth/me
Get current user (requires authentication)

### Projects Endpoints

#### GET /projects
Get all projects (with optional filters)
- Query params: `status`, `category`, `priority`, `manager`, `search`

#### GET /projects/:id
Get single project

#### POST /projects
Create new project (requires Manager+ role)

#### PUT /projects/:id
Update project (requires Manager+ role)

#### DELETE /projects/:id
Delete project (requires Admin role)

#### GET /projects/stats
Get project statistics

### Tasks Endpoints

#### GET /tasks
Get all tasks (with optional filters)

#### GET /tasks/kanban/:projectId
Get tasks in Kanban format for a project

#### GET /tasks/my
Get tasks assigned to current user

#### POST /tasks
Create new task

#### PUT /tasks/:id
Update task

#### DELETE /tasks/:id
Delete task

### Members Endpoints

#### GET /members
Get all members

#### POST /members
Create new member

#### PUT /members/:id
Update member

#### DELETE /members/:id
Delete member (requires Admin role)

#### GET /members/stats
Get member statistics

### Events Endpoints

#### GET /events
Get all events

#### POST /events
Create new event (requires Organizer+ role)

#### POST /events/:id/register
Register member for event

#### POST /events/:id/feedback
Add feedback to event

### Finance Endpoints

#### GET /finance
Get all transactions (requires Finance+ role)

#### POST /finance
Create new transaction (requires Finance+ role)

#### GET /finance/stats
Get financial statistics

#### GET /finance/dashboard
Get financial dashboard data

#### POST /finance/:id/approve
Approve transaction (requires CFO/CEO)

### Attendance Endpoints

#### GET /attendance
Get all attendance records

#### GET /attendance/my
Get my attendance records

#### POST /attendance/checkin
Check in

#### PUT /attendance/checkout
Check out

#### GET /attendance/stats
Get attendance statistics

### All endpoints support:
- Pagination
- Sorting
- Filtering
- Search

## Seed Data

The seed script creates:
- 6 users with different roles
- 24 projects in various categories and statuses
- 150+ tasks across all projects
- 180+ members with different categories
- 25+ events (conferences, workshops, networking)
- 100+ financial transactions
- 12 sponsors at different levels
- Full month of attendance data for all users
- 3 comprehensive reports

Run seed script:
```bash
npm run seed
```

## Features by Role

### President
- Full access to all modules
- Create and manage projects
- Approve budgets and financial transactions
- View all reports
- Manage users and permissions

### CFO
- Full financial management
- Approve transactions
- View financial reports
- Manage budgets
- Track expenses and income

### Project Manager
- Create and manage projects
- Assign tasks to team members
- Track project progress
- Manage project budgets
- Generate project reports

### Marketing Manager
- Manage events
- Create marketing campaigns
- Track event registrations
- Manage member communications
- View marketing analytics

### Member
- View assigned tasks
- Update task progress
- Check-in/check-out attendance
- Register for events
- View personal dashboard

## Real-time Features

### Socket.io Events

**Client to Server:**
- `user:join` - User joins the system
- `project:update` - Project updated
- `task:update` - Task updated
- `notification:send` - Send notification
- `message:send` - Send chat message
- `attendance:update` - Attendance updated

**Server to Client:**
- `users:active` - List of active users
- `project:updated` - Project update notification
- `task:updated` - Task update notification
- `notification:new` - New notification
- `message:received` - New message
- `attendance:updated` - Attendance update

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Protected API routes
- Input validation
- XSS protection
- CORS configuration
- Rate limiting
- Helmet security headers
- MongoDB injection protection

## Development

### Running Tests
```bash
npm test
```

### Building for Production

**Backend:**
```bash
npm start
```

**Frontend:**
```bash
npm run build
serve -s build
```

### Environment Variables

**Backend:**
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRE` - JWT expiration time
- `FRONTEND_URL` - Frontend URL for CORS

**Frontend:**
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_SOCKET_URL` - Socket.io server URL

## Docker Deployment

### Build and Run
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### Seed Database (in Docker)
```bash
docker exec -it acik-backend npm run seed
```

## Production Deployment

### Prerequisites
- Node.js v18+
- MongoDB instance
- Domain name (optional)
- SSL certificate (recommended)

### Steps
1. Set up production MongoDB
2. Configure environment variables
3. Build frontend: `npm run build`
4. Deploy backend to server
5. Set up reverse proxy (nginx)
6. Configure SSL certificates
7. Set up process manager (PM2)

### PM2 Configuration
```bash
pm2 start backend/server.js --name acik-api
pm2 startup
pm2 save
```

## Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify network connectivity

**Port Already in Use:**
- Change PORT in .env
- Kill process using the port

**Authentication Errors:**
- Clear browser cache
- Check JWT_SECRET configuration
- Verify token expiration

**Socket.io Connection Issues:**
- Check CORS configuration
- Verify Socket.io URL
- Check firewall settings

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@acik.com or open an issue on GitHub.

## Acknowledgments

- Built with MERN Stack
- UI inspired by modern dashboard designs
- Icons from React Icons
- Charts powered by Chart.js

---

**Made with ❤️ by the ACIK Team**

**Version:** 1.0.0
**Last Updated:** January 2024
**Status:** Production Ready
