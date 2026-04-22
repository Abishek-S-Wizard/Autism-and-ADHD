import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserCircle, Save, Loader2 } from 'lucide-react';
import '../../../styles/researchModule.css';
import '../../../styles/researcherProfile.css';
import '../../../styles/cards.css';
import '../../../styles/buttons.css';

import { supabase } from '../../../lib/supabase';

const ResearcherProfile = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    field: '',
    qualification: '',
    institution: '',
    department: '',
    purpose: ''
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
        
        if (!user) throw new Error("No authenticated user found");

        const { data, error: profileError } = await supabase
          .from('researchers')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (data) {
          setFormData({
            full_name: data.full_name || '',
            email: data.email || user.email || '',
            field: data.field || '',
            qualification: data.qualification || '',
            institution: data.institution || '',
            department: data.department || '',
            purpose: data.purpose || ''
          });
        } else {
          setFormData(prev => ({
            ...prev,
            email: user.email || ''
          }));
        }
      } catch (err) {
        console.error('Error fetching researcher profile:', err);
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

      // 1. Update/Upsert Researcher Data
      const profilePayload = {
        id: user.id,
        full_name: formData.full_name,
        email: user.email,
        field: formData.field,
        qualification: formData.qualification,
        institution: formData.institution,
        department: formData.department,
        purpose: formData.purpose
      };

      const { error: updateError } = await supabase
        .from('researchers')
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
      <div className="research-container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 className="animate-spin" size={48} color="var(--accent)" />
      </div>
    );
  }

  return (
    <div className="research-container animate-fade-in">
      <Link to="/researcher" className="research-back-link">
        <ArrowLeft size={18} /> Back to Research Portal
      </Link>
      
      <div className="research-header">
        <h1 className="research-title">Profile Management</h1>
        <p className="research-subtitle">
          Institutional details and academic credentials.
        </p>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444' }}>
          <p style={{ color: '#ef4444', margin: 0 }}>Error: {error}</p>
        </div>
      )}

      {success && (
        <div className="card" style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid var(--accent)' }}>
          <p style={{ color: 'var(--accent)', margin: 0 }}>Profile and settings updated successfully!</p>
        </div>
      )}

      <div className="card researcher-form-area" style={{ margin: '0 auto' }}>
        <form onSubmit={handleSubmit} className="researcher-form-container">
          
          <section>
            <h3 className="researcher-section-header">Account Details</h3>
            <div className="researcher-input-grid">
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="input-field" required />
              </div>
              <div className="input-group">
                <label>Institutional Email</label>
                <input type="email" name="email" value={formData.email} className="input-field researcher-input-disabled" disabled />
              </div>
            </div>
          </section>

          <section>
            <h3 className="researcher-section-header">Academic Information</h3>
            <div className="researcher-input-grid">
              <div className="input-group">
                <label>Qualification</label>
                <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} className="input-field" required />
              </div>
              <div className="input-group">
                <label>Primary Research Field</label>
                <input type="text" name="field" value={formData.field} onChange={handleChange} className="input-field" required />
              </div>
              <div className="input-group researcher-input-full">
                <label>Research Purpose</label>
                <textarea 
                  name="purpose" 
                  value={formData.purpose} 
                  onChange={handleChange} 
                  className="input-field" 
                  rows="3" 
                  required
                ></textarea>
              </div>
            </div>
          </section>

          <section>
            <h3 className="researcher-section-header">Institutional Affiliation</h3>
            <div className="researcher-input-grid">
              <div className="input-group">
                <label>University / Research Center</label>
                <input type="text" name="institution" value={formData.institution} onChange={handleChange} className="input-field" required />
              </div>
              <div className="input-group">
                <label>Department</label>
                <input type="text" name="department" value={formData.department} onChange={handleChange} className="input-field" required />
              </div>
            </div>
          </section>

          <section>
            <h3 className="researcher-section-header">Security & Password</h3>
            <div className="researcher-input-grid">
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

          <div className="researcher-form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent)' }}>
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ResearcherProfile;
