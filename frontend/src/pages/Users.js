import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import CreateModal from '../components/CreateModal';
import { cache } from '../utils/cache';
import { toast } from 'react-toastify';
import './Users.css';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'President';

  useEffect(() => {
    const cachedUsers = cache.get('users');
    if (cachedUsers) {
      setUsers(cachedUsers);
      setLoading(false);
      fetchUsers(true); // Refresh in background
    } else {
      fetchUsers();
    }
  }, []);

  const fetchUsers = async (background = false) => {
    try {
      const response = await adminAPI.getUsers();
      const data = response.data.data;
      setUsers(data);
      cache.set('users', data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      if (!background) setLoading(false);
    }
  };

  const handleCreateUser = async (formData) => {
    try {
      await adminAPI.updateUser('new', formData);
      cache.clear('users');
      await fetchUsers();
    } catch (error) {
      throw error;
    }
  };

  const userFields = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      placeholder: 'Enter full name',
      required: true
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'user@example.com',
      required: true
    },
    {
      name: 'password',
      label: 'Password',
      type: 'text',
      placeholder: 'Minimum 6 characters',
      required: true
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: [
        { value: 'President', label: 'President' },
        { value: 'Vice President', label: 'Vice President' },
        { value: 'CEO', label: 'CEO' },
        { value: 'CFO', label: 'CFO' },
        { value: 'Project Manager', label: 'Project Manager' },
        { value: 'Marketing Manager', label: 'Marketing Manager' },
        { value: 'Member', label: 'Member' },
        { value: 'Admin', label: 'Admin' }
      ]
    },
    {
      name: 'department',
      label: 'Department',
      type: 'select',
      required: true,
      options: [
        { value: 'Executive', label: 'Executive' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Projects', label: 'Projects' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Operations', label: 'Operations' },
        { value: 'HR', label: 'HR' },
        { value: 'IT', label: 'IT' }
      ]
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'text',
      placeholder: '+1 234 567 8900',
      required: false
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesDepartment && matchesSearch;
  });

  const getRoleColor = (role) => {
    const colors = {
      'President': 'danger',
      'Vice President': 'danger',
      'CEO': 'warning',
      'CFO': 'warning',
      'Project Manager': 'primary',
      'Marketing Manager': 'primary',
      'Admin': 'info',
      'Member': 'secondary'
    };
    return colors[role] || 'secondary';
  };

  const getRoleIcon = (role) => {
    const icons = {
      'President': '👑',
      'Vice President': '🎖️',
      'CEO': '💼',
      'CFO': '💰',
      'Project Manager': '📊',
      'Marketing Manager': '📢',
      'Admin': '⚙️',
      'Member': '👤'
    };
    return icons[role] || '👤';
  };

  const getDepartmentColor = (department) => {
    const colors = {
      'Executive': 'danger',
      'Finance': 'warning',
      'Projects': 'primary',
      'Marketing': 'info',
      'Operations': 'success',
      'HR': 'secondary',
      'IT': 'primary'
    };
    return colors[department] || 'secondary';
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const getUserInitials = (name) => {
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

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await adminAPI.updateUser(userId, { isActive: !currentStatus });
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
      cache.clear('users');
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteClick = (user) => {
    if (user.isDemo) {
      toast.warning('Demo users cannot be deleted');
      return;
    }
    if (user._id === currentUser?._id) {
      toast.error('You cannot delete yourself');
      return;
    }
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await adminAPI.deleteUser(userToDelete._id);
      setUsers(users.filter(u => u._id !== userToDelete._id));
      cache.clear('users');
      toast.success(`User ${userToDelete.name} deleted successfully`);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      if (showModal && selectedUser?._id === userToDelete._id) {
        closeModal();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Users">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Users">
      <div className="users-page">
        {/* Header with stats */}
        <div className="users-header">
          <div className="users-stats">
            <div className="stat-item">
              <span className="stat-number">{users.length}</span>
              <span className="stat-label">Total Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {users.filter(u => u.isActive).length}
              </span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {users.filter(u => u.role === 'Admin' || u.role === 'President').length}
              </span>
              <span className="stat-label">Admins</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {users.filter(u => u.role === 'Project Manager').length}
              </span>
              <span className="stat-label">Managers</span>
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <span>➕</span>
            Add User
          </button>
        </div>

        {/* Search and Filters */}
        <div className="users-controls">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filters">
            <div className="filter-group">
              <label>Role:</label>
              <select
                className="filter-select"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All</option>
                <option value="President">President</option>
                <option value="Vice President">Vice President</option>
                <option value="CEO">CEO</option>
                <option value="CFO">CFO</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Marketing Manager">Marketing Manager</option>
                <option value="Admin">Admin</option>
                <option value="Member">Member</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Department:</label>
              <select
                className="filter-select"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <option value="all">All</option>
                <option value="Executive">Executive</option>
                <option value="Finance">Finance</option>
                <option value="Projects">Projects</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
                <option value="HR">HR</option>
                <option value="IT">IT</option>
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
          <div className="users-grid">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="user-card"
                onClick={() => handleUserClick(user)}
              >
                <div className="user-card-header">
                  <div
                    className="user-avatar"
                    style={{ background: getAvatarColor(user.name) }}
                  >
                    {getUserInitials(user.name)}
                  </div>
                  <span className={`status-dot ${user.isActive ? 'active' : 'inactive'}`}></span>
                </div>

                <div className="user-info">
                  <h3 className="user-name">{user.name}</h3>
                  <div className="user-badges">
                    <span className={`role-badge badge-${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)} {user.role}
                    </span>
                    {user.isDemo && (
                      <span className="demo-badge">
                        DEMO
                      </span>
                    )}
                  </div>
                </div>

                <div className="user-department">
                  <span className={`department-badge badge-${getDepartmentColor(user.department)}`}>
                    {user.department}
                  </span>
                </div>

                <div className="user-contact">
                  <div className="contact-item">
                    <span className="contact-icon">📧</span>
                    <span className="contact-text">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="contact-item">
                      <span className="contact-icon">📱</span>
                      <span className="contact-text">{user.phone}</span>
                    </div>
                  )}
                </div>

                <div className="user-footer">
                  <span className={`badge badge-${user.isActive ? 'success' : 'warning'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {user.lastLogin && (
                    <span className="last-login">
                      🕒 {new Date(user.lastLogin).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">👥</span>
                <h3>No users found</h3>
                <p>Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="users-list">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="table-row-clickable"
                  >
                    <td onClick={() => handleUserClick(user)}>
                      <div className="table-user-info">
                        <div
                          className="user-avatar small"
                          style={{ background: getAvatarColor(user.name) }}
                        >
                          {getUserInitials(user.name)}
                        </div>
                        <strong>{user.name}</strong>
                      </div>
                    </td>
                    <td onClick={() => handleUserClick(user)}>
                      <span className={`role-badge badge-${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)} {user.role}
                      </span>
                      {user.isDemo && (
                        <span className="demo-badge" style={{ marginLeft: '8px' }}>
                          DEMO
                        </span>
                      )}
                    </td>
                    <td onClick={() => handleUserClick(user)}>
                      <span className={`department-badge badge-${getDepartmentColor(user.department)}`}>
                        {user.department}
                      </span>
                    </td>
                    <td onClick={() => handleUserClick(user)}>{user.email}</td>
                    <td onClick={() => handleUserClick(user)}>{user.phone || '-'}</td>
                    <td onClick={() => handleUserClick(user)}>
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td onClick={() => handleUserClick(user)}>
                      <span className={`badge badge-${user.isActive ? 'success' : 'warning'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {isAdmin && (
                          <button
                            className={`btn btn-sm ${user.isActive ? 'btn-outline' : 'btn-success'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleActive(user._id, user.isActive);
                            }}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(user);
                            }}
                            disabled={user.isDemo || user._id === currentUser?._id}
                            title={user.isDemo ? 'Cannot delete demo users' : user._id === currentUser?._id ? 'Cannot delete yourself' : 'Delete user'}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">👥</span>
                <h3>No users found</h3>
                <p>Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        )}

        {/* User Detail Modal */}
        {showModal && selectedUser && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-header-content">
                  <div
                    className="user-avatar large"
                    style={{ background: getAvatarColor(selectedUser.name) }}
                  >
                    {getUserInitials(selectedUser.name)}
                  </div>
                  <div>
                    <h2>{selectedUser.name}</h2>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={`role-badge badge-${getRoleColor(selectedUser.role)}`}>
                        {getRoleIcon(selectedUser.role)} {selectedUser.role}
                      </span>
                      {selectedUser.isDemo && (
                        <span className="demo-badge">
                          DEMO
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button className="modal-close" onClick={closeModal}>✕</button>
              </div>

              <div className="modal-body">
                <div className="modal-section">
                  <label>Status</label>
                  <span className={`badge badge-${selectedUser.isActive ? 'success' : 'warning'}`}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="modal-section">
                  <label>Department</label>
                  <span className={`department-badge badge-${getDepartmentColor(selectedUser.department)}`}>
                    {selectedUser.department}
                  </span>
                </div>

                <div className="modal-section">
                  <label>Email Address</label>
                  <p>
                    <a href={`mailto:${selectedUser.email}`} className="contact-link">
                      📧 {selectedUser.email}
                    </a>
                  </p>
                </div>

                {selectedUser.phone && (
                  <div className="modal-section">
                    <label>Phone Number</label>
                    <p>
                      <a href={`tel:${selectedUser.phone}`} className="contact-link">
                        📱 {selectedUser.phone}
                      </a>
                    </p>
                  </div>
                )}

                {selectedUser.lastLogin && (
                  <div className="modal-section">
                    <label>Last Login</label>
                    <p>{new Date(selectedUser.lastLogin).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                )}

                {selectedUser.createdAt && (
                  <div className="modal-section">
                    <label>Account Created</label>
                    <p>{new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                )}

                {selectedUser.permissions && selectedUser.permissions.length > 0 && (
                  <div className="modal-section">
                    <label>Permissions</label>
                    <div className="permissions-list">
                      {selectedUser.permissions.map((perm, idx) => (
                        <span key={idx} className="badge badge-info">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline" onClick={closeModal}>
                  Close
                </button>
                {isAdmin && (
                  <>
                    <button
                      className={`btn ${selectedUser.isActive ? 'btn-secondary' : 'btn-success'}`}
                      onClick={() => {
                        handleToggleActive(selectedUser._id, selectedUser.isActive);
                        closeModal();
                      }}
                    >
                      {selectedUser.isActive ? 'Deactivate User' : 'Activate User'}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        handleDeleteClick(selectedUser);
                      }}
                      disabled={selectedUser.isDemo || selectedUser._id === currentUser?._id}
                      title={selectedUser.isDemo ? 'Cannot delete demo users' : selectedUser._id === currentUser?._id ? 'Cannot delete yourself' : 'Delete user'}
                    >
                      🗑️ Delete User
                    </button>
                  </>
                )}
                {isAdmin && <button className="btn btn-primary">Edit User</button>}
              </div>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        <CreateModal
          type="User"
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUser}
          fields={userFields}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && userToDelete && (
          <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
            <div className="modal-content delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>⚠️ Confirm Delete</h2>
                <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>✕</button>
              </div>

              <div className="modal-body">
                <p style={{ fontSize: '16px', marginBottom: '16px' }}>
                  Are you sure you want to delete user <strong>{userToDelete.name}</strong>?
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  This action cannot be undone. All data associated with this user will be permanently removed.
                </p>
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDeleteUser}>
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Users;
