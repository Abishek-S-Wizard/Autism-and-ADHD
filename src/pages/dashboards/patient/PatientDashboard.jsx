import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

// Asset imports
import iconAutism from '../../../assets/dashboard-icons/icon_autism.png';
import iconADHD from '../../../assets/dashboard-icons/icon_adhd.png';
import iconScreening from '../../../assets/dashboard-icons/icon_screening.png';
import iconReport from '../../../assets/dashboard-icons/icon_report.png';
import iconChat from '../../../assets/dashboard-icons/icon_chat.png';
import iconInfo from '../../../assets/dashboard-icons/icon_info.png';
import iconChatbot from '../../../assets/dashboard-icons/icon_chatbot.png';
import iconUser from '../../../assets/dashboard-icons/icon_user.png';

// Sub-modules
import AutismDetection from './AutismDetection';
import ADHDDetection from './ADHDDetection';
import ScreeningTest from './ScreeningTest';
import ViewDoctorReports from './ViewDoctorReports';
import QueryDoctor from './QueryDoctor';
import DoctorInfo from './DoctorInfo';
import PatientChatbot from './PatientChatbot';
import PatientProfile from './PatientProfile';
import PatientInfoForm from './PatientInfoForm';

import '../../../styles/patientDashboard.css';
import '../../../styles/cards.css';

const DashboardHome = () => {
  const [userName, setUserName] = useState('Patient');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('patients')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile) setUserName(profile.full_name);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login/patient');
  };

  return (
    <div className="patient-dashboard-container">
      <div className="patient-dashboard-header">
        <button onClick={handleLogout} className="patient-logout-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit' }}>Logout</button>
        <h1 className="patient-dashboard-title">Welcome, {userName}</h1>
        <p className="patient-dashboard-subtitle">Autism & ADHD AI Research and Analytics Dashboard</p>
      </div>

      <div className="patient-dashboard-grid">
      
      {/* Module 1: Autism Detection */}
      <Link to="autism-detection" className="card patient-module-card">
        <div className="patient-icon-container pat-theme-autism">
          <img src={iconAutism} alt="Autism Detection" />
        </div>
        <h3 className="patient-module-title">Autism Face Image Detection</h3>
        <p className="patient-module-desc">Upload a facial image for AI predicting Autism & Severity Level.</p>
        <div className="module-tag tag-blue">Autism Analysis</div>
      </Link>
      
      {/* Module 2: ADHD Detection */}
      <Link to="adhd-detection" className="card patient-module-card">
        <div className="patient-icon-container pat-theme-adhd">
          <img src={iconADHD} alt="ADHD Detection" />
        </div>
        <h3 className="patient-module-title">ADHD MRI Detection</h3>
        <p className="patient-module-desc">Upload an MRI brain image for AI predicting ADHD status & Severity Level.</p>
        <div className="module-tag tag-green">ADHD Analysis</div>
      </Link>

      {/* Module 3: Screening Test */}
      <Link to="screening" className="card patient-module-card">
        <div className="patient-icon-container pat-theme-screening">
          <img src={iconScreening} alt="Screening Test" />
        </div>
        <h3 className="patient-module-title">Screening Test Module</h3>
        <p className="patient-module-desc">Camera behavior test, speech recording, and questionnaire.</p>
        <div className="module-tag tag-purple">Screening</div>
      </Link>

      {/* View Doctor Reports */}
      <Link to="reports" className="card patient-module-card">
        <div className="patient-icon-container pat-theme-reports">
          <img src={iconReport} alt="Doctor Reports" />
        </div>
        <h3 className="patient-module-title">View Doctor Reports</h3>
        <p className="patient-module-desc">Access and download reports sent by your assigned doctor.</p>
        <div className="module-tag tag-pink">Reports</div>
      </Link>

      {/* Query Doctor */}
      <Link to="query-doctor" className="card patient-module-card">
        <div className="patient-icon-container pat-theme-query">
          <img src={iconChat} alt="Query Doctor" />
        </div>
        <h3 className="patient-module-title">Query Doctor</h3>
        <p className="patient-module-desc">Send questions and messages to your assigned doctor.</p>
        <div className="module-tag tag-amber">Consultation</div>
      </Link>

      {/* Doctor Info */}
      <Link to="doctor-info" className="card patient-module-card">
        <div className="patient-icon-container pat-theme-info">
          <img src={iconInfo} alt="Doctor Info" />
        </div>
        <h3 className="patient-module-title">Doctor Info</h3>
        <p className="patient-module-desc">Shows assigned medical professional details and availability.</p>
        <div className="module-tag tag-cyan">Information</div>
      </Link>

      {/* Chatbot */}
      <Link to="chatbot" className="card patient-module-card">
        <div className="patient-icon-container pat-theme-chatbot">
          <img src={iconChatbot} alt="Chatbot" />
        </div>
        <h3 className="patient-module-title">Chatbot</h3>
        <p className="patient-module-desc">Patient support AI assistant for fast answers.</p>
        <div className="module-tag tag-indigo">AI Support</div>
      </Link>

      {/* Patient Information Module */}
      <Link to="patient-info" className="card patient-module-card">
        <div className="patient-icon-container pat-theme-info" style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)' }}>
          <Activity size={24} color="white" />
        </div>
        <h3 className="patient-module-title">Patient Information</h3>
        <p className="patient-module-desc">Fill in medical history, allergies, medications, and daily observations.</p>
        <div className="module-tag tag-red" style={{ background: 'rgba(255, 107, 107, 0.1)', color: '#FF6B6B' }}>Medical Profile</div>
      </Link>

      {/* Profile Management */}
      <Link to="profile" className="card patient-module-card">
        <div className="patient-icon-container pat-theme-profile">
          <img src={iconUser} alt="Profile" />
        </div>
        <h3 className="patient-module-title">Profile Management</h3>
        <p className="patient-module-desc">Update your personal and caregiver contact information.</p>
        <div className="module-tag tag-slate">Account</div>
      </Link>
      
      </div>
    </div>
  );
};

const PatientDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardHome />} />
      <Route path="/autism-detection" element={<AutismDetection />} />
      <Route path="/adhd-detection" element={<ADHDDetection />} />
      <Route path="/screening" element={<ScreeningTest />} />
      <Route path="/reports" element={<ViewDoctorReports />} />
      <Route path="/query-doctor" element={<QueryDoctor />} />
      <Route path="/doctor-info" element={<DoctorInfo />} />
      <Route path="/chatbot" element={<PatientChatbot />} />
      <Route path="/profile" element={<PatientProfile />} />
      <Route path="/patient-info" element={<PatientInfoForm />} />
    </Routes>
  );
};

export default PatientDashboard;
