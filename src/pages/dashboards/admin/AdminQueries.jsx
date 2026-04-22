import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Reply, User, Activity, Database, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import '../../../styles/adminModule.css';
import '../../../styles/adminQueries.css';
import '../../../styles/cards.css';
import '../../../styles/buttons.css';

const AdminQueries = () => {
  const [activeTab, setActiveTab] = useState('doctors');
  const [replyText, setReplyText] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_queries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter(t => 
    t.sender_role === (activeTab === 'doctors' ? 'doctor' : 'researcher')
  );

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    try {
      const { error } = await supabase
        .from('admin_queries')
        .update({ 
          reply_message: replyText,
          status: 'Resolved'
        })
        .eq('id', selectedTicket.id);

      if (error) throw error;

      alert(`Reply successfully sent to ${selectedTicket.sender_name}.`);
      setReplyText('');
      setSelectedTicket(null);
      fetchTickets();
    } catch (err) {
      console.error('Error updating ticket:', err);
      alert('Failed to update ticket: ' + err.message);
    }
  };

  return (
    <div className="admin-container animate-fade-in">
      <Link to="/admin" className="admin-back-link">
        <ArrowLeft size={18} /> Back to Admin Portal
      </Link>
      
      <div className="admin-header">
        <h1 className="admin-title">Support Queries</h1>
        <p className="admin-subtitle">
          Resolve staff technical and administrative tickets from the centralized dashboard.
        </p>
      </div>

      <div className="queries-layout-grid">
        
        {/* Ticket List Sidebar */}
        <div className="card ticket-sidebar">
          
          {/* Tabs */}
          <div className="ticket-tabs">
            <button 
              onClick={() => {setActiveTab('doctors'); setSelectedTicket(null);}}
              className={`ticket-tab-btn ${activeTab === 'doctors' ? 'active' : ''}`}
            >
              <Activity size={18} /> Doctors
            </button>
            <button 
              onClick={() => {setActiveTab('researchers'); setSelectedTicket(null);}}
              className={`ticket-tab-btn ${activeTab === 'researchers' ? 'active' : ''}`}
            >
              <Database size={18} /> Researchers
            </button>
          </div>

          <div className="ticket-list">
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.6 }}>
                <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 1rem' }} />
                <p>Syncing tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                <AlertCircle size={32} style={{ margin: '0 auto 1rem' }} />
                <p>No tickets found</p>
              </div>
            ) : (
              filteredTickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  onClick={() => setSelectedTicket(ticket)}
                  className={`ticket-item ${selectedTicket?.id === ticket.id ? 'active' : ''}`}
                >
                  <div className="ticket-item-header">
                    <span className="ticket-sender">{ticket.sender_name}</span>
                    <span className="ticket-date">{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="ticket-subject">
                     {ticket.status === 'Open' ? (
                       <span className="status-dot open"></span>
                     ) : (
                       <CheckCircle2 size={14} color="#10B981" />
                     )}
                     {ticket.subject}
                  </div>
                  <p className="ticket-preview">{ticket.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ticket Detail / Reply Area */}
        <div className="card ticket-detail-area">
          {selectedTicket ? (
            <>
              <div className="ticket-detail-header">
                <div className="ticket-meta-top">
                  <span className="ticket-id-badge">ID: {selectedTicket.id.substring(0, 8)}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Recieved: {new Date(selectedTicket.created_at).toLocaleString()}
                  </span>
                </div>
                <h2 className="ticket-detail-title">{selectedTicket.subject}</h2>
                <div className="ticket-meta-bottom">
                  <User size={16} /> From: <span className="ticket-sender-name">{selectedTicket.sender_name}</span>
                  <span style={{ margin: '0 0.5rem' }}>•</span>
                  Status: <span className={selectedTicket.status === 'Open' ? 'ticket-status-open' : 'ticket-status-resolved'}>{selectedTicket.status}</span>
                </div>
              </div>

              <div className="ticket-message-body">
                <div className="ticket-message-content" style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedTicket.message}
                </div>
                {selectedTicket.reply_message && (
                  <div className="admin-reply-bubble" style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(57, 107, 255, 0.05)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Reply size={14} /> ADMIN RESPONSE
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{selectedTicket.reply_message}</p>
                  </div>
                )}
              </div>

              {selectedTicket.status === 'Open' && (
                <div className="ticket-reply-area" style={{ borderTop: '1px solid var(--border)', padding: '2rem' }}>
                  <form onSubmit={handleReply}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>System Response</label>
                    <textarea 
                      className="input-field reply-textarea" 
                      rows="4" 
                      placeholder="Enter resolution notes for the user..." 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      required
                    ></textarea>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                      <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                        <Reply size={18} /> Send & Resolve
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="empty-ticket-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
              <MessageSquare size={64} style={{ marginBottom: '1.5rem' }} />
              <p style={{ fontSize: '1.1rem' }}>Select a ticket to begin resolution</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminQueries;
