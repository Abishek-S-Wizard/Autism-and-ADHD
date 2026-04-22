import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AIChatWindow from '../../shared/AIChatWindow';
import '../../../styles/chatbots.css';
import '../../../styles/aiChatbot.css';

const ResearchChatbot = () => {
  return (
    <div className="chatbot-container animate-fade-in">
      <Link to="/researcher" className="chatbot-back-button">
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>
      
      <div className="chatbot-header">
        <h1 className="chatbot-title">Research AI Assistant</h1>
        <p className="chatbot-subtitle">Technical details, dataset links, and research paper summaries for academic study.</p>
      </div>

      <AIChatWindow role="researcher" />
    </div>
  );
};

export default ResearchChatbot;
