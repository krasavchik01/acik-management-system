import React, { useState, useEffect } from 'react';
import { tasksAPI } from '../services/api';
import Layout from '../components/Layout';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
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

  if (loading) return <Layout><div className="loading"><div className="spinner"></div></div></Layout>;

  return (
    <Layout>
      <div className="dashboard">
        <h1>Tasks ({tasks.length})</h1>
        <div className="card" style={{ marginTop: '30px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Task</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Priority</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px' }}>{task.title}</td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge badge-${task.status === 'Done' ? 'success' : 'warning'}`}>
                      {task.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge badge-${task.priority === 'High' ? 'danger' : 'info'}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Tasks;
