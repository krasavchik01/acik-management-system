import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../services/api';
import Layout from '../components/Layout';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getAll();
      setEvents(response.data.data);
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
        <h1>Events ({events.length})</h1>
        <div className="grid grid-3" style={{ marginTop: '30px' }}>
          {events.map((event) => (
            <div key={event._id} className="card">
              <h3>{event.title}</h3>
              <p>{event.type} - {event.location?.venue}</p>
              <p>Date: {new Date(event.startDate).toLocaleDateString()}</p>
              <span className={`badge badge-${event.status === 'Active' ? 'success' : 'info'}`}>
                {event.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Events;
