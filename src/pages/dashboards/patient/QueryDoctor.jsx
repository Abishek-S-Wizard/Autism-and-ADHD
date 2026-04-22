import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send, Loader2 } from 'lucide-react';
import '../../../styles/queryDoctor.css';

import { supabase } from '../../../lib/supabase';

const QueryDoctor = () => {
  const [message, setMessage] = useState('');
  const [doctor, setDoctor] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const initChat = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        
        if (!user) throw new Error("Please log in to contact your doctor.");

        // 1. Get assigned doctor mapping (Confirmed two-step logic)
        const { data: mappingData, error: mappingError } = await supabase
          .from('doctor_patient_mappings')
          .select('doctor_id')
          .eq('patient_id', user.id)
          .maybeSingle();

        if (mappingError) throw mappingError;

        if (!mappingData) {
          setError("You don't have an assigned doctor yet. Please wait for an administrator to assign a doctor to you.");
          setLoading(false);
          return;
        }

        // 2. Fetch Doctor details separately
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('*')
          .eq('id', mappingData.doctor_id)
          .single();

        if (doctorError) throw doctorError;
        setDoctor(doctorData);

        // 3. VERIFY PATIENT PROFILE EXISTS (Critical for foreign key)
        const { data: patientProfile } = await supabase
          .from('patients')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        
        if (!patientProfile) {
          setError(`CRITICAL ERROR: Your account (ID: ${user.id}) is missing from the database. Please contact Admin.`);
          return;
        }

        // 4. Get chat history
        const { data: history, error: historyError } = await supabase
          .from('doctor_patient_queries')
          .select('*')
          .eq('patient_id', user.id)
          .eq('doctor_id', mappingData.doctor_id) // Use the ID from mapping
          .order('created_at', { ascending: true });

        if (historyError) throw historyError;
        setChatHistory(history || []);
        setTimeout(scrollToBottom, 100);

      } catch (err) {
        console.error('Chat error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    // 4. REAL-TIME SUBSCRIPTION
    const channel = supabase
      .channel('doctor_patient_queries_realtime')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'doctor_patient_queries'
      }, (payload) => {
        const newMsg = payload.new;
        // Only add if it's for this chat and we don't have it yet
        setChatHistory(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          
          // Re-verify IDs inside the setter to ensure we have latest state context
          // Since this is a simple patient-doctor chat, if the message involves both, it's likely for this chat.
          return [...prev, newMsg];
        });
        setTimeout(scrollToBottom, 50);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); 

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending || !doctor) return;

    try {
      setSending(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User session not found.");

      const newMessage = {
        patient_id: user.id,
        doctor_id: doctor.id,
        sender_role: 'patient',
        message: message.trim()
      };

      console.log("DEBUG: Sending message:", newMessage);

      const { data, error: sendError } = await supabase
        .from('doctor_patient_queries')
        .insert([newMessage])
        .select()
        .single();

      if (sendError) {
        console.error("DEBUG: Send error:", sendError);
        throw new Error(sendError.message);
      }

      setChatHistory([...chatHistory, data]);
      setMessage('');
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      console.error("DEBUG: Detailed Send Error:", err);
      alert(`Failed to send message: ${err.message}\n\nDEBUG INFO:\nPatient ID: ${user?.id}\nDoctor ID: ${doctor?.id}`);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="query-container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="query-container animate-fade-in">
      <Link to="/patient" className="query-back-button">
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>
      
      <div className="query-header">
        <h1 className="query-title">Query Doctor</h1>
        <p className="query-subtitle">
          {doctor 
            ? `Send direct queries to ${doctor.full_name}. Your doctor will respond to clinical questions within 24-48 business hours.`
            : "Direct communication with your healthcare provider."}
        </p>
        {currentUser && (
          <div>     
          </div>
        )}
      </div>

      {error && (
        <div className="card" style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444' }}>
          <p style={{ color: '#ef4444', margin: 0 }}>{error}</p>
        </div>
      )}

      {doctor && (
        <div className="query-chat-card">
          <div className="query-history">
            <div className="chat-system-info">
              Consultation with {doctor.full_name}
            </div>
            
            {chatHistory.length === 0 ? (
              <div style={{ textAlign: 'center', py: 8, opacity: 0.5 }}>
                No messages yet. Start the conversation below.
              </div>
            ) : (
              chatHistory.map((msg) => (
                <div key={msg.id} className={`message-row ${msg.sender_role === 'patient' ? 'message-row-user' : ''}`}>
                  <div className={`message-avatar ${msg.sender_role === 'patient' ? 'avatar-patient' : 'avatar-doctor'}`}>
                    {msg.sender_role === 'patient' ? 'PT' : 'DOC'}
                  </div>
                  <div className={`message-bubble ${msg.sender_role === 'patient' ? 'bubble-patient' : 'bubble-doctor'}`}>
                    <p style={{ margin: 0 }}>{msg.message}</p>
                    <div className="message-time">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="query-input-area">
            <form onSubmit={handleSend} className="query-input-form">
              <input 
                type="text" 
                className="query-text-input" 
                placeholder="Type your clinical question..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={sending}
              />
              <button type="submit" className="query-send-btn" disabled={!message.trim() || sending}>
                {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryDoctor;
