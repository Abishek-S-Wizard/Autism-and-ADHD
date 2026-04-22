import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Phone, Building, Save } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import '../../../styles/adminProfile.css';

const AdminProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'Admin'
  });
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile, error } = await supabase
        .from('admins')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profile) {
        setFormData({
          name: profile.full_name || '',
          email: profile.email || user.email,
          phone: profile.phone_number || '',
          password: profile.password || '',
          role: profile.is_super_admin ? 'Super Admin' : 'Admin'
        });
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('admins')
        .update({ 
          full_name: formData.name,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone
        })
        .eq('id', user.id);
      
      if (error) alert(error.message);
      else alert('Administrator profile updated successfully.');
    }
  };

  return (
    <div className="admin-container animate-fade-in">
      <Link to="/admin" className="admin-back-link" style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
        <ArrowLeft size={18} /> Back to Admin Portal
      </Link>
      
      <div className="admin-header" style={{ marginBottom: '3rem' }}>
        <h1 className="admin-title" style={{ fontSize: '2.5rem', fontWeight: '800' }}>Admin Settings</h1>
        <p className="admin-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Manage your root account credentials and system privileges.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <div className="loading-spinner"></div>
          <p>Loading your administrator profile...</p>
        </div>
      ) : (
      <div className="profile-layout-grid">
        {/* Form Area */}
        <div className="card profile-form-area animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <form onSubmit={handleSubmit} className="profile-form-container">
            
            <section>
               <div className="profile-avatar-row">
                 <div className="profile-avatar-circle">
                   {formData.name ? formData.name.charAt(0).toUpperCase() : 'A'}
                 </div>
                 <div>
                   <h2 className="profile-avatar-name">{formData.name || 'Administrator'}</h2>
                   <div className="profile-root-badge">
                     <Lock size={12} style={{ marginRight: '0.4rem' }} />
                     ROOT ACCESS
                   </div>
                 </div>
               </div>

              <h3 className="profile-section-header">
                <User size={18} /> Account Identity
              </h3>
              <div className="profile-input-grid">
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="Enter full name" required />
                </div>
                <div className="input-group">
                  <label>Administrator Role</label>
                  <input type="text" name="role" value={formData.role} className="input-field" disabled />
                </div>
                <div className="input-group">
                  <label>Registered Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" placeholder="admin@example.com" required />
                </div>
                <div className="input-group">
                  <label>System Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} className="input-field" placeholder="••••••••" />
                </div>
                <div className="input-group">
                  <label>Recovery Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            </section>

            <div className="profile-form-actions">
              <button type="submit" className="btn-primary btn-dark">
                <Save size={18} />
                Save Changes
              </button>
            </div>

          </form>
        </div>
      </div>
      )}
    </div>
  );
};

export default AdminProfile;
