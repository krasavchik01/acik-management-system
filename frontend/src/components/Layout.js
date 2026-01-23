import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Topbar from './Topbar';
import './Layout.css';

const Layout = ({ children, pageTitle = 'Dashboard' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuSections = [
    {
      title: 'MAIN',
      items: [
        { path: '/', icon: '📊', label: 'Dashboard' },
        { path: '/analytics', icon: '📈', label: 'Analytics' },
        { path: '/notifications', icon: '🔔', label: 'Notifications' },
        { path: '/attendance', icon: '👥', label: 'Attendance' }
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { path: '/projects', icon: '🎯', label: 'Projects' },
        { path: '/tasks', icon: '✅', label: 'Tasks' },
        { path: '/members', icon: '👤', label: 'Members' },
        { path: '/users', icon: '👨‍💼', label: 'Users' },
        { path: '/events', icon: '📅', label: 'Events' }
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { path: '/finance', icon: '💰', label: 'Finance' },
        { path: '/sponsors', icon: '🤝', label: 'Sponsors' }
      ]
    },
    {
      title: 'REPORTS',
      items: [
        { path: '/reports', icon: '📋', label: 'Reports' }
      ]
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-logo">
              AI
            </div>
            <div className="brand-text">
              <div className="brand-name">ACIK ONE</div>
              <div className="brand-tagline">Management Platform</div>
            </div>
          </div>
        </div>

        <div className="user-profile">
          <div className="avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">{user?.role || 'Member'}</div>
          </div>
        </div>

        <nav className="nav">
          {menuSections.map((section, idx) => (
            <div key={idx} className="nav-section">
              <div className="nav-title">{section.title}</div>
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="main">
        <Topbar pageTitle={pageTitle} />
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
