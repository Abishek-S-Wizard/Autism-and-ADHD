import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

// Asset imports
import iconAutism from '../../../assets/dashboard-icons/icon_autism.png';
import iconADHD from '../../../assets/dashboard-icons/icon_adhd.png';
import iconScreening from '../../../assets/dashboard-icons/icon_screening.png';
import iconReport from '../../../assets/dashboard-icons/icon_report.png';
import iconChat from '../../../assets/dashboard-icons/icon_chat.png';
import iconChatbot from '../../../assets/dashboard-icons/icon_chatbot.png';
import iconUser from '../../../assets/dashboard-icons/icon_user.png';

// Sub-modules
import AutismDetectionDoctor from './AutismDetectionDoctor';
import ADHDDetectionDoctor from './ADHDDetectionDoctor';
import ViewPatientScreening from './ViewPatientScreening';
import GenerateReport from './GenerateReport';
import ViewPatientInfo from './ViewPatientInfo';
import ReplyToQueries from './ReplyToQueries';
import DoctorChatbot from './DoctorChatbot';
import DoctorProfile from './DoctorProfile';
import QueryAdmin from './QueryAdmin';

import '../../../styles/doctorDashboard.css';
import '../../../styles/cards.css';

const DashboardHome = () => {
  const [docName, setDocName] = useState('Doctor');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('doctors')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile) setDocName(profile.full_name);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login/doctor');
  };

  return (
    <div className="doctor-dashboard-container">
      <div className="doctor-dashboard-header">
        <button onClick={handleLogout} className="doctor-logout-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit' }}>Logout</button>
        <h1 className="doctor-dashboard-title">Welcome, {docName}</h1>
        <p className="doctor-dashboard-subtitle">Autism & ADHD Clinical Research and Patient Management Dashboard</p>
      </div>

      <div className="doctor-dashboard-grid">
      
      {/* Module 1: Autism Detection (Doctor) */}
      <Link to="autism-analysis" className="card doctor-module-card">
        <div className="doctor-icon-container doc-theme-autism">
          <img src={iconAutism} alt="Autism Analysis" />
        </div>
        <h3 className="doctor-module-title">Autism Analysis</h3>
        <p className="doctor-module-desc">Upload patient face image to get detailed detection, causes, and control methods.</p>
        <div className="module-tag tag-blue">Clinical Analysis</div>
      </Link>
      
      {/* Module 2: ADHD Detection */}
      <Link to="adhd-analysis" className="card doctor-module-card">
        <div className="doctor-icon-container doc-theme-adhd">
          <img src={iconADHD} alt="ADHD Analysis" />
        </div>
        <h3 className="doctor-module-title">ADHD MRI Scan Analysis</h3>
        <p className="doctor-module-desc">Diagnostic analysis of patient MRI scans, detecting condition, severity, and treatment methods.</p>
        <div className="module-tag tag-green">Clinical Analysis</div>
      </Link>

      {/* View Patient Screening */}
      <Link to="screening-results" className="card doctor-module-card">
        <div className="doctor-icon-container doc-theme-screening">
          <img src={iconScreening} alt="Patient Screening" />
        </div>
        <h3 className="doctor-module-title">View Patient Screening</h3>
        <p className="doctor-module-desc">Review camera behavior, speech recordings, and questionnaire results.</p>
        <div className="module-tag tag-purple">Screening</div>
      </Link>

      {/* Generate Report */}
      <Link to="generate-report" className="card doctor-module-card">
        <div className="doctor-icon-container doc-theme-report">
          <img src={iconReport} alt="Generate Report" />
        </div>
        <h3 className="doctor-module-title">Generate Patient Report</h3>
        <p className="doctor-module-desc">Compile diagnostic outputs into formal medical reports and send to patients.</p>
        <div className="module-tag tag-pink">Documentation</div>
      </Link>

      {/* Manage Patients */}
      <Link to="manage-patients" className="card doctor-module-card">
        <div className="doctor-icon-container doc-theme-patients">
          <img src={iconUser} alt="Patients" />
        </div>
        <h3 className="doctor-module-title">View Patient Info</h3>
        <p className="doctor-module-desc">Manage your assigned patients and access their historical records.</p>
        <div className="module-tag tag-cyan">Core Data</div>
      </Link>

      {/* Reply to Queries */}
      <Link to="queries" className="card doctor-module-card">
        <div className="doctor-icon-container doc-theme-queries">
          <img src={iconChat} alt="Patient Queries" />
        </div>
        <h3 className="doctor-module-title">Reply to Patient Queries</h3>
        <p className="doctor-module-desc">Answer direct questions sent by your assigned patients.</p>
        <div className="module-tag tag-amber">Consultation</div>
      </Link>

      {/* Doctor Chatbot */}
      <Link to="chatbot" className="card doctor-module-card">
        <div className="doctor-icon-container doc-theme-chatbot">
          <img src={iconChatbot} alt="Clinical Chatbot" />
        </div>
        <h3 className="doctor-module-title">Clinical Chatbot</h3>
        <p className="doctor-module-desc">Interact with the medical AI assistant for system or diagnostic help.</p>
        <div className="module-tag tag-indigo">AI Support</div>
      </Link>

      {/* Query Administrator */}
      <Link to="query-admin" className="card doctor-module-card">
        <div className="doctor-icon-container doc-theme-queries">
          <img src={iconChat} alt="Query Admin" />
        </div>
        <h3 className="doctor-module-title">Query Administrator</h3>
        <p className="doctor-module-desc">Submit technical or administrative requests directly to the system admin.</p>
        <div className="module-tag tag-rose">Support</div>
      </Link>

      {/* Profile Management */}
      <Link to="profile" className="card doctor-module-card">
        <div className="doctor-icon-container doc-theme-profile">
          <img src={iconUser} alt="Profile" />
        </div>
        <h3 className="doctor-module-title">Profile Management</h3>
        <p className="doctor-module-desc">Update your professional details and availability.</p>
        <div className="module-tag tag-slate">Account</div>
      </Link>
      </div>
    </div>
  );
};

const DoctorDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardHome />} />
      <Route path="/autism-analysis" element={<AutismDetectionDoctor />} />
      <Route path="/adhd-analysis" element={<ADHDDetectionDoctor />} />
      <Route path="/screening-results/:patientId?" element={<ViewPatientScreening />} />
      <Route path="/generate-report" element={<GenerateReport />} />
      <Route path="/manage-patients" element={<ViewPatientInfo />} />
      <Route path="/queries" element={<ReplyToQueries />} />
      <Route path="/chatbot" element={<DoctorChatbot />} />
      <Route path="/profile" element={<DoctorProfile />} />
      <Route path="/query-admin" element={<QueryAdmin />} />
    </Routes>
  );
};

export default DoctorDashboard;
