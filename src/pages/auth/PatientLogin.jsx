import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ArrowLeft, ArrowRight } from 'lucide-react';
import '../../styles/authForms.css';
import '../../styles/buttons.css';

import { supabase } from '../../lib/supabase';

const PatientLogin = () => {
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
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // Check for approval in patients table
      const { data: profile, error: profileError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        throw new Error('User profile not found. Please contact support.');
      }

      if (!profile.is_approved) {
        await supabase.auth.signOut();
        navigate('/pending-approval', { state: { role: 'Patient' } });
        return;
      }

      navigate('/patient');
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
          <User size={32} />
        </div>
        <h2 className="auth-form-title">Patient Login</h2>
        <p className="auth-form-subtitle">Access your health records and screening status</p>
      </div>

      {error && <div className="auth-error-message" style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="input-group">
          <label>Email Address</label>
          <input type="email" name="email" className="input-field" placeholder="patient@example.com" required onChange={handleChange} />
        </div>

        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label style={{ marginBottom: 0 }}>Password</label>
            <Link to="#" className="auth-footer-link" style={{ fontSize: '0.875rem', fontWeight: '500' }}>Forgot password?</Link>
          </div>
          <input type="password" name="password" className="input-field" placeholder="••••••••" required onChange={handleChange} />
        </div>

        <button type="submit" className="btn-full btn-auth-patient" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={22} />
        </button>
      </form>

      <div className="auth-footer-text">
        Don't have an account? <Link to="/register/patient" className="auth-footer-link">Create an account</Link>
      </div>
    </div>
  );
};

export default PatientLogin;
