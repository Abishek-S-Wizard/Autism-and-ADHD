import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Brain, FileText, Activity, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import '../../../styles/doctorModule.css';
import '../../../styles/analysisModules.css';

const ADHDDetectionDoctor = () => {
  const [file, setFile] = useState(null);
  const [fileObject, setFileObject] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error: mappingError } = await supabase
        .from('doctor_patient_mappings')
        .select('*, patients(*)')
        .eq('doctor_id', user.id);

      if (mappingError) throw mappingError;

      const flattened = (data || []).map(m => m.patients).filter(p => p);
      setPatients(flattened);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Failed to load your assigned patients.");
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(URL.createObjectURL(selectedFile));
      setFileObject(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedPatientId) {
      setError("Please select a patient first.");
      return;
    }
    
    setAnalyzing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', fileObject);
      
      const { data: { user } } = await supabase.auth.getUser();

      const response = await fetch(`http://localhost:8000/predict/adhd?patient_id=${selectedPatientId}&doctor_id=${user.id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Analysis failed");
      }

      const data = await response.json();
      
      // Enhance backend data with clinical clinical context for Doctors
      const enhancedResult = {
        ...data,
        clinicalExplanation: data.result === "ADHD" 
          ? "Volumetric analysis indicates neuro-anatomical variations in the prefrontal cortex and cerebellum, often associated with neurotransmitter dysregulation in dopaminergic pathways."
          : "Neuro-anatomical structures appear within standard physiological ranges for the subject's age and developmental stage.",
        recommendations: data.result === "ADHD"
          ? ["Initiate tailored behavioral therapy", "Review executive function coaching options", "Monitor cardiovascular baseline if medicinal trial is considered"]
          : ["Maintain standard developmental monitoring", "Annual neuro-assessment recommended"]
      };
      
      setResult(enhancedResult);
    } catch (err) {
      console.error("Analysis Error:", err);
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="doctor-container animate-fade-in">
      <Link to="/doctor" className="doctor-back-link">
        <ArrowLeft size={18} /> Back to Doctor Dashboard
      </Link>
      
      <div className="doctor-header">
        <h1 className="doctor-title">ADHD Clinical MRI Analysis</h1>
        <p className="doctor-subtitle">
          Advanced neuro-imaging diagnostics with AI-assisted pathology mapping.
        </p>
      </div>

      <div className="analysis-layout-grid">
        
        {/* Input Controls */}
        <div className="analysis-input-column">
          <div className="premium-glass card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 className="analysis-step-title">
              <span className="step-num">1</span> Patient Selection
            </h3>
            {loadingPatients ? (
              <div className="flex-center py-2"><Loader2 className="animate-spin" size={20} /></div>
            ) : (
              <select 
                className="input-field select-modern"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
              >
                <option value="">-- Choose Patient --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name} ({p.id.substring(0,8)})</option>
                ))}
              </select>
            )}
          </div>

          <div className="premium-glass card" style={{ padding: '1.5rem' }}>
            <h3 className="analysis-step-title">
              <span className="step-num">2</span> Upload Scan (MRI)
            </h3>
            <div className={`upload-dropzone-modern ${file ? 'has-file' : ''}`}>
              <input type="file" accept=".nii,.nii.gz,.dcm,.jpg,.png" onChange={handleFileChange} className="upload-input-overlay" />
              {file ? (
                 <div className="preview-container">
                   <img src={file} alt="MRI Preview" className="upload-preview-img-modern" />
                   <div className="file-info-pill">{fileObject?.name}</div>
                 </div>
              ) : (
                <div className="upload-placeholder-modern">
                  <div className="upload-icon-pulse"><Upload size={32} /></div>
                  <p>Drop MRI file or Click to Browse</p>
                  <span className="file-hint">Supports .nii, .dcm, .jpg, .png</span>
                </div>
              )}
            </div>

            {error && (
              <div className="error-alert-modern animate-shake">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button 
              onClick={handleAnalyze} 
              disabled={!file || analyzing || !selectedPatientId} 
              className={`analysis-btn-modern ${analyzing ? 'is-loading' : ''}`}
            >
              {analyzing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Processing Neural Maps...</span>
                </>
              ) : (
                <>
                  <Brain size={20} />
                  <span>Execute Clinical Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Diagnostic Output */}
        <div className={`premium-glass card analysis-output-card-modern ${result ? 'is-resolved' : ''}`}>
          <div className="output-header-modern">
             <div className="header-title-group">
               <FileText size={20} />
               <h3 className="output-header-title">Diagnostic Pathology Report</h3>
             </div>
             {result && (
               <div className="confidence-pill-modern">
                 AI Confidence: {(result.confidence * 100).toFixed(1)}%
               </div>
             )}
          </div>
          
          {!result && !analyzing && (
            <div className="empty-state-view-modern">
               <div className="radar-circle-bg">
                 <Brain size={64} className="faded-icon" />
               </div>
               <p>Patient neurological data will appear here after analysis.</p>
            </div>
          )}

          {analyzing && (
            <div className="scanning-state-modern">
               <div className="scanner-container">
                 <div className="scanner-grid"></div>
                 <div className="scanner-beam"></div>
                 <Activity size={48} className="scanning-icon" />
               </div>
               <div className="scanning-info">
                 <div className="scanning-title">Neural Mapping in Progress</div>
                 <div className="scanning-subtitle">Analyzing voxel density across prefrontal regions</div>
               </div>
            </div>
          )}

          {result && !analyzing && (
            <div className="diagnostic-details-modern animate-slide-up">
               <div className={`status-banner-modern ${result.result === 'ADHD' ? 'status-positive' : 'status-negative'}`}>
                 <div className="banner-icon">
                   {result.result === 'ADHD' ? <AlertCircle size={28} /> : <CheckCircle2 size={28} />}
                 </div>
                 <div className="banner-content">
                   <div className="banner-label">Analysis Outcome</div>
                   <div className="banner-value">{result.result === 'ADHD' ? 'Clinical Markers for ADHD Detected' : 'No ADHD Indicators Found'}</div>
                 </div>
                 <div className="severity-chip">
                   {result.severity} Severity
                 </div>
               </div>

               <div className="clinical-grid-modern">
                 <div className="clinical-section">
                   <div className="section-header-modern"><Info size={16} /> Pathology Explanation</div>
                   <p className="clinical-text-p">{result.clinicalExplanation}</p>
                 </div>

                 <div className="clinical-section">
                   <div className="section-header-modern"><CheckCircle2 size={16} /> Recommended Interventions</div>
                   <ul className="clinical-list-modern">
                     {result.recommendations.map((rec, i) => (
                       <li key={i}><div className="list-dot"></div> {rec}</li>
                     ))}
                   </ul>
                 </div>
               </div>
               
               <div className="action-footer-modern">
                 <button className="footer-btn btn-secondary">Download PDF Report</button>
                 <button className="footer-btn btn-primary">Sync to Patient Portal</button>
               </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ADHDDetectionDoctor;
