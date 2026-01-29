import React, { useState } from 'react';
import Layout from '../components/Layout';
import './DeliveryPlan.css';

const DeliveryPlan = () => {
  const [activeSprintTab, setActiveSprintTab] = useState(null);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);

  const projectInfo = {
    title: 'ACIK Management System',
    subtitle: 'Full-Stack Web Application',
    developer: 'Aidos Tazhbenov',
    client: 'ACIK Organization',
    startDate: '03 February 2025',
    endDate: '28 March 2025',
    totalSprints: 4,
    sprintDuration: '2 weeks',
    totalBudget: '$12,000',
    techStack: 'React 18, Node.js, Express, MongoDB, Socket.io, JWT'
  };

  const sprints = [
    {
      id: 1,
      name: 'Sprint 1 — Foundation & Core Infrastructure',
      dates: '03 Feb — 14 Feb 2025',
      status: 'completed',
      progress: 100,
      goal: 'Project setup, authentication, database design, core layout & navigation',
      deliverables: [
        {
          title: 'Project Initialization & Configuration',
          items: [
            'React frontend with CRA + routing setup',
            'Express.js backend with middleware stack (Helmet, CORS, Compression, Rate Limiting)',
            'MongoDB connection with Mongoose ODM',
            'Environment configuration (.env, dotenv)',
            'Git repository with proper .gitignore'
          ],
          status: 'done'
        },
        {
          title: 'Authentication System',
          items: [
            'User model with bcrypt password hashing',
            'JWT token generation & validation',
            'Login / Register API endpoints',
            'Protected route middleware (auth.js)',
            'Role-based authorization middleware (authorize())',
            'AuthContext for frontend state management',
            'Instant login with localStorage cache + background verification'
          ],
          status: 'done'
        },
        {
          title: 'Database Schema Design (9 Models)',
          items: [
            'User — roles, departments, permissions, isDemo flag',
            'Project — budget tracking, milestones, team assignments',
            'Task — status pipeline, assignments, comments, dependencies',
            'Member — categories, skills, contact info, membership fees',
            'Event — types, registration, speakers, pricing, feedback',
            'Finance — income/expense, approval workflow, recurring',
            'Sponsor — levels, payments, benefits tracking',
            'Attendance — check-in/out, geospatial, breaks, overtime',
            'Report — KPIs, charts, access levels, review workflow'
          ],
          status: 'done'
        },
        {
          title: 'Layout & Navigation',
          items: [
            'Responsive sidebar with 4 menu sections (Main, Management, Finance, Reports)',
            'Topbar component with page title',
            'User profile section in sidebar',
            'Active route highlighting',
            'PageLoader with spinner for Suspense fallback'
          ],
          status: 'done'
        }
      ],
      penalty: {
        condition: 'Authentication not working OR database not connected',
        amount: '15% of sprint payment ($450)',
        details: 'If user cannot login/register or database fails to persist data by Sprint 1 deadline'
      }
    },
    {
      id: 2,
      name: 'Sprint 2 — Core Management Modules',
      dates: '17 Feb — 28 Feb 2025',
      status: 'completed',
      progress: 100,
      goal: 'Dashboard, Projects, Tasks, Members, Users management with full CRUD operations',
      deliverables: [
        {
          title: 'Dashboard',
          items: [
            'Statistics cards: Projects, Members, Events, Finance, Attendance',
            'Quick action cards linking to all main pages',
            'Recent activity feed',
            'Data caching with 5-min TTL for instant loading',
            'Parallel API loading with Promise.all()'
          ],
          status: 'done'
        },
        {
          title: 'Projects Module',
          items: [
            'Full CRUD (Create, Read, Update, Delete)',
            '3 view modes: Grid, List, Kanban',
            'Status filtering: Active, Completed, On Hold, Planning',
            'Priority levels: Low, Medium, High, Critical',
            'Budget tracking (allocated / spent / remaining)',
            'Progress bar visualization',
            'Team assignment with roles',
            'Project detail modal'
          ],
          status: 'done'
        },
        {
          title: 'Tasks Module',
          items: [
            'Full CRUD with project linkage',
            'Kanban board: TODO → In Progress → Review → Done → Blocked',
            'User assignment dropdown (populated from Users)',
            'Priority badges with color coding',
            'Due date tracking with overdue detection',
            'Checklist support within tasks',
            'Comments system with author info',
            'Estimated vs actual hours tracking'
          ],
          status: 'done'
        },
        {
          title: 'Members Module',
          items: [
            'Full CRUD with 180+ seed members',
            'Categories: Bronze, Silver, Gold, Platinum, Diamond',
            'Search by name, email, phone',
            'Filter by category and status',
            'Contact information management',
            'Skills and interests tracking',
            'Membership fee tracking'
          ],
          status: 'done'
        },
        {
          title: 'Users Module (Admin Panel)',
          items: [
            'User management with Grid and List views',
            'Admin role with full delete capabilities',
            'DEMO user badge with animated glow effect',
            'Role-based access: 8 roles (Admin, President, VP, CEO, CFO, PM, Marketing, Member)',
            'Department assignment: 7 departments',
            'Activate / Deactivate users',
            'Delete confirmation modal with protection for demo users',
            'Search and filter by role/department'
          ],
          status: 'done'
        }
      ],
      penalty: {
        condition: 'CRUD not functional OR pages not rendering',
        amount: '20% of sprint payment ($600)',
        details: 'If any of the 5 modules fails to create/read/update/delete data, or pages throw errors on load'
      }
    },
    {
      id: 3,
      name: 'Sprint 3 — Advanced Modules & Finance',
      dates: '03 Mar — 14 Mar 2025',
      status: 'completed',
      progress: 100,
      goal: 'Events, Finance, Sponsors, Attendance, Notifications, Reports modules',
      deliverables: [
        {
          title: 'Events Module',
          items: [
            'Full CRUD for events',
            '8 event types: Conference, Workshop, Networking, Summit, Webinar, Meeting, Social, Training',
            'Registration management with capacity limits',
            'Speaker management',
            'Pricing tiers: Free, Member, Non-Member, Early Bird',
            'Virtual / Physical location support',
            'Agenda creation',
            'Event feedback and ratings'
          ],
          status: 'done'
        },
        {
          title: 'Finance Module',
          items: [
            'Income / Expense tracking with 17 categories',
            'Financial dashboard with monthly summary',
            'Payment methods: Cash, Check, Credit Card, Bank Transfer, PayPal, Stripe',
            'Invoice and receipt number tracking',
            'Approval workflow (recordedBy → approvedBy)',
            'Link to Projects, Events, Sponsors',
            'Recurring transaction support'
          ],
          status: 'done'
        },
        {
          title: 'Sponsors Module',
          items: [
            'Sponsor management with 5 levels (Bronze → Diamond)',
            'Contact person management',
            'Company details and website',
            'Payment history tracking',
            'Benefit delivery tracking',
            'Link to Events and Projects',
            'Document management'
          ],
          status: 'done'
        },
        {
          title: 'Attendance Module',
          items: [
            'Check-in / Check-out with 5 methods (Manual, QR, Biometric, RFID, Mobile)',
            'Work types: Office, Remote, Hybrid, Field Work, Client Site',
            'Break tracking: Lunch, Coffee, Meeting',
            'Automatic hours worked calculation with break subtraction',
            'Overtime tracking with approval workflow',
            'Geospatial location indexing (2dsphere)',
            'Mood and productivity tracking',
            'Daily attendance statistics'
          ],
          status: 'done'
        },
        {
          title: 'Notifications Module',
          items: [
            'In-app notification system',
            'Real-time updates via Socket.io',
            'Notification bell in topbar'
          ],
          status: 'done'
        },
        {
          title: 'Reports Module',
          items: [
            '8 report types: Weekly, Monthly, Quarterly, Annual, Project, Financial, Event, Custom',
            'KPI tracking with target vs actual metrics',
            '6 chart types: Line, Bar, Pie, Doughnut, Area, Scatter',
            'Review and approval workflow',
            'Access levels: Public, Internal, Restricted, Confidential',
            'Financial summary integration',
            'Export support'
          ],
          status: 'done'
        }
      ],
      penalty: {
        condition: 'Finance calculations incorrect OR real-time features not working',
        amount: '20% of sprint payment ($600)',
        details: 'If income/expense totals are miscalculated, or Socket.io fails to deliver real-time updates'
      }
    },
    {
      id: 4,
      name: 'Sprint 4 — Optimization, Security & Deployment',
      dates: '17 Mar — 28 Mar 2025',
      status: 'completed',
      progress: 100,
      goal: 'Performance optimization, security hardening, deployment, seed data, final QA',
      deliverables: [
        {
          title: 'Performance Optimization',
          items: [
            'React.lazy() code splitting for all pages (14% bundle reduction)',
            'LocalStorage caching with 5-minute TTL (cache.js utility)',
            'Instant login — load from cache, verify in background',
            'Dashboard cached loading — show instantly, refresh in background',
            'Parallel API calls with Promise.all()',
            'Suspense with PageLoader fallback',
            'Bundle split: 78.74 KB main + lazy chunks (4.8 KB, 4.27 KB, etc.)'
          ],
          status: 'done'
        },
        {
          title: 'Security',
          items: [
            'Helmet.js security headers',
            'CORS configuration',
            'Rate limiting: 100 req / 15 min',
            'bcryptjs password hashing with salt rounds',
            'JWT token-based authentication',
            'Protected routes on frontend and backend',
            'Role-based authorization middleware',
            'Demo user deletion protection'
          ],
          status: 'done'
        },
        {
          title: 'Data Seeding',
          items: [
            '7 users (Admin, President, VP, CEO, CFO, PM, Marketing)',
            '180 members across 5 categories',
            '24 projects with budget and team data',
            '100+ tasks linked to projects and users',
            '25 events with registrations',
            '12 sponsors with payment histories',
            '100 finance transactions (50 income + 50 expense)',
            '30 days of attendance records',
            '3 reports with KPIs'
          ],
          status: 'done'
        },
        {
          title: 'Deployment',
          items: [
            'Frontend deployed to Netlify (app-acik.netlify.app)',
            'Backend deployed (API server)',
            'MongoDB Atlas cloud database',
            'Environment variables configured',
            'CI/CD via Git push to main branch'
          ],
          status: 'done'
        },
        {
          title: 'Data Relationships',
          items: [
            'Tasks → Users (assignedTo, createdBy) with .populate()',
            'Tasks → Projects with .populate()',
            'Projects → Users (manager, team members)',
            'Events → Users (organizer)',
            'Finance → Users, Projects, Events, Sponsors',
            'Attendance → Users, Projects',
            'Reports → Users (createdBy, reviewers, approvedBy)',
            'All relationships display populated names in UI'
          ],
          status: 'done'
        }
      ],
      penalty: {
        condition: 'App not deployed OR critical performance issues',
        amount: '25% of sprint payment ($750)',
        details: 'If app is not accessible online, login takes > 3 seconds, or pages crash on load'
      }
    }
  ];

  const penalties = [
    {
      id: 'P1',
      type: 'Sprint Deadline Miss',
      description: 'If any sprint deliverables are not completed by the sprint end date',
      penalty: '10% deduction per business day of delay (max 5 days)',
      maxPenalty: '50% of sprint payment',
      severity: 'high'
    },
    {
      id: 'P2',
      type: 'Critical Bug in Production',
      description: 'If a critical bug is found in production that prevents core functionality (login, CRUD operations, data loss)',
      penalty: 'Free fix within 24 hours, otherwise $200/day penalty',
      maxPenalty: '$1,000',
      severity: 'critical'
    },
    {
      id: 'P3',
      type: 'Security Vulnerability',
      description: 'If a security vulnerability is discovered (SQL injection, XSS, exposed credentials, unprotected endpoints)',
      penalty: 'Free fix within 12 hours, otherwise $300/day penalty',
      maxPenalty: '$1,500',
      severity: 'critical'
    },
    {
      id: 'P4',
      type: 'Data Loss or Corruption',
      description: 'If user data is lost or corrupted due to developer error (not backup/infrastructure issues)',
      penalty: '20% of total project budget',
      maxPenalty: '$2,400',
      severity: 'critical'
    },
    {
      id: 'P5',
      type: 'Performance Degradation',
      description: 'If page load time exceeds 5 seconds or app becomes unusable under normal load',
      penalty: '5% of sprint payment until resolved',
      maxPenalty: '15% of sprint payment',
      severity: 'medium'
    },
    {
      id: 'P6',
      type: 'Missing Feature',
      description: 'If an agreed-upon feature listed in sprint deliverables is missing or non-functional',
      penalty: '5% per missing feature deducted from sprint payment',
      maxPenalty: '30% of sprint payment',
      severity: 'high'
    },
    {
      id: 'P7',
      type: 'Downtime After Deployment',
      description: 'If the deployed application experiences downtime exceeding 4 hours (excluding infrastructure outages)',
      penalty: '$100 per additional hour of downtime',
      maxPenalty: '$800 per incident',
      severity: 'medium'
    },
    {
      id: 'P8',
      type: 'Abandonment',
      description: 'If developer stops communication for more than 5 business days without prior notice',
      penalty: 'Full refund of all payments made for undelivered sprints',
      maxPenalty: 'Up to 100% of remaining budget',
      severity: 'critical'
    }
  ];

  const getStatusBadge = (status) => {
    const map = {
      done: { label: 'Done', color: '#10b981' },
      'in-progress': { label: 'In Progress', color: '#3b82f6' },
      pending: { label: 'Pending', color: '#6b7280' }
    };
    const s = map[status] || map.pending;
    return <span className="dp-status-badge" style={{ background: s.color }}>{s.label}</span>;
  };

  const getSprintStatusIcon = (status) => {
    if (status === 'completed') return '✅';
    if (status === 'active') return '🔄';
    return '⏳';
  };

  const getSeverityColor = (severity) => {
    const map = {
      critical: '#ef4444',
      high: '#f59e0b',
      medium: '#3b82f6',
      low: '#10b981'
    };
    return map[severity] || '#6b7280';
  };

  return (
    <Layout pageTitle="Delivery Plan">
      <div className="delivery-plan-page">
        {/* Header */}
        <div className="dp-hero">
          <div className="dp-hero-content">
            <div className="dp-hero-badge">DELIVERY PLAN</div>
            <h1 className="dp-hero-title">{projectInfo.title}</h1>
            <p className="dp-hero-subtitle">{projectInfo.subtitle}</p>
            <div className="dp-hero-meta">
              <div className="dp-hero-meta-item">
                <span className="dp-meta-label">Developer</span>
                <span className="dp-meta-value">{projectInfo.developer}</span>
              </div>
              <div className="dp-hero-meta-item">
                <span className="dp-meta-label">Client</span>
                <span className="dp-meta-value">{projectInfo.client}</span>
              </div>
              <div className="dp-hero-meta-item">
                <span className="dp-meta-label">Duration</span>
                <span className="dp-meta-value">{projectInfo.startDate} — {projectInfo.endDate}</span>
              </div>
              <div className="dp-hero-meta-item">
                <span className="dp-meta-label">Budget</span>
                <span className="dp-meta-value">{projectInfo.totalBudget}</span>
              </div>
            </div>
          </div>
          <div className="dp-hero-stats">
            <div className="dp-stat-card">
              <div className="dp-stat-number">{projectInfo.totalSprints}</div>
              <div className="dp-stat-label">Sprints</div>
            </div>
            <div className="dp-stat-card">
              <div className="dp-stat-number">12</div>
              <div className="dp-stat-label">Pages</div>
            </div>
            <div className="dp-stat-card">
              <div className="dp-stat-number">9</div>
              <div className="dp-stat-label">Models</div>
            </div>
            <div className="dp-stat-card">
              <div className="dp-stat-number">11</div>
              <div className="dp-stat-label">API Routes</div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="dp-tech-stack">
          <h3>Tech Stack</h3>
          <div className="dp-tech-tags">
            {['React 18', 'Node.js', 'Express', 'MongoDB', 'Mongoose', 'Socket.io', 'JWT', 'bcrypt', 'Helmet', 'Chart.js', 'Axios', 'Netlify'].map(tech => (
              <span key={tech} className="dp-tech-tag">{tech}</span>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="dp-section">
          <div className="dp-section-header">
            <h2>Sprint Timeline</h2>
            <button className="dp-penalty-btn" onClick={() => setShowPenaltyModal(true)}>
              Penalties & SLA
            </button>
          </div>

          <div className="dp-timeline">
            {sprints.map((sprint) => (
              <div key={sprint.id} className={`dp-sprint-card ${sprint.status}`}>
                <div
                  className="dp-sprint-header"
                  onClick={() => setActiveSprintTab(activeSprintTab === sprint.id ? null : sprint.id)}
                >
                  <div className="dp-sprint-left">
                    <span className="dp-sprint-icon">{getSprintStatusIcon(sprint.status)}</span>
                    <div>
                      <h3 className="dp-sprint-name">{sprint.name}</h3>
                      <p className="dp-sprint-dates">{sprint.dates}</p>
                    </div>
                  </div>
                  <div className="dp-sprint-right">
                    <div className="dp-progress-bar">
                      <div
                        className="dp-progress-fill"
                        style={{ width: `${sprint.progress}%` }}
                      />
                    </div>
                    <span className="dp-progress-text">{sprint.progress}%</span>
                    <span className={`dp-expand-icon ${activeSprintTab === sprint.id ? 'open' : ''}`}>
                      ▼
                    </span>
                  </div>
                </div>

                {activeSprintTab === sprint.id && (
                  <div className="dp-sprint-body">
                    <div className="dp-sprint-goal">
                      <strong>Goal:</strong> {sprint.goal}
                    </div>

                    <div className="dp-deliverables">
                      {sprint.deliverables.map((del, idx) => (
                        <div key={idx} className="dp-deliverable">
                          <div className="dp-deliverable-header">
                            <h4>{del.title}</h4>
                            {getStatusBadge(del.status)}
                          </div>
                          <ul className="dp-deliverable-list">
                            {del.items.map((item, i) => (
                              <li key={i}>
                                <span className="dp-check">&#10003;</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="dp-sprint-penalty">
                      <div className="dp-penalty-icon">&#9888;</div>
                      <div>
                        <strong>If Not Delivered:</strong> {sprint.penalty.condition}
                        <br />
                        <span className="dp-penalty-amount">Penalty: {sprint.penalty.amount}</span>
                        <br />
                        <span className="dp-penalty-detail">{sprint.penalty.details}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Summary Table */}
        <div className="dp-section">
          <h2>Deliverables Summary</h2>
          <div className="dp-table-wrapper">
            <table className="dp-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Sprint</th>
                  <th>Features</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Auth & DB</strong></td>
                  <td>Sprint 1</td>
                  <td>JWT Login, 9 Models, Role-based Access</td>
                  <td><span className="dp-status-done">Delivered</span></td>
                </tr>
                <tr>
                  <td><strong>Dashboard</strong></td>
                  <td>Sprint 2</td>
                  <td>Stats, Activity Feed, Cached Loading</td>
                  <td><span className="dp-status-done">Delivered</span></td>
                </tr>
                <tr>
                  <td><strong>Projects</strong></td>
                  <td>Sprint 2</td>
                  <td>CRUD, Grid/List/Kanban, Budget, Teams</td>
                  <td><span className="dp-status-done">Delivered</span></td>
                </tr>
                <tr>
                  <td><strong>Tasks</strong></td>
                  <td>Sprint 2</td>
                  <td>CRUD, Kanban Pipeline, Assignment, Comments</td>
                  <td><span className="dp-status-done">Delivered</span></td>
                </tr>
                <tr>
                  <td><strong>Members</strong></td>
                  <td>Sprint 2</td>
                  <td>CRUD, Categories, Search, 180+ Records</td>
                  <td><span className="dp-status-done">Delivered</span></td>
                </tr>
                <tr>
                  <td><strong>Users</strong></td>
                  <td>Sprint 2</td>
                  <td>Admin Panel, DEMO Badges, Delete, Roles</td>
                  <td><span className="dp-status-done">Delivered</span></td>
                </tr>
                <tr>
                  <td><strong>Events</strong></td>
                  <td>Sprint 3</td>
                  <td>CRUD, Registration, Pricing, 8 Types</td>
                  <td><span className="dp-status-done">Delivered</span></td>
                </tr>
                <tr>
                  <td><strong>Finance</strong></td>
                  <td>Sprint 3</td>
                  <td>Income/Expense, Dashboard, Approvals</td>
                  <td><span className="dp-status-done">Delivered</span></td>
                </tr>
                <tr>
                  <td><strong>Sponsors</strong></td>
                  <td>Sprint 3</td>
                  <td>Levels, Payments, Benefits, Documents</td>
                  <td><span className="dp-status-done">Delivered</span></td>
                </tr>
                <tr>
                  <td><strong>Attendance</strong></td>
                  <td>Sprint 3</td>
                  <td>Check-in/out, Overtime, Geospatial, Breaks</td>
                  <td><span className="dp-status-done">Delivered</span></td>
                </tr>
                <tr>
                  <td><strong>Notifications</strong></td>
                  <td>Sprint 3</td>
                  <td>Real-time Socket.io, In-app Alerts</td>
                  <td><span className="dp-status-done">Delivered</span></td>
                </tr>
                <tr>
                  <td><strong>Reports</strong></td>
                  <td>Sprint 3</td>
                  <td>KPIs, Charts, Access Levels, Workflows</td>
                  <td><span className="dp-status-done">Delivered</span></td>
                </tr>
                <tr>
                  <td><strong>Optimization</strong></td>
                  <td>Sprint 4</td>
                  <td>Lazy Loading, Caching, Code Splitting</td>
                  <td><span className="dp-status-done">Delivered</span></td>
                </tr>
                <tr>
                  <td><strong>Deployment</strong></td>
                  <td>Sprint 4</td>
                  <td>Netlify, MongoDB Atlas, CI/CD</td>
                  <td><span className="dp-status-done">Delivered</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Signature Block */}
        <div className="dp-section">
          <div className="dp-signatures">
            <h2>Agreement</h2>
            <p className="dp-agreement-text">
              This Delivery Plan constitutes a binding agreement between the Developer and the Client.
              All deliverables listed above are subject to the penalty clauses outlined in the Penalties & SLA section.
              Both parties agree to the terms, timelines, and consequences of non-delivery as specified herein.
            </p>
            <div className="dp-signature-grid">
              <div className="dp-signature-block">
                <div className="dp-signature-line"></div>
                <p className="dp-signature-name">Aidos Tazhbenov</p>
                <p className="dp-signature-role">Developer</p>
                <p className="dp-signature-date">Date: _______________</p>
              </div>
              <div className="dp-signature-block">
                <div className="dp-signature-line"></div>
                <p className="dp-signature-name">ACIK Organization</p>
                <p className="dp-signature-role">Client Representative</p>
                <p className="dp-signature-date">Date: _______________</p>
              </div>
            </div>
          </div>
        </div>

        {/* Penalty Modal */}
        {showPenaltyModal && (
          <div className="dp-modal-overlay" onClick={() => setShowPenaltyModal(false)}>
            <div className="dp-modal" onClick={(e) => e.stopPropagation()}>
              <div className="dp-modal-header">
                <h2>Penalties & SLA Agreement</h2>
                <button className="dp-modal-close" onClick={() => setShowPenaltyModal(false)}>
                  &times;
                </button>
              </div>
              <div className="dp-modal-body">
                <p className="dp-modal-intro">
                  The following penalties apply if the developer (Aidos Tazhbenov) fails to meet
                  the agreed-upon deliverables, timelines, or quality standards for the ACIK Management System project.
                </p>

                <div className="dp-penalties-list">
                  {penalties.map((p) => (
                    <div key={p.id} className="dp-penalty-card">
                      <div className="dp-penalty-card-header">
                        <div>
                          <span
                            className="dp-severity-badge"
                            style={{ background: getSeverityColor(p.severity) }}
                          >
                            {p.severity.toUpperCase()}
                          </span>
                          <span className="dp-penalty-id">{p.id}</span>
                        </div>
                        <h4>{p.type}</h4>
                      </div>
                      <p className="dp-penalty-desc">{p.description}</p>
                      <div className="dp-penalty-details">
                        <div className="dp-penalty-row">
                          <span className="dp-penalty-label">Penalty:</span>
                          <span className="dp-penalty-val">{p.penalty}</span>
                        </div>
                        <div className="dp-penalty-row">
                          <span className="dp-penalty-label">Max Penalty:</span>
                          <span className="dp-penalty-val dp-penalty-max">{p.maxPenalty}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="dp-penalty-footer">
                  <h4>General Terms</h4>
                  <ul>
                    <li>All penalties are calculated based on business days only</li>
                    <li>Force majeure events (natural disasters, infrastructure provider outages) are excluded</li>
                    <li>Penalties are capped at 50% of total project budget ($6,000)</li>
                    <li>Bug fix SLA: Critical — 24h, High — 48h, Medium — 72h, Low — 1 week</li>
                    <li>30-day warranty period after final delivery for bug fixes at no additional cost</li>
                    <li>Disputes are resolved via written communication first, then arbitration if needed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DeliveryPlan;
