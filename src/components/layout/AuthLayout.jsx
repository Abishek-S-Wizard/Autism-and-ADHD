import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Activity } from 'lucide-react';
import '../../styles/authLayout.css';

const AuthLayout = () => {
  const location = useLocation();
  const path = location.pathname;

  // Detect role from path
  const getRole = () => {
    if (path.includes('patient')) return 'patient';
    if (path.includes('doctor')) return 'doctor';
    if (path.includes('researcher')) return 'researcher';
    if (path.includes('admin')) return 'admin';
    return 'default';
  };

  const role = getRole();

  return (
    <div className={`auth-layout auth-theme-${role}`}>
      <header className="auth-header">
        <div className="container auth-header-content">
          <Link to="/" className="auth-brand">
            <Activity size={28} />
            <span>Autism & ADHD</span>
          </Link>
        </div>
      </header>
      <main className="auth-main">
        <div className="animate-fade-in auth-content">
          <Outlet />
        </div>
      </main>
      
      {/* Background Decorators */}
      <div className="auth-bg-glow-1"></div>
      <div className="auth-bg-glow-2"></div>
    </div>
  );
};

export default AuthLayout;
