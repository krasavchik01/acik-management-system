import React, { useState, useEffect } from 'react';
import { financeAPI } from '../services/api';
import Layout from '../components/Layout';
import './Finance.css';

const Finance = () => {
  const [dashboard, setDashboard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('overview'); // overview, transactions
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      const dashboardRes = await financeAPI.getDashboard();
      setDashboard(dashboardRes.data.data);

      // Mock transactions for demo
      setTransactions([
        { _id: '1', type: 'Income', category: 'Membership', amount: 500, description: 'Monthly membership fees', date: new Date().toISOString(), status: 'Completed' },
        { _id: '2', type: 'Expense', category: 'Event', amount: 250, description: 'Conference venue booking', date: new Date(Date.now() - 86400000).toISOString(), status: 'Completed' },
        { _id: '3', type: 'Income', category: 'Sponsorship', amount: 1000, description: 'Corporate sponsorship', date: new Date(Date.now() - 172800000).toISOString(), status: 'Completed' },
        { _id: '4', type: 'Expense', category: 'Marketing', amount: 150, description: 'Social media ads', date: new Date(Date.now() - 259200000).toISOString(), status: 'Pending' },
        { _id: '5', type: 'Income', category: 'Event', amount: 750, description: 'Workshop ticket sales', date: new Date(Date.now() - 345600000).toISOString(), status: 'Completed' },
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching finance data:', error);
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getCategoryColor = (category) => {
    const colors = {
      'Membership': 'primary',
      'Event': 'success',
      'Sponsorship': 'warning',
      'Marketing': 'info',
      'Other': 'secondary'
    };
    return colors[category] || 'secondary';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Membership': '👥',
      'Event': '🎤',
      'Sponsorship': '🤝',
      'Marketing': '📢',
      'Other': '💼'
    };
    return icons[category] || '💼';
  };

  // Simple bar chart component
  const BarChart = ({ data, height = 200 }) => {
    if (!data || data.length === 0) return null;
    const maxValue = Math.max(...data.map(d => d.value));

    return (
      <div className="bar-chart" style={{ height: `${height}px` }}>
        {data.map((item, idx) => (
          <div key={idx} className="bar-item">
            <div className="bar-wrapper">
              <div
                className="bar-fill"
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                  background: item.color || 'var(--primary)'
                }}
              >
                <span className="bar-value">${item.value}</span>
              </div>
            </div>
            <div className="bar-label">{item.label}</div>
          </div>
        ))}
      </div>
    );
  };

  // Simple donut chart component
  const DonutChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
      <div className="donut-chart-container">
        <svg className="donut-chart" viewBox="0 0 200 200">
          {data.map((item, idx) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;

            const startRad = (startAngle - 90) * (Math.PI / 180);
            const endRad = (startAngle + angle - 90) * (Math.PI / 180);

            const x1 = 100 + 70 * Math.cos(startRad);
            const y1 = 100 + 70 * Math.sin(startRad);
            const x2 = 100 + 70 * Math.cos(endRad);
            const y2 = 100 + 70 * Math.sin(endRad);

            const largeArc = angle > 180 ? 1 : 0;

            const pathData = [
              `M 100 100`,
              `L ${x1} ${y1}`,
              `A 70 70 0 ${largeArc} 1 ${x2} ${y2}`,
              `Z`
            ].join(' ');

            return (
              <path
                key={idx}
                d={pathData}
                fill={item.color}
                opacity="0.9"
              />
            );
          })}
          <circle cx="100" cy="100" r="50" fill="var(--surface)" />
          <text x="100" y="95" textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--text-primary)">
            ${total}
          </text>
          <text x="100" y="110" textAnchor="middle" fontSize="12" fill="var(--text-secondary)">
            Total
          </text>
        </svg>
        <div className="donut-legend">
          {data.map((item, idx) => (
            <div key={idx} className="legend-item">
              <div className="legend-color" style={{ background: item.color }}></div>
              <span className="legend-label">{item.label}</span>
              <span className="legend-value">${item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout pageTitle="Finance">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  const monthlyData = [
    { label: 'Jan', value: 4500, color: 'linear-gradient(135deg, #10b981, #34d399)' },
    { label: 'Feb', value: 5200, color: 'linear-gradient(135deg, #10b981, #34d399)' },
    { label: 'Mar', value: 4800, color: 'linear-gradient(135deg, #10b981, #34d399)' },
    { label: 'Apr', value: 6100, color: 'linear-gradient(135deg, #10b981, #34d399)' },
    { label: 'May', value: 5500, color: 'linear-gradient(135deg, #10b981, #34d399)' },
    { label: 'Jun', value: dashboard?.currentMonth.net || 0, color: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
  ];

  const expensesByCategory = [
    { label: 'Events', value: 2500, color: '#3b82f6' },
    { label: 'Marketing', value: 1200, color: '#10b981' },
    { label: 'Operations', value: 800, color: '#f59e0b' },
    { label: 'Other', value: 500, color: '#8b5cf6' },
  ];

  return (
    <Layout pageTitle="Finance">
      <div className="finance-page">
        {/* Header */}
        <div className="finance-header">
          <div className="view-tabs">
            <button
              className={`tab-btn ${viewMode === 'overview' ? 'active' : ''}`}
              onClick={() => setViewMode('overview')}
            >
              📊 Overview
            </button>
            <button
              className={`tab-btn ${viewMode === 'transactions' ? 'active' : ''}`}
              onClick={() => setViewMode('transactions')}
            >
              💳 Transactions
            </button>
          </div>
          <button className="btn btn-primary">
            <span>➕</span>
            New Transaction
          </button>
        </div>

        {/* Overview Mode */}
        {viewMode === 'overview' && dashboard && (
          <>
            {/* Financial Stats */}
            <div className="finance-stats">
              <div className="stat-card stat-income">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <p>Total Income</p>
                  <h3>${dashboard.currentMonth.income.toLocaleString()}</h3>
                  <span className="stat-change positive">+12.5% from last month</span>
                </div>
              </div>

              <div className="stat-card stat-expense">
                <div className="stat-icon">💸</div>
                <div className="stat-content">
                  <p>Total Expenses</p>
                  <h3>${dashboard.currentMonth.expenses.toLocaleString()}</h3>
                  <span className="stat-change negative">+8.2% from last month</span>
                </div>
              </div>

              <div className="stat-card stat-net">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <p>Net Income</p>
                  <h3>${dashboard.currentMonth.net.toLocaleString()}</h3>
                  <span className="stat-change positive">+18.3% from last month</span>
                </div>
              </div>

              <div className="stat-card stat-balance">
                <div className="stat-icon">🏦</div>
                <div className="stat-content">
                  <p>Current Balance</p>
                  <h3>${(dashboard.currentMonth.income * 3).toLocaleString()}</h3>
                  <span className="stat-detail">As of today</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Monthly Revenue</h3>
                  <span className="chart-subtitle">Last 6 months</span>
                </div>
                <BarChart data={monthlyData} height={250} />
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h3>Expenses by Category</h3>
                  <span className="chart-subtitle">This month</span>
                </div>
                <DonutChart data={expensesByCategory} />
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="recent-section">
              <div className="section-header">
                <h3>Recent Transactions</h3>
                <button
                  className="link-btn"
                  onClick={() => setViewMode('transactions')}
                >
                  View all →
                </button>
              </div>
              <div className="transactions-preview">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction._id} className="transaction-preview-item">
                    <div className="transaction-icon-badge" style={{
                      background: transaction.type === 'Income' ? '#d1fae5' : '#fee2e2'
                    }}>
                      {getCategoryIcon(transaction.category)}
                    </div>
                    <div className="transaction-info">
                      <strong>{transaction.description}</strong>
                      <span className="transaction-category">{transaction.category}</span>
                    </div>
                    <div className={`transaction-amount ${transaction.type.toLowerCase()}`}>
                      {transaction.type === 'Income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Transactions Mode */}
        {viewMode === 'transactions' && (
          <>
            {/* Search and Filters */}
            <div className="transactions-controls">
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filters">
                <div className="filter-group">
                  <label>Type:</label>
                  <select
                    className="filter-select"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="transactions-list">
              {filteredTransactions.map((transaction) => (
                <div key={transaction._id} className="transaction-item">
                  <div className="transaction-main">
                    <div className="transaction-icon-badge" style={{
                      background: transaction.type === 'Income'
                        ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)'
                        : 'linear-gradient(135deg, #fee2e2, #fecaca)'
                    }}>
                      {getCategoryIcon(transaction.category)}
                    </div>

                    <div className="transaction-details">
                      <div className="transaction-header-row">
                        <h4 className="transaction-description">{transaction.description}</h4>
                        <div className={`transaction-amount ${transaction.type.toLowerCase()}`}>
                          {transaction.type === 'Income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                        </div>
                      </div>

                      <div className="transaction-meta">
                        <span className={`category-badge badge-${getCategoryColor(transaction.category)}`}>
                          {transaction.category}
                        </span>
                        <span className="meta-tag">
                          📅 {new Date(transaction.date).toLocaleDateString()}
                        </span>
                        <span className="meta-tag">
                          {transaction.type === 'Income' ? '💰' : '💸'} {transaction.type}
                        </span>
                        <span className={`status-badge ${transaction.status.toLowerCase()}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredTransactions.length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon">💳</span>
                  <h3>No transactions found</h3>
                  <p>Try adjusting your filters or add a new transaction</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Finance;
