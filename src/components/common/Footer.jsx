import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Mail, Phone, MapPin } from 'lucide-react';
import "../../styles/footer.css";

const Footer = () => {
  return (
    <footer className="footer" style={{ background: 'var(--text-primary)' }}>
      <div className="container">
        <div className="footer-grid">
          
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Activity color="var(--accent)" size={32} />
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white' }}>Autism & ADHD</span>
            </div>
            <p style={{ maxWidth: '400px' }}>
              An intelligent healthcare system that analyzes face images, MRI scans, behavioral screening, and speech patterns to assist doctors and caregivers.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h4 className="footer-col-title" style={{ color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>QUICK LINKS</h4>
            <div className="footer-links" style={{ alignItems: 'flex-start' }}>
              <Link to="/" className="footer-link-blue">Home</Link>
              <a href="/#about" className="footer-link-blue">About Platform</a>
              <a href="/#roles" className="footer-link-blue">User Roles</a>
              <Link to="/login" className="footer-link-blue">Login Portal</Link>
            </div>
          </div>



        </div>
        
        <div className="footer-bottom">
          <p style={{ marginTop: '0.5rem' }}>© 2026 A Deep Learning-Driven Intelligent Framework for Automated Prediction and Detection of Autism and ADHD.</p>
          <p style={{ marginTop: '0.5rem' }}>Final Year Project | Department of Computer Science</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
