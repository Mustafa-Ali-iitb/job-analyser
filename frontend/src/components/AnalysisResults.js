import React from 'react';
import '../styles/AnalysisResults.css';

const AnalysisResults = ({ data, jobDescription }) => {
  const getSkillColor = (skill) => {
    const skillLower = skill.toLowerCase();
    
    // Frontend skills
    if (['react', 'angular', 'vue', 'html', 'css', 'javascript', 'typescript'].includes(skillLower)) {
      return 'frontend';
    }
    
    // Backend skills
    if (['python', 'java', 'node.js', 'django', 'flask', 'fastapi', 'spring'].includes(skillLower)) {
      return 'backend';
    }
    
    // Database skills
    if (['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle'].includes(skillLower)) {
      return 'database';
    }
    
    // Cloud/DevOps skills
    if (['aws', 'azure', 'docker', 'kubernetes', 'jenkins', 'git'].includes(skillLower)) {
      return 'devops';
    }
    
    // Data Science/ML skills
    if (['machine learning', 'ai', 'data science', 'tensorflow', 'pytorch'].includes(skillLower)) {
      return 'ml';
    }
    
    // Mobile skills
    if (['ios', 'android', 'react native', 'flutter'].includes(skillLower)) {
      return 'mobile';
    }
    
    // Default
    return 'other';
  };

  return (
    <div className="analysis-results">
      <div className="results-header">
        <h3>Analysis Results</h3>
        <div className="results-badge">
          <span className="badge-icon">✓</span>
          Analysis Complete
        </div>
      </div>

      <div className="results-grid">
        {/* Job Role */}
        <div className="result-card role-card">
          <div className="card-header">
            <h4>Job Role</h4>
          </div>
          <div className="card-content">
            <div className="role-type">{data.role_type}</div>
          </div>
        </div>

        {/* Experience Level */}
        <div className="result-card experience-card">
          <div className="card-header">
            <h4>Experience Level</h4>
          </div>
          <div className="card-content">
            <div className="experience-level">{data.experience_level}</div>
          </div>
        </div>

        {/* Skills */}
        <div className="result-card skills-card full-width">
          <div className="card-header">
            <h4>Required Skills</h4>
            <span className="skills-count">({data.skills.length} skills found)</span>
          </div>
          <div className="card-content">
            {data.skills.length > 0 ? (
              <div className="skills-container">
                {data.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className={`skill-tag ${getSkillColor(skill)}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="no-skills">
                <span>No specific skills detected</span>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="result-card summary-card full-width">
          <div className="card-header">
            <h4>Job Summary</h4>
          </div>
          <div className="card-content">
            <div className="summary-text">{data.summary}</div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="analysis-stats">
        <div className="stat-item">
          <span className="stat-label">Original Length:</span>
          <span className="stat-value">{jobDescription.length} characters</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Skills Found:</span>
          <span className="stat-value">{data.skills.length}</span>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;