import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Library, FileText, Download, PlayCircle } from 'lucide-react';
import '../../../styles/researchModule.css';
import '../../../styles/resourceList.css';
import '../../../styles/cards.css';
import '../../../styles/buttons.css';

const ResearchMaterials = () => {
  return (
    <div className="research-container animate-fade-in">
      <Link to="/researcher" className="research-back-link">
        <ArrowLeft size={18} /> Back to Research Portal
      </Link>
      
      <div className="research-header">
        <h1 className="research-title">Study Materials</h1>
        <p className="research-subtitle">
          Documentation, methodologies, and clinical study frameworks.
        </p>
      </div>

      <div className="materials-grid">
        
        {/* Methodology Card */}
        <div className="card material-card">
          <div className="material-icon-wrapper icon-wrapper-primary">
            <FileText color="#3B82F6" size={24} />
          </div>
          <h3 className="material-card-title">Diagnostic Methodologies</h3>
          <p className="material-card-desc">
            Detailed documentation on the clinical criteria used to label the training datasets, cross-referenced with DSM-5 standards.
          </p>
          <button type="button" className="btn btn-outline material-btn-full">
            <Download size={16} /> Download PDF Overview
          </button>
        </div>

        {/* Video Lectures */}
        <div className="card material-card">
          <div className="material-icon-wrapper icon-wrapper-secondary">
            <PlayCircle color="var(--secondary)" size={24} />
          </div>
          <h3 className="material-card-title">Clinical Observation Recordings</h3>
          <p className="material-card-desc">
            Library of 50+ hours of anonymized patient clinic visits demonstrating various behavioral indicators and ML flag points.
          </p>
          <button type="button" className="btn btn-outline material-btn-full">
            <PlayCircle size={16} /> Access Video Library
          </button>
        </div>

        {/* Study Protocol */}
        <div className="card material-card">
          <div className="material-icon-wrapper icon-wrapper-accent">
            <Library color="var(--accent)" size={24} />
          </div>
          <h3 className="material-card-title">Trial Protocol Guidelines</h3>
          <p className="material-card-desc">
            Standard operating procedures for administering the camera, speech, and questionnaire tests in field studies.
          </p>
          <button type="button" className="btn btn-outline material-btn-full">
            <Download size={16} /> Download Protocols
          </button>
        </div>

      </div>
    </div>
  );
};

export default ResearchMaterials;
