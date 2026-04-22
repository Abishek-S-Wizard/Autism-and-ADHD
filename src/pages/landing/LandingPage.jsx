import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Activity, Users, FileText, ArrowRight, Brain, UserCheck, Stethoscope, AreaChart } from 'lucide-react';
import patientIllustration from '../../assets/illustrations/patient.png';
import doctorIllustration from '../../assets/illustrations/doctor.png';
import researcherIllustration from '../../assets/illustrations/researcher.png';
import adminIllustration from '../../assets/illustrations/admin.png';
import '../../styles/landing.css';
import '../../styles/buttons.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      
      {/* 1. HERO SECTION */}
      <section className="section-padding hero-section">
        <div className="container">
          <div className="hero-grid">
            
            {/* Left Content Column */}
            <div className="hero-content-left animate-fade-in">
              <div className="hero-accent-line"></div>
              
              <h1 className="hero-title text-text-primary">
                Autism & ADHD Screening and AI-<br />Assisted Detection System
              </h1>
              
              <div className="hero-subtitle text-text-secondary">
                <p style={{ marginBottom: '1.5rem' }}>
                  A web-based platform that integrates behavioral screening questionnaires and AI-based MRI analysis to support early identification of neurodevelopmental conditions.
                </p>
                <p>
                  The system assists caregivers and clinicians in identifying potential risk indicators and provides structured reports that support clinical decision making.
                </p>
              </div>
              
              <div className="hero-buttons">
                <Link to="/login" className="btn btn-primary hero-btn">
                  Login
                </Link>
                <Link to="/register/patient" className="btn btn-text hero-btn">
                  Start Screening
                </Link>
              </div>
            </div>

            {/* Right Image Column */}
            <div className="hero-image-right animate-fade-in animate-delay-200">
              <div className="hero-image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1559757175-5700dde675bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Doctor examining brain MRI scan on a digital display" 
                  className="hero-main-img"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. ABOUT SECTION */}
      <section id="about" className="section-padding about-section">
        <div className="container">
          <div className="about-grid">
            
            {/* Left Image Column */}
            <div className="about-image-column animate-fade-in">
              <div className="about-image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Medical evaluation room" 
                  className="about-main-img"
                />
              </div>
            </div>

            {/* Right Content Column */}
            <div className="about-content-column animate-fade-in animate-delay-200">
              <div className="about-label">About Us</div>
              <h2 className="about-title">Pioneering Early Detection in Child Healthcare</h2>
              <p className="about-desc">
                Autism & ADHD empowers caregivers and clinicians with cutting-edge artificial intelligence to analyze Autism using facial image analysis and ADHD using MRI brain scans.
              </p>
              
              <div className="about-feature-cards">
                <div className="about-feature-card">
                  <div className="about-feature-icon">
                    <Activity size={24} color="#0ea5e9" />
                  </div>
                  <div className="about-feature-text">
                    <div className="about-feature-title">Innovative Learning</div>
                    <div className="about-feature-desc">Behavioral screening tests using camera and speech, AI tools, and predictive models to build future-ready diagnostics.</div>
                  </div>
                </div>

                <div className="about-feature-card">
                  <div className="about-feature-icon">
                    <Users size={24} color="#0ea5e9" />
                  </div>
                  <div className="about-feature-text">
                    <div className="about-feature-title">Clinical Success</div>
                    <div className="about-feature-desc">Partnered with 50+ medical institutions, shaping the next-gen healthcare with guidance for top-tier clinical reporting.</div>
                  </div>
                </div>
              </div>

              <Link to="/login" className="btn-cyan about-btn">
                VIEW MORE <ArrowRight size={16} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 3. OBJECTIVES SECTION */}
      <section id="objectives" className="section-padding objectives-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Platform Objectives</h2>
            <p className="section-subtitle">Our comprehensive system is designed to provide end-to-end support for healthcare professionals and families.</p>
          </div>
          
          <div className="grid-cards">
            {[
              { title: 'Early Detection of Autism', icon: <UserCheck size={32} color="var(--primary)" />, color: 'var(--primary)' },
              { title: 'Early Detection of ADHD', icon: <Brain size={32} color="var(--secondary)" />, color: 'var(--secondary)' },
              { title: 'Behavioral Screening', icon: <Activity size={32} color="var(--accent)" />, color: 'var(--accent)' },
              { title: 'Doctor Assisted Evaluation', icon: <Stethoscope size={32} color="var(--primary)" />, color: 'var(--primary)' }
            ].map((obj, i) => (
              <div key={i} className="card objectives-card" style={{ borderTop: `4px solid ${obj.color}` }}>
                <div className="objectives-icon-bg" style={{ background: `${obj.color}15` }}>
                  {obj.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{obj.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>Utilizing state-of-the-art machine learning models to provide accurate, timely, and actionable insights.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ROLES SECTION */}
      <section id="roles" className="section-padding roles-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Who Is This For?</h2>
            <p className="section-subtitle">Dedicated interfaces and tools tailored for every stakeholder.</p>
          </div>
          
          <div className="roles-grid">
            {[
              { 
                role: 'Patient / Caregiver', 
                desc: 'Completes screening questionnaires, uploads MRI images, views AI-assisted results, and accesses reports.',
                img: patientIllustration 
              },
              { 
                role: 'Doctor / Clinician', 
                desc: 'Reviews patient screening data, AI prediction results, and supports clinical decision-making.',
                img: doctorIllustration
              },
              { 
                role: 'Researcher', 
                desc: 'Accesses anonymized screening and prediction data for research and analytical purposes.',
                img: researcherIllustration
              },
              { 
                role: 'Administrator', 
                desc: 'Manages users, system configurations, and overall platform operations.',
                img: adminIllustration
              }
            ].map((role, i) => (
              <div key={i} className="card roles-card animate-fade-in" style={{ animationDelay: `${(i + 1) * 0.1}s` }}>
                <div className="roles-icon-wrapper">
                  <div className="roles-icon-bg">
                    <img src={role.img} alt={role.role} className="roles-illustration" />
                  </div>
                </div>
                <h3 className="roles-card-title">{role.role}</h3>
                <p className="roles-card-desc">{role.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="section-padding how-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle" style={{ color: '#94a3b8' }}>The seamless journey from registration to diagnosis.</p>
          </div>
          
          <div className="how-steps">
            {[
              { step: '1', title: 'Register & Approve', desc: 'User registers and admin approves account.' },
              { step: '2', title: 'Upload Scans', desc: 'Patient uploads face image or MRI.' },
              { step: '3', title: 'AI Analysis', desc: 'AI models analyze images & screening data.' },
              { step: '4', title: 'Doctor Review', desc: 'Doctor verifies results & generates report.' }
            ].map((step, i) => (
              <div key={i} className="how-step">
                <div className="how-step-number">
                  {step.step}
                </div>
                <h4 className="how-step-title">{step.title}</h4>
                <p className="how-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
