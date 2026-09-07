import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './AIChatPanel.css';

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || '';

const AIChatPanel = ({ roomId }) => {
  const storageKey = `syncode.aichat.${roomId || 'global'}`;

  const [messages, setMessages] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Persist messages to localStorage whenever they update
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save AI chat to localStorage:', e);
    }
  }, [messages, storageKey]);

  // If roomId changes, load corresponding history
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      setMessages(stored ? JSON.parse(stored) : []);
    } catch {
      setMessages([]);
    }
  }, [storageKey]);

  const clearHistory = () => {
    setMessages([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.warn('Failed to clear AI chat from localStorage:', e);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const prompt = input.trim();

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: prompt }
    ]);

    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('syncode_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post(
        `${BACKEND_URL}/ai`,
        { prompt },
        { headers }
      );

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: response.data.reply
        }
      ]);
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.message ||
        'Unable to connect to AI service. Check server connection.';

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: message
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-panel">
      <div className="ai-chat-panel-title">
        AI Assistant
      </div>

      {messages.length > 0 && (
        <div className="ai-chat-panel-toolbar">
          <span className="ai-chat-status-text">History saved</span>
          <button
            type="button"
            className="ai-chat-clear-btn"
            onClick={clearHistory}
            title="Clear AI chat history"
          >
            Clear chat
          </button>
        </div>
      )}

      <div className="ai-chat-panel-messages">
        {messages.length === 0 && (
          <div className="ai-chat-panel-empty">
            Ask questions about your code or project. Try asking
            for explanations, refactoring suggestions, or debugging help.
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className="ai-message-row">
            <div className={`ai-message-label ${msg.role}`}>
              {msg.role === 'user' ? 'You' : 'Assistant'}
            </div>

            <div className="ai-message-text">
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="ai-chat-panel-loading">
            Thinking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="ai-chat-panel-input-area">
        <div className="ai-chat-panel-input-wrapper">
          <input
            className="ai-chat-panel-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' &&
              !e.shiftKey &&
              sendMessage()
            }
            placeholder="Ask a question (Shift+Enter for new line)"
            disabled={loading}
          />

          <button
            className="ai-chat-panel-button"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatPanel;
