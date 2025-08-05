import React, { useState, useRef } from 'react';
import AnalysisResults from './AnalysisResults';
import '../styles/AnalysisModal.css';

const AnalysisModal = ({ onClose }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  const CHARACTER_LIMIT = 3000;

  const handleInputChange = (e) => {
    const text = e.target.value;
    if (text.length <= CHARACTER_LIMIT) {
      setJobDescription(text);
      setError('');
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const truncatedText = text.slice(0, CHARACTER_LIMIT);
      setJobDescription(truncatedText);
      setError('');
      
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      setError('Unable to access clipboard. Please paste manually using Cmd+V.');
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        return;
      }

      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          job_description: jobDescription
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Analysis failed. Please try again.');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = (e) => {
    setTimeout(() => {
      const text = e.target.value;
      if (text.length > CHARACTER_LIMIT) {
        setJobDescription(text.slice(0, CHARACTER_LIMIT));
      }
    }, 0);
  };

  const resetModal = () => {
    setJobDescription('');
    setAnalysisData(null);
    setError('');
  };

  const remainingChars = CHARACTER_LIMIT - jobDescription.length;
  const isAnalyzeDisabled = !jobDescription.trim() || loading;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Analyze Job Description</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="modal-body">
          <div className="input-section">
            <div className="input-header">
              <label htmlFor="job-description">Job Description</label>
              <button 
                className="paste-btn" 
                onClick={handlePasteClipboard}
                type="button"
              >
                Paste Clipboard
              </button>
            </div>
            
            <div className="textarea-container">
              <textarea
                ref={textareaRef}
                id="job-description"
                value={jobDescription}
                onChange={handleInputChange}
                onPaste={handlePaste}
                placeholder="Paste your job description here or type it manually..."
                className={`job-textarea ${error ? 'error' : ''}`}
                rows={8}
              />
              
              <div className={`char-counter ${remainingChars < 50 ? 'warning' : ''}`}>
                {remainingChars} characters remaining
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="action-buttons">
              <button
                className={`analyze-button ${isAnalyzeDisabled ? 'disabled' : ''}`}
                onClick={handleAnalyze}
                disabled={isAnalyzeDisabled}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze
                  </>
                )}
              </button>

              {analysisData && (
                <button
                  className="reset-button"
                  onClick={resetModal}
                  type="button"
                >
                  Analyze Another
                </button>
              )}
            </div>
          </div>

          {analysisData && (
            <AnalysisResults 
              data={analysisData} 
              jobDescription={jobDescription}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;