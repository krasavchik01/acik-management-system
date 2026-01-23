import React, { useState, useEffect } from 'react';
import { tasksAPI, adminAPI } from '../services/api';
import Layout from '../components/Layout';
import CreateModal from '../components/CreateModal';
import './Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // list, kanban
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getAll();
      setTasks(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateTask = async (formData) => {
    try {
      await tasksAPI.create(formData);
      await fetchTasks();
    } catch (error) {
      throw error;
    }
  };

  const taskFields = [
    {
      name: 'title',
      label: 'Task Title',
      type: 'text',
      placeholder: 'Enter task title',
      required: true
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Describe the task',
      required: false
    },
    {
      name: 'assignedTo',
      label: 'Assign To',
      type: 'select',
      required: false,
      options: users.map(user => ({
        value: user._id,
        label: `${user.name} (${user.role})`
      }))
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'To Do', label: 'To Do' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Review', label: 'Review' },
        { value: 'Done', label: 'Done' }
      ]
    },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      required: true,
      options: [
        { value: 'High', label: 'High' },
        { value: 'Medium', label: 'Medium' },
        { value: 'Low', label: 'Low' }
      ]
    },
    {
      name: 'dueDate',
      label: 'Due Date',
      type: 'date',
      required: false
    }
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPriority && matchesStatus && matchesSearch;
  });

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'danger',
      'Medium': 'warning',
      'Low': 'success'
    };
    return colors[priority] || 'info';
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      'High': '🔴',
      'Medium': '🟡',
      'Low': '🟢'
    };
    return icons[priority] || '⚪';
  };

  const getStatusColor = (status) => {
    const colors = {
      'To Do': 'info',
      'In Progress': 'warning',
      'Review': 'primary',
      'Done': 'success'
    };
    return colors[status] || 'secondary';
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTask(null);
  };

  const toggleTaskComplete = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'Done' ? 'To Do' : 'Done';
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <Layout pageTitle="Tasks">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Tasks">
      <div className="tasks-page">
        {/* Header with stats */}
        <div className="tasks-header">
          <div className="tasks-stats">
            <div className="stat-item">
              <span className="stat-number">{tasks.length}</span>
              <span className="stat-label">Total Tasks</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {tasks.filter(t => t.status === 'In Progress').length}
              </span>
              <span className="stat-label">In Progress</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {tasks.filter(t => t.status === 'Done').length}
              </span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {tasks.filter(t => isOverdue(t.dueDate) && t.status !== 'Done').length}
              </span>
              <span className="stat-label">Overdue</span>
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <span>➕</span>
            New Task
          </button>
        </div>

        {/* Search and Filters */}
        <div className="tasks-controls">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filters">
            <div className="filter-group">
              <label>Priority:</label>
              <select
                className="filter-select"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="all">All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
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
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          <div className="view-switcher">
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              ☰
            </button>
            <button
              className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
              title="Kanban view"
            >
              ▦
            </button>
          </div>
        </div>

        {/* List View */}
        {viewMode === 'list' && (
          <div className="tasks-list">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className={`task-item ${task.status === 'Done' ? 'completed' : ''} priority-${task.priority.toLowerCase()}`}
                onClick={() => handleTaskClick(task)}
              >
                <div className="task-checkbox">
                  <input
                    type="checkbox"
                    checked={task.status === 'Done'}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleTaskComplete(task._id, task.status);
                    }}
                  />
                </div>

                <div className="task-content">
                  <div className="task-header-row">
                    <h3 className="task-title">{task.title}</h3>
                    <div className="task-badges">
                      <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                        {getPriorityIcon(task.priority)} {task.priority}
                      </span>
                      <span className={`badge badge-${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>

                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}

                  <div className="task-meta">
                    {task.project && (
                      <span className="meta-tag">
                        📂 {task.project.name}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className={`meta-tag ${isOverdue(task.dueDate) && task.status !== 'Done' ? 'overdue' : ''}`}>
                        📅 {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {task.assignedTo && (
                      <span className="meta-tag">
                        👤 {task.assignedTo.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredTasks.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">📝</span>
                <h3>No tasks found</h3>
                <p>Try adjusting your filters or create a new task</p>
              </div>
            )}
          </div>
        )}

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <div className="kanban-board">
            {['To Do', 'In Progress', 'Review', 'Done'].map((status) => (
              <div key={status} className="kanban-column">
                <div className={`kanban-header status-${status.toLowerCase().replace(' ', '-')}`}>
                  <h3>{status}</h3>
                  <span className="kanban-count">
                    {filteredTasks.filter(t => t.status === status).length}
                  </span>
                </div>

                <div className="kanban-cards">
                  {filteredTasks
                    .filter(t => t.status === status)
                    .map((task) => (
                      <div
                        key={task._id}
                        className={`kanban-card priority-${task.priority.toLowerCase()}`}
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className="kanban-card-header">
                          <h4>{task.title}</h4>
                          <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                            {getPriorityIcon(task.priority)}
                          </span>
                        </div>

                        {task.description && (
                          <p className="kanban-card-desc">{task.description}</p>
                        )}

                        <div className="kanban-card-footer">
                          {task.dueDate && (
                            <span className={`due-date ${isOverdue(task.dueDate) && status !== 'Done' ? 'overdue' : ''}`}>
                              📅 {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          {task.assignedTo && (
                            <div className="task-assignee">
                              {task.assignedTo.name?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Task Detail Modal */}
        {showModal && selectedTask && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedTask.title}</h2>
                <button className="modal-close" onClick={closeModal}>✕</button>
              </div>

              <div className="modal-body">
                <div className="modal-section">
                  <label>Status</label>
                  <span className={`badge badge-${getStatusColor(selectedTask.status)}`}>
                    {selectedTask.status}
                  </span>
                </div>

                <div className="modal-section">
                  <label>Priority</label>
                  <span className={`priority-badge ${selectedTask.priority.toLowerCase()}`}>
                    {getPriorityIcon(selectedTask.priority)} {selectedTask.priority}
                  </span>
                </div>

                {selectedTask.description && (
                  <div className="modal-section">
                    <label>Description</label>
                    <p>{selectedTask.description}</p>
                  </div>
                )}

                {selectedTask.project && (
                  <div className="modal-section">
                    <label>Project</label>
                    <p>{selectedTask.project.name}</p>
                  </div>
                )}

                {selectedTask.dueDate && (
                  <div className="modal-section">
                    <label>Due Date</label>
                    <p className={isOverdue(selectedTask.dueDate) && selectedTask.status !== 'Done' ? 'text-danger' : ''}>
                      {new Date(selectedTask.dueDate).toLocaleDateString()}
                      {isOverdue(selectedTask.dueDate) && selectedTask.status !== 'Done' && (
                        <span className="overdue-label"> (Overdue)</span>
                      )}
                    </p>
                  </div>
                )}

                {selectedTask.assignedTo && (
                  <div className="modal-section">
                    <label>Assigned To</label>
                    <p>{selectedTask.assignedTo.name}</p>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline" onClick={closeModal}>
                  Close
                </button>
                <button
                  className={`btn ${selectedTask.status === 'Done' ? 'btn-secondary' : 'btn-success'}`}
                  onClick={() => {
                    toggleTaskComplete(selectedTask._id, selectedTask.status);
                    closeModal();
                  }}
                >
                  {selectedTask.status === 'Done' ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
                <button className="btn btn-primary">Edit Task</button>
              </div>
            </div>
          </div>
        )}

        {/* Create Task Modal */}
        <CreateModal
          type="Task"
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTask}
          fields={taskFields}
        />
      </div>
    </Layout>
  );
};

export default Tasks;
