import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import '../../styles/authForms.css';
import '../../styles/buttons.css';

import { supabase } from '../../lib/supabase';

const PatientRegistration = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('Patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const fullName = formData.get('fullName');
    const patientName = formData.get('patientName');

    const dob = formData.get('dob');
    const gender = formData.get('gender');
    const guardianName = formData.get('guardianName');
    const relationship = formData.get('relationship');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Insert profile into the 'patients' table
        const { error: profileError } = await supabase
          .from('patients')
          .insert({
            id: authData.user.id,
            full_name: fullName,
            email: email,
            patient_name: patientName,
            dob: dob,
            gender: gender,
            guardian_name: guardianName,
            relationship: relationship,
            is_approved: false,
          });

        if (profileError) throw profileError;

        navigate('/pending-approval', { state: { role } });
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
          <UserPlus size={36} />
        </div>
        <h2 className="auth-form-title">Patient / Caregiver Registration</h2>
        <p className="auth-form-subtitle">Create your Autism & ADHD account</p>
      </div>

      {error && <div className="auth-error-message" style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        
        <section>
          <h3 className="auth-section-title">Account Information</h3>
          <div className="auth-grid">
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" name="fullName" className="input-field" placeholder="Abishek" required />
            </div>
            <div className="input-group">
              <label>Email Address</label>
              <input type="email" name="email" className="input-field" placeholder="john@example.com" required />
            </div>
            <div className="input-group">
              <label>Mobile Number</label>
              <input type="tel" className="input-field" placeholder="+1 (555) 000-0000" required />
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
          <h3 className="auth-section-title">Role Selection</h3>
          <div className="input-group">
            <label>Select Role</label>
            <select className="input-field" value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="Patient">Patient</option>
              <option value="Caregiver">Caregiver</option>
            </select>
          </div>
        </section>

        <section>
          <h3 className="auth-section-title">Patient Details</h3>
          <div className="auth-grid">
            <div className="input-group">
              <label>Patient Name</label>
              <input type="text" name="patientName" className="input-field" placeholder="Patient's Full Name" required />
            </div>
            <div className="input-group">
              <label>Date of Birth</label>
              <input type="date" name="dob" className="input-field" required />
            </div>
            <div className="input-group">
              <label>Gender</label>
              <select name="gender" className="input-field" required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </section>

        {role === 'Caregiver' && (
          <section className="animate-fade-in">
            <h3 className="auth-section-title">Caregiver Details</h3>
            <div className="auth-grid">
              <div className="input-group">
                <label>Guardian Name</label>
                <input type="text" name="guardianName" className="input-field" placeholder="Guardian's Full Name" required />
              </div>
              <div className="input-group">
                <label>Relationship with Patient</label>
                <input type="text" name="relationship" className="input-field" placeholder="e.g., Mother, Father, Legal Guardian" required />
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="auth-checkbox-group">
            <label className="auth-checkbox-label">
              <input type="checkbox" required />
              I consent to AI-based screening and understand this is not a medical diagnosis.
            </label>
            <label className="auth-checkbox-label">
              <input type="checkbox" required />
              I agree to the Privacy Policy and Terms of Service.
            </label>
          </div>
        </section>

        <button type="submit" className="btn-full btn-auth-patient" disabled={loading}>
          {loading ? 'Registering...' : 'Register Account'} <ArrowRight size={22} />
        </button>
      </form>

      <div className="auth-footer-text">
        Already have an account? <Link to="/login/patient" className="auth-footer-link">Sign in here</Link>
      </div>
    </div>
  );
};

export default PatientRegistration;
