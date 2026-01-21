import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../services/api';
import Layout from '../components/Layout';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await reportsAPI.getAll();
      setReports(response.data.data);
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
        <h1>Reports ({reports.length})</h1>
        <div className="card" style={{ marginTop: '30px' }}>
          {reports.map((report) => (
            <div key={report._id} style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
              <h3>{report.title}</h3>
              <p>{report.summary}</p>
              <span className={`badge badge-${report.status === 'Published' ? 'success' : 'warning'}`}>
                {report.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
