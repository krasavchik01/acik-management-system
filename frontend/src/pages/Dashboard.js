import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, membersAPI, eventsAPI, financeAPI, attendanceAPI } from '../services/api';
import Layout from '../components/Layout';
import { cache } from '../utils/cache';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    projects: { total: 0, active: 0 },
    tasks: { total: 0, completed: 0 },
    members: { total: 0, active: 0 },
    events: { total: 0, upcoming: 0 },
    finance: { income: 0, expenses: 0, net: 0 },
    attendance: { today: { present: 0, absent: 0, late: 0 } }
  });

  useEffect(() => {
    // Check cache first
    const cachedStats = cache.get('dashboard_stats');
    if (cachedStats) {
      setStats(cachedStats);
      // Refresh in background
      fetchDashboardData(true);
    } else {
      fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projects, members, events, finance, attendance] = await Promise.all([
        projectsAPI.getStats().catch(() => ({ data: { data: { total: 0, active: 0 } } })),
        membersAPI.getStats().catch(() => ({ data: { data: { total: 0, active: 0 } } })),
        eventsAPI.getStats().catch(() => ({ data: { data: { total: 0, upcoming: 0 } } })),
        financeAPI.getDashboard().catch(() => ({ data: { data: { currentMonth: { income: 0, expenses: 0, net: 0 } } } })),
        attendanceAPI.getStats().catch(() => ({ data: { data: { today: { present: 0, absent: 0, late: 0 } } } }))
      ]);

      const newStats = {
        projects: projects.data.data || { total: 0, active: 0 },
        members: members.data.data || { total: 0, active: 0 },
        events: events.data.data || { total: 0, upcoming: 0 },
        finance: finance.data.data?.currentMonth || { income: 0, expenses: 0, net: 0 },
        attendance: attendance.data.data || { today: { present: 0, absent: 0, late: 0 } }
      };

      setStats(newStats);
      cache.set('dashboard_stats', newStats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <Layout pageTitle="Dashboard">
      <div>
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name}!</h1>
            <p className="dashboard-subtitle">Here's what's happening today</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <div className="stat-header">
              <div className="stat-content">
                <p>Total Projects</p>
                <h3>{stats.projects.total}</h3>
                <span className="stat-detail">{stats.projects.active} active</span>
              </div>
              <div className="stat-icon blue">📊</div>
            </div>
          </div>

          <div className="stat-card stat-success">
            <div className="stat-header">
              <div className="stat-content">
                <p>Total Members</p>
                <h3>{stats.members.total}</h3>
                <span className="stat-detail">{stats.members.active} active</span>
              </div>
              <div className="stat-icon green">✅</div>
            </div>
          </div>

          <div className="stat-card stat-warning">
            <div className="stat-header">
              <div className="stat-content">
                <p>Upcoming Events</p>
                <h3>{stats.events.upcoming}</h3>
                <span className="stat-detail">{stats.events.total} total</span>
              </div>
              <div className="stat-icon yellow">📅</div>
            </div>
          </div>

          <div className="stat-card stat-info">
            <div className="stat-header">
              <div className="stat-content">
                <p>Monthly Income</p>
                <h3>${stats.finance.income.toLocaleString()}</h3>
                <span className="stat-detail">
                  ${stats.finance.expenses.toLocaleString()} expenses
                </span>
              </div>
              <div className="stat-icon yellow">💰</div>
            </div>
          </div>

          <div className="stat-card stat-secondary">
            <div className="stat-header">
              <div className="stat-content">
                <p>Present Today</p>
                <h3>{stats.attendance.today.present}</h3>
                <span className="stat-detail">
                  {stats.attendance.today.late} late
                </span>
              </div>
              <div className="stat-icon purple">👥</div>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <Link to="/projects" className="action-card">
                <span className="action-icon">📂</span>
                <h3>Projects</h3>
                <p>Manage your projects</p>
              </Link>
              <Link to="/tasks" className="action-card">
                <span className="action-icon">✅</span>
                <h3>Tasks</h3>
                <p>Track your tasks</p>
              </Link>
              <Link to="/members" className="action-card">
                <span className="action-icon">👥</span>
                <h3>Members</h3>
                <p>View all members</p>
              </Link>
              <Link to="/events" className="action-card">
                <span className="action-icon">📅</span>
                <h3>Events</h3>
                <p>Upcoming events</p>
              </Link>
              <Link to="/finance" className="action-card">
                <span className="action-icon">💰</span>
                <h3>Finance</h3>
                <p>Financial overview</p>
              </Link>
              <Link to="/reports" className="action-card">
                <span className="action-icon">📊</span>
                <h3>Reports</h3>
                <p>View reports</p>
              </Link>
            </div>
          </div>

          <div className="dashboard-row">
            <div className="dashboard-section">
              <div className="section-header">
                <h2>Recent Activity</h2>
                <Link to="/projects" className="section-link">View All</Link>
              </div>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon">📂</div>
                  <div className="activity-content">
                    <p><strong>New project created:</strong> AI Innovation Lab</p>
                    <span className="activity-time">2 hours ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">✅</div>
                  <div className="activity-content">
                    <p><strong>Task completed:</strong> Database Schema Design</p>
                    <span className="activity-time">4 hours ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">👤</div>
                  <div className="activity-content">
                    <p><strong>New member joined:</strong> John Doe</p>
                    <span className="activity-time">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
