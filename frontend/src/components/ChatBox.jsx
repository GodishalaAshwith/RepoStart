import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Copy, Check } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div style={{ position: 'relative', marginTop: '1rem', marginBottom: '1rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#1e1e1e',
          padding: '0.4rem 0.8rem',
          borderTopLeftRadius: '0.5rem',
          borderTopRightRadius: '0.5rem',
          borderBottom: '1px solid #333'
        }}>
          <span style={{ color: '#858585', fontSize: '0.75rem', fontFamily: 'monospace' }}>
            {match[1]}
          </span>
          <button
            onClick={handleCopy}
            style={{
              background: 'none',
              border: 'none',
              color: '#858585',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem'
            }}
            title="Copy code"
          >
            {copied ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
            {copied ? <span style={{ color: '#4ade80' }}>Copied!</span> : 'Copy'}
          </button>
        </div>
        <SyntaxHighlighter
          {...props}
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          customStyle={{ margin: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem', fontSize: '0.9rem' }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    );
  }
  
  return (
    <code {...props} className={className} style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '0.1rem 0.3rem', borderRadius: '0.2rem', fontFamily: 'monospace', fontSize: '0.85em' }}>
      {children}
    </code>
  );
};

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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiUrl}/api/query`, {
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
            <div className="message-bubble" style={{ overflowX: 'auto', lineHeight: '1.6' }}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  code: CodeBlock
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
            {msg.source && (
              <div className="message-source" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '0.5rem', marginTop: '0.5rem', overflowX: 'auto' }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.source}
                </ReactMarkdown>
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
