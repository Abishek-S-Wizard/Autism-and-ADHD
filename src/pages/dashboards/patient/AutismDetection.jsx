import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import iconAutism from '../../../assets/dashboard-icons/icon_autism.png';
import '../../../styles/autismDetection.css';
import { supabase } from '../../../lib/supabase';

const AutismDetection = () => {
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
      setHistory(data.filter(r => r.detection_type === 'autism'));
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

      const response = await fetch(`http://localhost:8000/predict/autism?patient_id=${user.id}`, {
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
    <div className="autism-detection-container animate-fade-in">
      <Link to="/patient" className="autism-back-button">
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>
      
      <div className="autism-detection-header">
        <h1 className="autism-detection-title">Autism AI Diagnostics</h1>
        <p className="autism-detection-subtitle">
          Utilizing advanced computer vision to analyze facial biomarkers for precise ASD trait detection.
        </p>
      </div>

      <div className="autism-analysis-grid">
        {/* Upload Section */}
        <div className="autism-upload-card premium-glass">
          <h3 className="section-title">Upload Face Image</h3>
          
          <div className={`autism-dropzone ${file ? 'has-file' : ''}`}>
            <input type="file" accept="image/*" onChange={handleFileChange} className="autism-file-input" />
            
            {file ? (
               <div className="preview-container">
                 <img src={file} alt="Preview" className="autism-preview-img" />
                 <div className="preview-overlay">Change Image</div>
               </div>
            ) : (
              <div className="upload-placeholder">
                <div className="autism-upload-icon-pulse">
                  <Upload size={32} />
                </div>
                <p className="upload-text">Drop face image here</p>
                <p className="upload-hint">JPG, PNG (Max 10MB)</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleAnalyze} 
            disabled={!file || analyzing} 
            className={`autism-analyze-btn ${analyzing ? 'is-loading' : ''}`}
          >
            {analyzing ? (
              <span className="flex-center">
                <div className="small-spinner"></div>
                Analyzing Biometrics...
              </span>
            ) : (
              "Run Neural Analysis"
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="autism-results-card premium-glass">
          <h3 className="section-title">
            Analysis Results {result && <div className="status-dot success"></div>}
          </h3>
          
          {!result && !analyzing && (
            <div className="autism-empty-results">
              <div className="empty-icon-bg">
                <AlertCircle size={40} className="faded-icon" />
              </div>
              <p className="empty-text">
                Upload a clear frontal facial image for accurate AI diagnosis.
              </p>
            </div>
          )}

          {analyzing && (
            <div className="autism-analyzing-state">
              <div className="scanning-line"></div>
              <div className="analysis-progress">
                <p className="loading-title">Neural Scanning...</p>
                <p className="loading-desc">Mapping facial keypoints and social markers</p>
              </div>
            </div>
          )}

          {result && !analyzing && (
            <div className="result-display-container animate-slide-up">
              <div className={`result-main-card ${result.result === 'Autism' ? 'is-autism' : 'is-normal'}`}>
                <div className="result-header">
                  <span className="label">Detection Result</span>
                  <div className={`result-tag ${result.result === 'Autism' ? 'tag-danger' : 'tag-success'}`}>
                    {result.result === 'Autism' ? 'Traits Detected' : 'No Significant Traits'}
                  </div>
                </div>
                <div className="result-value-main">{result.result}</div>
              </div>
              
              <div className="result-stats-grid">
                <div className="stat-item">
                  <div className="stat-label">Severity Level</div>
                  <div className="stat-value amber-text">{result.severity}</div>
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
            <h2 className="history-title">Recent Predictions</h2>
            <div className="history-line"></div>
          </div>
          
          {history.length === 0 ? (
            <div className="no-history">No recent analysis found.</div>
          ) : (
            <div className="history-cards-grid">
                {history.map((h, i) => (
                    <div key={i} className="history-card">
                        <div className="h-card-top">
                          <span className={`h-result-badge ${h.result === 'Autism' ? 'is-autism' : 'is-normal'}`}>
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

export default AutismDetection;
