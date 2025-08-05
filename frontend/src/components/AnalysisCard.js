import React, { useState } from 'react';
import '../styles/AnalysisCard.css';

const AnalysisCard = ({ analysis, onDelete, formatDate }) => {
  const [expanded, setExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getSkillColor = (skill) => {
    const skillLower = skill.toLowerCase();
    
    if (['react', 'angular', 'vue', 'html', 'css', 'javascript', 'typescript'].includes(skillLower)) {
      return 'frontend';
    }
    if (['python', 'java', 'node.js', 'django', 'flask', 'fastapi', 'spring'].includes(skillLower)) {
      return 'backend';
    }
    if (['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle'].includes(skillLower)) {
      return 'database';
    }
    if (['aws', 'azure', 'docker', 'kubernetes', 'jenkins', 'git'].includes(skillLower)) {
      return 'devops';
    }
    if (['machine learning', 'ai', 'data science', 'tensorflow', 'pytorch'].includes(skillLower)) {
      return 'ml';
    }
    if (['ios', 'android', 'react native', 'flutter'].includes(skillLower)) {
      return 'mobile';
    }
    return 'other';
  };

  const handleDelete = () => {
    onDelete(analysis.analysis_id);
    setShowDeleteConfirm(false);
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const analysisData = analysis.analysis;
  const jobDescription = analysis.job_description;
  const createdAt = analysis.created_at;

  return (
    <div className="analysis-card">
      <div className="card-header">
        <div className="header-main">
          <div className="role-info">
            <h4 className="role-title">{analysisData.role_type}</h4>
            <span className="experience-badge">{analysisData.experience_level}</span>
          </div>
          <div className="date-info">
            <span className="analysis-date">{formatDate(createdAt)}</span>
          </div>
        </div>
        
        <div className="header-actions">
          <button
            className="expand-btn"
            onClick={() => setExpanded(!expanded)}
          >
            <span className={`expand-icon ${expanded ? 'expanded' : ''}`}>
              ▼
            </span>
          </button>
          <button
            className="delete-btn"
            onClick={() => setShowDeleteConfirm(true)}
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="card-content">
        {/* Skills Preview */}
        <div className="skills-preview">
          <span className="skills-label">Skills:</span>
          <div className="skills-tags">
            {analysisData.skills.slice(0, 3).map((skill, index) => (
              <span 
                key={index} 
                className={`skill-tag-small ${getSkillColor(skill)}`}
              >
                {skill}
              </span>
            ))}
            {analysisData.skills.length > 3 && (
              <span className="more-skills">
                +{analysisData.skills.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Summary Preview */}
        <div className="summary-preview">
          <p>{truncateText(analysisData.summary, 120)}</p>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="expanded-content">
            <div className="expanded-section">
              <h5>All Skills ({analysisData.skills.length})</h5>
              <div className="all-skills">
                {analysisData.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className={`skill-tag ${getSkillColor(skill)}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="expanded-section">
              <h5>Full Summary</h5>
              <div className="full-summary">
                {analysisData.summary}
              </div>
            </div>

            <div className="expanded-section">
              <h5>Original Job Description</h5>
              <div className="job-description">
                {jobDescription}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h4>Delete Analysis?</h4>
            <p>This action cannot be undone. Are you sure you want to delete this analysis?</p>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisCard;