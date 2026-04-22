import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Brain, Activity, Search } from 'lucide-react';
import '../../../styles/researchModule.css';
import '../../../styles/educationalContent.css';
import '../../../styles/cards.css';
import '../../../styles/buttons.css';

const AboutADHD = () => {
  return (
    <div className="research-container animate-fade-in">
      <Link to="/researcher" className="research-back-link">
        <ArrowLeft size={18} /> Back to Research Portal
      </Link>
      
      <div className="research-header">
        <h1 className="research-title">About ADHD</h1>
        <p className="research-subtitle">
          Clinical knowledge and pathology for Attention-Deficit/Hyperactivity Disorder.
        </p>
      </div>

      <div className="education-layout-grid">
        
        {/* Main Educational Content */}
        <div className="education-main-column">
          
          <div className="card education-content-card">
            <h2 className="education-card-heading">
              <Brain size={24} color="var(--secondary)" /> Clinical Overview
            </h2>
            <p className="education-text-block">
              Attention-Deficit/Hyperactivity Disorder (ADHD) is one of the most common neurodevelopmental disorders of childhood. It is usually first diagnosed in childhood and often lasts into adulthood. Children with ADHD may have trouble paying attention, controlling impulsive behaviors, or be overly active.
            </p>
            <p className="education-text-block" style={{ marginBottom: 0 }}>
              Our platform utilizes high-resolution fMRI (Functional Magnetic Resonance Imaging) datasets passed through Convolutional Neural Networks (CNN) to detect volumetric differences in the prefrontal cortex and basal ganglia heavily associated with ADHD.
            </p>
          </div>

          <div className="card education-content-card">
            <h2 className="education-card-subheading">Diagnostic Sub-types</h2>
            <div className="indicators-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              
              <div className="indicator-box">
                <h3 className="indicator-title" style={{ color: 'var(--secondary)' }}>Inattentive Type</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Hard to organize or finish a task, pay attention to details, or follow instructions. The person is easily distracted or forgets details of daily routines.
                </p>
              </div>

              <div className="indicator-box">
                <h3 className="indicator-title" style={{ color: '#F59E0B' }}>Hyperactive/Impulsive Type</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  The person fidgets and talks a lot. It is hard to sit still for long. Impulsivity causes interrupting others, grabbing things, or speaking at inappropriate times.
                </p>
              </div>

              <div className="indicator-box">
                <h3 className="indicator-title" style={{ color: 'var(--primary)' }}>Combined Type</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Symptoms of the above two types are equally present in the person. This is the most common presentation in clinical diagnoses.
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Sidebar References */}
        <div className="education-sidebar-column">
          <div className="card sidebar-info-card">
            <h3 className="sidebar-heading">
              <Activity size={18} color="var(--accent)" /> AI Model Context
            </h3>
            <p className="sidebar-text">
              The VGG16 model scans axial MRI slices highlighting neural density metrics. Researchers can export tensor weights directly from the datasets module.
            </p>
            <div className="sidebar-highlight-box sidebar-highlight-secondary">
              <strong>Current Training Efficacy:</strong> 94.2% Validation Accuracy across 3,150 instances.
            </div>
          </div>

          <div className="card related-topics-card">
            <div className="related-topics-header">
               <h3 className="related-topics-title">
                 <Search size={18} /> Related Topics
               </h3>
            </div>
            <div className="related-topics-list">
               <a href="#" className="related-topic-link">Dopaminergic System Anomalies</a>
               <a href="#" className="related-topic-link">Efficacy of Stimulant Medications</a>
               <a href="#" className="related-topic-link">fMRI Biomarkers in Pediatrics</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutADHD;
