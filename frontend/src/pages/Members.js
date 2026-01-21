import React, { useState, useEffect } from 'react';
import { membersAPI } from '../services/api';
import Layout from '../components/Layout';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await membersAPI.getAll();
      setMembers(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  if (loading) return <Layout><div className="loading"><div className="spinner"></div></div></Layout>;

  return (
    <Layout>
      <div className="dashboard">
        <h1>Members ({members.length})</h1>
        <div className="grid grid-4" style={{ marginTop: '30px' }}>
          {members.map((member) => (
            <div key={member._id} className="card">
              <h3>{member.fullName}</h3>
              <p>{member.email}</p>
              <p>{member.phone}</p>
              <span className={`badge badge-${member.status === 'Active' ? 'success' : 'warning'}`}>
                {member.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Members;
