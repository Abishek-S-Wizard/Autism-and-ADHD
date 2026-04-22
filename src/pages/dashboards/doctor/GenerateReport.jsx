import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, FileText, CheckCircle, 
  Activity, User, Brain, Video, 
  ClipboardList, AlertCircle, Loader2 
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import '../../../styles/doctorModule.css';
import '../../../styles/analysisModules.css';

const GenerateReport = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientSummary, setPatientSummary] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [doctorId, setDoctorId] = useState(null);
  
  // Form fields
  const [diagnosis, setDiagnosis] = useState('');
  const [summary, setSummary] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setDoctorId(user.id);
      fetchPatients(user.id);
    }
  };

  const fetchPatients = async (did) => {
    try {
      setLoadingPatients(true);
      const res = await fetch(`http://localhost:8000/patients?doctor_id=${did}`);
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchSummary = async (pid) => {
    if (!pid) return;
    setLoadingSummary(true);
    setGenerated(false);
    try {
      const res = await fetch(`http://localhost:8000/patient-summary/${pid}`);
      const data = await res.json();
      setPatientSummary(data);
      
      // Auto-pre-fill diagnosis based on results
      if (data.autism?.result === "Autism" || data.adhd?.result === "ADHD") {
        setDiagnosis("Neurodevelopmental markers identified.");
      } else {
        setDiagnosis("No clinical indicators detected at this time.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedPatientId || !doctorId) return;

    setGenerating(true);
    try {
      const payload = {
        patient_id: selectedPatientId,
        doctor_id: doctorId,
        diagnosis,
        summary,
        doctor_notes: notes,
        autism_data: patientSummary.autism,
        adhd_data: patientSummary.adhd,
        screening_data: patientSummary.screening
      };

      const res = await fetch("http://localhost:8000/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setGenerated(true);
      }
    } catch (err) {
      alert("Failed to save report.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="doctor-container animate-fade-in">
      <Link to="/doctor" className="doctor-back-link">
        <ArrowLeft size={18} /> Back to Doctor Portal
      </Link>
      
      <div className="doctor-header">
        <h1 className="doctor-title">Integrated Clinical Report</h1>
        <p className="doctor-subtitle">
          Consolidate AI detection and behavioral screening into an official record.
        </p>
      </div>

      <div className="analysis-layout-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '2rem' }}>
        
        {/* LEFT: CONFIGURATION */}
        <div className="card analysis-input-column" style={{ padding: '2rem' }}>
          <h3 className="analysis-step-title" style={{ marginBottom: '1.5rem' }}>Report Configuration</h3>
          
          <form onSubmit={handleGenerate} className="analysis-form-group">
            <div className="input-group">
              <label>Select Linked Patient</label>
              {loadingPatients ? (
                <div className="flex-center py-2"><Loader2 className="animate-spin" /></div>
              ) : (
                <select 
                  className="input-field" 
                  value={selectedPatientId} 
                  onChange={(e) => {
                    setSelectedPatientId(e.target.value);
                    fetchSummary(e.target.value);
                  }} 
                  required
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.id.substring(0,8)})</option>
                  ))}
                </select>
              )}
            </div>

            <div className="input-group">
              <label>Clinical Diagnosis</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Moderate Autism traits detected"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Executive Summary</label>
              <textarea 
                className="input-field" 
                rows="3" 
                placeholder="Brief summary for the patient..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              ></textarea>
            </div>

            <div className="input-group">
              <label>Confidential Clinical Notes</label>
              <textarea 
                className="input-field" 
                rows="4" 
                placeholder="Internal observations and longitudinal notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary analysis-submit-btn" style={{ width: '100%', marginTop: '1rem' }} disabled={!selectedPatientId || generating}>
              {generating ? 'Saving Clinical Record...' : 'Archive & Send to Patient'}
            </button>
          </form>
        </div>

        {/* RIGHT: LIVE PREVIEW & DATA SNAPSHOT */}
        <div className={`card analysis-output-card ${patientSummary ? 'output-resolved' : 'output-empty'}`} style={{ padding: '2rem' }}>
          {!patientSummary && !loadingSummary && (
            <div className="empty-state-view">
               <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
               <p style={{ color: '#64748b' }}>Select a patient to preview <br/>available clinical data.</p>
            </div>
          )}

          {loadingSummary && (
            <div className="processing-state-view">
               <Activity size={32} className="animate-spin" />
               <p className="processing-text">Aggregating Clinical Data...</p>
            </div>
          )}

          {patientSummary && !loadingSummary && !generated && (
            <div className="report-preview-pane animate-fade-in">
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)' }}>
                <Activity size={18} /> Data Components
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Autism Component */}
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #6366f1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6366f1' }}><User size={12} /> FACIAL ANALYSIS</span>
                    <span style={{ fontSize: '0.7rem' }}>{patientSummary.autism ? 'LATEST' : 'NO DATA'}</span>
                  </div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{patientSummary.autism?.result || 'Awaiting Analysis'}</p>
                  {patientSummary.autism && <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Confidence: {(patientSummary.autism.confidence * 100).toFixed(0)}%</span>}
                </div>

                {/* ADHD Component */}
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981' }}><Brain size={12} /> MRI NEURO-IMAGING</span>
                    <span style={{ fontSize: '0.7rem' }}>{patientSummary.adhd ? 'LATEST' : 'NO DATA'}</span>
                  </div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{patientSummary.adhd?.result || 'Awaiting Analysis'}</p>
                  {patientSummary.adhd && <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Confidence: {(patientSummary.adhd.confidence * 100).toFixed(0)}%</span>}
                </div>

                {/* Screening Component */}
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f59e0b' }}><ClipboardList size={12} /> BEHAVIORAL SCREENING</span>
                    <span style={{ fontSize: '0.7rem' }}>{patientSummary.screening ? 'LATEST' : 'NO DATA'}</span>
                  </div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{patientSummary.screening?.result || 'Awaiting Analysis'}</p>
                  {patientSummary.screening && <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Severity: {patientSummary.screening.severity}</span>}
                </div>
              </div>
            </div>
          )}

          {generated && (
            <div className="animate-fade-in success-state-view" style={{ flex: 1, justifyContent: 'center', textAlign: 'center' }}>
              <div className="success-icon-circle" style={{ margin: '0 auto 1.5rem', background: '#10b981', color: 'white', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={32} />
              </div>
              <div>
                <h3 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Archived Successfully!</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>The clinician report has been sent to the patient portal and archived in the medical history.</p>
              </div>
              
              <div className="actions-row" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button type="button" className="btn btn-outline" onClick={() => window.location.reload()}>Start New Report</button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default GenerateReport;
