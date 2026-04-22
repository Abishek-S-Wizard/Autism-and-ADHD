import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Activity, Check, X, Edit, Trash2, Search } from 'lucide-react';
import '../../../styles/adminModule.css';
import '../../../styles/dataTable.css';
import '../../../styles/cards.css';

import { supabase } from '../../../lib/supabase';

const DoctorManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDoctors(data || []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAction = async (id, action) => {
    if (action === 'delete') {
      if (window.confirm('Are you sure you want to completely delete this doctor record?')) {
        const { error } = await supabase.from('doctors').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchDoctors();
      }
    } else if (action === 'approve') {
      const { error } = await supabase.from('doctors').update({ is_approved: true }).eq('id', id);
      if (error) alert(error.message);
      else fetchDoctors();
    } else if (action === 'reject') {
      const { error } = await supabase.from('doctors').update({ is_approved: false }).eq('id', id);
      if (error) alert(error.message);
      else fetchDoctors();
    }
  };

  const filtered = doctors.filter(d => 
    (d.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (d.reg_number?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const getStatusClass = (status) => {
    switch (status) {
      case 'Approved': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  return (
    <div className="admin-container animate-fade-in">
      <Link to="/admin" className="admin-back-link">
        <ArrowLeft size={18} /> Back to Admin Portal
      </Link>
      
      <div className="admin-header" style={{ marginBottom: '2rem' }}>
        <h1 className="admin-title">Doctor Management</h1>
        <p className="admin-subtitle">
          Verify credentials and manage professional accounts.
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span className="status-badge status-approved">Total Records: {doctors.length}</span>
          <button onClick={fetchDoctors} className="action-btn action-approve" style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem' }}>
            Refresh List
          </button>
        </div>
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
            placeholder="Search by name or Reg No..." 
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
                <th>Profile</th>
                <th>Professional Info</th>
                <th>Workplace</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="font-semibold">{doc.full_name}</span>
                      <span className="text-secondary" style={{ fontSize: '0.8rem' }}>ID: {doc.id.substring(0, 8)} | {doc.email}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="font-medium" style={{ color: 'var(--secondary)' }}>{doc.specialization}</span>
                      <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
                        {doc.qualification} • {doc.experience} yrs exp
                      </span>
                      <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>Reg No: {doc.reg_number}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="font-medium">{doc.hospital}</span>
                      <span className="text-secondary" style={{ fontSize: '0.85rem' }}>{doc.city}</span>
                    </div>
                  </td>
                  <td className="text-secondary">{new Date(doc.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${doc.is_approved ? 'status-approved' : 'status-pending'}`}>
                      {doc.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="action-cell">
                    {!doc.is_approved && (
                      <button onClick={() => handleAction(doc.id, 'approve')} className="action-btn action-approve" title="Approve">
                        <Check size={16} />
                      </button>
                    )}
                    {doc.is_approved && (
                      <button onClick={() => handleAction(doc.id, 'reject')} className="action-btn action-reject" title="Revoke Approval">
                        <X size={16} />
                      </button>
                    )}
                    <button onClick={() => handleAction(doc.id, 'delete')} className="action-btn action-delete" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="table-empty-state">
                    {loading ? 'Fetching records...' : 'No doctors found.'}
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

export default DoctorManagement;
