import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Network, Link as LinkIcon, Users, UserPlus, Trash2, Loader2 } from 'lucide-react';
import '../../../styles/adminModule.css';
import '../../../styles/dataTable.css';
import '../../../styles/cards.css';
import '../../../styles/buttons.css';

import { supabase } from '../../../lib/supabase';

const DoctorPatientMapping = () => {
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [mappings, setMappings] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Approved Patients
      const { data: pData, error: pError } = await supabase
        .from('patients')
        .select('id, full_name, patient_name')
        .order('full_name');
      
      if (pError) throw pError;
      setPatients(pData || []);

      // 2. Fetch Approved Doctors
      const { data: dData, error: dError } = await supabase
        .from('doctors')
        .select('id, full_name, specialization')
        .order('full_name');
      
      if (dError) throw dError;
      setDoctors(dData || []);

      // 3. Fetch Existing Mappings with Joined Data
      const { data: mData, error: mError } = await supabase
        .from('doctor_patient_mappings')
        .select(`
          id,
          doctor:doctors(full_name, specialization),
          patient:patients(full_name, patient_name)
        `); 

      if (mError) {
         console.warn("Retrying with created_at...");
         const { data: mData2, error: mError2 } = await supabase
          .from('doctor_patient_mappings')
          .select(`
            id,
            doctor:doctors(full_name, specialization),
            patient:patients(full_name, patient_name)
          `);
         if (mError2) throw mError2;
         setMappings(mData2 || []);
      } else {
        setMappings(mData || []);
      }

    } catch (err) {
      console.error('Error fetching mapping data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (selectedDoctor && selectedPatient) {
      try {
        setLoading(true);
        const { error: assignError } = await supabase
          .from('doctor_patient_mappings')
          .insert({
            doctor_id: selectedDoctor,
            patient_id: selectedPatient
          });

        if (assignError) {
          if (assignError.code === '23505') {
            throw new Error('This patient is already assigned to this doctor.');
          }
          throw assignError;
        }

        setSelectedDoctor('');
        setSelectedPatient('');
        await fetchData();
        alert('Patient successfully linked to doctor.');
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRemoveMapping = async (id) => {
    if (window.confirm('Are you sure you want to decouple this patient from this doctor?')) {
      try {
        setLoading(true);
        const { error: deleteError } = await supabase
          .from('doctor_patient_mappings')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;
        await fetchData();
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter out patients who are already assigned to someone (Optional, depending on business logic)
  // For now, we'll show all approved patients in the dropdown
  const availablePatients = patients;

  return (
    <div className="admin-container animate-fade-in">
      <Link to="/admin" className="admin-back-link">
        <ArrowLeft size={18} /> Back to Admin Portal
      </Link>
      
      <div className="admin-header">
        <h1 className="admin-title">Doctor-Patient Mapping</h1>
        <p className="admin-subtitle">
          Assign patients to clinical specialists for formal review.
        </p>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444' }}>
          <p style={{ color: '#ef4444', margin: 0 }}>Error: {error}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Assignment Form */}
        <div className="card" style={{ padding: '2rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={20} color="var(--primary)" /> Create Assignment
          </h3>
          
          <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="input-group">
              <label>Select Patient</label>
              <select className="input-field" value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)} required disabled={loading}>
                <option value="">-- Choose Patient --</option>
                {availablePatients.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name} ({p.patient_name})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              <LinkIcon size={24} style={{ opacity: 0.3 }} />
            </div>

            <div className="input-group">
              <label>Assign to Doctor</label>
              <select className="input-field" value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} required disabled={loading}>
                <option value="">-- Choose Clinical Specialist --</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.full_name} ({d.specialization})</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Network size={18} />}
              {loading ? 'Processing...' : 'Link Patient to Doctor'}
            </button>
          </form>
        </div>

        {/* Current Mappings Table */}
        <div className="card table-container">
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Users size={20} /> Active Assignments
             </h3>
             <span className="status-badge status-approved">Total: {mappings.length}</span>
          </div>
          
          <div className="table-responsive-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Assigned Doctor</th>
                  <th>Date Linked</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map(map => (
                  <tr key={map.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="font-semibold">{map.patient?.full_name}</span>
                        <span className="text-secondary" style={{ fontSize: '0.7rem' }}>PT ID: <strong style={{ color: '#fff' }}>{map.patient_id}</strong></span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="font-semibold" style={{ color: 'var(--primary)' }}>{map.doctor?.full_name}</span>
                        <span className="text-secondary" style={{ fontSize: '0.7rem' }}>DOC ID: <strong style={{ color: '#fff' }}>{map.doctor_id}</strong></span>
                      </div>
                    </td>
                    <td className="text-secondary">{new Date(map.assigned_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleRemoveMapping(map.id)} 
                        disabled={loading}
                        className="action-btn action-reject" 
                        title="Unlink Account"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {mappings.length === 0 && (
                  <tr>
                    <td colSpan="4" className="table-empty-state">
                      {loading ? 'Loading mappings...' : 'No active assignments found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DoctorPatientMapping;
