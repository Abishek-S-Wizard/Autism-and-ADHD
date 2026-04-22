import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send, Loader2, User } from 'lucide-react';
import '../../../styles/doctorModule.css';
import '../../../styles/chatbots.css';
import '../../../styles/cards.css';
import '../../../styles/buttons.css';

import { supabase } from '../../../lib/supabase';

const ReplyToQueries = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMappedPatients = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        
        if (!user) throw new Error("Please log in to respond to queries.");

        // 0. VERIFY DOCTOR PROFILE EXISTS
        const { data: docProfile } = await supabase
          .from('doctors')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        
        if (!docProfile) {
          setError(`CRITICAL: Your account (ID: ${user.id}) is MISSING from the 'doctors' table. Please ensure your registration was approved.`);
          setLoading(false);
          return;
        }

        // Get all patients assigned to this doctor
        // Get all patients assigned to this doctor
        const { data: mappingData, error: mappingError } = await supabase
          .from('doctor_patient_mappings')
          .select('*, patients(*)')
          .eq('doctor_id', user.id);

        if (mappingError) throw mappingError;

        // Filter out null patients immediately
        const validMappedPatients = (mappingData || []).filter(item => item.patients !== null);
        setPatients(validMappedPatients);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMappedPatients();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      const fetchChatHistory = async () => {
        try {
          setChatLoading(true);
          const { data: { user } } = await supabase.auth.getUser();
          
          const { data, error: historyError } = await supabase
            .from('doctor_patient_queries')
            .select('*')
            .eq('patient_id', selectedPatientId)
            .eq('doctor_id', user.id)
            .order('created_at', { ascending: true });

          if (historyError) throw historyError;
          setChatHistory(data || []);
          setTimeout(scrollToBottom, 100);
        } catch (err) {
          console.error('Error fetching chat:', err);
        } finally {
          setChatLoading(false);
        }
      };

      fetchChatHistory();

      // Real-time listener for THIS specific conversation
      const channel = supabase
        .channel(`chat:${selectedPatientId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'doctor_patient_queries',
          filter: `patient_id=eq.${selectedPatientId}`
        }, (payload) => {
          const newMsg = payload.new;
          setChatHistory(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          setTimeout(scrollToBottom, 50);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedPatientId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending || !selectedPatientId) return;

    try {
      setSending(true);
      const { data: { user } } = await supabase.auth.getUser();

      const newMessage = {
        patient_id: selectedPatientId,
        doctor_id: user.id,
        sender_role: 'doctor',
        message: message.trim()
      };

      const { data, error: sendError } = await supabase
        .from('doctor_patient_queries')
        .insert([newMessage])
        .select()
        .single();

      if (sendError) throw sendError;

      setChatHistory([...chatHistory, data]);
      setMessage('');
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      console.error("DEBUG: Detailed Send Error:", err);
      alert(`Failed to send reply: ${err.message}\n\nDEBUG INFO:\nPatient ID: ${selectedPatientId}\nDoctor ID: ${user?.id}`);
    } finally {
      setSending(false);
    }
  };

  const selectedPatientData = patients.find(p => p.patient_id === selectedPatientId)?.patients;

  if (loading) {
    return (
      <div className="doctor-container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="doctor-container animate-fade-in">
      <Link to="/doctor" className="doctor-back-link">
        <ArrowLeft size={18} /> Back to Doctor Portal
      </Link>
      
      <div className="doctor-header">
        <h1 className="doctor-title">Patient Queries</h1>
        <p className="doctor-subtitle">
          Direct communication with your assigned patients.
        </p>
        {error && (
          <div className="card" style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', padding: '1rem', marginTop: '1rem', color: '#ef4444' }}>
            {error}
          </div>
        )}
        {currentUser && (
          <div> 
          </div>
        )}
      </div>

      <div className="doctor-queries-grid">
        
        {/* Contact List Sidebar */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
             <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Active Conversations</h3>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {patients.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>
                No patients assigned to you.
              </div>
            ) : (
              patients.map((item) => (
                <div 
                  key={item.patient_id} 
                  onClick={() => setSelectedPatientId(item.patient_id)} 
                  className={`patient-chat-item ${selectedPatientId === item.patient_id ? 'active' : ''}`}
                >
                  <div className="chat-avatar-circle chat-avatar-primary">
                    {item.patients?.full_name?.charAt(0) || 'P'}
                  </div>
                  <div className="chat-item-text">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600 }}>{item.patients?.full_name || 'Unknown Patient'}</span>
                    </div>
                    <p className="ticket-preview" style={{ fontSize: '0.8rem' }}>Guardian: {item.patients?.guardian_name || 'N/A'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
          {selectedPatientId ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div className="chat-avatar-circle chat-avatar-primary">
                    {selectedPatientData?.full_name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.125rem' }}>{selectedPatientData?.full_name}</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Guardian: {selectedPatientData?.guardian_name}</p>
                  </div>
                </div>
              </div>

              {/* Chat History */}
              <div style={{ flex: 1, padding: '2rem', background: 'var(--background)', overflowY: 'auto', minHeight: '400px' }}>
                {chatLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <Loader2 className="animate-spin" />
                  </div>
                ) : chatHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', py: 10, opacity: 0.5 }}>
                    No messages yet. Send a response to begin.
                  </div>
                ) : (
                  chatHistory.map((msg) => (
                    <div key={msg.id} className={`chat-message-row ${msg.sender_role === 'doctor' ? 'chat-message-right' : ''}`}>
                      {msg.sender_role === 'patient' && (
                        <div className="chat-avatar-circle chat-avatar-primary" style={{ width: '32px', height: '32px', fontSize: '0.875rem', flexShrink: 0 }}>
                          {selectedPatientData?.full_name?.charAt(0) || 'P'}
                        </div>
                      )}
                      <div className={msg.sender_role === 'doctor' ? 'chat-bubble-doctor' : 'chat-bubble-patient'}>
                        <p style={{ margin: 0 }}>{msg.message}</p>
                        <div style={{ fontSize: '0.75rem', color: msg.sender_role === 'doctor' ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)', marginTop: '0.5rem' }}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="chatbot-input-area" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                <form onSubmit={handleSend} className="chatbot-input-form">
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Type your clinical response here..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{ flex: 1 }}
                    required
                    disabled={sending}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }} disabled={sending || !message.trim()}>
                    {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="empty-state-view" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', py: 20 }}>
              <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>Select a patient conversation to begin replying.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ReplyToQueries;
