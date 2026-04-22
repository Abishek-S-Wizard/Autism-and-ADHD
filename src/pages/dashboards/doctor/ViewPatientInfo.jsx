import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Search, Loader2, X, Phone, MapPin, Activity, Droplet, AlertCircle, FileText, Pill, Moon } from 'lucide-react';
import '../../../styles/doctorModule.css';
import '../../../styles/viewPatientInfo.css';
import '../../../styles/cards.css';
import '../../../styles/buttons.css';

import { supabase } from '../../../lib/supabase';

const ViewPatientInfo = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const fetchAssignedPatients = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        // Fetch mappings with detailed patient info
        const { data: mappingData, error: mappingError } = await supabase
          .from('doctor_patient_mappings')
          .select(`
            *,
            patients (
              *,
              patient_details (*)
            )
          `)
          .eq('doctor_id', user.id);

        if (mappingError) throw mappingError;

        console.log("DEBUG: Raw mapping data in ViewPatientInfo:", mappingData);

        // Flatten the data safely
        const flattenedPatients = (mappingData || [])
          .map(m => m.patients)
          .filter(p => p !== null && p !== undefined);

        setPatients(flattenedPatients);

      } catch (err) {
        console.error('Error fetching patients:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedPatients();
  }, []);

  const handleViewProfile = (patient) => {
    setSelectedPatient(patient);
    setShowProfileModal(true);
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const filtered = patients.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.includes(searchTerm)
  );

  return (
    <div className="doctor-container animate-fade-in">
      <Link to="/doctor" className="doctor-back-link">
        <ArrowLeft size={18} /> Back to Doctor Portal
      </Link>
      
      <div className="doctor-header" style={{ marginBottom: '2rem' }}>
        <h1 className="doctor-title">Manage Patients</h1>
        <p className="doctor-subtitle">
          Clinical status and assigned data for your patients.
        </p>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444' }}>
          <p style={{ color: '#ef4444', margin: 0 }}>Error: {error}</p>
        </div>
      )}

      <div className="card" style={{ marginBottom: '2rem', padding: '1rem' }}>
        <div className="module-search-wrapper" style={{ margin: 0, width: '100%', maxWidth: 'none' }}>
          <Search size={18} className="module-search-icon" />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            className="input-field module-search-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
          <Loader2 className="animate-spin" size={48} color="var(--primary)" />
        </div>
      ) : (
        <div className="patient-cards-grid">
          {filtered.map(patient => (
            <div key={patient.id} className="card patient-info-card">
              <div className="patient-card-header">
                 <div className="patient-card-title-group">
                   <div className="patient-avatar">
                     {patient.full_name?.[0] || 'P'}
                   </div>
                   <div>
                     <h3 className="patient-name-title">{patient.full_name}</h3>
                     <span className="patient-id-badge">ID: {patient.id.substring(0, 8)}</span>
                   </div>
                 </div>
              </div>

              <div className="patient-meta-grid">
                <div className="patient-meta-item">
                  <span className="patient-meta-label">Patient Name</span>
                  <span className="patient-meta-value">{patient.patient_name}</span>
                </div>
                <div className="patient-meta-item">
                  <span className="patient-meta-label">Age / Gender</span>
                  <span className="patient-meta-value">{calculateAge(patient.dob)} / {patient.gender}</span>
                </div>
                <div className="patient-meta-item">
                  <span className="patient-meta-label">Guardian</span>
                  <span className="patient-meta-value">{patient.guardian_name}</span>
                </div>
                <div className="patient-meta-item">
                  <span className="patient-meta-label">Joined On</span>
                  <span className="patient-meta-value">{new Date(patient.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="patient-card-actions">
                <Link to={`/doctor/screening-results/${patient.id}`} className="btn btn-outline">View Screenings</Link>
                <button className="btn btn-primary" onClick={() => handleViewProfile(patient)}>Medical Profile</button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="empty-search-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: 'var(--card-bg)', borderRadius: '12px' }}>
              <User size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
              <p>No assigned patients found matching your search.</p>
            </div>
          )}
        </div>
      )}

      {/* Profile Detail Modal */}
      {showProfileModal && selectedPatient && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-container animate-scale-up">
            <div className="modal-header">
              <h2 className="modal-title">Patient Profile</h2>
              <button className="modal-close-btn" onClick={() => setShowProfileModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-content">
              {/* Basic Info Section */}
              <div className="profile-detail-section">
                <h3 className="profile-section-title"><User size={18} /> Basic Information</h3>
                <div className="profile-detail-grid">
                  <div className="detail-item">
                    <label>Full Name</label>
                    <span>{selectedPatient.full_name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Patient Name</label>
                    <span>{selectedPatient.patient_name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Date of Birth</label>
                    <span>{selectedPatient.dob}</span>
                  </div>
                  <div className="detail-item">
                    <label>Age</label>
                    <span>{calculateAge(selectedPatient.dob)} Years</span>
                  </div>
                  <div className="detail-item">
                    <label>Gender</label>
                    <span>{selectedPatient.gender}</span>
                  </div>
                  <div className="detail-item">
                    <label>Guardian</label>
                    <span>{selectedPatient.guardian_name} ({selectedPatient.relationship})</span>
                  </div>
                </div>
              </div>

              {/* Extended Info Section */}
              {(() => {
                const details = Array.isArray(selectedPatient.patient_details) 
                  ? selectedPatient.patient_details[0] 
                  : selectedPatient.patient_details;
                
                if (!details) {
                  return (
                    <div className="no-details-alert">
                      <AlertCircle size={40} style={{ opacity: 0.2 }} />
                      <p>Patient has not yet submitted their detailed health profile.</p>
                    </div>
                  );
                }

                return (
                  <>
                    <div className="profile-detail-section">
                      <h3 className="profile-section-title"><Phone size={18} /> Contact & Location</h3>
                      <div className="profile-detail-grid">
                        <div className="detail-item">
                          <label>Email Address</label>
                          <span>{selectedPatient.email}</span>
                        </div>
                        <div className="detail-item">
                          <label>Mobile Number</label>
                          <span>{details.mobile || 'Not available'}</span>
                        </div>
                        <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                          <label><MapPin size={14} /> Address</label>
                          <span>{details.address || 'Not specified'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="profile-detail-section">
                      <h3 className="profile-section-title"><Activity size={18} /> Medical History</h3>
                      <div className="profile-detail-grid">
                        <div className="detail-item">
                          <label><Droplet size={14} /> Blood Group</label>
                          <span className="badge-red">{details.blood_group || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label><AlertCircle size={14} /> Allergies</label>
                          <span>{details.allergies || 'None reported'}</span>
                        </div>
                        <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                          <label><FileText size={14} /> Existing Conditions</label>
                          <span>{details.existing_conditions || 'None reported'}</span>
                        </div>
                        <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                          <label><Pill size={14} /> Current Medications</label>
                          <span>{details.medications || 'None reported'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="profile-detail-section">
                      <h3 className="profile-section-title"><Moon size={18} /> Daily Observations</h3>
                      <div className="profile-detail-grid">
                        <div className="detail-item">
                          <label>Sleep Pattern</label>
                          <span className={details.sleep_pattern === 'Disturbed' ? 'status-high' : 'status-low'}>
                            {details.sleep_pattern}
                          </span>
                        </div>
                        <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                          <label>Behavior Notes</label>
                          <p className="behavior-notes-text">{details.behavior_notes || 'No recent notes.'}</p>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowProfileModal(false)}>Close View</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ViewPatientInfo;
