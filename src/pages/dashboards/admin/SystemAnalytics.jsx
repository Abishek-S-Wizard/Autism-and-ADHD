import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, Users, Activity, Target, Brain, PieChart, RefreshCw, AlertCircle } from 'lucide-react';
import '../../../styles/adminModule.css';
import '../../../styles/systemAnalytics.css';
import '../../../styles/cards.css';
import { supabase } from '../../../lib/supabase';

const SystemAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    researchers: 0,
    autismScans: 0,
    adhdScans: 0,
    autismAccuracy: 0,
    adhdAccuracy: 0,
    cameraTests: 0,
    speechTests: 0,
    questionnaires: 0
  });

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch User Stats
      const [patientsRes, doctorsRes, researchersRes] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('doctors').select('*', { count: 'exact', head: true }).eq('is_approved', true),
        supabase.from('researchers').select('*', { count: 'exact', head: true }).eq('is_approved', true)
      ]);

      // 2. Fetch AI Detection Stats from detection_results table
      const [autismRes, adhdRes, autismAccRes, adhdAccRes] = await Promise.all([
        supabase.from('detection_results').select('*', { count: 'exact', head: true }).eq('detection_type', 'autism'),
        supabase.from('detection_results').select('*', { count: 'exact', head: true }).eq('detection_type', 'adhd'),
        supabase.from('detection_results').select('confidence').eq('detection_type', 'autism'),
        supabase.from('detection_results').select('confidence').eq('detection_type', 'adhd')
      ]);

      // 3. Fetch Screening Stats from screening_results table
      const [cameraRes, speechRes, questionRes] = await Promise.all([
        supabase.from('screening_results').select('*', { count: 'exact', head: true }).not('camera_data', 'is', null),
        supabase.from('screening_results').select('*', { count: 'exact', head: true }).not('speech_data', 'is', null),
        supabase.from('screening_results').select('*', { count: 'exact', head: true }).not('answers', 'is', null)
      ]);

      // Calculate Accuracies
      const calcAvg = (data) => {
        if (!data || data.length === 0) return 0;
        const sum = data.reduce((acc, curr) => acc + (curr.confidence || 0), 0);
        return (sum / data.length) * 100;
      };

      setStats({
        patients: patientsRes.count || 0,
        doctors: doctorsRes.count || 0,
        researchers: researchersRes.count || 0,
        autismScans: autismRes.count || 0,
        adhdScans: adhdRes.count || 0,
        autismAccuracy: calcAvg(autismAccRes.data).toFixed(1),
        adhdAccuracy: calcAvg(adhdAccRes.data).toFixed(1),
        cameraTests: cameraRes.count || 0,
        speechTests: speechRes.count || 0,
        questionnaires: questionRes.count || 0
      });

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load system analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="admin-container flex-center" style={{ height: '80vh', flexDirection: 'column' }}>
        <div className="loader-spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Gathering real-time insights...</p>
      </div>
    );
  }
  return (
    <div className="admin-container animate-fade-in">
      <Link to="/admin" className="admin-back-link">
        <ArrowLeft size={18} /> Back to Admin Portal
      </Link>
      
      <div className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="admin-title">System & User Analytics</h1>
            <p className="admin-subtitle">
              Global overview of platform usage and AI detection metrics.
            </p>
          </div>
          <button onClick={fetchAnalytics} className="action-btn action-approve" style={{ padding: '0.6rem 1rem', borderRadius: '10px' }} title="Refresh Data">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: '2rem', padding: '1rem', borderLeft: '4px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AlertCircle color="#ef4444" size={24} />
          <p style={{ color: '#ef4444', fontWeight: '500', margin: 0 }}>{error}</p>
        </div>
      )}

      <div className="analytics-stats-grid">
        
        {/* User Stats Card */}
        <div className="card stat-card">
          <div className="stat-icon-wrapper icon-wrap-users">
            <Users color="var(--primary)" size={32} />
          </div>
          <h2 className="stat-value">{stats.patients.toLocaleString()}</h2>
          <p className="stat-label">Total Registered Patients</p>
        </div>

        {/* Doctor Stats Card */}
        <div className="card stat-card">
          <div className="stat-icon-wrapper icon-wrap-doctors">
            <Target color="var(--secondary)" size={32} />
          </div>
          <h2 className="stat-value">{stats.doctors.toLocaleString()}</h2>
          <p className="stat-label">Verified Doctors</p>
        </div>

        {/* Researcher Stats Card */}
        <div className="card stat-card">
          <div className="stat-icon-wrapper icon-wrap-researchers">
            <PieChart color="var(--accent)" size={32} />
          </div>
          <h2 className="stat-value">{stats.researchers.toLocaleString()}</h2>
          <p className="stat-label">Active Researchers</p>
        </div>
      </div>

      <div className="analytics-panels-grid">
        
        {/* Detection Statistics Panel */}
        <div className="card">
          <h3 className="panel-header">
            <Activity color="#EF4444" size={20} /> AI Detection Statistics
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="font-medium">Autism Face Model Processed</span>
                <span className="font-semibold" style={{ color: 'var(--primary)' }}>{stats.autismScans.toLocaleString()} Scans</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill progress-autism" style={{ width: `${Math.min(100, (stats.autismScans / 10000) * 100)}%` }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="font-medium">ADHD MRI Model Processed</span>
                <span className="font-semibold" style={{ color: 'var(--secondary)' }}>{stats.adhdScans.toLocaleString()} Scans</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill progress-adhd" style={{ width: `${Math.min(100, (stats.adhdScans / 5000) * 100)}%` }}></div>
              </div>
            </div>
            
            <div className="accuracy-metrics">
               <div className="metric-box">
                 <div className="metric-value">{stats.autismAccuracy}%</div>
                 <div className="metric-label">Avg. Autism Model Confidence</div>
               </div>
               <div className="metric-box">
                 <div className="metric-value">{stats.adhdAccuracy}%</div>
                 <div className="metric-label">Avg. ADHD Model Confidence</div>
               </div>
            </div>
          </div>
        </div>

        {/* Screening Statistics Panel */}
        <div className="card">
          <h3 className="panel-header">
            <Brain color="var(--accent)" size={20} /> Screening Statistics
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="screening-stat-row">
               <div>
                 <div className="screening-stat-title">Camera Behavior Tests</div>
                 <div className="screening-stat-desc">Completed via patient portal</div>
               </div>
               <div className="screening-stat-number" style={{ color: 'var(--primary)' }}>{stats.cameraTests.toLocaleString()}</div>
            </div>

            <div className="screening-stat-row">
               <div>
                 <div className="screening-stat-title">Speech Recordings</div>
                 <div className="screening-stat-desc">Analyzed for prosody/echolalia</div>
               </div>
               <div className="screening-stat-number" style={{ color: 'var(--secondary)' }}>{stats.speechTests.toLocaleString()}</div>
            </div>

            <div className="screening-stat-row">
               <div>
                 <div className="screening-stat-title">Standardized Questionnaires</div>
                 <div className="screening-stat-desc">Submitted by caregivers/patients</div>
               </div>
               <div className="screening-stat-number" style={{ color: 'var(--accent)' }}>{stats.questionnaires.toLocaleString()}</div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default SystemAnalytics;
