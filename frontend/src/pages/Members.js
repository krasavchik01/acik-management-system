import React, { useState, useEffect } from 'react';
import { membersAPI } from '../services/api';
import Layout from '../components/Layout';
import './Members.css';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await membersAPI.getAll();
      setMembers(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching members:', error);
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesCategory = filterCategory === 'all' || member.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    const matchesSearch = member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (member.phone && member.phone.includes(searchQuery));
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getCategoryColor = (category) => {
    const colors = {
      'Professional': 'primary',
      'Student': 'info',
      'Corporate': 'success',
      'Honorary': 'warning'
    };
    return colors[category] || 'secondary';
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'success' : 'warning';
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMember(null);
  };

  const getMemberInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  if (loading) {
    return (
      <Layout pageTitle="Members">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Members">
      <div className="members-page">
        {/* Header with stats */}
        <div className="members-header">
          <div className="members-stats">
            <div className="stat-item">
              <span className="stat-number">{members.length}</span>
              <span className="stat-label">Total Members</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {members.filter(m => m.status === 'Active').length}
              </span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {members.filter(m => m.category === 'Professional').length}
              </span>
              <span className="stat-label">Professional</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {members.filter(m => m.category === 'Student').length}
              </span>
              <span className="stat-label">Students</span>
            </div>
          </div>

          <button className="btn btn-primary">
            <span>➕</span>
            Add Member
          </button>
        </div>

        {/* Search and Filters */}
        <div className="members-controls">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search members by name, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filters">
            <div className="filter-group">
              <label>Category:</label>
              <select
                className="filter-select"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All</option>
                <option value="Professional">Professional</option>
                <option value="Student">Student</option>
                <option value="Corporate">Corporate</option>
                <option value="Honorary">Honorary</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Status:</label>
              <select
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="view-switcher">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              ◫
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="members-grid">
            {filteredMembers.map((member) => (
              <div
                key={member._id}
                className="member-card"
                onClick={() => handleMemberClick(member)}
              >
                <div className="member-card-header">
                  <div
                    className="member-avatar"
                    style={{ background: getAvatarColor(member.fullName) }}
                  >
                    {getMemberInitials(member.fullName)}
                  </div>
                  <span className={`status-dot ${member.status === 'Active' ? 'active' : 'inactive'}`}></span>
                </div>

                <div className="member-info">
                  <h3 className="member-name">{member.fullName}</h3>
                  <span className={`category-badge badge-${getCategoryColor(member.category)}`}>
                    {member.category}
                  </span>
                </div>

                <div className="member-contact">
                  <div className="contact-item">
                    <span className="contact-icon">📧</span>
                    <span className="contact-text">{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="contact-item">
                      <span className="contact-icon">📱</span>
                      <span className="contact-text">{member.phone}</span>
                    </div>
                  )}
                </div>

                <div className="member-footer">
                  <div className="member-meta">
                    {member.joinDate && (
                      <span className="meta-tag">
                        📅 Joined {new Date(member.joinDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <span className={`badge badge-${getStatusColor(member.status)}`}>
                    {member.status}
                  </span>
                </div>
              </div>
            ))}

            {filteredMembers.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">👥</span>
                <h3>No members found</h3>
                <p>Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="members-list">
            <table className="members-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Category</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Join Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr
                    key={member._id}
                    onClick={() => handleMemberClick(member)}
                    className="table-row-clickable"
                  >
                    <td>
                      <div className="table-member-info">
                        <div
                          className="member-avatar small"
                          style={{ background: getAvatarColor(member.fullName) }}
                        >
                          {getMemberInitials(member.fullName)}
                        </div>
                        <div className="member-details">
                          <strong>{member.fullName}</strong>
                          <span className="member-id">ID: {member.memberId || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`category-badge badge-${getCategoryColor(member.category)}`}>
                        {member.category}
                      </span>
                    </td>
                    <td>{member.email}</td>
                    <td>{member.phone || '-'}</td>
                    <td>
                      {member.joinDate
                        ? new Date(member.joinDate).toLocaleDateString()
                        : '-'
                      }
                    </td>
                    <td>
                      <span className={`badge badge-${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredMembers.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">👥</span>
                <h3>No members found</h3>
                <p>Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        )}

        {/* Member Detail Modal */}
        {showModal && selectedMember && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-header-content">
                  <div
                    className="member-avatar large"
                    style={{ background: getAvatarColor(selectedMember.fullName) }}
                  >
                    {getMemberInitials(selectedMember.fullName)}
                  </div>
                  <div>
                    <h2>{selectedMember.fullName}</h2>
                    <span className={`category-badge badge-${getCategoryColor(selectedMember.category)}`}>
                      {selectedMember.category}
                    </span>
                  </div>
                </div>
                <button className="modal-close" onClick={closeModal}>✕</button>
              </div>

              <div className="modal-body">
                <div className="modal-section">
                  <label>Status</label>
                  <span className={`badge badge-${getStatusColor(selectedMember.status)}`}>
                    {selectedMember.status}
                  </span>
                </div>

                <div className="modal-section">
                  <label>Member ID</label>
                  <p>{selectedMember.memberId || 'Not assigned'}</p>
                </div>

                <div className="modal-section">
                  <label>Email Address</label>
                  <p>
                    <a href={`mailto:${selectedMember.email}`} className="contact-link">
                      📧 {selectedMember.email}
                    </a>
                  </p>
                </div>

                {selectedMember.phone && (
                  <div className="modal-section">
                    <label>Phone Number</label>
                    <p>
                      <a href={`tel:${selectedMember.phone}`} className="contact-link">
                        📱 {selectedMember.phone}
                      </a>
                    </p>
                  </div>
                )}

                {selectedMember.address && (
                  <div className="modal-section">
                    <label>Address</label>
                    <p>{selectedMember.address}</p>
                  </div>
                )}

                {selectedMember.company && (
                  <div className="modal-section">
                    <label>Company</label>
                    <p>{selectedMember.company}</p>
                  </div>
                )}

                {selectedMember.joinDate && (
                  <div className="modal-section">
                    <label>Join Date</label>
                    <p>{new Date(selectedMember.joinDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                )}

                {selectedMember.birthDate && (
                  <div className="modal-section">
                    <label>Birth Date</label>
                    <p>{new Date(selectedMember.birthDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                )}

                {selectedMember.notes && (
                  <div className="modal-section">
                    <label>Notes</label>
                    <p>{selectedMember.notes}</p>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline" onClick={closeModal}>
                  Close
                </button>
                <button className="btn btn-secondary">
                  Send Email
                </button>
                <button className="btn btn-primary">Edit Member</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Members;
