import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserCircle, Save, Loader2 } from 'lucide-react';
import '../../../styles/patientProfile.css';

import { supabase } from '../../../lib/supabase';

const PatientProfile = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    patient_name: '',
    dob: '',
    gender: 'Male',
    guardian_name: '',
    relationship: ''
  });
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error("No user found");

        const { data, error: profileError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (data) {
          setFormData({
            full_name: data.full_name || '',
            email: data.email || user.email || '',
            patient_name: data.patient_name || '',
            dob: data.dob || '',
            gender: data.gender || 'Male',
            guardian_name: data.guardian_name || '',
            relationship: data.relationship || ''
          });
        } else {
          // Initialize with at least the email from Auth if no record exists yet
          setFormData(prev => ({
            ...prev,
            email: user.email || ''
          }));
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});
  const handlePasswordChange = (e) => setPasswords({...passwords, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User session not found");

      // 1. Update/Upsert Profile Data
      const profilePayload = {
        id: user.id, // Ensure ID is present for upsert
        full_name: formData.full_name,
        email: user.email, // Always keep email in sync from auth
        patient_name: formData.patient_name,
        dob: formData.dob,
        gender: formData.gender,
        guardian_name: formData.guardian_name,
        relationship: formData.relationship
      };

      const { error: updateError } = await supabase
        .from('patients')
        .upsert(profilePayload);

      if (updateError) throw updateError;

      // 2. Update Password if provided
      if (passwords.newPassword) {
        if (passwords.newPassword !== passwords.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (passwords.newPassword.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }

        const { error: pwError } = await supabase.auth.updateUser({
          password: passwords.newPassword
        });

        if (pwError) throw pwError;
        
        // Clear password fields on success
        setPasswords({ newPassword: '', confirmPassword: '' });
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="profile-container animate-fade-in">
      <Link to="/patient" className="profile-back-button">
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>
      
      <div className="profile-header">
        <h1 className="profile-title">Profile Management</h1>
        <p className="profile-subtitle">Manage your personal data, contact information, and caregiver details to ensure accurate clinical tracking.</p>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444' }}>
          <p style={{ color: '#ef4444', margin: 0 }}>{error}</p>
        </div>
      )}

      {success && (
        <div className="card" style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981' }}>
          <p style={{ color: '#10b981', margin: 0 }}>Profile and settings updated successfully!</p>
        </div>
      )}

      <div className="profile-card">
        <form onSubmit={handleSubmit} className="profile-form">
          <section>
            <h3 className="profile-section-title">Account Information</h3>
            <div className="profile-grid-2">
              <div className="profile-field">
                <label className="profile-label">Full Name (Primary User)</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="profile-input" required />
              </div>
              <div className="profile-field">
                <label className="profile-label">Email Address</label>
                <input type="email" name="email" value={formData.email} className="profile-input profile-input-readonly" disabled />
              </div>
            </div>
          </section>

          <section>
            <h3 className="profile-section-title">Patient Demographics</h3>
            <div className="profile-grid-3">
              <div className="profile-field">
                <label className="profile-label">Patient Name</label>
                <input type="text" name="patient_name" value={formData.patient_name} onChange={handleChange} className="profile-input" required />
              </div>
              <div className="profile-field">
                <label className="profile-label">Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="profile-input" required />
              </div>
              <div className="profile-field">
                <label className="profile-label">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="profile-input" required>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h3 className="profile-section-title">Guardian & Emergency Contact</h3>
            <div className="profile-grid-2">
              <div className="profile-field">
                <label className="profile-label">Guardian Name</label>
                <input type="text" name="guardian_name" value={formData.guardian_name} onChange={handleChange} className="profile-input" required />
              </div>
              <div className="profile-field">
                <label className="profile-label">Relationship</label>
                <input type="text" name="relationship" value={formData.relationship} onChange={handleChange} className="profile-input" required />
              </div>
            </div>
          </section>

          <section>
            <h3 className="profile-section-title">Security & Password</h3>
            <div className="profile-grid-2">
              <div className="profile-field">
                <label className="profile-label">New Password</label>
                <input 
                  type="password" 
                  name="newPassword" 
                  value={passwords.newPassword} 
                  onChange={handlePasswordChange} 
                  className="profile-input" 
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div className="profile-field">
                <label className="profile-label">Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={passwords.confirmPassword} 
                  onChange={handlePasswordChange} 
                  className="profile-input" 
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </section>

          <div className="profile-footer">
            <button type="submit" className="profile-save-btn" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Update Profile & Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientProfile;
