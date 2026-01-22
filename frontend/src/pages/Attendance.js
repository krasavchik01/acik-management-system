import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';
import Layout from '../components/Layout';
import './Attendance.css';

const Attendance = () => {
  const [stats, setStats] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('overview'); // overview, calendar, list
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await attendanceAPI.getStats();
      setStats(statsRes.data.data);

      // Mock attendance records
      setAttendanceRecords([
        { _id: '1', member: { name: 'John Smith', memberId: 'M001' }, date: new Date().toISOString(), status: 'Present', time: '09:00' },
        { _id: '2', member: { name: 'Emma Wilson', memberId: 'M002' }, date: new Date().toISOString(), status: 'Late', time: '09:45' },
        { _id: '3', member: { name: 'Michael Brown', memberId: 'M003' }, date: new Date().toISOString(), status: 'Absent', time: null },
        { _id: '4', member: { name: 'Sarah Davis', memberId: 'M004' }, date: new Date(Date.now() - 86400000).toISOString(), status: 'Present', time: '08:55' },
        { _id: '5', member: { name: 'James Miller', memberId: 'M005' }, date: new Date(Date.now() - 86400000).toISOString(), status: 'Present', time: '09:10' },
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setLoading(false);
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    const matchesSearch = record.member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.member.memberId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Present': 'success',
      'Late': 'warning',
      'Absent': 'danger'
    };
    return colors[status] || 'secondary';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Present': '✓',
      'Late': '⚠',
      'Absent': '✗'
    };
    return icons[status] || '○';
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getAttendanceForDate = (date) => {
    return attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.toDateString() === date.toDateString();
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayRecords = getAttendanceForDate(date);
      const isToday = date.toDateString() === today.toDateString();

      const presentCount = dayRecords.filter(r => r.status === 'Present').length;
      const lateCount = dayRecords.filter(r => r.status === 'Late').length;
      const absentCount = dayRecords.filter(r => r.status === 'Absent').length;

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${dayRecords.length > 0 ? 'has-records' : ''}`}
        >
          <div className="day-number">{day}</div>
          {dayRecords.length > 0 && (
            <div className="day-stats">
              {presentCount > 0 && <span className="stat-dot success">{presentCount}</span>}
              {lateCount > 0 && <span className="stat-dot warning">{lateCount}</span>}
              {absentCount > 0 && <span className="stat-dot danger">{absentCount}</span>}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <Layout pageTitle="Attendance">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Attendance">
      <div className="attendance-page">
        {/* Header */}
        <div className="attendance-header">
          <div className="view-tabs">
            <button
              className={`tab-btn ${viewMode === 'overview' ? 'active' : ''}`}
              onClick={() => setViewMode('overview')}
            >
              📊 Overview
            </button>
            <button
              className={`tab-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              📅 Calendar
            </button>
            <button
              className={`tab-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 Records
            </button>
          </div>
          <button className="btn btn-primary">
            <span>➕</span>
            Mark Attendance
          </button>
        </div>

        {/* Overview Mode */}
        {viewMode === 'overview' && stats && (
          <>
            {/* Stats */}
            <div className="attendance-stats">
              <div className="stat-card stat-present">
                <div className="stat-icon">✓</div>
                <div className="stat-content">
                  <p>Present Today</p>
                  <h3>{stats.today.present}</h3>
                  <span className="stat-detail">{((stats.today.present / (stats.today.present + stats.today.absent + stats.today.late)) * 100).toFixed(0)}% attendance rate</span>
                </div>
              </div>

              <div className="stat-card stat-late">
                <div className="stat-icon">⚠</div>
                <div className="stat-content">
                  <p>Late Today</p>
                  <h3>{stats.today.late}</h3>
                  <span className="stat-detail">Arrived after scheduled time</span>
                </div>
              </div>

              <div className="stat-card stat-absent">
                <div className="stat-icon">✗</div>
                <div className="stat-content">
                  <p>Absent Today</p>
                  <h3>{stats.today.absent}</h3>
                  <span className="stat-detail">Not marked present</span>
                </div>
              </div>

              <div className="stat-card stat-total">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <p>Total Members</p>
                  <h3>{stats.today.present + stats.today.absent + stats.today.late}</h3>
                  <span className="stat-detail">Active members</span>
                </div>
              </div>
            </div>

            {/* Recent Records */}
            <div className="recent-section">
              <div className="section-header">
                <h3>Today's Attendance</h3>
                <button
                  className="link-btn"
                  onClick={() => setViewMode('list')}
                >
                  View all →
                </button>
              </div>
              <div className="records-grid">
                {attendanceRecords.filter(r => new Date(r.date).toDateString() === new Date().toDateString()).map((record) => (
                  <div key={record._id} className={`record-card status-${record.status.toLowerCase()}`}>
                    <div className="record-icon">
                      {getStatusIcon(record.status)}
                    </div>
                    <div className="record-info">
                      <strong>{record.member.name}</strong>
                      <span className="member-id">{record.member.memberId}</span>
                    </div>
                    <div className="record-status">
                      <span className={`status-badge ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                      {record.time && <span className="record-time">{record.time}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Calendar Mode */}
        {viewMode === 'calendar' && (
          <div className="calendar-view">
            <div className="calendar-header">
              <button className="calendar-nav-btn" onClick={previousMonth}>
                ‹
              </button>
              <h2 className="calendar-month">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button className="calendar-nav-btn" onClick={nextMonth}>
                ›
              </button>
            </div>

            <div className="calendar-legend">
              <span className="legend-item"><span className="legend-dot success"></span> Present</span>
              <span className="legend-item"><span className="legend-dot warning"></span> Late</span>
              <span className="legend-item"><span className="legend-dot danger"></span> Absent</span>
            </div>

            <div className="calendar-grid">
              <div className="calendar-weekday">Sun</div>
              <div className="calendar-weekday">Mon</div>
              <div className="calendar-weekday">Tue</div>
              <div className="calendar-weekday">Wed</div>
              <div className="calendar-weekday">Thu</div>
              <div className="calendar-weekday">Fri</div>
              <div className="calendar-weekday">Sat</div>
              {renderCalendar()}
            </div>
          </div>
        )}

        {/* List Mode */}
        {viewMode === 'list' && (
          <>
            {/* Search and Filters */}
            <div className="records-controls">
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name or member ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filters">
                <div className="filter-group">
                  <label>Status:</label>
                  <select
                    className="filter-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Records List */}
            <div className="records-list">
              {filteredRecords.map((record) => (
                <div key={record._id} className="record-item">
                  <div className={`record-icon-badge status-${record.status.toLowerCase()}`}>
                    {getStatusIcon(record.status)}
                  </div>

                  <div className="record-details">
                    <div className="record-header-row">
                      <div className="record-member">
                        <strong>{record.member.name}</strong>
                        <span className="member-id">{record.member.memberId}</span>
                      </div>
                      <span className={`status-badge ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </div>

                    <div className="record-meta">
                      <span className="meta-tag">
                        📅 {new Date(record.date).toLocaleDateString()}
                      </span>
                      {record.time && (
                        <span className="meta-tag">
                          🕒 {record.time}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredRecords.length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon">📋</span>
                  <h3>No records found</h3>
                  <p>Try adjusting your filters or mark attendance</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Attendance;
