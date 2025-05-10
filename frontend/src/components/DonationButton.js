import React, { useState } from 'react';
import './DonationButton.css';

const DonationButton = ({ darkMode }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState('');

  const cryptoAddresses = [
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      address: 'bc1qu705kxdq8qkrkyjhv8xlhh02958zg3e3y53u4k',
      icon: '₿'
    },
    {
      name: 'Ethereum',
      symbol: 'ETH',
      address: '0xcf5eB417b8762B3dAd2432CB33d78B085C3A361F',
      icon: 'Ξ'
    },
    {
      name: 'Litecoin',
      symbol: 'LTC',
      address: 'ltc1qd68rv2ea2nhufe7fhdrnc0jhyxr6kx2q94qggy',
      icon: 'Ł'
    },
    {
      name: 'BNB',
      symbol: 'BNB',
      address: 'bnb17d7nn8afg4wdsntlrrfxqfy8yarh2rq0k0l2je',
      icon: 'BNB'
    }
  ];

  const handleCopyAddress = async (crypto) => {
    try {
      await navigator.clipboard.writeText(crypto.address);
      setCopiedAddress(crypto.symbol);
      setTimeout(() => setCopiedAddress(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`donation-container ${darkMode ? 'dark-mode' : ''}`}>
      <p className="donation-text">Power our compute cluster—buy us a 'GPU hour'!</p>
      <div className="donation-button-wrapper">
        <button 
          className="donation-button"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          Donate
        </button>
        
        {showDropdown && (
          <div className="crypto-dropdown">
            {cryptoAddresses.map((crypto) => (
              <div 
                key={crypto.symbol}
                className="crypto-option"
                onClick={() => handleCopyAddress(crypto)}
              >
                <span className="crypto-icon">{crypto.icon}</span>
                <span className="crypto-name">{crypto.name}</span>
                {copiedAddress === crypto.symbol && (
                  <span className="copied-badge">Copied!</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationButton;