import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, MapPin, Award, Clock, Loader2 } from 'lucide-react';
import '../../../styles/doctorInfo.css';

import { supabase } from '../../../lib/supabase';

const DoctorInfo = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignedDoctor = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error("Please log in to view doctor info.");

        // Fetch mapping for this patient
        const { data: mapping, error: mappingError } = await supabase
          .from('doctor_patient_mappings')
          .select('doctor_id')
          .eq('patient_id', user.id)
          .maybeSingle();

        if (mappingError) throw mappingError;

        if (!mapping) {
          setDoctor(null);
          return;
        }

        // Fetch doctor details
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('*')
          .eq('id', mapping.doctor_id)
          .single();

        if (doctorError) throw doctorError;
        setDoctor(doctorData);

      } catch (err) {
        console.error('Error fetching doctor info:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedDoctor();
  }, []);

  if (loading) {
    return (
      <div className="doctor-info-container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctor-info-container animate-fade-in">
        <Link to="/patient" className="doctor-info-back-button">
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>
        <div className="card" style={{ padding: '2rem', textAlign: 'center', borderLeft: '4px solid #ef4444' }}>
          <p style={{ color: '#ef4444' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="doctor-info-container animate-fade-in">
        <Link to="/patient" className="doctor-info-back-button">
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>
        <div className="doctor-info-header">
          <h1 className="doctor-info-title">Doctor Information</h1>
          <p className="doctor-info-subtitle">No clinical specialist has been assigned to your account yet.</p>
        </div>
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <User size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <h3>Assignment Pending</h3>
          <p>Please wait for the administrator to link your profile to a clinical specialist for review.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-info-container animate-fade-in">
      <Link to="/patient" className="doctor-info-back-button">
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>
      
      <div className="doctor-info-header">
        <h1 className="doctor-info-title">Doctor Information</h1>
        <p className="doctor-info-subtitle">
          Connect with your assigned clinical specialist. View credentials, contact details, and professional availability.
        </p>
      </div>

      <div className="doctor-card">
        <div className="doctor-profile-section">
          <div className="doctor-avatar-box">
            {doctor.full_name?.split(' ').map(n => n[0]).join('') || 'DR'}
          </div>
          <div>
            <h2 className="doctor-name-headline">{doctor.full_name}</h2>
            <div className="doctor-subtext">{doctor.specialization}</div>
            <div className="doctor-badges">
              <span className="doctor-badge"><Award size={14} /> {doctor.experience} Years Experience</span>
            </div>
          </div>
        </div>

        <div className="doctor-info-grid">
          <div className="info-block">
            <span className="info-label">Hospital / Clinic</span>
            <div className="info-value">
              <MapPin size={18} color="#10b981" /> {doctor.hospital}, {doctor.city}
            </div>
          </div>
          
          <div className="info-block">
            <span className="info-label">Professional Email</span>
            <div className="info-value">
              <Mail size={18} color="#10b981" /> {doctor.email}
            </div>
          </div>

          <div className="info-block" style={{ gridColumn: '1 / -1' }}>
            <span className="info-label">Qualifications & Credentials</span>
            <div className="info-value">
              <Award size={18} color="#10b981" /> {doctor.qualification}
            </div>
          </div>
          
          <div className="info-block">
            <span className="info-label">Medical Reg No.</span>
            <div className="info-value">
              <span className="font-mono">{doctor.reg_number}</span>
            </div>
          </div>
        </div>

        <div className="doctor-btn-group">
           <Link to="/patient/query-doctor" className="btn-message">
             Send a Message
           </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorInfo;
