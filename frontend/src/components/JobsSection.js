import React, { useState, useEffect } from 'react';
import './JobsSection.css';

const JobsSection = ({ darkMode }) => {
  console.log('API URL in JobsSection:', process.env.REACT_APP_API_URL);
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'remote', 'onsite'
  
  useEffect(() => {
    let mounted = true; // To prevent setting state on unmounted component
    
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // API URL moved inside useEffect
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        
        const response = await fetch(`${apiUrl}/jobs`);
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        
        const jobsData = await response.json();
        console.log('Jobs fetched:', jobsData.length);
        
        if (mounted) {
          setJobs(jobsData);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        if (mounted) {
          setError('Failed to load jobs. Please try again later.');
          setLoading(false);
        }
      }
    };
    
    fetchJobs();
    
    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - runs only once
  
  const handleSearch = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // API URL for search
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const url = searchTerm 
        ? `${apiUrl}/jobs/search?query=${encodeURIComponent(searchTerm)}`
        : `${apiUrl}/jobs`;
        
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const results = await response.json();
      setJobs(results);
    } catch (err) {
      console.error('Error searching jobs:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const filteredJobs = jobs.filter(job => {
    if (filter === 'remote') return job.isRemote;
    if (filter === 'onsite') return !job.isRemote;
    return true; // 'all'
  });
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not specified';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  const handleJobClick = (job) => {
    // Analytics can be added later
    console.log('Job clicked:', job.title);
  };
  
  return (
    <div className={`jobs-section ${darkMode ? 'dark-mode' : ''}`}>
      <h2>Bioinformatics Jobs</h2>
      
      <div className="jobs-controls">
        <form onSubmit={handleSearch} className="jobs-search">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search jobs by title, company, or skills..."
            className={`jobs-search-input ${darkMode ? 'dark-input' : ''}`}
          />
          <button type="submit" className="jobs-search-button">Search</button>
        </form>
        
        <div className="jobs-filter">
          <label className={darkMode ? 'dark-label' : ''}>
            <input
              type="radio"
              name="filter"
              value="all"
              checked={filter === 'all'}
              onChange={() => setFilter('all')}
            />
            All
          </label>
          <label className={darkMode ? 'dark-label' : ''}>
            <input
              type="radio"
              name="filter"
              value="remote"
              checked={filter === 'remote'}
              onChange={() => setFilter('remote')}
            />
            Remote Only
          </label>
          <label className={darkMode ? 'dark-label' : ''}>
            <input
              type="radio"
              name="filter"
              value="onsite"
              checked={filter === 'onsite'}
              onChange={() => setFilter('onsite')}
            />
            On-site Only
          </label>
        </div>
      </div>
      
      {loading ? (
        <div className={`jobs-loading ${darkMode ? 'dark-text' : ''}`}>
          <div className="loader"></div>
          <span>Loading jobs...</span>
        </div>
      ) : error ? (
        <div className="jobs-error">{error}</div>
      ) : filteredJobs.length === 0 ? (
        <div className={`jobs-empty ${darkMode ? 'dark-text' : ''}`}>No jobs found matching your criteria.</div>
      ) : (
        <div className="jobs-list">
          {filteredJobs.map((job) => (
            <div key={job._id || job.url} className={`job-card ${darkMode ? 'dark-card' : ''}`}>
              <h3 className="job-title">
                <a 
                  href={job.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => handleJobClick(job)}
                  className={darkMode ? 'dark-link' : ''}
                >
                  {job.title}
                </a>
              </h3>
              <div className={`job-company ${darkMode ? 'dark-text' : ''}`}>{job.company}</div>
              <div className={`job-location ${darkMode ? 'dark-text-secondary' : ''}`}>
                {job.location}
                {job.isRemote && <span className={`job-remote-badge ${darkMode ? 'dark-badge' : ''}`}>Remote</span>}
              </div>
              <div className={`job-meta ${darkMode ? 'dark-text-secondary' : ''}`}>
                <span className="job-source">Source: {job.source}</span>
                <span className="job-date">Posted: {job.posted_date ? formatDate(job.posted_date) : 'Recently'}</span>
              </div>
              <div className="job-tags">
                {job.tags && job.tags.map((tag, tagIndex) => (
                  <span key={`${job._id}-${tagIndex}`} className={`job-tag ${darkMode ? 'dark-tag' : ''}`}>{tag}</span>
                ))}
              </div>
              <a 
                href={job.url} 
                className="job-apply-btn" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => handleJobClick(job)}
              >
                View Job
              </a>
              
              {/* Ad placeholder for future Google AdSense */}
              {filteredJobs.indexOf(job) === 2 && (
                <div className={`ad-placeholder ${darkMode ? 'dark-placeholder' : ''}`} id="job-list-ad">
                  {/* Google AdSense will be added here later */}
                  <span className={darkMode ? 'dark-text-secondary' : ''}>Advertisement</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Bottom ad placeholder */}
      <div className={`ad-placeholder ad-placeholder-bottom ${darkMode ? 'dark-placeholder' : ''}`} id="jobs-bottom-ad">
        {/* Google AdSense will be added here later */}
        <span className={darkMode ? 'dark-text-secondary' : ''}>Advertisement</span>
      </div>
    </div>
  );
};

export default JobsSection;