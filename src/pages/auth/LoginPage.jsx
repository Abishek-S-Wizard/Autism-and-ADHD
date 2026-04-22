import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import patient from '../../assets/illustrations/patient.png';
import doctor from '../../assets/illustrations/doctor.png';
import researcher from '../../assets/illustrations/researcher.png';
import admin from '../../assets/illustrations/admin.png';
import '../../styles/login.css';

const LoginPage = () => {
  return (
    <div className="login-home-container">
      {/* Extra Feature: Back to Home */}
      <Link to="/" className="back-home-btn animate-fade-in">
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </Link>

      <div className="login-home-header">
        <h1 className="login-home-title animate-fade-in">Choose Your Login Type</h1>
        <p className="login-home-subtitle animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Select your role to continue to the secure login portal
        </p>
      </div>

      <div className="login-home-boxes">
        {[
          { title: 'Patient / Caregiver', path: '/login/patient', img: patient, alt: 'Patient / Caregiver Login' },
          { title: 'Doctor / Clinician', path: '/login/doctor', img: doctor, alt: 'Doctor Login' },
          { title: 'Researcher', path: '/login/researcher', img: researcher, alt: 'Researcher Login' },
          { title: 'Administrator', path: '/login/admin', img: admin, alt: 'Admin Login' }
        ].map((role, i) => (
          <Link 
            key={i} 
            to={role.path} 
            className="login-box animate-fade-in" 
            style={{ animationDelay: `${(i + 2) * 0.15}s` }}
          >
            <div className="login-box-img-wrapper">
              <img src={role.img} alt={role.alt} />
            </div>
            <h2>{role.title}</h2>
          </Link>
        ))}
      </div>

      {/* Decorative Elements (Extra Feature) */}
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>
    </div>
  );
};

export default LoginPage;
