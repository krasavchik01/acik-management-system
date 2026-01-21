import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';
import Layout from '../components/Layout';

const Attendance = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await attendanceAPI.getStats();
      setStats(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  if (loading) return <Layout><div className="loading"><div className="spinner"></div></div></Layout>;

  return (
    <Layout>
      <div className="dashboard">
        <h1>Attendance</h1>
        <div className="stats-grid" style={{ marginTop: '30px' }}>
          <div className="stat-card stat-success">
            <div className="stat-content">
              <h3>{stats?.today.present}</h3>
              <p>Present Today</p>
            </div>
          </div>
          <div className="stat-card stat-danger">
            <div className="stat-content">
              <h3>{stats?.today.absent}</h3>
              <p>Absent Today</p>
            </div>
          </div>
          <div className="stat-card stat-warning">
            <div className="stat-content">
              <h3>{stats?.today.late}</h3>
              <p>Late Today</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Attendance;
