import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import '../../styles/authForms.css';
import '../../styles/buttons.css';

import { supabase } from '../../lib/supabase';

const ResearcherRegistration = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const fullName = formData.get('fullName');

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Insert profile into the 'researchers' table
        const { error: profileError } = await supabase
          .from('researchers')
          .insert({
            id: authData.user.id,
            full_name: formData.get('fullName'),
            email: formData.get('email'),
            field: formData.get('field'),
            qualification: formData.get('qualification'),
            institution: formData.get('institution'),
            department: formData.get('department'),
            purpose: formData.get('purpose'),
            is_approved: false,
          });

        if (profileError) throw profileError;

        navigate('/pending-approval', { state: { role: 'Researcher' } });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-card wide">
      <Link to="/login" className="auth-back-link">
        <ArrowLeft size={18} /> Back to Login
      </Link>
      
      <div className="auth-form-header">
        <div className="auth-icon-wrapper">
          <BookOpen size={32} />
        </div>
        <h2 className="auth-form-title">Researcher Registration</h2>
        <p className="auth-form-subtitle">Access academic analytics and datasets</p>
      </div>

      {error && <div className="auth-error-message" style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        
        <section>
          <h3 className="auth-section-title">Account Information</h3>
          <div className="auth-grid">
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" name="fullName" className="input-field" placeholder="Dr. Abishek" required />
            </div>
            <div className="input-group">
              <label>Email Address</label>
              <input type="email" name="email" className="input-field" placeholder="researcher@university.edu" required />
            </div>
            <div className="input-group" style={{ position: 'relative' }}>
              <label>Password</label>
              <input type={showPassword ? "text" : "password"} name="password" className="input-field" placeholder="••••••••" required />
              <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="input-group" style={{ position: 'relative' }}>
              <label>Confirm Password</label>
              <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" className="input-field" placeholder="••••••••" required />
              <button type="button" className="auth-password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3 className="auth-section-title">Academic / Professional Information</h3>
          <div className="auth-grid">
            <div className="input-group">
              <label>Research Field</label>
              <input type="text" name="field" className="input-field" placeholder="e.g., Neuroscience, Machine Learning" required />
            </div>
            <div className="input-group">
              <label>Highest Qualification</label>
              <input type="text" name="qualification" className="input-field" placeholder="e.g., PhD, MSc" required />
            </div>
            <div className="input-group">
              <label>University / Institution Name</label>
              <input type="text" name="institution" className="input-field" placeholder="Institution Name" required />
            </div>
            <div className="input-group">
              <label>Department</label>
              <input type="text" name="department" className="input-field" placeholder="e.g., Computer Science" required />
            </div>
          </div>
        </section>

        <section>
          <h3 className="auth-section-title">Research Purpose</h3>
          <div className="input-group">
            <label>Purpose of accessing the platform</label>
            <textarea name="purpose" className="input-field" rows="4" style={{ resize: 'vertical' }} placeholder="Briefly describe your research goals and how this dataset will assist your work..." required></textarea>
          </div>
        </section>

        <section>
          <div className="auth-checkbox-group">
            <label className="auth-checkbox-label">
              <input type="checkbox" required />
              I agree to the Data Usage Policy.
            </label>
            <label className="auth-checkbox-label">
              <input type="checkbox" required />
              I accept the Privacy Policy.
            </label>
            <label className="auth-checkbox-label">
              <input type="checkbox" required />
              I confirm that I will utilize only anonymized research data for academic purposes.
            </label>
          </div>
        </section>

        <button type="submit" className="btn-full btn-auth-researcher" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Registration'} <ArrowRight size={22} />
        </button>
      </form>

      <div className="auth-footer-text">
        Already registered? <Link to="/login/researcher" className="auth-footer-link">Login here</Link>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#43e97b', background: 'rgba(67, 233, 123, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(67, 233, 123, 0.2)' }}>
        Researcher accounts may require administrator approval before accessing analytics data.
      </div>
    </div>
  );
};

export default ResearcherRegistration;
