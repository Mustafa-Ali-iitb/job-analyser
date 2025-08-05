import React, { useState, useEffect, useCallback } from 'react';
import AnalysisCard from './AnalysisCard';
import Pagination from './Pagination';
import '../styles/PastAnalysis.css';

const PastAnalysis = () => {
  const [allAnalyses, setAllAnalyses] = useState([]); // Store all analyses
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [itemsPerPage] = useState(6);
  
  // Sorting and filtering
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const sortAnalyses = useCallback((analyses, sortType) => {
    const sorted = [...analyses];
    
    switch (sortType) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'role':
        return sorted.sort((a, b) => a.analysis.role_type.localeCompare(b.analysis.role_type));
      case 'experience':
        return sorted.sort((a, b) => a.analysis.experience_level.localeCompare(b.analysis.experience_level));
      default:
        return sorted;
    }
  }, []);

  const filterAnalyses = useCallback((analyses, filterType) => {
    if (filterType === 'all') return analyses;
    
    return analyses.filter(analysis => {
      const roleType = analysis.analysis.role_type.toLowerCase();
      const expLevel = analysis.analysis.experience_level.toLowerCase();
      
      switch (filterType) {
        case 'frontend':
          return roleType.includes('frontend') || roleType.includes('front-end') || roleType.includes('front end');
        case 'backend':
          return roleType.includes('backend') || roleType.includes('back-end') || roleType.includes('back end');
        case 'fullstack':
          return roleType.includes('fullstack') || roleType.includes('full-stack') || roleType.includes('full stack');
        case 'data':
          return roleType.includes('data') || roleType.includes('scientist') || roleType.includes('analyst');
        case 'devops':
          return roleType.includes('devops') || roleType.includes('infrastructure') || roleType.includes('sre');
        case 'mobile':
          return roleType.includes('mobile') || roleType.includes('ios') || roleType.includes('android');
        case 'junior':
          return expLevel.includes('junior') || expLevel.includes('0-2') || expLevel.includes('entry') || expLevel.includes('intern');
        case 'mid':
          return expLevel.includes('mid') || expLevel.includes('3-5') || expLevel.includes('intermediate');
        case 'senior':
          return expLevel.includes('senior') || expLevel.includes('5+') || expLevel.includes('lead') || expLevel.includes('principal');
        default:
          return true;
      }
    });
  }, []);

  const fetchAnalyses = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/analyses', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const fetchedAnalyses = data.analyses || [];
        
        // Store all analyses
        setAllAnalyses(fetchedAnalyses);
        
        // Apply sorting and filtering
        let processedAnalyses = sortAnalyses(fetchedAnalyses, sortBy);
        processedAnalyses = filterAnalyses(processedAnalyses, filterBy);
        
        setTotalAnalyses(processedAnalyses.length);
        
        // Apply pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedAnalyses = processedAnalyses.slice(startIndex, endIndex);
        
        setAnalyses(paginatedAnalyses);
        setError(''); // Clear any previous errors
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to fetch analyses');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, filterBy, itemsPerPage, sortAnalyses, filterAnalyses]);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:8000/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchAnalyses();
    if (currentPage === 1) { // Only fetch stats on first page or refresh
      fetchStats();
    }
  }, [fetchAnalyses, fetchStats, refreshTrigger, currentPage]);

  const handleDeleteAnalysis = async (analysisId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/analyses/${analysisId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Trigger refresh
        setRefreshTrigger(prev => prev + 1);
      } else {
        console.error('Failed to delete analysis');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const handleFilterChange = (newFilter) => {
    setFilterBy(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleClearFilters = () => {
    setFilterBy('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get available filter options based on actual data
  const getAvailableFilters = () => {
    if (allAnalyses.length === 0) return { roles: [], experiences: [] };
    
    const roles = new Set();
    const experiences = new Set();
    
    allAnalyses.forEach(analysis => {
      const roleType = analysis.analysis.role_type.toLowerCase();
      const expLevel = analysis.analysis.experience_level.toLowerCase();
      
      // Map roles to filter categories
      if (roleType.includes('frontend') || roleType.includes('front-end')) roles.add('frontend');
      if (roleType.includes('backend') || roleType.includes('back-end')) roles.add('backend');
      if (roleType.includes('fullstack') || roleType.includes('full-stack')) roles.add('fullstack');
      if (roleType.includes('data') || roleType.includes('scientist')) roles.add('data');
      if (roleType.includes('devops') || roleType.includes('infrastructure')) roles.add('devops');
      if (roleType.includes('mobile') || roleType.includes('ios') || roleType.includes('android')) roles.add('mobile');
      
      // Map experience to filter categories
      if (expLevel.includes('junior') || expLevel.includes('0-2') || expLevel.includes('entry')) experiences.add('junior');
      if (expLevel.includes('mid') || expLevel.includes('3-5') || expLevel.includes('intermediate')) experiences.add('mid');
      if (expLevel.includes('senior') || expLevel.includes('5+') || expLevel.includes('lead')) experiences.add('senior');
    });
    
    return { roles: Array.from(roles), experiences: Array.from(experiences) };
  };

  const availableFilters = getAvailableFilters();
  const totalPages = Math.ceil(totalAnalyses / itemsPerPage);
  const hasActiveFilters = filterBy !== 'all' || sortBy !== 'newest';

  if (loading && currentPage === 1 && allAnalyses.length === 0) {
    return (
      <div className="past-analysis">
        <div className="analysis-header">
          <h2>Past Analysis</h2>
          <p>Loading your analysis history...</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Fetching your analyses...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="past-analysis">
        <div className="analysis-header">
          <h2>Past Analysis</h2>
          <p>View your previous job description analyses</p>
        </div>
        <div className="error-container">

          <h3>Error Loading Analyses</h3>
          <p>{error}</p>
          <button 
            className="retry-btn"
            onClick={() => {
              setError('');
              setCurrentPage(1);
              handleRefresh();
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="past-analysis">
      <div className="analysis-header">
        <div className="header-content">
          <h2>Past Analysis</h2>
          <p>View and manage your previous job description analyses</p>
        </div>
        <div className="header-actions">
          {hasActiveFilters && (
            <button 
              className="clear-filters-btn"
              onClick={handleClearFilters}
            >
              <span className="clear-icon">✕</span>
              Clear Filters
            </button>
          )}
          <button 
            className="refresh-btn"
            onClick={handleRefresh}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">

              <div className="stat-content">
                <div className="stat-number">{stats.total_analyses}</div>
                <div className="stat-label">Total Analyses</div>
              </div>
            </div>
            
            <div className="stat-card">

              <div className="stat-content">
                <div className="stat-number">
                  {Object.keys(stats.role_distribution || {}).length}
                </div>
                <div className="stat-label">Role Types</div>
              </div>
            </div>
            
            <div className="stat-card">
              
              <div className="stat-content">
                <div className="stat-number">
                  {Object.keys(stats.experience_distribution || {}).length}
                </div>
                <div className="stat-label">Experience Levels</div>
              </div>
            </div>
            
            <div className="stat-card">
              
              <div className="stat-content">
                <div className="stat-number">
                  {totalAnalyses}
                </div>
                <div className="stat-label">
                  {hasActiveFilters ? 'Filtered Results' : 'All Results'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Content */}
      <div className="analysis-content">
        {allAnalyses.length === 0 ? (
          <div className="empty-state">
            
            <h3>No analyses yet</h3>
            <p>Start by analyzing your first job description!</p>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="analysis-controls">
              <div className="controls-left">
                <div className="results-info">
                  <span className="results-count">
                    {totalAnalyses === 0 ? (
                      <>No results found</>
                    ) : (
                      <>Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalAnalyses)} of {totalAnalyses} analyses</>
                    )}
                  </span>
                  {hasActiveFilters && (
                    <span className="filter-indicator">
                      (filtered from {allAnalyses.length} total)
                    </span>
                  )}
                </div>
              </div>
              
              <div className="controls-right">
                {/* Filter Dropdown */}
                <div className="filter-group">
                  <label htmlFor="filter-select">Filter:</label>
                  <select 
                    id="filter-select"
                    value={filterBy} 
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Types ({allAnalyses.length})</option>
                    {availableFilters.roles.length > 0 && (
                      <optgroup label="Role Types">
                        {availableFilters.roles.includes('frontend') && <option value="frontend">Frontend</option>}
                        {availableFilters.roles.includes('backend') && <option value="backend">Backend</option>}
                        {availableFilters.roles.includes('fullstack') && <option value="fullstack">Fullstack</option>}
                        {availableFilters.roles.includes('data') && <option value="data">Data Science</option>}
                        {availableFilters.roles.includes('devops') && <option value="devops">DevOps</option>}
                        {availableFilters.roles.includes('mobile') && <option value="mobile">Mobile</option>}
                      </optgroup>
                    )}
                    {availableFilters.experiences.length > 0 && (
                      <optgroup label="Experience Levels">
                        {availableFilters.experiences.includes('junior') && <option value="junior">Junior</option>}
                        {availableFilters.experiences.includes('mid') && <option value="mid">Mid-level</option>}
                        {availableFilters.experiences.includes('senior') && <option value="senior">Senior</option>}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* Sort Dropdown */}
                <div className="sort-group">
                  <label htmlFor="sort-select">Sort by:</label>
                  <select 
                    id="sort-select"
                    value={sortBy} 
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="sort-select"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="role">Role Type</option>
                    <option value="experience">Experience Level</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Analysis List or Empty Filter State */}
            {totalAnalyses === 0 ? (
              <div className="empty-filter-state">
                
                <h3>No analyses match your filter</h3>
                <p>Try adjusting your filter criteria or clear all filters to see all analyses.</p>
                <button 
                  className="clear-filters-btn-large"
                  onClick={handleClearFilters}
                >
                  <span className="clear-icon">✕</span>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="analysis-list">
                  {loading ? (
                    <div className="loading-overlay">
                      <div className="loading-spinner"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    analyses.map((analysis, index) => (
                      <AnalysisCard
                        key={analysis.analysis_id || `${currentPage}-${index}`}
                        analysis={analysis}
                        onDelete={handleDeleteAnalysis}
                        formatDate={formatDate}
                      />
                    ))
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    totalItems={totalAnalyses}
                    itemsPerPage={itemsPerPage}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PastAnalysis;