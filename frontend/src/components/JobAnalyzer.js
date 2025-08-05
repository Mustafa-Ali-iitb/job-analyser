import React, { useState } from 'react';
import AnalysisModal from './AnalysisModal';
import '../styles/JobAnalyzer.css';

const JobAnalyzer = () => {
  const [showModal, setShowModal] = useState(false);

  const handleAnalyzeClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="job-analyzer">
      <div className="analyzer-content">
        {/* Left Section */}
        <div className="left-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Extract Job Details
              <br />
              <span className="highlight">Within Seconds</span>
            </h1>
            <p className="hero-subtitle">
              Paste any job description and get instant insights about skills, 
              experience level, role type, and a comprehensive summary.
            </p>
            <button className="analyze-btn" onClick={handleAnalyzeClick}>
              
              Analyse Job Description
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="right-section">
        <div className="image-container">
          <div className="sample-image">
            <img src="/job_analyser.png" alt="Job Analysis Visualization" className="job-analysis-image"  />
          </div>
        </div>
        </div>
      </div>

      {/* Analysis Modal */}
      {showModal && (
        <AnalysisModal onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default JobAnalyzer;