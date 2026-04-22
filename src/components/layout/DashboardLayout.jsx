import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Menu, X, Activity } from 'lucide-react';
import '../../styles/dashboardLayout.css';
import '../../styles/buttons.css';
import AIChatbot from '../../pages/shared/AIChatbot';

const DashboardLayout = ({ role }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Implement logout logic here
    navigate('/login');
  };

  const getRoleTitle = () => {
    switch(role) {
      case 'patient': return 'Patient Portal';
      case 'doctor': return 'Doctor Portal';
      case 'admin': return 'Admin Portal';
      case 'researcher': return 'Researcher Portal';
      default: return 'Portal';
    }
  };

  const getRoleColor = () => {
    switch(role) {
      case 'admin': return 'var(--primary)';
      case 'doctor': return 'var(--secondary)';
      case 'researcher': return 'var(--accent)';
      default: return '#3B82F6'; // Default blue for patient
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Top Navigation Bar - Sticky */}
      <header className="dashboard-topbar">
        <div className="container dashboard-topbar-content">
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to={`/${role}`} className="dashboard-brand">
              <Activity color={getRoleColor()} size={28} />
              <div className="dashboard-brand-text">
                <span className="dashboard-brand-title">Autism & ADHD</span>
                <span className="dashboard-brand-subtitle">{getRoleTitle()}</span>
              </div>
            </Link>
          </div>

          {/* Desktop Right Nav */}
          <div className="dashboard-desktop-nav">
            <Link to={`/${role}`} className="nav-link">Modules</Link>
            <div className="dashboard-nav-divider"></div>
            <div className="dashboard-profile">
              <div className="dashboard-avatar">
                <User size={18} color="var(--primary)" />
              </div>
              <span className="dashboard-profile-name">My Profile</span>
            </div>
            <button onClick={handleLogout} className="btn btn-logout desktop-logout-btn">
              <LogOut size={16} /> 
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="dashboard-mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>

        </div>
      </header>
      
      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="dashboard-mobile-menu">
           <Link to={`/${role}`} className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Dashboard Modules</Link>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
              <User size={20} /> <span style={{ fontWeight: 500 }}>My Profile</span>
           </div>
           <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', color: '#ef4444', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
              <LogOut size={20} /> Logout
           </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="dashboard-mainarea">
        <div className="container animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Simple Footer for Dashboard */}
      <footer className="dashboard-footer">
        <div className="container">
          &copy; {new Date().getFullYear()} Autism & ADHD - {getRoleTitle()}
        </div>
      </footer>

      {role !== 'admin' && <AIChatbot role={role} />}
    </div>
  );
};

export default DashboardLayout;
