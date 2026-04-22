import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Download, 
  Calendar, User, Brain, Activity, 
  ClipboardList, CheckCircle, Loader2, AlertCircle 
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import '../../../styles/patientReports.css';

const ViewDoctorReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const res = await fetch(`http://localhost:8000/reports/patient/${user.id}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`Server Error (${res.status}): ${errorData.detail || res.statusText}`);
      }
      
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setReports(data);
        if (data.length > 0 && !selectedReport) {
          setSelectedReport(data[0]);
        }
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to sync records.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="reports-container animate-fade-in">
      <div className="reports-header-section no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <Link to="/patient" className="back-to-portal">
            <ArrowLeft size={18} /> Dashboard
          </Link>
          <h1 className="reports-title">Clinical Reports & Diagnostics</h1>
          <p className="reports-subtitle">Secure access to your official medical documentations and AI analysis results.</p>
        </div>
        <button onClick={fetchReports} className="btn-refresh" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'white', border: '1px solid #e2e8f0', padding: '0.6rem 1rem', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, marginBottom: '0.1rem' }}>
          <Activity size={16} className={loading ? 'animate-spin' : ''} /> Sync Records
        </button>
      </div>

      {error && (
        <div className="no-print" style={{ padding: '1rem', background: '#fef2f2', color: '#dc2626', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '4px solid #dc2626' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="reports-main-layout">
        
        {/* Reports List */}
        <div className="reports-list-column no-print">
          <h3 className="section-title">Received Reports</h3>
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <Loader2 className="animate-spin" size={32} color="var(--report-blue)" />
            </div>
          ) : reports.length === 0 ? (
            <div className="empty-reports-card" style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '24px' }}>
              <FileText size={48} style={{ opacity: 0.1, margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No official reports have been filed by your clinician yet.</p>
              <button 
                onClick={fetchReports} 
                style={{ padding: '0.6rem 1.2rem', background: 'var(--report-blue)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
              >
                Sync Medical History
              </button>
            </div>
          ) : (
            <div className="reports-grid">
              {reports.map((report) => (
                <div 
                  key={report.id} 
                  className={`report-summary-card ${selectedReport?.id === report.id ? 'active' : ''}`}
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="report-icon-bg">
                    <FileText size={24} />
                  </div>
                  <div className="report-info">
                    <h4>{report.diagnosis}</h4>
                    <div className="report-meta">
                      <span><User size={12} /> {report.doctor?.full_name || 'Clinician'}</span>
                      <span><Calendar size={12} /> {new Date(report.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report Detail View */}
        <div className="report-detail-column">
          {selectedReport ? (
            <div className="report-full-view animate-fade-in">
              <div className="report-detail-header">
                <div className="header-main">
                  <h2>Official Clinical Record</h2>
                  <span className="report-id-pill">ID: #{selectedReport.id.substring(0,8)}</span>
                </div>
                <button className="download-report-btn no-print" onClick={handleDownload}>
                  <Download size={18} /> Download PDF
                </button>
              </div>

              <div className="report-section">
                <h4 className="section-heading"><CheckCircle size={16} /> Clinical Conclusion</h4>
                <p className="diagnosis-text">{selectedReport.diagnosis}</p>
              </div>

              <div className="report-section">
                <h4 className="section-heading"><Activity size={16} /> Summary</h4>
                <p className="summary-text">{selectedReport.summary || 'No summary provided.'}</p>
              </div>

              {/* Data Snapshots */}
              <div className="detection-snapshots-grid">
                {selectedReport.autism_data && (
                  <div className="snapshot-item" style={{ borderLeft: '4px solid var(--report-blue)' }}>
                    <div className="snapshot-label"><User size={12} /> Autism Face Analysis</div>
                    <div className="snapshot-value">{selectedReport.autism_data.result}</div>
                    <div className="snapshot-conf">Confidence: {(selectedReport.autism_data.confidence * 100).toFixed(0)}%</div>
                  </div>
                )}
                {selectedReport.adhd_data && (
                  <div className="snapshot-item" style={{ borderLeft: '4px solid var(--report-emerald)' }}>
                    <div className="snapshot-label"><Brain size={12} /> ADHD MRI Analysis</div>
                    <div className="snapshot-value">{selectedReport.adhd_data.result}</div>
                    <div className="snapshot-conf">Confidence: {(selectedReport.adhd_data.confidence * 100).toFixed(0)}%</div>
                  </div>
                )}
                {selectedReport.screening_data && (
                  <div className="snapshot-item" style={{ borderLeft: '4px solid var(--report-amber)' }}>
                    <div className="snapshot-label"><ClipboardList size={12} /> Behavioral Screening</div>
                    <div className="snapshot-value">{selectedReport.screening_data.result}</div>
                    <div className="snapshot-conf">Severity: {selectedReport.screening_data.severity}</div>
                  </div>
                )}
              </div>

              {selectedReport.doctor_notes && (
                <div className="report-section notes-section">
                  <h4 className="section-heading"><AlertCircle size={16} /> Clinician Remarks</h4>
                  <p className="notes-text">{selectedReport.doctor_notes}</p>
                </div>
              )}
              
              <div className="report-footer">
                <div className="verified-stamp">
                  <CheckCircle size={14} /> Digital Signature: Dr. {selectedReport.doctor?.full_name}
                </div>
                <span className="timestamp">Generated on {new Date(selectedReport.created_at).toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="report-selection-placeholder animate-fade-in card">
              <FileText size={64} style={{ opacity: 0.1 }} />
              <p style={{ fontSize: '1.1rem' }}>Select a report from the ledger to view <br/>the full diagnostic pathological data.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ViewDoctorReports;
