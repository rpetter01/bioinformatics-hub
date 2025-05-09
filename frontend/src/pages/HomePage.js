// src/pages/HomePage.js
import React, { useState } from 'react';
import { Search, Database, Book, Code, Globe, Moon, Sun, ShoppingBag } from 'lucide-react';
import './HomePage.css';

function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  
  // Hard-coded resources to ensure they appear
  const resources = [
    {
      id: "blast",
      name: "BLAST (NCBI)",
      description: "Basic Local Alignment Search Tool for comparing biological sequence information",
      category: "tool",
      tags: ["sequence alignment", "genomics", "NCBI"],
      url: "https://blast.ncbi.nlm.nih.gov/Blast.cgi",
      lastUpdated: "2025-05-01",
      featured: true
    },
    {
      id: "alphafold",
      name: "AlphaFold",
      description: "AI system developed by DeepMind that predicts protein 3D structure from amino acid sequence",
      category: "tool",
      tags: ["protein structure", "AI", "DeepMind"],
      url: "https://alphafold.ebi.ac.uk/",
      lastUpdated: "2025-04-30",
      featured: true
    },
    {
      id: "genbank",
      name: "GenBank",
      description: "Comprehensive genetic sequence database with annotated sequences",
      category: "database",
      tags: ["genetics", "sequence database", "NCBI"],
      url: "https://www.ncbi.nlm.nih.gov/genbank/",
      lastUpdated: "2025-04-23",
      featured: true
    },
    {
      id: "expasy",
      name: "ExPASy",
      description: "Swiss Institute of Bioinformatics resource portal for proteomics, genomics and systems biology",
      category: "website",
      tags: ["proteomics", "genomics", "systems biology"],
      url: "https://www.expasy.org/",
      lastUpdated: "2025-04-29",
      featured: false
    },
    {
      id: "pdb",
      name: "Protein Data Bank (PDB)",
      description: "Database of 3D structural data of biological macromolecules",
      category: "database",
      tags: ["protein structure", "3D models", "macromolecules"],
      url: "https://www.rcsb.org/",
      lastUpdated: "2025-05-02",
      featured: false
    }
  ];
  
  // Category icons
  const categoryIcons = {
    tool: <Code size={24} />,
    database: <Database size={24} />,
    course: <Book size={24} />,
    website: <Globe size={24} />
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <h1>Bioinformatics Hub</h1>
            <p>Your directory of bioinformatics resources</p>
          </div>
          
          <div className="actions">
            <button className="store-btn">
              <ShoppingBag size={18} />
              <span>Wear Your Science</span>
            </button>
            
            <button className="theme-btn" onClick={toggleDarkMode}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>
        
        {/* Search and filters */}
        <div className="search-container">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Search resources..." />
          </div>
          
          <div className="filter-buttons">
            <button className="active">All</button>
            <button>Tools</button>
            <button>Databases</button>
            <button>Websites</button>
            <button>Courses</button>
          </div>
        </div>
        
        {/* Featured Resources */}
        <section>
          <h2 className="section-title">
            <span className="dot"></span>
            Featured Resources
          </h2>
          
          <div className="resources-grid">
            {resources
              .filter(r => r.featured)
              .map(resource => (
                <div key={resource.id} className="resource-card featured">
                  <div className="feature-tag">Featured</div>
                  <h3>{resource.name}</h3>
                  <div className="resource-icon">
                    {categoryIcons[resource.category]}
                  </div>
                  <p>{resource.description}</p>
                  <div className="tags">
                    {resource.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="card-footer">
                    <span>Updated: {resource.lastUpdated}</span>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      Visit →
                    </a>
                  </div>
                </div>
              ))}
          </div>
        </section>
        
        {/* All Resources */}
        <section>
          <h2 className="section-title">All Resources</h2>
          
          <div className="resources-grid">
            {resources
              .filter(r => !r.featured)
              .map(resource => (
                <div key={resource.id} className="resource-card">
                  <h3>{resource.name}</h3>
                  <div className="resource-icon">
                    {categoryIcons[resource.category]}
                  </div>
                  <p>{resource.description}</p>
                  <div className="tags">
                    {resource.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="card-footer">
                    <span>Updated: {resource.lastUpdated}</span>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      Visit →
                    </a>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;