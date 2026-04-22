import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, MessageSquare, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '../../lib/supabase';
import '../../styles/aiChatbot.css';

const AIChatWindow = ({ role = 'patient' }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

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
    if (!message.trim() || loading) return;

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
      
      setChatHistory(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, response: data.response } : msg
      ));

    } catch (err) {
      console.error("Chat error:", err);
      setChatHistory(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, response: "Sorry, I'm having trouble connecting to my brain right now. Please try again later." } : msg
      ));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`ai-chat-window full-page role-${role}`}>
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
            <h3>Welcome to NeuroDetect AI Support</h3>
            <p>I'm your AI assistant, specifically tailored for your role as a {role.charAt(0).toUpperCase() + role.slice(1)}.</p>
            <p className="welcome-note">You can ask me technical questions, clinical explanations, or help with the platform.</p>
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
                    <div className="markdown-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {item.response}
                      </ReactMarkdown>
                    </div>
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
          placeholder="Ask something..." 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={!message.trim() || loading}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
};

export default AIChatWindow;
