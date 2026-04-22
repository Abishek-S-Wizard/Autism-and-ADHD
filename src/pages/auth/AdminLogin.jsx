import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import '../../styles/authForms.css';
import '../../styles/buttons.css';

import { supabase } from '../../lib/supabase';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // Verify they exist in the admins table
      const { data: adminProfile, error: profileError } = await supabase
        .from('admins')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();
      
      if (profileError) throw profileError;
      if (!adminProfile) {
        await supabase.auth.signOut();
        throw new Error('Unauthorized Access. Not an administrator account.');
      }

      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-card">
      <Link to="/login" className="auth-back-link">
        <ArrowLeft size={18} /> Back to Roles
      </Link>
      
      <div className="auth-form-header">
        <div className="auth-icon-wrapper">
          <Shield size={32} />
        </div>
        <h2 className="auth-form-title">Administrator Login</h2>
        <p className="auth-form-subtitle">Secure system administration hub</p>
      </div>

      {error && <div className="auth-error-message" style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form" style={{ gap: '1.5rem' }}>
        <div className="input-group">
          <label>Admin Email</label>
          <input type="email" name="email" className="input-field" placeholder="admin@autism-adhd.ai" required onChange={handleChange} />
        </div>

        <div className="input-group">
          <label>Security Key / Password</label>
          <div style={{ position: 'relative' }}>
            <input type="password" name="password" className="input-field" placeholder="••••••••" required onChange={handleChange} />
            <div className="auth-password-toggle" style={{ pointerEvents: 'none', top: '0.8rem' }}>
              <Lock size={18} />
            </div>
          </div>
        </div>

        <button type="submit" className="btn-full btn-auth-admin" style={{ marginTop: '0.5rem' }} disabled={loading}>
          {loading ? 'Authenticating...' : 'Authenticate'} <ArrowRight size={22} />
        </button>
      </form>

      <div className="auth-footer-text" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
        <Lock size={14} /> End-to-end encrypted connection
      </div>
    </div>
  );
};

export default AdminLogin;
