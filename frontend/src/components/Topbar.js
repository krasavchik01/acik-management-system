import React from 'react';
import './Topbar.css';

const Topbar = ({ pageTitle }) => {
  return (
    <div className="topbar">
      <div className="page-header">
        <h1 className="page-title">{pageTitle}</h1>
      </div>

      <div className="topbar-actions">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
          />
        </div>

        <button className="icon-btn">
          <span className="notification-badge">3</span>
          🔔
        </button>

        <button className="icon-btn">
          ⚙️
        </button>
      </div>
    </div>
  );
};

export default Topbar;
