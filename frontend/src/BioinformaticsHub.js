import React, { useState, useEffect } from 'react';
import './BioinformaticsHub.css';
import { useApi } from './services/api'; // Import the API hook

// Importing the Jobs component
import JobsSection from './components/JobsSection';

// Importando os ícones (usando SVG simples para evitar dependências)
const Icons = {
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  Database: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
    </svg>
  ),
  Book: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
  ),
  Code: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6"></polyline>
      <polyline points="8 6 2 12 8 18"></polyline>
    </svg>
  ),
  Globe: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  ),
  Sun: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  ),
  Moon: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  ),
  ShoppingBag: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
  ),
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  ),
  Briefcase: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  )
};

// Dados dos recursos
const RESOURCES = [
  {
    id: '1',
    name: 'BLAST (NCBI)',
    description: 'Basic Local Alignment Search Tool for comparing biological sequence information',
    category: 'tool',
    tags: ['sequence alignment', 'genomics', 'NCBI'],
    url: 'https://blast.ncbi.nlm.nih.gov/Blast.cgi',
    popularity: 98,
    lastUpdated: '2025-05-01',
    featured: true
  },
  {
    id: '2',
    name: 'GenBank',
    description: 'Comprehensive genetic sequence database with annotated sequences',
    category: 'database',
    tags: ['genetics', 'sequence database', 'NCBI'],
    url: 'https://www.ncbi.nlm.nih.gov/genbank/',
    popularity: 95,
    lastUpdated: '2025-04-23',
    featured: true
  },
  {
    id: '3',
    name: 'AlphaFold',
    description: 'AI system developed by DeepMind that predicts protein 3D structure from amino acid sequence',
    category: 'tool',
    tags: ['protein structure', 'AI', 'DeepMind'],
    url: 'https://alphafold.ebi.ac.uk/',
    popularity: 99,
    lastUpdated: '2025-04-30',
    featured: true
  },
  {
    id: '4',
    name: 'EdX: Principles of Biochemistry',
    description: 'Harvard University course covering fundamental biochemistry concepts for bioinformatics',
    category: 'course',
    tags: ['education', 'biochemistry', 'Harvard'],
    url: 'https://www.edx.org/learn/biochemistry',
    popularity: 88,
    lastUpdated: '2025-02-18',
    featured: false
  },
  {
    id: '5',
    name: 'Biostars',
    description: 'Q&A forum for bioinformatics professionals and students',
    category: 'website',
    tags: ['community', 'forum', 'Q&A'],
    url: 'https://www.biostars.org/',
    popularity: 92,
    lastUpdated: '2025-04-30',
    featured: false
  },
  {
    id: '6',
    name: 'ExPASy',
    description: 'Swiss Institute of Bioinformatics resource portal for proteomics, genomics and systems biology',
    category: 'website',
    tags: ['proteomics', 'genomics', 'systems biology'],
    url: 'https://www.expasy.org/',
    popularity: 90,
    lastUpdated: '2025-04-29',
    featured: false
  },
  {
    id: '7',
    name: 'Protein Data Bank (PDB)',
    description: 'Database of 3D structural data of biological macromolecules',
    category: 'database',
    tags: ['protein structure', '3D models', 'macromolecules'],
    url: 'https://www.rcsb.org/',
    popularity: 93,
    lastUpdated: '2025-05-02',
    featured: false
  }
];

// Custom store button - would be fetched from database in real implementation
const STORE_BUTTON = {
  text: "Wear Your Science",
  url: "https://www.redbubble.com/shop/ap/140714014",
  enabled: true
};

export default function BioinformaticsHub() {
  const [resources, setResources] = useState(RESOURCES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [storeButton, setStoreButton] = useState(STORE_BUTTON);
  const [activeTab, setActiveTab] = useState('resources'); // Added tab state

  const api = useApi(); // Initialize the API hook
  
  // Get all unique tags from data
  const allTags = [...new Set(RESOURCES.flatMap(item => item.tags))];
  
  // Filter resources based on search and filters
  useEffect(() => {
    let filtered = RESOURCES;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item => 
        selectedTags.every(tag => item.tags.includes(tag))
      );
    }
    
    setResources(filtered);
  }, [searchTerm, selectedCategory, selectedTags]);
  
  // Toggle tag selection
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Category to icon mapping
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'tool': return <Icons.Code />;
      case 'database': return <Icons.Database />;
      case 'course': return <Icons.Book />;
      case 'website': return <Icons.Globe />;
      default: return <Icons.Code />;
    }
  };
  
  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <h1 className="header-title">Bioinformatics Hub</h1>
            <p className="header-subtitle">Your directory of bioinformatics resources and jobs</p>
          </div>
          <div className="header-actions">
            {/* Store Button */}
            {storeButton.enabled && (
              <a 
                href={storeButton.url}
                target="_blank"
                rel="noopener noreferrer"
                className="store-button"
              >
                <span className="store-icon"><Icons.ShoppingBag /></span>
                <span>{storeButton.text}</span>
              </a>
            )}
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode} 
              className="theme-button"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Icons.Sun /> : <Icons.Moon />}
            </button>
          </div>
        </header>
        
        {/* Main Tab Navigation - REPLACED with filter-button style */}
        <div className="filter-buttons main-tabs">
          <button 
            className={`filter-button ${activeTab === 'resources' ? 'active' : ''}`}
            onClick={() => setActiveTab('resources')}
          >
            <Icons.Database /> Resources
          </button>
          <button 
            className={`filter-button ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            <Icons.Briefcase /> Jobs
          </button>
        </div>

        {/* Resources Content */}
        {activeTab === 'resources' && (
          <>
            {/* Search and filters */}
            <div className="search-container">
              <div className="search-box">
                <span className="search-icon"><Icons.Search /></span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search tools, databases, courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="filter-buttons">
                <button 
                  className={`filter-button ${selectedCategory === '' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('')}
                >
                  All
                </button>
                <button 
                  className={`filter-button ${selectedCategory === 'tool' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('tool')}
                >
                  <Icons.Code /> Tools
                </button>
                <button 
                  className={`filter-button ${selectedCategory === 'database' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('database')}
                >
                  <Icons.Database /> Databases
                </button>
                <button 
                  className={`filter-button ${selectedCategory === 'course' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('course')}
                >
                  <Icons.Book /> Courses
                </button>
                <button 
                  className={`filter-button ${selectedCategory === 'website' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('website')}
                >
                  <Icons.Globe /> Websites
                </button>
              </div>
              
              <div className="tags-container">
                <p className="tags-title">Popular Tags:</p>
                <div className="tags">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      className={`tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Featured Resources Section */}
            {resources.some(r => r.featured) && (
              <div className="featured-section">
                <h2 className="section-title">
                  <span className="featured-dot"></span>
                  Featured Resources
                </h2>
                <div className="resources-grid featured-grid">
                  {resources
                    .filter(resource => resource.featured)
                    .map(resource => (
                      <div key={resource.id} className="resource-card featured">
                        <div className="featured-badge">FEATURED</div>
                        <div className="card-content">
                          <div className="card-header">
                            <div className={`card-icon ${resource.category}`}>
                              {getCategoryIcon(resource.category)}
                            </div>
                            <h3 className="card-title">{resource.name}</h3>
                          </div>
                          <p className="card-description">{resource.description}</p>
                          <div className="card-tags">
                            {resource.tags.map(tag => (
                              <span key={tag} className="card-tag">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="card-footer">
                            <span className="card-date">Updated: {resource.lastUpdated}</span>
                            <a 
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="card-link"
                              onClick={() => api.analytics.recordResourceClick(resource.id, resource.name)}
                            >
                              Visit <span style={{ fontSize: '16px', marginLeft: '2px' }}>→</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
            
            {/* Regular Resource cards */}
            <div className="resources-section">
              <h2 className="section-title">All Resources</h2>
              <div className="resources-grid">
                {resources
                  .filter(resource => !resource.featured)
                  .map(resource => (
                    <div key={resource.id} className="resource-card">
                      <div className="card-content">
                        <div className="card-header">
                          <div className={`card-icon ${resource.category}`}>
                            {getCategoryIcon(resource.category)}
                          </div>
                          <h3 className="card-title">{resource.name}</h3>
                        </div>
                        <p className="card-description">{resource.description}</p>
                        <div className="card-tags">
                          {resource.tags.map(tag => (
                            <span key={tag} className="card-tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="card-footer">
                          <span className="card-date">Updated: {resource.lastUpdated}</span>
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="card-link"
                            onClick={() => api.analytics.recordResourceClick(resource.id, resource.name)}
                          >
                            Visit <span style={{ fontSize: '16px', marginLeft: '2px' }}>→</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            
            {/* Pagination */}
            <div className="pagination">
              <button className="pagination-button" disabled>Previous</button>
              <button className="pagination-button next">Next</button>
            </div>
          </>
        )}
        
        {/* Jobs Content - NEW */}
        {activeTab === 'jobs' && (
          <JobsSection darkMode={darkMode} />
        )}
      </div>
    </div>
  );
}