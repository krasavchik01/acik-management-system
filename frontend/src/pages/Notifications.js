import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    // Mock notifications for now
    const mockNotifications = [
      {
        _id: '1',
        type: 'task',
        title: 'New task assigned to you',
        message: 'You have been assigned to "Update project documentation"',
        isRead: false,
        createdAt: new Date().toISOString(),
        link: '/tasks',
        icon: '📝'
      },
      {
        _id: '2',
        type: 'event',
        title: 'Upcoming event tomorrow',
        message: 'ACIK Monthly Conference starts tomorrow at 10:00 AM',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        link: '/events',
        icon: '📅'
      },
      {
        _id: '3',
        type: 'finance',
        title: 'Budget approval required',
        message: 'New budget request from Marketing Department needs your approval',
        isRead: true,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        link: '/finance',
        icon: '💰'
      },
      {
        _id: '4',
        type: 'project',
        title: 'Project milestone completed',
        message: 'Website Redesign project reached 75% completion',
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        link: '/projects',
        icon: '🎯'
      },
      {
        _id: '5',
        type: 'member',
        title: 'New member joined',
        message: 'John Smith has joined the organization',
        isRead: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        link: '/members',
        icon: '👥'
      },
      {
        _id: '6',
        type: 'task',
        title: 'Task deadline approaching',
        message: '"Create marketing materials" is due in 2 days',
        isRead: false,
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        link: '/tasks',
        icon: '⏰'
      },
      {
        _id: '7',
        type: 'report',
        title: 'Monthly report published',
        message: 'November 2024 Financial Report is now available',
        isRead: true,
        createdAt: new Date(Date.now() - 345600000).toISOString(),
        link: '/reports',
        icon: '📊'
      },
      {
        _id: '8',
        type: 'system',
        title: 'System maintenance scheduled',
        message: 'Platform will be under maintenance on Sunday 2:00 AM - 4:00 AM',
        isRead: false,
        createdAt: new Date(Date.now() - 432000000).toISOString(),
        link: null,
        icon: '⚙️'
      }
    ];

    setNotifications(mockNotifications);
    setLoading(false);
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'unread' && !notification.isRead) ||
      (filter === 'read' && notification.isRead);

    const matchesType = typeFilter === 'all' || notification.type === typeFilter;

    return matchesFilter && matchesType;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(n =>
      n._id === id ? { ...n, isRead: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleDeleteNotification = (id) => {
    setNotifications(notifications.filter(n => n._id !== id));
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';

    return 'Just now';
  };

  const getTypeColor = (type) => {
    const colors = {
      'task': 'primary',
      'event': 'success',
      'finance': 'warning',
      'project': 'info',
      'member': 'secondary',
      'report': 'primary',
      'system': 'danger'
    };
    return colors[type] || 'secondary';
  };

  if (loading) {
    return (
      <Layout pageTitle="Notifications">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Notifications">
      <div className="notifications-page">
        {/* Header */}
        <div className="notifications-header">
          <div className="notifications-stats">
            <div className="stat-item">
              <span className="stat-number">{notifications.length}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{unreadCount}</span>
              <span className="stat-label">Unread</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{notifications.filter(n => n.isRead).length}</span>
              <span className="stat-label">Read</span>
            </div>
          </div>

          {unreadCount > 0 && (
            <button className="btn btn-primary" onClick={handleMarkAllAsRead}>
              <span>✓</span>
              Mark All as Read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="notifications-controls">
          <div className="filter-tabs">
            <button
              className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button
              className={`tab-btn ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
            <button
              className={`tab-btn ${filter === 'read' ? 'active' : ''}`}
              onClick={() => setFilter('read')}
            >
              Read ({notifications.filter(n => n.isRead).length})
            </button>
          </div>

          <div className="filter-group">
            <label>Type:</label>
            <select
              className="filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="task">Tasks</option>
              <option value="event">Events</option>
              <option value="finance">Finance</option>
              <option value="project">Projects</option>
              <option value="member">Members</option>
              <option value="report">Reports</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => {
                if (!notification.isRead) {
                  handleMarkAsRead(notification._id);
                }
                if (notification.link) {
                  window.location.href = notification.link;
                }
              }}
            >
              <div className="notification-icon-wrapper">
                <div className={`notification-icon badge-${getTypeColor(notification.type)}`}>
                  {notification.icon}
                </div>
                {!notification.isRead && <span className="unread-dot"></span>}
              </div>

              <div className="notification-content">
                <div className="notification-header-row">
                  <h3 className="notification-title">{notification.title}</h3>
                  <span className="notification-time">{getTimeAgo(notification.createdAt)}</span>
                </div>
                <p className="notification-message">{notification.message}</p>
                <div className="notification-footer">
                  <span className={`type-badge badge-${getTypeColor(notification.type)}`}>
                    {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                  </span>
                </div>
              </div>

              <div className="notification-actions">
                {!notification.isRead && (
                  <button
                    className="action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification._id);
                    }}
                    title="Mark as read"
                  >
                    ✓
                  </button>
                )}
                <button
                  className="action-btn delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNotification(notification._id);
                  }}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}

          {filteredNotifications.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">🔔</span>
              <h3>No notifications</h3>
              <p>You're all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
