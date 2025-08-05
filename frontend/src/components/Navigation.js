import React from 'react';
import '../styles/Navigation.css';

const Navigation = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <button
          className={`nav-item ${activeTab === 'analyzer' ? 'active' : ''}`}
          onClick={() => setActiveTab('analyzer')}
        >
          Job Analyzer
        </button>
        
        <button
          className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Past Analysis
        </button>
      </div>
    </nav>
  );
};

export default Navigation;