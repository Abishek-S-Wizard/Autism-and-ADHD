import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Database, Check, X, Edit, Trash2, Search } from 'lucide-react';
import '../../../styles/adminModule.css';
import '../../../styles/dataTable.css';
import '../../../styles/cards.css';

import { supabase } from '../../../lib/supabase';

const ResearchManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResearchers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('researchers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching researchers:', error);
      setError(error.message);
    } else {
      setResearchers(data || []);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResearchers();
  }, []);

  const handleAction = async (id, action) => {
    if (action === 'delete') {
      if (window.confirm('Are you sure you want to completely delete this researcher instance? Data access will be revoked immediately.')) {
        const { error } = await supabase.from('researchers').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchResearchers();
      }
    } else if (action === 'approve') {
      const { error } = await supabase.from('researchers').update({ is_approved: true }).eq('id', id);
      if (error) alert(error.message);
      else fetchResearchers();
    } else if (action === 'reject') {
      const { error } = await supabase.from('researchers').update({ is_approved: false }).eq('id', id);
      if (error) alert(error.message);
      else fetchResearchers();
    }
  };

  const filtered = researchers.filter(r => 
    (r.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (r.institution?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (r.field?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-container animate-fade-in">
      <Link to="/admin" className="admin-back-link">
        <ArrowLeft size={18} /> Back to Admin Portal
      </Link>
      
      <div className="admin-header" style={{ marginBottom: '2rem' }}>
        <h1 className="admin-title">Research Management</h1>
        <p className="admin-subtitle">
          Manage institutional access to anonymized datasets.
        </p>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: '2rem', padding: '1rem', borderLeft: '4px solid #ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          <p style={{ color: '#ef4444', fontWeight: '500', margin: 0 }}>
            Error loading data: {error}
          </p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#666' }}>
            Note: Ensure your user ID is added to the <code>admins</code> table in Supabase to view these records.
          </p>
        </div>
      )}

      <div className="card" style={{ marginBottom: '2rem', padding: '1rem' }}>
        <div className="module-search-wrapper" style={{ margin: 0, width: '100%', maxWidth: 'none' }}>
          <Search size={18} className="module-search-icon" />
          <input 
            type="text" 
            placeholder="Search by name, institution or field..." 
            className="input-field module-search-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card table-container">
        <div className="table-responsive-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Researcher</th>
                <th>Academic Info</th>
                <th>Institution</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(res => (
                <tr key={res.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="font-semibold">{res.full_name}</span>
                      <span className="text-secondary" style={{ fontSize: '0.8rem' }}>ID: {res.id.substring(0, 8)} | {res.email}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="font-medium" style={{ color: 'var(--primary)' }}>{res.field}</span>
                      <span className="text-secondary" style={{ fontSize: '0.85rem' }}>{res.qualification}</span>
                      <span className="text-secondary" style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>Purpose: {res.purpose?.substring(0, 40)}...</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="font-semibold" style={{ color: 'var(--accent)' }}>{res.institution}</span>
                      <span className="text-secondary" style={{ fontSize: '0.85rem' }}>{res.department}</span>
                    </div>
                  </td>
                  <td className="text-secondary">{new Date(res.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${res.is_approved ? 'status-approved' : 'status-pending'}`}>
                      {res.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="action-cell">
                    {!res.is_approved && (
                      <button onClick={() => handleAction(res.id, 'approve')} className="action-btn action-approve" title="Approve">
                        <Check size={16} />
                      </button>
                    )}
                    {res.is_approved && (
                      <button onClick={() => handleAction(res.id, 'reject')} className="action-btn action-reject" title="Revoke Approval">
                        <X size={16} />
                      </button>
                    )}
                    <button onClick={() => handleAction(res.id, 'delete')} className="action-btn action-delete" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="table-empty-state">
                    {loading ? 'Fetching records...' : 'No researchers found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResearchManagement;
