import React, { useState } from 'react';
import './Newsletter.css';

const Newsletter = ({ darkMode }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // For now, just show success message
    // Later you can integrate with an email service
    setStatus('success');
    setEmail('');
    
    setTimeout(() => {
      setStatus('');
    }, 3000);
  };

  return (
    <div className={`newsletter-container ${darkMode ? 'dark-mode' : ''}`}>
      <h3>Stay Updated with Bioinformatics News</h3>
      <p>Get the latest tools, research breakthroughs, and job opportunities delivered to your inbox weekly.</p>
      
      <form onSubmit={handleSubmit} className="newsletter-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="newsletter-input"
        />
        <button type="submit" className="newsletter-button">
          Subscribe
        </button>
      </form>
      
      {status === 'success' && (
        <p className="newsletter-success">Thank you for subscribing!</p>
      )}
    </div>
  );
};

export default Newsletter;