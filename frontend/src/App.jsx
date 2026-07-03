import React, { useState } from 'react';
import RepoInput from './components/RepoInput';
import ChatBox from './components/ChatBox';
import './index.css';

function App() {
  const [isIngested, setIsIngested] = useState(false);
  const [ingestStats, setIngestStats] = useState(null);

  const handleIngestSuccess = (data) => {
    setIsIngested(true);
    setIngestStats(data);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>RepoStart</h1>
        <p>Local AI Onboarding Engine</p>
      </header>

      <main>
        {!isIngested ? (
          <RepoInput onIngestSuccess={handleIngestSuccess} />
        ) : (
          <div style={{ animation: 'slideUp 0.5s ease forwards' }}>
            <div style={{ 
              background: 'rgba(16, 185, 129, 0.1)', 
              border: '1px solid var(--success-color)',
              color: 'var(--success-color)',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              {ingestStats?.message || 'Repository successfully indexed!'}
            </div>
            <ChatBox />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
