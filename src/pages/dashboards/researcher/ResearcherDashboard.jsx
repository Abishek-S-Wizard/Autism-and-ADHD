import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

// Asset imports
import iconAutism from '../../../assets/dashboard-icons/icon_autism.png';
import iconADHD from '../../../assets/dashboard-icons/icon_adhd.png';
import iconScreening from '../../../assets/dashboard-icons/icon_screening.png';
import iconReport from '../../../assets/dashboard-icons/icon_report.png';
import iconChatbot from '../../../assets/dashboard-icons/icon_chatbot.png';
import iconUser from '../../../assets/dashboard-icons/icon_user.png';
import iconAnalytics from '../../../assets/dashboard-icons/icon_analytics.png';

// Sub-modules
import AboutAutism from './AboutAutism';
import AboutADHD from './AboutADHD';
import ResearchMaterials from './ResearchMaterials';
import MedicalDatasets from './MedicalDatasets';
import ResearchPapers from './ResearchPapers';
import ResearchChatbot from './ResearchChatbot';
import ResearcherProfile from './ResearcherProfile';
import QueryAdmin from './QueryAdmin';

import '../../../styles/researcherDashboard.css';
import '../../../styles/cards.css';

const ResearcherHome = () => {
  const [resName, setResName] = useState('Researcher');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('researchers')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile) setResName(profile.full_name);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login/researcher');
  };

  return (
    <div className="researcher-dashboard-container">
      <div className="researcher-dashboard-header">
        <button onClick={handleLogout} className="researcher-logout-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit' }}>Logout</button>
        <h1 className="researcher-dashboard-title">Welcome, {resName}</h1>
        <p className="researcher-dashboard-subtitle">Autism & ADHD AI Research and Analytics Dashboard</p>
      </div>

      <div className="researcher-dashboard-grid">
      
      {/* Core Educational Content 1: Autism */}
      <Link to="about-autism" className="card researcher-module-card">
        <div className="researcher-icon-container res-theme-autism">
          <img src={iconAutism} alt="Autism" />
        </div>
        <h3 className="researcher-module-title">About Autism (ASD)</h3>
        <p className="researcher-module-desc">Educational modules breaking down pathology for Autism Spectrum Disorder.</p>
        <div className="module-tag tag-purple">Pathology</div>
      </Link>

      {/* Core Educational Content 2: ADHD */}
      <Link to="about-adhd" className="card researcher-module-card">
        <div className="researcher-icon-container res-theme-adhd">
          <img src={iconADHD} alt="ADHD" />
        </div>
        <h3 className="researcher-module-title">About ADHD</h3>
        <p className="researcher-module-desc">Educational modules breaking down pathology for ADHD and fMRI markers.</p>
        <div className="module-tag tag-blue">Pathology</div>
      </Link>
      
      {/* Research Materials */}
      <Link to="materials" className="card researcher-module-card">
        <div className="researcher-icon-container res-theme-materials">
          <img src={iconScreening} alt="Study Materials" />
        </div>
        <h3 className="researcher-module-title">Autism & ADHD Study</h3>
        <p className="researcher-module-desc">Proprietary research materials, methodology, and observational literature.</p>
        <div className="module-tag tag-green">Documentation</div>
      </Link>

      {/* Dataset & Downloads */}
      <Link to="datasets" className="card researcher-module-card researcher-card-dataset">
        <div className="researcher-icon-container res-theme-datasets">
          <img src={iconAnalytics} alt="Medical Datasets" />
        </div>
        <h3 className="researcher-module-title">Medical Datasets</h3>
        <p className="researcher-module-desc">Access and download anonymized facial and MRI scanning datasets for ML training.</p>
        <div className="module-tag tag-cyan">Core Data</div>
      </Link>

      {/* Research Papers */}
      <Link to="papers" className="card researcher-module-card">
        <div className="researcher-icon-container res-theme-papers">
          <img src={iconReport} alt="Research Papers" />
        </div>
        <h3 className="researcher-module-title">Research Papers</h3>
        <p className="researcher-module-desc">Peer-reviewed papers concerning pediatric AI diagnostics.</p>
        <div className="module-tag tag-amber">Publications</div>
      </Link>

      {/* Chatbot Assistant */}
      <Link to="assistant" className="card researcher-module-card">
        <div className="researcher-icon-container res-theme-assistant">
          <img src={iconChatbot} alt="Research Assistant" />
        </div>
        <h3 className="researcher-module-title">Research Assistant AI</h3>
        <p className="researcher-module-desc">Query the context-aware chatbot on platform research metrics and findings.</p>
        <div className="module-tag tag-pink">AI Support</div>
      </Link>

      {/* Query Administrator */}
      <Link to="query-admin" className="card researcher-module-card">
        <div className="researcher-icon-container res-theme-queries">
          <img src={iconChatbot} alt="Query Admin" />
        </div>
        <h3 className="researcher-module-title">Query Administrator</h3>
        <p className="researcher-module-desc">Request system changes, dataset access, or report bugs to platform admin.</p>
        <div className="module-tag tag-rose">Support</div>
      </Link>

      {/* Profile Management */}
      <Link to="profile" className="card researcher-module-card">
        <div className="researcher-icon-container res-theme-profile">
          <img src={iconUser} alt="Profile" />
        </div>
        <h3 className="researcher-module-title">Profile Management</h3>
        <p className="researcher-module-desc">Update credentials, institutional affiliations, and publication links.</p>
        <div className="module-tag tag-slate">Account</div>
      </Link>

      </div>
    </div>
  );
};

const ResearcherDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<ResearcherHome />} />
      <Route path="/about-autism" element={<AboutAutism />} />
      <Route path="/about-adhd" element={<AboutADHD />} />
      <Route path="/materials" element={<ResearchMaterials />} />
      <Route path="/datasets" element={<MedicalDatasets />} />
      <Route path="/papers" element={<ResearchPapers />} />
      <Route path="/assistant" element={<ResearchChatbot />} />
      <Route path="/profile" element={<ResearcherProfile />} />
      <Route path="/query-admin" element={<QueryAdmin />} />
    </Routes>
  );
};

export default ResearcherDashboard;
