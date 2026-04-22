import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, ArrowRight } from 'lucide-react';
import '../../styles/authForms.css';
import '../../styles/buttons.css';

import { supabase } from '../../lib/supabase';

const ResearcherLogin = () => {
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

      // Check for approval in researchers table
      const { data: profile, error: profileError } = await supabase
        .from('researchers')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        throw new Error('Researcher profile not found. Please contact support.');
      }

      if (!profile.is_approved) {
        await supabase.auth.signOut();
        navigate('/pending-approval', { state: { role: 'Researcher' } });
        return;
      }

      navigate('/researcher');
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
          <BookOpen size={32} />
        </div>
        <h2 className="auth-form-title">Researcher Login</h2>
        <p className="auth-form-subtitle">Enter the academic dataset portal</p>
      </div>

      {error && <div className="auth-error-message" style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="input-group">
          <label>Institutional Email</label>
          <input type="email" name="email" className="input-field" placeholder="researcher@university.edu" required onChange={handleChange} />
        </div>

        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label style={{ marginBottom: 0 }}>Password</label>
            <Link to="#" className="auth-footer-link" style={{ fontSize: '0.875rem', fontWeight: '500' }}>Forgot password?</Link>
          </div>
          <input type="password" name="password" className="input-field" placeholder="••••••••" required onChange={handleChange} />
        </div>

        <button type="submit" className="btn-full btn-auth-researcher" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={22} />
        </button>
      </form>

      <div className="auth-footer-text">
        Join the network? <Link to="/register/researcher" className="auth-footer-link">Submit request</Link>
      </div>
    </div>
  );
};

export default ResearcherLogin;
