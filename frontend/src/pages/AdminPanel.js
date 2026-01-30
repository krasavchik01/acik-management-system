import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { adminAPI, projectsAPI, tasksAPI } from '../services/api';
import Layout from '../components/Layout';
import { toast } from 'react-toastify';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [systemStats, setSystemStats] = useState(null);

  // Check if user is admin
  const isAdmin = currentUser?.role === 'Admin';

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
    fetchAllData();
  }, [isAdmin, navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [usersRes, projectsRes, tasksRes] = await Promise.all([
        adminAPI.getUsers(),
        projectsAPI.getProjects(),
        tasksAPI.getTasks()
      ]);

      setUsers(usersRes.data.data);
      setProjects(projectsRes.data.data);
      setTasks(tasksRes.data.data);

      // Calculate system stats
      const stats = {
        totalUsers: usersRes.data.data.length,
        activeUsers: usersRes.data.data.filter(u => u.isActive).length,
        totalProjects: projectsRes.data.data.length,
        activeProjects: projectsRes.data.data.filter(p => p.status !== 'completed').length,
        totalTasks: tasksRes.data.data.length,
        completedTasks: tasksRes.data.data.filter(t => t.status === 'completed').length,
        adminUsers: usersRes.data.data.filter(u => u.role === 'Admin').length,
        demoUsers: usersRes.data.data.filter(u => u.isDemo).length
      };
      setSystemStats(stats);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const user = users.find(u => u._id === userId);
    if (!user) return;

    if (user.isDemo) {
      toast.warning('Cannot delete demo users');
      return;
    }

    if (user._id === currentUser?._id) {
      toast.error('Cannot delete yourself');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
      toast.success(`User ${user.name} deleted successfully`);

      // Update stats
      setSystemStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers - 1,
        activeUsers: user.isActive ? prev.activeUsers - 1 : prev.activeUsers,
        demoUsers: user.isDemo ? prev.demoUsers - 1 : prev.demoUsers
      }));
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (userId) => {
    const user = users.find(u => u._id === userId);
    if (!user) return;

    try {
      await adminAPI.updateUser(userId, { isActive: !user.isActive });
      setUsers(users.map(u =>
        u._id === userId ? { ...u, isActive: !u.isActive } : u
      ));
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);

      // Update stats
      setSystemStats(prev => ({
        ...prev,
        activeUsers: user.isActive ? prev.activeUsers - 1 : prev.activeUsers + 1
      }));
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleMakeAdmin = async (userId) => {
    const user = users.find(u => u._id === userId);
    if (!user) return;

    if (!window.confirm(`Make "${user.name}" an Administrator? This will grant full system access.`)) {
      return;
    }

    try {
      await adminAPI.updateUser(userId, { role: 'Admin' });
      setUsers(users.map(u =>
        u._id === userId ? { ...u, role: 'Admin' } : u
      ));
      toast.success(`${user.name} is now an Administrator`);

      // Update stats
      setSystemStats(prev => ({
        ...prev,
        adminUsers: prev.adminUsers + 1
      }));
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleRevokeAdmin = async (userId) => {
    const user = users.find(u => u._id === userId);
    if (!user) return;

    if (user._id === currentUser?._id) {
      toast.error('Cannot revoke your own admin privileges');
      return;
    }

    if (!window.confirm(`Revoke admin privileges from "${user.name}"? They will become a regular Member.`)) {
      return;
    }

    try {
      await adminAPI.updateUser(userId, { role: 'Member' });
      setUsers(users.map(u =>
        u._id === userId ? { ...u, role: 'Member' } : u
      ));
      toast.success(`Admin privileges revoked from ${user.name}`);

      // Update stats
      setSystemStats(prev => ({
        ...prev,
        adminUsers: prev.adminUsers - 1
      }));
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteProject = async (projectId) => {
    const project = projects.find(p => p._id === projectId);
    if (!project) return;

    if (!window.confirm(`Delete project "${project.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await projectsAPI.deleteProject(projectId);
      setProjects(projects.filter(p => p._id !== projectId));
      toast.success(`Project "${project.name}" deleted successfully`);

      // Update stats
      setSystemStats(prev => ({
        ...prev,
        totalProjects: prev.totalProjects - 1,
        activeProjects: project.status !== 'completed' ? prev.activeProjects - 1 : prev.activeProjects
      }));
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleDeleteTask = async (taskId) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    if (!window.confirm(`Delete task "${task.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await tasksAPI.deleteTask(taskId);
      setTasks(tasks.filter(t => t._id !== taskId));
      toast.success(`Task "${task.title}" deleted successfully`);

      // Update stats
      setSystemStats(prev => ({
        ...prev,
        totalTasks: prev.totalTasks - 1,
        completedTasks: task.status === 'completed' ? prev.completedTasks - 1 : prev.completedTasks
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Admin Panel">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Admin Panel">
      <div className="admin-panel">
        <div className="admin-header">
          <div className="admin-title">
            <h1>⚙️ Administrator Control Panel</h1>
            <p>Complete system management and oversight</p>
          </div>
          <div className="admin-badge">
            <span className="badge badge-danger">ADMIN ACCESS</span>
          </div>
        </div>

        {/* System Stats */}
        {systemStats && (
          <div className="system-stats">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-value">{systemStats.totalUsers}</div>
                <div className="stat-label">Total Users</div>
                <div className="stat-sub">{systemStats.activeUsers} active</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <div className="stat-value">{systemStats.totalProjects}</div>
                <div className="stat-label">Projects</div>
                <div className="stat-sub">{systemStats.activeProjects} active</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <div className="stat-value">{systemStats.totalTasks}</div>
                <div className="stat-label">Tasks</div>
                <div className="stat-sub">{systemStats.completedTasks} completed</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔑</div>
              <div className="stat-info">
                <div className="stat-value">{systemStats.adminUsers}</div>
                <div className="stat-label">Administrators</div>
                <div className="stat-sub">{systemStats.demoUsers} demo users</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 User Management
          </button>
          <button
            className={`admin-tab ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            📁 Projects
          </button>
          <button
            className={`admin-tab ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            ✅ Tasks
          </button>
          <button
            className={`admin-tab ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            ⚙️ System
          </button>
        </div>

        {/* Tab Content */}
        <div className="admin-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="overview-section">
                <h2>📈 System Overview</h2>
                <div className="overview-grid">
                  <div className="overview-card">
                    <h3>Recent Activity</h3>
                    <div className="activity-list">
                      <div className="activity-item">
                        <span className="activity-icon">👤</span>
                        <span>{users.filter(u => u.lastLogin).length} users logged in recently</span>
                      </div>
                      <div className="activity-item">
                        <span className="activity-icon">📊</span>
                        <span>{projects.filter(p => p.status === 'in-progress').length} projects in progress</span>
                      </div>
                      <div className="activity-item">
                        <span className="activity-icon">⏳</span>
                        <span>{tasks.filter(t => t.status === 'in-progress').length} tasks being worked on</span>
                      </div>
                    </div>
                  </div>

                  <div className="overview-card">
                    <h3>Quick Actions</h3>
                    <div className="quick-actions">
                      <button className="btn btn-primary" onClick={() => navigate('/users')}>
                        ➕ Add New User
                      </button>
                      <button className="btn btn-primary" onClick={() => navigate('/projects')}>
                        📊 Create Project
                      </button>
                      <button className="btn btn-outline" onClick={() => navigate('/reports')}>
                        📋 View Reports
                      </button>
                      <button className="btn btn-outline" onClick={fetchAllData}>
                        🔄 Refresh Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overview-section">
                <h2>⚠️ System Alerts</h2>
                <div className="alerts-list">
                  {users.filter(u => !u.isActive).length > 0 && (
                    <div className="alert alert-warning">
                      <span className="alert-icon">⚠️</span>
                      <span>{users.filter(u => !u.isActive).length} inactive user(s) found</span>
                    </div>
                  )}
                  {tasks.filter(t => t.status === 'todo').length > 10 && (
                    <div className="alert alert-info">
                      <span className="alert-icon">📋</span>
                      <span>{tasks.filter(t => t.status === 'todo').length} tasks pending assignment</span>
                    </div>
                  )}
                  {systemStats.demoUsers > 0 && (
                    <div className="alert alert-info">
                      <span className="alert-icon">🧪</span>
                      <span>{systemStats.demoUsers} demo user(s) in system (cannot be deleted)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="users-management">
              <div className="management-header">
                <h2>👥 User Management</h2>
                <button className="btn btn-primary" onClick={() => navigate('/users')}>
                  ➕ Add User
                </button>
              </div>

              <div className="management-table-container">
                <table className="management-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Last Login</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>
                          <strong>{user.name}</strong>
                          {user.isDemo && <span className="demo-badge" style={{ marginLeft: '8px' }}>DEMO</span>}
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${user.role === 'Admin' ? 'badge-danger' : 'badge-primary'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{user.department}</td>
                        <td>
                          <span className={`badge ${user.isActive ? 'badge-success' : 'badge-warning'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleDateString()
                            : 'Never'
                          }
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className={`btn btn-sm ${user.isActive ? 'btn-warning' : 'btn-success'}`}
                              onClick={() => handleToggleUserStatus(user._id)}
                              title={user.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {user.isActive ? '⏸️' : '▶️'}
                            </button>

                            {user.role !== 'Admin' ? (
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() => handleMakeAdmin(user._id)}
                                title="Make Admin"
                              >
                                🔑
                              </button>
                            ) : (
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleRevokeAdmin(user._id)}
                                disabled={user._id === currentUser?._id}
                                title="Revoke Admin"
                              >
                                🔓
                              </button>
                            )}

                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteUser(user._id)}
                              disabled={user.isDemo || user._id === currentUser?._id}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="projects-management">
              <div className="management-header">
                <h2>📁 Project Management</h2>
                <button className="btn btn-primary" onClick={() => navigate('/projects')}>
                  ➕ Add Project
                </button>
              </div>

              <div className="management-table-container">
                <table className="management-table">
                  <thead>
                    <tr>
                      <th>Project Name</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map(project => (
                      <tr key={project._id}>
                        <td><strong>{project.name}</strong></td>
                        <td>
                          <span className={`badge badge-${
                            project.status === 'completed' ? 'success' :
                            project.status === 'in-progress' ? 'primary' : 'secondary'
                          }`}>
                            {project.status}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${
                            project.priority === 'high' ? 'danger' :
                            project.priority === 'medium' ? 'warning' : 'info'
                          }`}>
                            {project.priority}
                          </span>
                        </td>
                        <td>{project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}</td>
                        <td>{project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => navigate(`/projects/${project._id}`)}
                              title="View"
                            >
                              👁️
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteProject(project._id)}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="tasks-management">
              <div className="management-header">
                <h2>✅ Task Management</h2>
                <button className="btn btn-primary" onClick={() => navigate('/tasks')}>
                  ➕ Add Task
                </button>
              </div>

              <div className="management-table-container">
                <table className="management-table">
                  <thead>
                    <tr>
                      <th>Task Title</th>
                      <th>Project</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Assigned To</th>
                      <th>Due Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.slice(0, 50).map(task => (
                      <tr key={task._id}>
                        <td><strong>{task.title}</strong></td>
                        <td>{task.project?.name || '-'}</td>
                        <td>
                          <span className={`badge badge-${
                            task.status === 'completed' ? 'success' :
                            task.status === 'in-progress' ? 'primary' : 'secondary'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${
                            task.priority === 'high' ? 'danger' :
                            task.priority === 'medium' ? 'warning' : 'info'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td>{task.assignedTo?.name || 'Unassigned'}</td>
                        <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteTask(task._id)}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tasks.length > 50 && (
                  <div className="table-footer">
                    Showing 50 of {tasks.length} tasks
                  </div>
                )}
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="system-management">
              <h2>⚙️ System Settings</h2>

              <div className="system-card">
                <h3>🔒 Security</h3>
                <div className="system-info">
                  <p><strong>Current Admin:</strong> {currentUser?.name} ({currentUser?.email})</p>
                  <p><strong>Total Admins:</strong> {systemStats?.adminUsers}</p>
                  <p><strong>Demo Users:</strong> {systemStats?.demoUsers}</p>
                </div>
              </div>

              <div className="system-card">
                <h3>💾 Database</h3>
                <div className="system-info">
                  <p><strong>Users:</strong> {systemStats?.totalUsers} records</p>
                  <p><strong>Projects:</strong> {systemStats?.totalProjects} records</p>
                  <p><strong>Tasks:</strong> {systemStats?.totalTasks} records</p>
                </div>
                <button className="btn btn-outline" onClick={fetchAllData}>
                  🔄 Refresh All Data
                </button>
              </div>

              <div className="system-card">
                <h3>🌐 Application Info</h3>
                <div className="system-info">
                  <p><strong>Name:</strong> ACIK Management System</p>
                  <p><strong>Version:</strong> 1.0.0</p>
                  <p><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</p>
                  <p><strong>Demo URL:</strong> <a href="https://app-acik.netlify.app" target="_blank" rel="noopener noreferrer">https://app-acik.netlify.app</a></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminPanel;
