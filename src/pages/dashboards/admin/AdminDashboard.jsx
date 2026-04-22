import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// Asset imports
import iconShield from '../../../assets/dashboard-icons/icon_shield.png';
import iconNetwork from '../../../assets/dashboard-icons/icon_network.png';
import iconAnalytics from '../../../assets/dashboard-icons/icon_analytics.png';
import iconChat from '../../../assets/dashboard-icons/icon_chat.png';
import iconUser from '../../../assets/dashboard-icons/icon_user.png';

// Sub-modules
import PatientManagement from './PatientManagement';
import DoctorManagement from './DoctorManagement';
import ResearchManagement from './ResearchManagement';
import DoctorPatientMapping from './DoctorPatientMapping';
import SystemAnalytics from './SystemAnalytics';
import AdminQueries from './AdminQueries';
import AdminProfile from './AdminProfile';
import DatasetManagement from './DatasetManagement';
import ResearchPapers from './ResearchPapers';


import '../../../styles/adminDashboard.css';
import '../../../styles/cards.css';

const AdminHome = () => (
  <div className="admin-dashboard-container">
    <div className="admin-dashboard-header">
      <Link to="/login" className="admin-logout-btn">Logout</Link>
      <h1 className="admin-dashboard-title">Welcome, Admin</h1>
      <p className="admin-dashboard-subtitle">Platform Governance and System-Wide Analytics Hub</p>
    </div>

    <div className="admin-dashboard-grid">
      
      {/* Module 1: Patient Management */}
      <Link to="patients" className="card admin-module-card">
        <div className="admin-icon-container admin-theme-patients">
          <img src={iconShield} alt="Patient Management" />
        </div>
        <h3 className="admin-module-title">Patient Management</h3>
        <p className="admin-module-desc">Approve, reject, update, or delete pending patient accounts.</p>
        <div className="module-tag tag-blue">Governance</div>
        
      </Link>

      {/* Module 2: Doctor Management */}
      <Link to="doctors" className="card admin-module-card">
        <div className="admin-icon-container admin-theme-doctors">
          <img src={iconShield} alt="Doctor Management" />
        </div>
        <h3 className="admin-module-title">Doctor Management</h3>
        <p className="admin-module-desc">Verify credentials, approve, reject, or update doctor profiles.</p>
        <div className="module-tag tag-green">Governance</div>
        
      </Link>

      {/* Module 3: Researcher Management */}
      <Link to="researchers" className="card admin-module-card">
        <div className="admin-icon-container admin-theme-researchers">
          <img src={iconNetwork} alt="Researcher Management" />
        </div>
        <h3 className="admin-module-title">Researcher Management</h3>
        <p className="admin-module-desc">Manage university and institutional data access approvals.</p>
        <div className="module-tag tag-cyan">Access Control</div>
      </Link>

      {/* Module 4: Doctor-Patient Mapping */}
      <Link to="mapping" className="card admin-module-card admin-card-mapping">
        <div className="admin-icon-container admin-theme-mapping">
          <img src={iconNetwork} alt="Doctor-Patient Mapping" />
        </div>
        <h3 className="admin-module-title">Doctor-Patient Mapping</h3>
        <p className="admin-module-desc">Assign registered patients to specialized doctors (e.g., P1 → Doctor D1).</p>
        <div className="module-tag tag-purple">System Logic</div>
      </Link>

      {/* Module 5: System Analytics */}
      <Link to="analytics" className="card admin-module-card">
        <div className="admin-icon-container admin-theme-analytics">
          <img src={iconAnalytics} alt="System & User Analytics" />
        </div>
        <h3 className="admin-module-title">System & User Analytics</h3>
        <p className="admin-module-desc">View detection statistics, screening metrics, and global user counts.</p>
        <div className="module-tag tag-indigo">Analytics</div>
      </Link>

      {/* Module 6: Admin Queries */}
      <Link to="support" className="card admin-module-card">
        <div className="admin-icon-container admin-theme-queries">
          <img src={iconChat} alt="Support Queries" />
        </div>
        <h3 className="admin-module-title">Support Queries</h3>
        <p className="admin-module-desc">Respond to platform questions from both Doctors and Researchers.</p>
        <div className="module-tag tag-amber">Support</div>
      </Link>
      

      {/* Module 8: Dataset Management */}
      <Link to="datasets" className="card admin-module-card">
        <div className="admin-icon-container admin-theme-datasets" style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)' }}>
          <img src={iconAnalytics} alt="Dataset Management" />
        </div>
        <h3 className="admin-module-title">Dataset Management</h3>
        <p className="admin-module-desc">Upload, update, and manage medical datasets for researchers.</p>
        <div className="module-tag tag-red">Data Assets</div>
      </Link>

      {/* Module 9: Research Papers */}
      <Link to="papers" className="card admin-module-card">
        <div className="admin-icon-container" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
          <img src={iconNetwork} alt="Research Papers" />
        </div>
        <h3 className="admin-module-title">Research Papers</h3>
        <p className="admin-module-desc">Review, approve, and publish scientific literature uploaded by researchers.</p>
        <div className="module-tag tag-blue">Papers</div>
      </Link>

      {/* Module 7: Admin Profile */}
      <Link to="profile" className="card admin-module-card">
        <div className="admin-icon-container admin-theme-profile">
          <img src={iconUser} alt="Admin Preferences" />
        </div>
        <h3 className="admin-module-title">Admin Preferences</h3>
        <p className="admin-module-desc">Manage your root account credentials safely.</p>
        <div className="module-tag tag-slate">Account</div>
      </Link>
    </div>
  </div>
);

const AdminDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminHome />} />
      <Route path="/patients" element={<PatientManagement />} />
      <Route path="/doctors" element={<DoctorManagement />} />
      <Route path="/researchers" element={<ResearchManagement />} />
      <Route path="/mapping" element={<DoctorPatientMapping />} />
      <Route path="/analytics" element={<SystemAnalytics />} />
      <Route path="/support" element={<AdminQueries />} />
      <Route path="/profile" element={<AdminProfile />} />
      <Route path="/datasets" element={<DatasetManagement />} />
      <Route path="/papers" element={<ResearchPapers />} />
    </Routes>
  );
};

export default AdminDashboard;
