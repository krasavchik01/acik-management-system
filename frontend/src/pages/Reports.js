import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';
import Layout from '../components/Layout';
import './Reports.css';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await reportsAPI.getAll();
      setReports(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (report.summary && report.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesType && matchesSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Published': 'success',
      'Draft': 'warning',
      'Archived': 'secondary'
    };
    return colors[status] || 'info';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Monthly': '📅',
      'Quarterly': '📊',
      'Annual': '📈',
      'Custom': '📋'
    };
    return icons[type] || '📄';
  };

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReport(null);
  };

  const handleExport = (format) => {
    alert(`Exporting report in ${format} format...`);
  };

  if (loading) {
    return (
      <Layout pageTitle="Reports">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Reports">
      <div className="reports-page">
        {/* Header */}
        <div className="reports-header">
          <div className="reports-stats">
            <div className="stat-item">
              <span className="stat-number">{reports.length}</span>
              <span className="stat-label">Total Reports</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {reports.filter(r => r.status === 'Published').length}
              </span>
              <span className="stat-label">Published</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {reports.filter(r => r.status === 'Draft').length}
              </span>
              <span className="stat-label">Drafts</span>
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => alert('Create new report functionality coming soon!')}>
            <span>➕</span>
            New Report
          </button>
        </div>

        {/* Search and Filters */}
        <div className="reports-controls">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search reports..."
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
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Type:</label>
              <select
                className="filter-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="reports-grid">
          {filteredReports.map((report) => (
            <div
              key={report._id}
              className="report-card"
              onClick={() => handleReportClick(report)}
            >
              <div className="report-icon">
                {getTypeIcon(report.type)}
              </div>

              <div className="report-content">
                <div className="report-header">
                  <h3 className="report-title">{report.title}</h3>
                  <span className={`status-badge badge-${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>

                {report.summary && (
                  <p className="report-summary">{report.summary}</p>
                )}

                <div className="report-meta">
                  <span className="meta-tag">
                    {getTypeIcon(report.type)} {report.type}
                  </span>
                  {report.generatedDate && (
                    <span className="meta-tag">
                      📅 {new Date(report.generatedDate).toLocaleDateString()}
                    </span>
                  )}
                  {report.author && (
                    <span className="meta-tag">
                      👤 {report.author}
                    </span>
                  )}
                </div>
              </div>

              <div className="report-actions">
                <button
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExport('PDF');
                  }}
                  title="Export PDF"
                >
                  📄
                </button>
                <button
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExport('Excel');
                  }}
                  title="Export Excel"
                >
                  📊
                </button>
              </div>
            </div>
          ))}

          {filteredReports.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">📋</span>
              <h3>No reports found</h3>
              <p>Try adjusting your filters or create a new report</p>
            </div>
          )}
        </div>

        {/* Report Detail Modal */}
        {showModal && selectedReport && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>{selectedReport.title}</h2>
                  <span className={`status-badge badge-${getStatusColor(selectedReport.status)}`}>
                    {selectedReport.status}
                  </span>
                </div>
                <button className="modal-close" onClick={closeModal}>✕</button>
              </div>

              <div className="modal-body">
                <div className="modal-section">
                  <label>Type</label>
                  <p>{getTypeIcon(selectedReport.type)} {selectedReport.type}</p>
                </div>

                {selectedReport.summary && (
                  <div className="modal-section">
                    <label>Summary</label>
                    <p>{selectedReport.summary}</p>
                  </div>
                )}

                {selectedReport.generatedDate && (
                  <div className="modal-section">
                    <label>Generated Date</label>
                    <p>{new Date(selectedReport.generatedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                )}

                {selectedReport.author && (
                  <div className="modal-section">
                    <label>Author</label>
                    <p>{selectedReport.author}</p>
                  </div>
                )}

                {selectedReport.description && (
                  <div className="modal-section">
                    <label>Description</label>
                    <p>{selectedReport.description}</p>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline" onClick={closeModal}>
                  Close
                </button>
                <button className="btn btn-secondary" onClick={() => handleExport('PDF')}>
                  Export PDF
                </button>
                <button className="btn btn-primary">View Full Report</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
