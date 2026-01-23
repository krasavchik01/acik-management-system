import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../services/api';
import Layout from '../components/Layout';
import CreateModal from '../components/CreateModal';
import './Projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, kanban
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
    }
  };

  const handleCreateProject = async (formData) => {
    try {
      await projectsAPI.create(formData);
      await fetchProjects(); // Refresh list
    } catch (error) {
      throw error;
    }
  };

  const projectFields = [
    {
      name: 'name',
      label: 'Project Name',
      type: 'text',
      placeholder: 'Enter project name',
      required: true
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Describe your project',
      required: true
    },
    {
      name: 'category',
      label: 'Category',
      type: 'text',
      placeholder: 'e.g., Technology, Education, Community',
      required: true
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'Planning', label: 'Planning' },
        { value: 'Active', label: 'Active' },
        { value: 'On Hold', label: 'On Hold' },
        { value: 'Completed', label: 'Completed' }
      ]
    },
    {
      name: 'startDate',
      label: 'Start Date',
      type: 'date',
      required: true
    },
    {
      name: 'endDate',
      label: 'End Date',
      type: 'date',
      required: true
    },
    {
      name: 'budget',
      label: 'Budget',
      type: 'number',
      placeholder: 'Enter budget amount',
      required: false
    },
    {
      name: 'progress',
      label: 'Progress (%)',
      type: 'number',
      placeholder: '0-100',
      required: false
    }
  ];

  const filteredProjects = projects.filter(project => {
    if (filterStatus === 'all') return true;
    return project.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const getStatusColor = (status) => {
    const colors = {
      'active': 'success',
      'completed': 'primary',
      'on hold': 'warning',
      'planning': 'info'
    };
    return colors[status.toLowerCase()] || 'secondary';
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProject(null);
  };

  if (loading) {
    return (
      <Layout pageTitle="Projects">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Projects">
      <div className="projects-page">
        {/* Header with filters and actions */}
        <div className="projects-header">
          <div className="projects-stats">
            <div className="stat-item">
              <span className="stat-number">{projects.length}</span>
              <span className="stat-label">Total Projects</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {projects.filter(p => p.status === 'Active').length}
              </span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {projects.filter(p => p.status === 'Completed').length}
              </span>
              <span className="stat-label">Completed</span>
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <span>➕</span>
            New Project
          </button>
        </div>

        {/* Filters and View Switcher */}
        <div className="projects-controls">
          <div className="filters">
            <button
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
              onClick={() => setFilterStatus('active')}
            >
              Active
            </button>
            <button
              className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('completed')}
            >
              Completed
            </button>
            <button
              className={`filter-btn ${filterStatus === 'on hold' ? 'active' : ''}`}
              onClick={() => setFilterStatus('on hold')}
            >
              On Hold
            </button>
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
            <button
              className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
              title="Kanban view"
            >
              ▦
            </button>
          </div>
        </div>

        {/* Projects Grid/List/Kanban */}
        {viewMode === 'grid' && (
          <div className="projects-grid">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="project-card"
                onClick={() => handleProjectClick(project)}
              >
                <div className="project-card-header">
                  <div>
                    <h3 className="project-title">{project.name}</h3>
                    <p className="project-category">{project.category}</p>
                  </div>
                  <span className={`badge badge-${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                <p className="project-description">{project.description}</p>

                <div className="project-progress">
                  <div className="progress-header">
                    <span className="progress-label">Progress</span>
                    <span className="progress-value">
                      {project.progress || 0}%
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                <div className="project-footer">
                  <div className="project-meta">
                    <span className="meta-item">
                      📅 {new Date(project.startDate).toLocaleDateString()}
                    </span>
                    {project.budget && (
                      <span className="meta-item">
                        💰 ${project.budget.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {project.team && project.team.length > 0 && (
                    <div className="project-team">
                      {project.team.slice(0, 3).map((member, idx) => (
                        <div key={idx} className="team-avatar" title={member.name}>
                          {member.name?.charAt(0) || '?'}
                        </div>
                      ))}
                      {project.team.length > 3 && (
                        <div className="team-avatar-more">
                          +{project.team.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="projects-list">
            <table className="projects-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Status</th>
                  <th>Category</th>
                  <th>Progress</th>
                  <th>Start Date</th>
                  <th>Budget</th>
                  <th>Team</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr
                    key={project._id}
                    onClick={() => handleProjectClick(project)}
                    className="table-row-clickable"
                  >
                    <td>
                      <div className="table-project-name">
                        <strong>{project.name}</strong>
                        <span className="table-project-desc">
                          {project.description?.substring(0, 50)}...
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td>{project.category}</td>
                    <td>
                      <div className="table-progress">
                        <div className="progress-bar-container small">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${project.progress || 0}%` }}
                          />
                        </div>
                        <span>{project.progress || 0}%</span>
                      </div>
                    </td>
                    <td>{new Date(project.startDate).toLocaleDateString()}</td>
                    <td>{project.budget ? `$${project.budget.toLocaleString()}` : '-'}</td>
                    <td>
                      {project.team && project.team.length > 0 && (
                        <div className="project-team">
                          {project.team.slice(0, 3).map((member, idx) => (
                            <div key={idx} className="team-avatar small">
                              {member.name?.charAt(0) || '?'}
                            </div>
                          ))}
                          {project.team.length > 3 && (
                            <span className="team-count">+{project.team.length - 3}</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'kanban' && (
          <div className="kanban-board">
            {['Planning', 'Active', 'On Hold', 'Completed'].map((status) => (
              <div key={status} className="kanban-column">
                <div className="kanban-header">
                  <h3>{status}</h3>
                  <span className="kanban-count">
                    {projects.filter(p => p.status === status).length}
                  </span>
                </div>
                <div className="kanban-cards">
                  {projects
                    .filter(p => p.status === status)
                    .map((project) => (
                      <div
                        key={project._id}
                        className="kanban-card"
                        onClick={() => handleProjectClick(project)}
                      >
                        <h4>{project.name}</h4>
                        <p className="kanban-card-desc">{project.description}</p>
                        <div className="kanban-card-meta">
                          <span className="badge badge-info">{project.category}</span>
                          {project.budget && (
                            <span className="kanban-budget">
                              ${project.budget.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Project Detail Modal */}
        {showModal && selectedProject && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedProject.name}</h2>
                <button className="modal-close" onClick={closeModal}>✕</button>
              </div>
              <div className="modal-body">
                <div className="modal-section">
                  <label>Status</label>
                  <span className={`badge badge-${getStatusColor(selectedProject.status)}`}>
                    {selectedProject.status}
                  </span>
                </div>
                <div className="modal-section">
                  <label>Category</label>
                  <p>{selectedProject.category}</p>
                </div>
                <div className="modal-section">
                  <label>Description</label>
                  <p>{selectedProject.description}</p>
                </div>
                <div className="modal-section">
                  <label>Progress</label>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${selectedProject.progress || 0}%` }}
                    />
                  </div>
                  <span>{selectedProject.progress || 0}%</span>
                </div>
                <div className="modal-section">
                  <label>Timeline</label>
                  <p>
                    {new Date(selectedProject.startDate).toLocaleDateString()} -{' '}
                    {new Date(selectedProject.endDate).toLocaleDateString()}
                  </p>
                </div>
                {selectedProject.budget && (
                  <div className="modal-section">
                    <label>Budget</label>
                    <p>${selectedProject.budget.toLocaleString()}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={closeModal}>
                  Close
                </button>
                <button className="btn btn-primary">Edit Project</button>
              </div>
            </div>
          </div>
        )}

        {/* Create Project Modal */}
        <CreateModal
          type="Project"
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProject}
          fields={projectFields}
        />
      </div>
    </Layout>
  );
};

export default Projects;
