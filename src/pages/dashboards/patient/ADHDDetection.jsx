import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import '../../../styles/adhdDetection.css';
import { supabase } from '../../../lib/supabase';

const ADHDDetection = () => {
  const [file, setFile] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const response = await fetch(`http://localhost:8000/results/${user.id}`);
      const data = await response.json();
      setHistory(data.filter(r => r.detection_type === 'adhd'));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setRawFile(e.target.files[0]);
      setFile(URL.createObjectURL(e.target.files[0]));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const formData = new FormData();
      formData.append('file', rawFile);

      const response = await fetch(`http://localhost:8000/predict/adhd?patient_id=${user.id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Analysis failed");
      }

      const data = await response.json();
      setResult(data);
      fetchHistory(); // Refresh history
    } catch (error) {
      console.error("Analysis Error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="adhd-detection-container animate-fade-in">
      <Link to="/patient" className="adhd-back-button">
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>
      
      <div className="adhd-detection-header">
        <h1 className="adhd-detection-title">ADHD MRI Analysis</h1>
        <p className="adhd-detection-subtitle">
          Utilizing specialized neural networks to identify volumetric and connectivity biomarkers in MRI brain scans.
        </p>
      </div>

      <div className="adhd-analysis-grid">
        {/* Upload Section */}
        <div className="adhd-upload-card premium-glass">
          <h3 className="section-title">Upload MRI Scan</h3>
          
          <div className={`adhd-dropzone ${file ? 'has-file' : ''}`}>
            <input type="file" accept="image/*" onChange={handleFileChange} className="adhd-file-input" />
            
            {file ? (
               <div className="preview-container">
                 <img src={file} alt="Preview" className="adhd-preview-img" />
                 <div className="preview-overlay">Change MRI Scan</div>
               </div>
            ) : (
              <div className="upload-placeholder">
                <div className="adhd-upload-icon-pulse">
                  <Upload size={32} />
                </div>
                <p className="upload-text">Drop MRI image here</p>
                <p className="upload-hint">DICOM, JPG, PNG (Max 15MB)</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleAnalyze} 
            disabled={!file || analyzing} 
            className={`adhd-analyze-btn ${analyzing ? 'is-loading' : ''}`}
          >
            {analyzing ? (
              <span className="flex-center">
                <div className="small-spinner"></div>
                Processing Neural Data...
              </span>
            ) : (
              "Run MRI Diagnostics"
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="adhd-results-card premium-glass">
          <h3 className="section-title">
            Analysis Findings {result && <div className="status-dot success"></div>}
          </h3>
          
          {!result && !analyzing && (
            <div className="adhd-empty-results">
              <div className="empty-icon-bg">
                <AlertCircle size={40} className="faded-icon" />
              </div>
              <p className="empty-text">
                Provide a high-resolution MRI scan to generate a diagnostic report.
              </p>
            </div>
          )}

          {analyzing && (
            <div className="adhd-analyzing-state">
              <div className="scanning-grid"></div>
              <div className="analysis-progress">
                <p className="loading-title">Extracting Biomarkers...</p>
                <p className="loading-desc">Comparing connectivity patterns with clinical benchmarks</p>
              </div>
            </div>
          )}

          {result && !analyzing && (
            <div className="result-display-container animate-slide-up">
              <div className="result-main-card adhd-variant">
                <div className="result-header">
                  <span className="label">AI Diagnostic Result</span>
                  <div className={`result-tag ${result.result === 'ADHD' ? 'tag-danger' : 'tag-success'}`}>
                    {result.result === 'ADHD' ? 'Positive' : 'Normal'}
                  </div>
                </div>
                <div className="result-value-main">{result.result}</div>
              </div>
              
              <div className="result-stats-grid">
                <div className="stat-item">
                  <div className="stat-label">Biomarker Severity</div>
                  <div className="stat-value red-text">{result.severity}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Confidence Score</div>
                  <div className="stat-value blue-text">{(result.confidence * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History Section */}
      <div className="history-section-wrapper">
          <div className="history-header">
            <h2 className="history-title">Recent MRI Predictions</h2>
            <div className="history-line"></div>
          </div>
          
          {history.length === 0 ? (
            <div className="no-history">No scan history found.</div>
          ) : (
            <div className="history-cards-grid">
                {history.map((h, i) => (
                    <div key={i} className="history-card adhd-hover">
                        <div className="h-card-top">
                          <span className={`h-result-badge ${h.result === 'ADHD' ? 'is-adhd' : 'is-normal'}`}>
                            {h.result}
                          </span>
                          <span className="h-date">{new Date(h.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="h-card-bottom">
                          <div className="h-stat">
                            <span className="h-label">Severity:</span>
                            <span className="h-val">{h.severity}</span>
                          </div>
                          <div className="h-stat">
                            <span className="h-label">Conf:</span>
                            <span className="h-val">{(h.confidence * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                    </div>
                ))}
            </div>
          )}
      </div>
    </div>
  );
};

export default ADHDDetection;
