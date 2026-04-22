import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, MessageSquare, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import '../../../styles/researcherDashboard.css';
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
      
      // Get researcher name for reference
      const { data: researcher } = await supabase
        .from('researchers') // Assuming researchers table exists
        .select('full_name') // Using common field name
        .eq('id', user.id)
        .maybeSingle();

      const { error } = await supabase
        .from('admin_queries')
        .insert([{
          sender_id: user.id,
          sender_role: 'researcher',
          sender_name: researcher?.full_name || user.email,
          subject: formData.subject,
          message: formData.message,
          status: 'Open'
        }]);

      if (error) throw error;

      alert('Your inquiry has been submitted to the system administrator.');
      setFormData({ subject: '', message: '' });
      fetchQueries();
    } catch (err) {
      console.error('Error sending query:', err);
      alert('Failed to submit inquiry: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="researcher-container animate-fade-in">
      <Link to="/researcher" className="researcher-back-link" style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
        <ArrowLeft size={18} /> Back to Researcher Portal
      </Link>
      
      <div className="researcher-header" style={{ marginBottom: '2.5rem' }}>
        <h1 className="researcher-title">Inquiry to Administrator</h1>
        <p className="researcher-subtitle">
          Request dataset access expansions, API limit increases, or report platform bugs.
        </p>
      </div>

      <div className="researcher-grid" style={{ gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
        
        {/* New Query Form */}
        <div className="card animate-fade-in" style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MessageSquare size={20} color="var(--primary)" />
            New System Inquiry
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-group">
              <label>Inquiry Subject</label>
              <input 
                type="text" 
                name="subject" 
                value={formData.subject} 
                onChange={handleChange} 
                className="input-field" 
                placeholder="e.g. Dataset access for Q3 branch" 
                required 
              />
            </div>
            
            <div className="input-group">
              <label>Reasoning & Context</label>
              <textarea 
                name="message" 
                value={formData.message} 
                onChange={handleChange} 
                className="input-field" 
                rows="6" 
                placeholder="Explain the technical or research need..." 
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" disabled={sending} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem' }}>
              {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              Submit to Admin
            </button>
          </form>
        </div>

        {/* Query History */}
        <div className="card animate-fade-in" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clock size={20} color="var(--primary)" />
            Inquiry Logs
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 1rem' }} />
              <p>Fetching logs...</p>
            </div>
          ) : queries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
              <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
              <p>No logged inquiries found.</p>
            </div>
          ) : (
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {queries.map(q => (
                <div key={q.id} className="ticket-item" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', background: 'var(--surface)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{q.subject}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {new Date(q.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {q.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {q.status === 'Resolved' ? (
                      <span style={{ color: '#10B981', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={14} /> Logged & Resolved
                      </span>
                    ) : (
                      <span style={{ color: '#EF4444', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span className="status-dot open" style={{ width: '6px', height: '6px' }}></span> Pending Review
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
