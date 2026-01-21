import React, { useState, useEffect } from 'react';
import { financeAPI } from '../services/api';
import Layout from '../components/Layout';

const Finance = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await financeAPI.getDashboard();
      setDashboard(response.data.data);
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
        <h1>Finance Dashboard</h1>
        <div className="stats-grid" style={{ marginTop: '30px' }}>
          <div className="stat-card stat-success">
            <div className="stat-content">
              <h3>${dashboard?.currentMonth.income.toLocaleString()}</h3>
              <p>Monthly Income</p>
            </div>
          </div>
          <div className="stat-card stat-danger">
            <div className="stat-content">
              <h3>${dashboard?.currentMonth.expenses.toLocaleString()}</h3>
              <p>Monthly Expenses</p>
            </div>
          </div>
          <div className="stat-card stat-info">
            <div className="stat-content">
              <h3>${dashboard?.currentMonth.net.toLocaleString()}</h3>
              <p>Net Income</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Finance;
