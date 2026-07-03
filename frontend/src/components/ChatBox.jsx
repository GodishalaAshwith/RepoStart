import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';
import axios from 'axios';

const ChatBox = () => {
  const [messages, setMessages] = useState([
    { type: 'ai', content: 'Repository indexed! What would you like to know about the codebase?', source: null }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/query', {
        query: userMessage
      });
      
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: response.data.answer,
        source: response.data.source_snippet,
        confidence: response.data.confidence
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: 'Sorry, I encountered an error searching the knowledge base.',
        source: err.response?.data?.detail || err.message
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '600px', marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <Bot size={24} color="var(--accent-color)" />
        <h3 style={{ margin: 0 }}>Onboarding Assistant</h3>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem' }} className="chat-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.type}`}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.2rem', alignItems: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
              {msg.type === 'user' ? <User size={14} /> : <Bot size={14} />}
              <span>{msg.type === 'user' ? 'You' : 'Assistant'}</span>
            </div>
            <div className="message-bubble">
              {msg.content}
            </div>
            {msg.source && (
              <div className="message-source">
                {msg.source}
                {msg.confidence !== undefined && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <span className="confidence-badge">
                      Confidence: {(msg.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="message ai">
            <div className="message-bubble" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Loader2 className="spinner" size={16} />
              Searching vector index...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <input
          type="text"
          placeholder="Ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
