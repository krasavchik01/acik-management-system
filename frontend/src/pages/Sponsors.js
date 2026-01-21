import React, { useState, useEffect } from 'react';
import { sponsorsAPI } from '../services/api';
import Layout from '../components/Layout';

const Sponsors = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      const response = await sponsorsAPI.getAll();
      setSponsors(response.data.data);
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
        <h1>Sponsors ({sponsors.length})</h1>
        <div className="grid grid-3" style={{ marginTop: '30px' }}>
          {sponsors.map((sponsor) => (
            <div key={sponsor._id} className="card">
              <h3>{sponsor.name}</h3>
              <p>{sponsor.industry}</p>
              <span className={`badge badge-${sponsor.level === 'Platinum' ? 'primary' : 'info'}`}>
                {sponsor.level}
              </span>
              <p style={{ marginTop: '10px' }}>
                ${sponsor.sponsorship?.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Sponsors;
