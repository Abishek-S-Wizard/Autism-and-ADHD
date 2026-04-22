import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Activity, User, 
  Info, Search, CheckCircle, AlertTriangle,
  Mic, ClipboardList
} from 'lucide-react';
import '../../../styles/viewPatientScreening.css';
import { supabase } from '../../../lib/supabase';

const ViewPatientScreening = () => {
  const { patientId } = useParams();
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(patientId || '');
  const [screeningResults, setScreeningResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctorId, setDoctorId] = useState(null);

  const medicalGuidance = {
    autism: {
      description: "Autism Spectrum Disorder (ASD) is a developmental disability caused by differences in the brain. People with ASD often have problems with social communication and interaction, and restricted or repetitive behaviors or interests.",
      therapies: ["Applied Behavior Analysis (ABA)", "Speech and Language Therapy", "Occupational Therapy", "Social Skills Training"],
      actions: ["Structured educational programs", "Genetic consultation", "Neurological monitoring"]
    },
    adhd: {
      description: "ADHD is one of the most common neurodevelopmental disorders of childhood. It is usually first diagnosed in childhood and often lasts into adulthood. Children with ADHD may have trouble paying attention, controlling impulsive behaviors, or be overly active.",
      therapies: ["Behavior Therapy", "Cognitive Behavioral Therapy (CBT)", "Sensory Integration", "Parental Training"],
      actions: ["Clinical psychiatric evaluation", "Individualized Education Program (IEP)", "Lifestyle and nutrition monitoring"]
    }
  };

  useEffect(() => {
    const fetchSessionAndPatients = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setDoctorId(user.id);
          
          // Fetch patients assigned to this doctor
          const { data: mappingData, error: mappingError } = await supabase
            .from('doctor_patient_mappings')
            .select('*, patients(*)')
            .eq('doctor_id', user.id);

          if (mappingError) throw mappingError;

          const flattenedPatients = (mappingData || [])
            .map(m => m.patients)
            .filter(p => p !== null);

          setPatients(flattenedPatients);
        }
      } catch (err) {
        console.error("Failed to load clinical registry", err);
      }
    };
    fetchSessionAndPatients();
  }, []);

  useEffect(() => {
    if (patientId) {
      setSelectedPatientId(patientId);
    }
  }, [patientId]);

  useEffect(() => {
    if (selectedPatientId) fetchPatientData();
  }, [selectedPatientId]);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('screening_results')
        .select('*')
        .eq('patient_id', selectedPatientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScreeningResults(data || []);
    } catch (e) {
      console.error("Error fetching screening results:", e);
    } finally {
      setLoading(false);
    }
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <div className="doctor-screening-dashboard animate-fade-in">
      
      <div className="dashboard-header-container">
        <div className="dashboard-title">
          <Link to="/doctor" className="doctor-back-link" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6366f1', textDecoration: 'none', fontWeight: '600' }}>
            <ArrowLeft size={18} /> Exit Clinical View
          </Link>
          <h1>Clinical Diagnostics Terminal</h1>
          <p>Multi-modal AI analysis for Autism & ADHD detection</p>
        </div>
        <div className="status-indicator">
          <span className="severity-badge severity-low">System Operational</span>
        </div>
      </div>

      <div className="clinical-grid">
        
        {/* SIDEBAR: PATIENT SELECTION */}
        <aside className="patient-list-sidebar">
          <h3 className="sidebar-title"><Search size={20} /> Patient Registry</h3>
          
          <label style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>SELECT APPROVED PATIENT</label>
          <select 
            className="patient-selector" 
            value={selectedPatientId} 
            onChange={(e) => setSelectedPatientId(e.target.value)}
          >
            <option value="">-- Search Registry --</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.patient_name || p.full_name}</option>
            ))}
          </select>

          {selectedPatient && (
            <div className="patient-mini-profile" style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="#64748b" />
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>{selectedPatient.patient_name}</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>ID: {selectedPatientId.slice(0,8)}...</p>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', margin: '0.25rem 0' }}><strong>Email:</strong> {selectedPatient.email}</p>
              <p style={{ fontSize: '0.8rem', margin: '0.25rem 0' }}><strong>Approved:</strong> <CheckCircle size={12} color="#10b981" /></p>
            </div>
          )}
        </aside>

        {/* MAIN: CLINICAL DATA */}
        <main className="clinical-results-area">
          
          {!selectedPatientId ? (
            <div className="result-section-card empty-state">
              <Activity size={64} color="#e2e8f0" style={{ margin: '0 auto' }} />
              <h3>Awaiting Clinical Selection</h3>
              <p>Please select a patient from the registry to view multimodal screening results and AI detection data.</p>
            </div>
          ) : loading ? (
            <div className="result-section-card text-center">
              <div className="loader" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #6366f1', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
              <p style={{ marginTop: '1rem' }}>Synchronizing medical records...</p>
            </div>
          ) : (
            <div className="animate-fade-in">
              
              {/* SECTION: BEHAVIORAL AI SCREENING ONLY */}
              <section className="result-section-card">
                <h2 className="section-title"><Activity size={22} color="#6366f1" /> Behavioral AI Screening</h2>
                
                {screeningResults.length === 0 ? (
                  <p style={{ color: '#64748b', fontStyle: 'italic' }}>No behavioral screening records found for this patient.</p>
                ) : screeningResults.map((res, i) => (
                  <div key={res.id || i} className="screening-record-wrapper">
                    <div className="record-header">
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Clinical Encounter</span>
                        <h4 style={{ margin: 0 }}>
                          {new Date(res.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })} 
                          <span style={{ marginLeft: '0.5rem', color: '#6366f1' }}>
                            {new Date(res.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </h4>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        {i === 0 && (
                          <span style={{ padding: '0.25rem 0.5rem', background: '#e0e7ff', color: '#4338ca', fontSize: '0.6rem', fontWeight: 900, borderRadius: '4px' }}>LATEST RECORD</span>
                        )}
                        <span className={`severity-badge ${res.severity === 'High' ? 'severity-high' : res.severity === 'Medium' ? 'severity-medium' : 'severity-low'}`}>
                          {res.severity} Risk
                        </span>
                      </div>
                    </div>
                    
                    <div className="record-body">
                      <div className="behavioral-stats-grid">
                        <div className="stat-metric-card">
                          <div className="metric-label">Primary Diagnosis</div>
                          <div className="metric-value" style={{ color: res.result === 'Autism' ? '#6366f1' : res.result === 'ADHD' ? '#10b981' : '#0f172a' }}>{res.result}</div>
                        </div>
                        <div className="stat-metric-card">
                          <div className="metric-label">ASD Score</div>
                          <div className="metric-value">{res.asd_score}</div>
                        </div>
                        <div className="stat-metric-card">
                          <div className="metric-label">ADHD Score</div>
                          <div className="metric-value">{res.adhd_score}</div>
                        </div>
                        <div className="stat-metric-card">
                          <div className="metric-label">Confidence</div>
                          <div className="metric-value">{(res.confidence * 100).toFixed(1)}%</div>
                          <div className="confidence-indicator">
                            <div className="confidence-bar" style={{ width: `${res.confidence * 100}%` }}></div>
                          </div>
                        </div>
                      </div>

                      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {res.camera_data && (
                          <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px' }}>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Info size={14} /> Ocular & Phasal Data
                            </h4>
                            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <p><strong>Eye Contact Ratio:</strong> {res.camera_data.eye_contact_ratio * 100}%</p>
                              <p><strong>Blinks Recorded:</strong> {res.camera_data.blink_rate}</p>
                              <p><strong>Head Stability:</strong> {res.camera_data.face_stability * 100}%</p>
                            </div>
                            
                            {/* NEW: Video Player for Ocular Test */}
                            {res.video_url && (
                              <div style={{ marginTop: '1.5rem' }}>
                                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Recorded Session</span>
                                <video src={res.video_url} controls className="media-player-mini" style={{ width: '100%', borderRadius: '12px', background: '#000' }} />
                              </div>
                            )}
                          </div>
                        )}
                        {res.speech_data && (
                          <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px' }}>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Mic size={14} /> Speech Profile
                            </h4>
                            <div style={{ fontSize: '0.85rem' }}>
                              <p><strong>Speech Rate:</strong> {res.speech_data.rate} WPM</p>
                              <p><strong>Clarity Confidence:</strong> {(res.speech_data.clarity * 100).toFixed(1)}%</p>
                              <p style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#64748b' }}>"{res.speech_data.text}"</p>
                            </div>

                            {/* Audio Player for Speech Test */}
                            {res.audio_url && (
                              <div style={{ marginTop: '1.5rem' }}>
                                <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Audio Recording</span>
                                <audio src={res.audio_url} controls style={{ width: '100%' }} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* NEW: BEHAVIORAL QUESTIONNAIRE (ASSESSMENT) RESULTS */}
                      {res.answers && res.answers.length > 0 && (
                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                          <h4 style={{ fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ClipboardList size={16} color="#6366f1" /> Clinical Behavioral Questionnaire
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                            {res.answers.map((ans, idx) => (
                              <div key={idx} style={{ padding: '1rem', background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                  <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: ans.type === 'asd' ? '#6366f1' : '#10b981' }}>
                                    {ans.type === 'asd' ? 'Autism Scale' : 'ADHD Scale'}
                                  </span>
                                  <span className={`severity-badge ${ans.answer === 'Frequently' || ans.answer === 'Sometimes' ? 'severity-medium' : 'severity-low'}`} style={{ fontSize: '0.6rem' }}>
                                    {ans.answer}
                                  </span>
                                </div>
                                <p style={{ fontSize: '0.8rem', margin: 0, color: '#475569', fontWeight: 600 }}>
                                  {ans.text || `Diagnostic Question ${idx + 1}`}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </section>

            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ViewPatientScreening;