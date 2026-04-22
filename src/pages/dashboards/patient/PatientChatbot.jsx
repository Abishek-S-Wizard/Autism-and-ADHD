import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AIChatWindow from '../../shared/AIChatWindow';
import '../../../styles/chatbots.css';
import '../../../styles/aiChatbot.css';

const PatientChatbot = () => {
  return (
    <div className="chatbot-container animate-fade-in">
      <Link to="/patient" className="chatbot-back-button">
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>
      
      <div className="chatbot-header">
        <h1 className="chatbot-title">AI Support Chatbot</h1>
        <p className="chatbot-subtitle">Instant answers for platform navigation, general ADHD/Autism inquiries, and technical support.</p>
      </div>

      <AIChatWindow role="patient" />
    </div>
  );
};

export default PatientChatbot;
