import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../services/api';
import Layout from '../components/Layout';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <Layout><div className="loading"><div className="spinner"></div></div></Layout>;

  return (
    <Layout>
      <div className="dashboard">
        <h1>Projects ({projects.length})</h1>
        <div className="grid grid-3" style={{ marginTop: '30px' }}>
          {projects.map((project) => (
            <div key={project._id} className="card">
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <div style={{ marginTop: '15px' }}>
                <span className={`badge badge-${project.status === 'Active' ? 'success' : 'warning'}`}>
                  {project.status}
                </span>
                <span className="badge badge-info" style={{ marginLeft: '10px' }}>
                  {project.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Projects;
