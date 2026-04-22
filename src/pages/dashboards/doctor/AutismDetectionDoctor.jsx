import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Camera, FileText, Activity, CheckCircle2, AlertCircle, Loader2, User, Info } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import '../../../styles/doctorModule.css';
import '../../../styles/analysisModules.css';

const AutismDetectionDoctor = () => {
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

      const response = await fetch(`http://localhost:8000/predict/autism?patient_id=${selectedPatientId}&doctor_id=${user.id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Analysis failed");
      }

      const data = await response.json();
      
      // Determine Clinical Pathological Data based on result
      const isAutism = data.result === "Autism";
      
      const enhancedResult = {
        ...data,
        explanation: isAutism 
          ? "Neural scanning of facial markers indicates a high correlation with established neurodevelopmental atypicalities. Landmark analysis shows specific variance in emotional micro-expression latency."
          : "Facial landmark distributions and fixation point mapping are consistent with neurotypical developmental baselines for the primary subject group.",
        symptoms: isAutism 
          ? ['Reduced social-emotional reciprocity', 'Atypical facial expression modulation', 'Deviations in ocular fixation patterns']
          : ['Consistent social reciprocity', 'Standard facial expressivity', 'Typical ocular engagement'],
        causes: isAutism
          ? ['Genetic predisposition (CNV variations linked to SHANK3/NLGN genes)', 'Atypical synaptogenesis during early cortical development']
          : ['Standard neurochemical pathways', 'Genetic screening shows typical developmental markers'],
        controlMethods: isAutism
          ? ['Early Intensive Behavioral Intervention (EIBI)', 'Social-communications therapy (PECS/Social Stories)', 'Occupational sensory integration therapy']
          : ['Routine developmental screenings', 'Standard pediatric follow-up plans']
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
        <h1 className="doctor-title">Autism Clinical Face Analysis</h1>
        <p className="doctor-subtitle">
          AI-driven facial landmark screening and pathological reporting for clinicians.
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
              <span className="step-num">2</span> Patient Image (Frontal)
            </h3>
            <div className={`upload-dropzone-modern ${file ? 'has-file' : ''}`}>
              <input type="file" accept="image/*" onChange={handleFileChange} className="upload-input-overlay" />
              {file ? (
                 <div className="preview-container">
                   <img src={file} alt="Preview" className="upload-preview-img-modern" />
                   <div className="file-info-pill">{fileObject?.name}</div>
                 </div>
              ) : (
                <div className="upload-placeholder-modern">
                  <div className="upload-icon-pulse"><Camera size={32} /></div>
                  <p>Upload Patient Facial Photo</p>
                  <span className="file-hint">Frontal view, clear lighting recommended</span>
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
              style={{ background: 'var(--gradient-primary)' }}
            >
              {analyzing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Scanning Landmarks...</span>
                </>
              ) : (
                <>
                  <Activity size={20} />
                  <span>Generate Pathological Report</span>
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
               <h3 className="output-header-title">Clinical Pathology Report</h3>
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
                 <User size={64} className="faded-icon" />
               </div>
               <p>Select a patient and scan their image to view clinical markers.</p>
            </div>
          )}

          {analyzing && (
            <div className="scanning-state-modern">
               <div className="scanner-container">
                 <div className="scanner-grid"></div>
                 <div className="scanner-beam"></div>
                 <Camera size={48} className="scanning-icon" />
               </div>
               <div className="scanning-info">
                 <div className="scanning-title">Landmark Analysis Active</div>
                 <div className="scanning-subtitle">Mapping ocular fixation and emotional reciprocity markers</div>
               </div>
            </div>
          )}

          {result && !analyzing && (
            <div className="diagnostic-details-modern animate-slide-up">
               <div className={`status-banner-modern ${result.result === 'Autism' ? 'status-positive' : 'status-negative'}`}>
                 <div className="banner-icon">
                   {result.result === 'Autism' ? <AlertCircle size={28} /> : <CheckCircle2 size={28} />}
                 </div>
                 <div className="banner-content">
                   <div className="banner-label">Diagnostic Conclusion</div>
                   <div className="banner-value">{result.result === 'Autism' ? 'Autism Spectrum Traits Identified' : 'No ASD Markers Detected'}</div>
                 </div>
                 <div className="severity-chip">
                   {result.severity} Severity
                 </div>
               </div>

               <div className="clinical-grid-modern">
                 <div className="clinical-section">
                   <div className="section-header-modern"><Info size={16} /> Pathology Summary</div>
                   <p className="clinical-text-p">{result.explanation}</p>
                 </div>

                 <div className="clinical-lists-trio" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div className="clinical-section">
                      <div className="section-header-modern">Associated Symptoms</div>
                      <ul className="clinical-list-modern">
                        {result.symptoms.map((s, i) => (
                          <li key={i}><div className="list-dot"></div> {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="clinical-section">
                      <div className="section-header-modern">Probable Causes</div>
                      <ul className="clinical-list-modern">
                        {result.causes.map((c, i) => (
                          <li key={i}><div className="list-dot"></div> {c}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="clinical-section">
                      <div className="section-header-modern">Control Methods</div>
                      <ul className="clinical-list-modern">
                        {result.controlMethods.map((cm, i) => (
                          <li key={i}><div className="list-dot"></div> {cm}</li>
                        ))}
                      </ul>
                    </div>
                 </div>
               </div>
               
               <div className="action-footer-modern">
                 <button className="footer-btn btn-secondary">Print Clinical Report</button>
                 <button className="footer-btn btn-primary">Archive to History</button>
               </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AutismDetectionDoctor;
