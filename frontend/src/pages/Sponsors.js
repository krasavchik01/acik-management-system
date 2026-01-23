import React, { useState, useEffect } from 'react';
import { sponsorsAPI } from '../services/api';
import Layout from '../components/Layout';
import './Sponsors.css';

const Sponsors = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState(null);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      const response = await sponsorsAPI.getAll();
      setSponsors(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      setLoading(false);
    }
  };

  const filteredSponsors = sponsors.filter(sponsor => {
    const matchesLevel = filterLevel === 'all' || sponsor.level === filterLevel;
    const matchesSearch = sponsor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (sponsor.industry && sponsor.industry.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLevel && matchesSearch;
  });

  const getLevelColor = (level) => {
    const colors = {
      'Platinum': 'primary',
      'Gold': 'warning',
      'Silver': 'secondary',
      'Bronze': 'info'
    };
    return colors[level] || 'secondary';
  };

  const getLevelIcon = (level) => {
    const icons = {
      'Platinum': '💎',
      'Gold': '🥇',
      'Silver': '🥈',
      'Bronze': '🥉'
    };
    return icons[level] || '🏅';
  };

  const handleSponsorClick = (sponsor) => {
    setSelectedSponsor(sponsor);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSponsor(null);
  };

  if (loading) {
    return (
      <Layout pageTitle="Sponsors">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  const pricingTiers = [
    {
      level: 'Platinum',
      price: 50000,
      icon: '💎',
      benefits: ['Logo on all materials', 'Speaking slot at events', 'Exclusive networking', 'Prime booth location', 'Social media promotion']
    },
    {
      level: 'Gold',
      price: 25000,
      icon: '🥇',
      benefits: ['Logo on materials', 'Event booth space', 'Newsletter feature', 'Social media mention']
    },
    {
      level: 'Silver',
      price: 10000,
      icon: '🥈',
      benefits: ['Logo on website', 'Event recognition', 'Newsletter mention']
    },
    {
      level: 'Bronze',
      price: 5000,
      icon: '🥉',
      benefits: ['Logo on website', 'Event thank you']
    }
  ];

  return (
    <Layout pageTitle="Sponsors">
      <div className="sponsors-page">
        {/* Header */}
        <div className="sponsors-header">
          <div className="sponsors-stats">
            <div className="stat-item">
              <span className="stat-number">{sponsors.length}</span>
              <span className="stat-label">Total Sponsors</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                ${sponsors.reduce((sum, s) => sum + (s.sponsorship?.amount || 0), 0).toLocaleString()}
              </span>
              <span className="stat-label">Total Funding</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {sponsors.filter(s => s.level === 'Platinum').length}
              </span>
              <span className="stat-label">Platinum</span>
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => alert('Contact sales functionality coming soon!')}>
            <span>➕</span>
            Become a Sponsor
          </button>
        </div>

        {/* Pricing Tiers */}
        <div className="pricing-section">
          <h2>Sponsorship Tiers</h2>
          <div className="pricing-grid">
            {pricingTiers.map((tier) => (
              <div key={tier.level} className={`pricing-card tier-${tier.level.toLowerCase()}`}>
                <div className="pricing-icon">{tier.icon}</div>
                <h3 className="pricing-title">{tier.level}</h3>
                <div className="pricing-amount">
                  <span className="currency">$</span>
                  <span className="price">{tier.price.toLocaleString()}</span>
                  <span className="period">/year</span>
                </div>
                <ul className="pricing-benefits">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx}>✓ {benefit}</li>
                  ))}
                </ul>
                <button className="btn btn-outline">Learn More</button>
              </div>
            ))}
          </div>
        </div>

        {/* Current Sponsors */}
        <div className="current-sponsors-section">
          <div className="section-header">
            <h2>Current Sponsors</h2>
            <div className="sponsors-controls">
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search sponsors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label>Level:</label>
                <select
                  className="filter-select"
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Bronze">Bronze</option>
                </select>
              </div>
            </div>
          </div>

          <div className="sponsors-grid">
            {filteredSponsors.map((sponsor) => (
              <div
                key={sponsor._id}
                className="sponsor-card"
                onClick={() => handleSponsorClick(sponsor)}
              >
                <div className="sponsor-badge">
                  <span className={`level-badge badge-${getLevelColor(sponsor.level)}`}>
                    {getLevelIcon(sponsor.level)} {sponsor.level}
                  </span>
                </div>

                <div className="sponsor-content">
                  <h3 className="sponsor-name">{sponsor.name}</h3>
                  {sponsor.industry && (
                    <p className="sponsor-industry">{sponsor.industry}</p>
                  )}
                  {sponsor.sponsorship?.amount && (
                    <div className="sponsor-amount">
                      ${sponsor.sponsorship.amount.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredSponsors.length === 0 && (
              <div className="empty-state">
                <span className="empty-icon">🤝</span>
                <h3>No sponsors found</h3>
                <p>Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Sponsor Detail Modal */}
        {showModal && selectedSponsor && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>{selectedSponsor.name}</h2>
                  <span className={`level-badge badge-${getLevelColor(selectedSponsor.level)}`}>
                    {getLevelIcon(selectedSponsor.level)} {selectedSponsor.level}
                  </span>
                </div>
                <button className="modal-close" onClick={closeModal}>✕</button>
              </div>

              <div className="modal-body">
                {selectedSponsor.industry && (
                  <div className="modal-section">
                    <label>Industry</label>
                    <p>{selectedSponsor.industry}</p>
                  </div>
                )}

                {selectedSponsor.sponsorship?.amount && (
                  <div className="modal-section">
                    <label>Sponsorship Amount</label>
                    <p className="amount-large">
                      ${selectedSponsor.sponsorship.amount.toLocaleString()}
                    </p>
                  </div>
                )}

                {selectedSponsor.sponsorship?.startDate && (
                  <div className="modal-section">
                    <label>Partnership Period</label>
                    <p>
                      {new Date(selectedSponsor.sponsorship.startDate).toLocaleDateString()} -{' '}
                      {selectedSponsor.sponsorship.endDate
                        ? new Date(selectedSponsor.sponsorship.endDate).toLocaleDateString()
                        : 'Ongoing'}
                    </p>
                  </div>
                )}

                {selectedSponsor.contactPerson && (
                  <div className="modal-section">
                    <label>Contact Person</label>
                    <p>{selectedSponsor.contactPerson}</p>
                  </div>
                )}

                {selectedSponsor.email && (
                  <div className="modal-section">
                    <label>Email</label>
                    <p>
                      <a href={`mailto:${selectedSponsor.email}`} className="contact-link">
                        {selectedSponsor.email}
                      </a>
                    </p>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline" onClick={closeModal}>
                  Close
                </button>
                <button className="btn btn-primary">Contact Sponsor</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Sponsors;
