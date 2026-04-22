import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, X, MessageSquare, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import '../../styles/aiChatbot.css';

const AIChatbot = ({ role = 'patient' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [cooldown, setCooldown] = useState(0);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch(`http://localhost:8000/history/${user.id}`);
      if (!response.ok) throw new Error("Failed to load history");
      
      const data = await response.json();
      setChatHistory(data);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading || cooldown > 0) return;

    const userMessage = message.trim();
    setMessage('');
    
    // Optimistic update
    const tempId = Date.now();
    setChatHistory(prev => [...prev, { id: tempId, message: userMessage, response: '...', role }]);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          role: role,
          message: userMessage
        })
      });

      if (!response.ok) throw new Error("Chatbot service offline");

      const data = await response.json();
      
      // Replace the loading message with actual response
      setChatHistory(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, response: data.response } : msg
      ));

    } catch (err) {
      console.error("Chat error:", err);
      const isRateLimit = err.message.includes("overwhelmed") || err.message.includes("limit");
      
      setChatHistory(prev => prev.map(msg => 
        msg.id === tempId ? { 
          ...msg, 
          response: isRateLimit 
            ? "I'm a bit overwhelmed right now! I've reached my free tier limit. Please wait about a minute before asking me another question. 🧠☕"
            : "Sorry, I'm having trouble connecting to my brain right now. Please try again later." 
        } : msg
      ));

      if (isRateLimit) {
        setCooldown(60);
        const timer = setInterval(() => {
          setCooldown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        className="ai-chat-launcher"
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Assistant"
      >
        <Bot size={28} />
      </button>
    );
  }

  return (
    <div className={`ai-chat-container role-${role} ${isMinimized ? 'minimized' : ''}`}>
      <div className="ai-chat-header">
        <div className="ai-chat-title">
          <Bot size={20} className="ai-bot-icon" />
          <span>NeuroDetect AI Assistant ({role.charAt(0).toUpperCase() + role.slice(1)})</span>
        </div>
        <div className="ai-chat-actions">
          <button onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button onClick={() => setIsOpen(false)}>
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="ai-chat-messages">
            {historyLoading ? (
              <div className="ai-chat-loading">
                <Loader2 className="animate-spin" size={24} />
                <p>Loading conversation history...</p>
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="ai-chat-welcome">
                <div className="welcome-icon">
                  <MessageSquare size={32} />
                </div>
                <h3>Welcome!</h3>
                <p>Ask me anything about Autism and ADHD. I'm tailored to help you as a {role}.</p>
              </div>
            ) : (
              chatHistory.map((item, index) => (
                <div key={item.id || index} className="chat-pair">
                  <div className="chat-bubble user-bubble">
                    <User size={14} className="bubble-icon" />
                    <div className="bubble-text">{item.message}</div>
                  </div>
                  <div className="chat-bubble bot-bubble">
                    <Bot size={14} className="bubble-icon" />
                    <div className="bubble-text">
                      {item.response === '...' ? (
                        <div className="typing-indicator">
                          <span></span><span></span><span></span>
                        </div>
                      ) : (
                        item.response
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="ai-chat-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder={cooldown > 0 ? `Wait ${cooldown}s...` : "Type your message..."} 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading || cooldown > 0}
            />
            <button type="submit" disabled={!message.trim() || loading || cooldown > 0}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : 
               cooldown > 0 ? <span className="cooldown-text">{cooldown}</span> : <Send size={18} />}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default AIChatbot;
