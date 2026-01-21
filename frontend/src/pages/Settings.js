import React from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const Settings = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="dashboard">
        <h1>Settings</h1>
        <div className="card" style={{ marginTop: '30px' }}>
          <h2>Profile Information</h2>
          <div style={{ marginTop: '20px' }}>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            <p><strong>Department:</strong> {user?.department}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
