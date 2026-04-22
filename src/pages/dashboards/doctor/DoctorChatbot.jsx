import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AIChatWindow from '../../shared/AIChatWindow';
import '../../../styles/chatbots.css';
import '../../../styles/aiChatbot.css';

const DoctorChatbot = () => {
  return (
    <div className="chatbot-container animate-fade-in">
      <Link to="/doctor" className="chatbot-back-button">
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>
      
      <div className="chatbot-header">
        <h1 className="chatbot-title">Clinician AI Assistant</h1>
        <p className="chatbot-subtitle">Clinical explanations, screening summaries, and academic resources at your fingertips.</p>
      </div>

      <AIChatWindow role="doctor" />
    </div>
  );
};

export default DoctorChatbot;
