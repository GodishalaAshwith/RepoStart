import React, { useState } from 'react';
import { Github, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';

const RepoInput = ({ onIngestSuccess }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/api/ingest', {
        github_url: url
      });
      onIngestSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to ingest repository');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel">
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}>
        <Github size={24} />
        Connect Repository
      </h2>
      <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
        Paste a GitHub URL to build the local knowledge base.
      </p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="https://github.com/owner/repo"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading || !url}>
          {loading ? <Loader2 className="spinner" size={20} /> : <ArrowRight size={20} />}
          {loading ? 'Ingesting...' : 'Ingest'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'var(--error-color)', marginTop: '1rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default RepoInput;
