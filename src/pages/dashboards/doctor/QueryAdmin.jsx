import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, MessageSquare, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import '../../../styles/doctorModule.css';
import '../../../styles/cards.css';
import '../../../styles/buttons.css';

const QueryAdmin = () => {
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('admin_queries')
        .select('*')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQueries(data || []);
    } catch (err) {
      console.error('Error fetching queries:', err);
      setError('Failed to load query history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim() || sending) return;

    try {
      setSending(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get doctor name for reference
      const { data: doctor } = await supabase
        .from('doctors')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      const { error } = await supabase
        .from('admin_queries')
        .insert([{
          sender_id: user.id,
          sender_role: 'doctor',
          sender_name: doctor?.full_name || user.email,
          subject: formData.subject,
          message: formData.message,
          status: 'Open'
        }]);

      if (error) throw error;

      alert('Your query has been sent to the administrator.');
      setFormData({ subject: '', message: '' });
      fetchQueries();
    } catch (err) {
      console.error('Error sending query:', err);
      alert('Failed to send query: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="doctor-container animate-fade-in">
      <Link to="/doctor" className="doctor-back-link">
        <ArrowLeft size={18} /> Back to Doctor Portal
      </Link>
      
      <div className="doctor-header">
        <h1 className="doctor-title">Query to Administrator</h1>
        <p className="doctor-subtitle">
          Submit technical issues or administrative requests to the platform governance team.
        </p>
      </div>

      <div className="doctor-queries-grid" style={{ gridTemplateColumns: 'minmax(400px, 1fr) 1fr', gap: '2rem' }}>
        
        {/* New Query Form */}
        <div className="card animate-fade-in" style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MessageSquare size={20} color="var(--primary)" />
            New Support Ticket
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-group">
              <label>Subject</label>
              <input 
                type="text" 
                name="subject" 
                value={formData.subject} 
                onChange={handleChange} 
                className="input-field" 
                placeholder="Brief summary of your request" 
                required 
              />
            </div>
            
            <div className="input-group">
              <label>Detailed Message</label>
              <textarea 
                name="message" 
                value={formData.message} 
                onChange={handleChange} 
                className="input-field" 
                rows="6" 
                placeholder="Provide as much detail as possible..." 
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" disabled={sending} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem' }}>
              {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              Submit Query
            </button>
          </form>
        </div>

        {/* Query History */}
        <div className="card animate-fade-in" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clock size={20} color="var(--primary)" />
            Recent History
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 1rem' }} />
              <p>Loading records...</p>
            </div>
          ) : queries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
              <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
              <p>No query history found.</p>
            </div>
          ) : (
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {queries.map(q => (
                <div key={q.id} className="ticket-item" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{q.subject}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {new Date(q.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {q.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {q.status === 'Resolved' ? (
                      <span style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={14} /> Resolved
                      </span>
                    ) : (
                      <span style={{ color: '#EF4444', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span className="status-dot open"></span> Open
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default QueryAdmin;
