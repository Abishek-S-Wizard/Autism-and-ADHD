import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Brain, Activity, Search } from 'lucide-react';
import '../../../styles/researchModule.css';
import '../../../styles/educationalContent.css';
import '../../../styles/cards.css';
import '../../../styles/buttons.css';

const AboutAutism = () => {
  return (
    <div className="research-container animate-fade-in">
      <Link to="/researcher" className="research-back-link">
        <ArrowLeft size={18} /> Back to Research Portal
      </Link>
      
      <div className="research-header">
        <h1 className="research-title">About Autism (ASD)</h1>
        <p className="research-subtitle">
          Clinical knowledge and pathology for Autism Spectrum Disorder.
        </p>
      </div>

      <div className="education-layout-grid">
        
        {/* Main Educational Content */}
        <div className="education-main-column">
          
          <div className="card education-content-card">
            <h2 className="education-card-heading">
              <Brain size={24} color="var(--primary)" /> Clinical Overview
            </h2>
            <p className="education-text-block">
              Autism Spectrum Disorder (ASD) is a complex developmental condition that involves persistent challenges in social interaction, speech and nonverbal communication, and restricted/repetitive behaviors. The effects of ASD and the severity of symptoms are different in each person.
            </p>
            <p className="education-text-block" style={{ marginBottom: 0 }}>
              Our platform utilizes deep-learning models to analyze facial symmetry, micro-expressions, and eye-tracking behaviors to predict early onset pathology with high statistical accuracy.
            </p>
          </div>

          <div className="card education-content-card">
            <h2 className="education-card-subheading">Diagnostic Indicators</h2>
            <div className="indicators-grid">
              <div className="indicator-box">
                <h3 className="indicator-title" style={{ color: 'var(--primary)' }}>Social Communication</h3>
                <ul className="indicator-list">
                  <li>Avoidance of eye contact or inconsistent eye contact</li>
                  <li>Failure to respond to name by 9 months of age</li>
                  <li>Lack of facial expressions like happy, sad, angry, and surprised</li>
                  <li>Difficulty understanding other people’s feelings</li>
                </ul>
              </div>
              <div className="indicator-box">
                <h3 className="indicator-title" style={{ color: 'var(--accent)' }}>Restricted Behaviors</h3>
                <ul className="indicator-list">
                  <li>Echolalia (repeating words or phrases over and over)</li>
                  <li>Playing with toys the exact same way every time</li>
                  <li>Flapping hands, rocking body, or spinning in circles</li>
                  <li>Hyper or hypo-reactivity to sensory input</li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar References */}
        <div className="education-sidebar-column">
          <div className="card sidebar-info-card">
            <h3 className="sidebar-heading">
              <Activity size={18} color="var(--secondary)" /> AI Model Context
            </h3>
            <p className="sidebar-text">
              The VGG16 underlying model for Autism detection relies primarily on analyzing distinct demographic variations and micro-asymmetries mapped via OpenCV. 
            </p>
            <div className="sidebar-highlight-box">
              <strong>Current Training Efficacy:</strong> 96.8% Validation Accuracy across 8,432 instances.
            </div>
          </div>

          <div className="card related-topics-card">
            <div className="related-topics-header">
               <h3 className="related-topics-title">
                 <Search size={18} /> Related Topics
               </h3>
            </div>
            <div className="related-topics-list">
               <a href="#" className="related-topic-link">Historical Prevalence Rates</a>
               <a href="#" className="related-topic-link">Genetic vs. Environmental Factors</a>
               <a href="#" className="related-topic-link">Comorbid Conditions in ASD</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutAutism;
