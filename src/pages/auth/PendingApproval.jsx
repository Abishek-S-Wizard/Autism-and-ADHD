import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import '../../styles/pendingApproval.css';
import '../../styles/authForms.css';
import '../../styles/buttons.css';

const PendingApproval = () => {
  const location = useLocation();
  const role = location.state?.role || 'Account';

  return (
    <div className="auth-form-card" style={{ textAlign: 'center' }}>
      <Link to="/" className="auth-back-link">
        <ArrowLeft size={18} /> Back to Home
      </Link>

      <div className="pending-pulse-container">
        <div className="animate-pulse pending-pulse-ring"></div>
        <div className="pending-icon-center">
          <Clock size={44} />
        </div>
      </div>
      
      <h2 className="auth-form-title">Application Submitted!</h2>
      
      <div className="pending-info-box">
        <p className="auth-form-subtitle" style={{ fontSize: '1.2rem', fontWeight: '600', color: 'white' }}>
          Your {role} registration is pending admin approval.
        </p>
        <p className="pending-desc" style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
          For security reasons, all accounts must be verified by a system administrator before access is granted. You will receive an email notification once your account is activated.
        </p>
      </div>

      <ul className="pending-checklist" style={{ listStyle: 'none', padding: 0, margin: '2rem 0', textAlign: 'left', display: 'inline-block' }}>
        <li className="pending-checklist-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: '#43e97b' }}>
          <CheckCircle size={20} /> Form deeply validated
        </li>
        <li className="pending-checklist-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: '#43e97b' }}>
          <CheckCircle size={20} /> Details submitted securely
        </li>
        <li className="pending-checklist-item waiting" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fbbf24' }}>
          <Clock size={20} className="animate-pulse" /> Awaiting administrator review...
        </li>
      </ul>

      <Link to="/" className="btn-full btn-auth-patient" style={{ marginTop: '1rem' }}>
        Return to Home <CheckCircle size={20} />
      </Link>
    </div>
  );
};

export default PendingApproval;
