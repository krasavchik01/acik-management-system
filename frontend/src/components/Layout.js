import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: '🏠', label: 'Dashboard' },
    { path: '/projects', icon: '📂', label: 'Projects' },
    { path: '/tasks', icon: '✅', label: 'Tasks' },
    { path: '/members', icon: '👥', label: 'Members' },
    { path: '/events', icon: '📅', label: 'Events' },
    { path: '/finance', icon: '💰', label: 'Finance' },
    { path: '/sponsors', icon: '💼', label: 'Sponsors' },
    { path: '/attendance', icon: '📊', label: 'Attendance' },
    { path: '/reports', icon: '📄', label: 'Reports' },
    { path: '/settings', icon: '⚙️', label: 'Settings' }
  ];

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>ACIK</h2>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="user-details">
                <p className="user-name">{user?.name}</p>
                <p className="user-role">{user?.role}</p>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="btn-logout">
            🚪 {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
