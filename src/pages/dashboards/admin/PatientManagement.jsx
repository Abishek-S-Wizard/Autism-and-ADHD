import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Check, X, Edit, Trash2, Search } from 'lucide-react';
import '../../../styles/adminModule.css';
import '../../../styles/dataTable.css';
import '../../../styles/cards.css';

import { supabase } from '../../../lib/supabase';

const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPatients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching patients:', error);
      setError(error.message);
    } else {
      setPatients(data || []);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleAction = async (id, action) => {
    if (action === 'delete') {
      if (window.confirm('Are you sure you want to completely delete this patient record?')) {
        const { error } = await supabase.from('patients').delete().eq('id', id);
        if (error) alert(error.message);
        else fetchPatients();
      }
    } else if (action === 'approve') {
      const { error } = await supabase.from('patients').update({ is_approved: true }).eq('id', id);
      if (error) alert(error.message);
      else fetchPatients();
    } else if (action === 'reject') {
      const { error } = await supabase.from('patients').update({ is_approved: false }).eq('id', id);
      if (error) alert(error.message);
      else fetchPatients();
    }
  };

  const filtered = patients.filter(p => 
    (p.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (p.id?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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
        <h1 className="admin-title">Patient Management</h1>
        <p className="admin-subtitle">
          Review, approve, and manage all patient accounts.
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
            placeholder="Search by name or ID..." 
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
                <th>Patient Details</th>
                <th>Caregiver/Account</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(patient => (
                <tr key={patient.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="font-semibold">{patient.full_name}</span>
                      <span className="text-secondary" style={{ fontSize: '0.8rem' }}>ID: {patient.id.substring(0, 8)}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="font-medium">{patient.patient_name}</span>
                      <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
                        {patient.gender} • {new Date().getFullYear() - new Date(patient.dob).getFullYear()} yrs
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="text-primary" style={{ fontSize: '0.9rem' }}>{patient.email}</span>
                      {patient.guardian_name && (
                        <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                          Guard: {patient.guardian_name} ({patient.relationship})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-secondary">{new Date(patient.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${patient.is_approved ? 'status-approved' : 'status-pending'}`}>
                      {patient.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="action-cell">
                    {!patient.is_approved && (
                      <button onClick={() => handleAction(patient.id, 'approve')} className="action-btn action-approve" title="Approve">
                        <Check size={16} />
                      </button>
                    )}
                    {patient.is_approved && (
                      <button onClick={() => handleAction(patient.id, 'reject')} className="action-btn action-reject" title="Revoke Approval">
                        <X size={16} />
                      </button>
                    )}
                    <button onClick={() => handleAction(patient.id, 'delete')} className="action-btn action-delete" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="table-empty-state">
                    No patients found.
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

export default PatientManagement;
