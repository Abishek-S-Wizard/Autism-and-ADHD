import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, ArrowRight, Video, Mic, 
  ClipboardList, CheckCircle, Shield, 
  AlertCircle, Activity, Play, StopCircle 
} from 'lucide-react';
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { supabase } from '../../../lib/supabase';
import '../../../styles/screeningTest.css';

const ScreeningTest = () => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Intro, 2: Camera, 3: Speech, 4: Questions, 5: Results
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Data states
  const [answers, setAnswers] = useState({});
  const [speechData, setSpeechData] = useState(null);
  const [cameraData, setCameraData] = useState({
    face_detected: false,
    eye_contact_ratio: 0,
    blink_rate: 0,
    head_movement: 0,
    face_stability: 0
  });

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null); // Audio
  const videoRecorderRef = useRef(null); // Video
  const audioChunksRef = useRef([]);
  const videoChunksRef = useRef([]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setPatientId(user.id);
    };
    fetchUser();
  }, []);
  const uploadFile = async (blob, type) => {
    if (!blob || !patientId) return null;
    const fileName = `${type}_${Date.now()}.${type === 'video' ? 'webm' : 'wav'}`;
    const filePath = `screening/${patientId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('screening-media')
      .upload(filePath, blob);

    if (error) {
      console.error(`Upload error (${type}):`, error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('screening-media')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // =========================
  // 🎥 CAMERA ANALYSIS
  // =========================
  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);

      // Start Recording Video
      const recorder = new MediaRecorder(stream);
      videoChunksRef.current = [];
      recorder.ondataavailable = (e) => videoChunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: "video/webm" });
        setVideoBlob(blob);
      };
      recorder.start();
      videoRecorderRef.current = recorder;

      const faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });

      let blinkCount = 0;
      let lastBlinkTime = Date.now();
      let headMovements = 0;

      faceMesh.onResults((results) => {
        if (!results.multiFaceLandmarks?.length) {
          setCameraData(prev => ({ ...prev, face_detected: false }));
          return;
        }

        const landmarks = results.multiFaceLandmarks[0];
        const eyeTop = landmarks[159];
        const eyeBottom = landmarks[145];
        const eyeDistance = Math.abs(eyeTop.y - eyeBottom.y);

        if (eyeDistance < 0.012) { // Blink threshold
          const now = Date.now();
          if (now - lastBlinkTime > 250) {
            blinkCount++;
            lastBlinkTime = now;
          }
        }

        const nose = landmarks[1];
        const eyeContact = 1 - (Math.abs(nose.x - 0.5) * 2);
        const headMove = Math.abs(nose.x - 0.5);
        if (headMove > 0.12) headMovements++;
        const stability = Math.max(0, 1 - (headMove * 2));

        setCameraData({
          face_detected: true,
          eye_contact_ratio: Number(eyeContact.toFixed(2)),
          blink_rate: blinkCount,
          head_movement: headMovements,
          face_stability: Number(stability.toFixed(2))
        });
      });

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) await faceMesh.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();

    } catch (err) {
      console.error("Camera access denied", err);
      alert("Please allow camera access for the behavioral test.");
    }
  };

  // =========================
  // 🎤 SPEECH ANALYSIS (WEB SPEECH API)
  // =========================
  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        
        recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          setAudioBlob(blob);
        };

        // Initialize Web Speech API (Google)
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          alert("Speech recognition not supported in this browser. Try Chrome.");
          return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          const confidence = event.results[0][0].confidence;
          
          // Calculate Metrics
          const words = transcript.split(' ').length;
          const wpm = Math.round((words / 10) * 60); // Approx based on 10s recording

          setSpeechData({
            text: transcript,
            rate: wpm,
            delay: 1.0,
            clarity: Number(confidence.toFixed(2)),
            pause_count: 1
          });
        };

        recognition.onerror = (err) => console.error("Speech Recognition Error:", err);

        recorder.start();
        recognition.start();

        mediaRecorderRef.current = recorder;
        setIsRecording(true);

        // Auto stop after 10 seconds
        setTimeout(() => {
          if (recorder.state === "recording") {
            recorder.stop();
            recognition.stop();
            setIsRecording(false);
          }
        }, 10000);

      } catch (err) {
        alert("Microphone access denied.");
      }
    }
  };

  const analyzeAudio = () => {
    if (!speechData) {
      alert("No speech detected. Please try recording again.");
      return;
    }
    setCurrentStep(4);
  };

  // =========================
  // 🚀 SUBMISSION
  // =========================
  const handleFinalSubmit = async () => {
    if (!patientId) return alert("User not identified.");
    
    setLoading(true);

    try {
      // 1. Upload Media
      const [videoUrl, audioUrl] = await Promise.all([
        uploadFile(videoBlob, 'video'),
        uploadFile(audioBlob, 'audio')
      ]);

      // 2. Submit Data
      const payload = {
        patient_id: patientId,
        answers: Object.values(answers),
        speechData,
        cameraData,
        video_url: videoUrl,
        audio_url: audioUrl
      };
      const res = await fetch("http://localhost:8000/screening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setResult(data);
      setCurrentStep(5);
    } catch (err) {
      alert("Submission failed. Check backend connectivity.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (id, type, value, text) => {
    setAnswers(prev => ({
      ...prev,
      [id]: { type, answer: value, text }
    }));
  };

  // Rendering Helpers
  const renderStepIndicator = () => (
    <div className="progress-stepper">
      {[1, 2, 3, 4, 5].map(step => (
        <div 
          key={step} 
          className={`step-item ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
        >
          {currentStep > step ? <CheckCircle size={18} /> : step}
        </div>
      ))}
    </div>
  );

  return (
    <div className="screening-suite-container animate-fade-in">
      <Link to="/patient" className="module-back-link">
        <ArrowLeft size={16} /> Dashboard
      </Link>

      <div className="screening-header-card">
        <h1>Behavioral Screening Suite</h1>
        <p>AI-powered assessment for Autism & ADHD traits</p>
      </div>

      {renderStepIndicator()}

      <div className="wizard-section">
        
        {/* STEP 1: INTRO */}
        {currentStep === 1 && (
          <div className="text-center">
            <Shield size={64} color="#6366f1" style={{ margin: '0 auto 1.5rem' }} />
            <h2>Medical Disclaimer</h2>
            <p className="prompt-text" style={{ fontStyle: 'normal', fontSize: '1.1rem' }}>
              This screening tool uses multimodal AI to analyze behavioral patterns. 
              It is designed for research and awareness purposes and <strong>does not</strong> provide a clinical diagnosis. 
              Always consult with a medical professional.
            </p>
            <button className="btn-primary" onClick={() => setCurrentStep(2)} style={{ margin: '2rem auto 0' }}>
              Start Assessment <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: CAMERA */}
        {currentStep === 2 && (
          <div>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h3><Video size={20} /> Vision & Behavior Test</h3>
              <span className="badge-autism">Phase 1/3</span>
            </div>
            <p style={{ marginBottom: '2rem', color: '#64748b' }}>
              Position yourself in front of the camera. The AI will analyze eye contact and head stability for 30 seconds.
            </p>
            
            <div className="video-container">
              <video ref={videoRef} className="video-feed" autoPlay playsInline muted />
              {cameraData.face_detected && (
                <div className="camera-overlay">
                  <Activity size={14} /> Tracking Active
                </div>
              )}
              {!cameraActive && (
                <div className="camera-placeholder" style={{ height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
                  <button onClick={initCamera} className="btn-primary">Enable Camera</button>
                </div>
              )}
            </div>

            <div className="wizard-footer">
              <button disabled className="btn-secondary">Previous</button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  setCameraActive(false);
                  if (videoRef.current?.srcObject) {
                    videoRef.current.srcObject.getTracks().forEach(t => t.stop());
                  }
                  setCurrentStep(3);
                }}
                disabled={!cameraData.face_detected}
              >
                Next Step <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SPEECH */}
        {currentStep === 3 && (
          <div className="speech-test-card">
            <div className="flex-between" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <h3><Mic size={20} /> Speech Pattern Analysis</h3>
              <span className="badge-adhd">Phase 2/3</span>
            </div>
            
            <p className="prompt-text">
              "The quick brown fox jumps over the lazy dog. Scientific research helps us understand the human brain better every single day."
            </p>

            <div style={{ margin: '3rem 0' }}>
              {isRecording ? (
                <div className="recording-container">
                  <div className="recording-pulse">
                    <Mic size={32} />
                  </div>
                  <p style={{ color: '#ef4444', fontWeight: 'bold', marginTop: '1rem' }}>Recording... (Max 10s)</p>
                </div>
              ) : audioBlob ? (
                <div className="success-badge" style={{ color: '#10b981' }}>
                  <CheckCircle size={48} style={{ margin: '0 auto 1rem' }} />
                  <p>Audio Captured Successfully</p>
                </div>
              ) : (
                <button onClick={toggleRecording} className="btn-primary" style={{ margin: '0 auto' }}>
                  <Play size={18} /> Start Recording
                </button>
              )}
            </div>

            <div className="wizard-footer">
              <button className="btn-secondary" onClick={() => setCurrentStep(2)}>Back</button>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {audioBlob && !loading && (
                  <button 
                    className="btn-secondary" 
                    onClick={() => {
                      setAudioBlob(null);
                      setSpeechData(null);
                    }}
                    style={{ background: '#f1f5f9', color: '#64748b' }}
                  >
                    Record Again
                  </button>
                )}
                <button 
                  className="btn-primary" 
                  onClick={analyzeAudio} 
                  disabled={!audioBlob || loading}
                >
                  {loading ? "Analyzing..." : "Next Step"} <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: QUESTIONS */}
        {currentStep === 4 && (
          <div>
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h3><ClipboardList size={20} /> Behavioral Questionnaire</h3>
              <span className="badge-normal" style={{ background: '#fef3c7', color: '#d97706' }}>Phase 3/3</span>
            </div>

            <div className="question-list" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '1rem' }}>
              {[
                { id: 1, type: "asd", text: "Do you find it difficult to understand other people's feelings?" },
                { id: 2, type: "adhd", text: "Do you often feel restless or as if you are 'driven by a motor'?" },
                { id: 3, type: "asd", text: "Do you prefer to do things the same way every time (routines)?" },
                { id: 4, type: "adhd", text: "Do you struggle to finish tasks that require a lot of mental effort?" }
              ].map(q => (
                <div key={q.id} className="question-item">
                  <label>{q.text}</label>
                  <div className="option-grid">
                    {["Never", "Rarely", "Sometimes", "Frequently"].map(opt => (
                      <button 
                        key={opt}
                        className={`option-btn ${answers[q.id]?.answer === opt ? 'selected' : ''}`}
                        onClick={() => handleAnswerChange(q.id, q.type, opt, q.text)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="wizard-footer">
              <button className="btn-secondary" onClick={() => setCurrentStep(3)}>Back</button>
              <button 
                className="btn-primary" 
                onClick={handleFinalSubmit}
                disabled={Object.keys(answers).length < 4 || loading}
              >
                {loading ? "Finalizing..." : "Submit Screening"} <CheckCircle size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: RESULTS */}
        {currentStep === 5 && result && (
          <div className="result-container text-center">
            <div className="result-main-card">
              <span className={`result-badge ${result.result === 'Autism' ? 'badge-autism' : result.result === 'ADHD' ? 'badge-adhd' : 'badge-normal'}`}>
                Sereening Result
              </span>
              <h2 className="result-title">{result.result}</h2>
              <p style={{ color: '#64748b', fontSize: '1.2rem' }}>Severity Level: <strong>{result.severity}</strong></p>
              
              <div className="score-visualization">
                <div className="score-stat">
                  <div className="stat-value">{result.asd_score}</div>
                  <div className="stat-label">ASD Index</div>
                </div>
                <div className="score-stat">
                  <div className="stat-value">{result.adhd_score}</div>
                  <div className="stat-label">ADHD Index</div>
                </div>
              </div>

              <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', textAlign: 'left' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <AlertCircle size={16} color="#6366f1" /> Clinical Insights
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#475569' }}>
                  Based on speech clarity ({(speechData?.clarity * 100).toFixed(0)}%) and camera eye-contact stability ({cameraData.eye_contact_ratio * 100}%), 
                  the AI has reached a confidence of <strong>{(result.confidence * 100).toFixed(1)}%</strong>. 
                  {result.secondary && <span> Secondary signals of <strong>{result.secondary}</strong> were also detected.</span>}
                </p>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn-primary" onClick={() => window.location.reload()}>Retake Test</button>
                <Link to="/patient" className="btn-secondary" style={{ textDecoration: 'none' }}>Back to Home</Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ScreeningTest;