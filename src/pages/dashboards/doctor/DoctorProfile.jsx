import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserCircle, Save, Loader2 } from 'lucide-react';
import '../../../styles/doctorModule.css';
import '../../../styles/doctorProfile.css';
import '../../../styles/cards.css';
import '../../../styles/buttons.css';

import { supabase } from '../../../lib/supabase';

const DoctorProfile = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    reg_number: '',
    specialization: '',
    experience: '',
    qualification: '',
    hospital: '',
    city: ''
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
          .from('doctors')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (data) {
          setFormData({
            full_name: data.full_name || '',
            email: data.email || user.email || '',
            reg_number: data.reg_number || '',
            specialization: data.specialization || '',
            experience: data.experience?.toString() || '',
            qualification: data.qualification || '',
            hospital: data.hospital || '',
            city: data.city || ''
          });
        } else {
          setFormData(prev => ({
            ...prev,
            email: user.email || ''
          }));
        }
      } catch (err) {
        console.error('Error fetching doctor profile:', err);
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
        id: user.id,
        full_name: formData.full_name,
        email: user.email,
        specialization: formData.specialization,
        experience: parseInt(formData.experience) || 0,
        qualification: formData.qualification,
        hospital: formData.hospital,
        city: formData.city
      };

      const { error: updateError } = await supabase
        .from('doctors')
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
      
      <div className="doctor-header" style={{ marginBottom: '2rem' }}>
        <h1 className="doctor-title">Profile Management</h1>
        <p className="doctor-subtitle">
          Professional and clinical information.
        </p>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444' }}>
          <p style={{ color: '#ef4444', margin: 0 }}>Error: {error}</p>
        </div>
      )}

      {success && (
        <div className="card" style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981' }}>
          <p style={{ color: '#10b981', margin: 0 }}>Profile and settings updated successfully!</p>
        </div>
      )}

      <div className="card profile-form-area" style={{ margin: '0 auto' }}>
        <form onSubmit={handleSubmit} className="profile-form-container">
          
          <section>
            <h3 className="profile-section-header">Account Details</h3>
            <div className="profile-input-grid">
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="input-field" required />
              </div>
              <div className="input-group">
                <label>Professional Email</label>
                <input type="email" name="email" value={formData.email} className="input-field input-disabled" disabled />
              </div>
            </div>
          </section>

          <section>
            <h3 className="profile-section-header">Professional Information</h3>
            <div className="profile-input-grid-auto">
              <div className="input-group">
                <label>Medical Reg. Number</label>
                <input type="text" name="reg_number" value={formData.reg_number} className="input-field input-disabled" disabled />
              </div>
              <div className="input-group">
                <label>Specialization</label>
                <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} className="input-field" required />
              </div>
              <div className="input-group">
                <label>Qualification</label>
                <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} className="input-field" required />
              </div>
              <div className="input-group">
                <label>Experience (Years)</label>
                <input type="number" name="experience" value={formData.experience} onChange={handleChange} className="input-field" required />
              </div>
            </div>
          </section>

          <section>
            <h3 className="profile-section-header">Practice Details</h3>
            <div className="profile-input-grid">
              <div className="input-group">
                <label>Hospital / Clinic Name</label>
                <input type="text" name="hospital" value={formData.hospital} onChange={handleChange} className="input-field" required />
              </div>
              <div className="input-group">
                <label>City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="input-field" required />
              </div>
            </div>
          </section>

          <section>
            <h3 className="profile-section-header">Security & Password</h3>
            <div className="profile-input-grid">
              <div className="input-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  name="newPassword" 
                  value={passwords.newPassword} 
                  onChange={handlePasswordChange} 
                  className="input-field" 
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div className="input-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={passwords.confirmPassword} 
                  onChange={handlePasswordChange} 
                  className="input-field" 
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </section>

          <div className="profile-form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#3B82F6' }}>
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Update Profile & Password'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default DoctorProfile;
