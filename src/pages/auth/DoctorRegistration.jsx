import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import '../../styles/authForms.css';
import '../../styles/buttons.css';

import { supabase } from '../../lib/supabase';

const DoctorRegistration = () => {
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
    const fullName = formData.get('fullName');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Insert profile into the 'doctors' table
        const { error: profileError } = await supabase
          .from('doctors')
          .insert({
            id: authData.user.id,
            full_name: formData.get('fullName'),
            email: formData.get('email'),
            reg_number: formData.get('regNumber'),
            specialization: formData.get('specialization'),
            experience: parseInt(formData.get('experience')),
            qualification: formData.get('qualification'),
            hospital: formData.get('hospital'),
            city: formData.get('city'),
            is_approved: false,
          });

        if (profileError) throw profileError;

        navigate('/pending-approval', { state: { role: 'Doctor' } });
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
          <Stethoscope size={36} />
        </div>
        <h2 className="auth-form-title">Medical Professional Registration</h2>
        <p className="auth-form-subtitle">Join the clinical diagnostic portal</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        
        <section>
          <h3 className="auth-section-title">Account Information</h3>
          <div className="auth-grid">
            <div className="input-group">
              <label>Full Name (with Title)</label>
              <input type="text" name="fullName" className="input-field" placeholder="Dr. Abishek" required />
            </div>
            <div className="input-group">
              <label>Professional Email Address</label>
              <input type="email" name="email" className="input-field" placeholder="doctor@hospital.org" required />
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
          <h3 className="auth-section-title">Professional Information</h3>
          <div className="auth-grid">
            <div className="input-group">
              <label>Medical Registration Number</label>
              <input type="text" name="regNumber" className="input-field" placeholder="Enter Registration/License #" required />
            </div>
            <div className="input-group">
              <label>Specialization</label>
              <select name="specialization" className="input-field" required>
                <option value="">Select Specialization</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Psychiatrist">Psychiatrist</option>
                <option value="Clinical Psychologist">Clinical Psychologist</option>
                <option value="General Practitioner">General Practitioner</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="input-group">
              <label>Years of Experience</label>
              <input type="number" name="experience" min="0" className="input-field" placeholder="e.g., 5" required />
            </div>
            <div className="input-group">
              <label>Highest Qualification</label>
              <input type="text" name="qualification" className="input-field" placeholder="e.g., MD, DO, PhD" required />
            </div>
          </div>
        </section>

        <section>
          <h3 className="auth-section-title">Workplace Information</h3>
          <div className="auth-grid">
            <div className="input-group">
              <label>Hospital / Clinic Name</label>
              <input type="text" name="hospital" className="input-field" placeholder="Primary place of practice" required />
            </div>
            <div className="input-group">
              <label>City</label>
              <input type="text" name="city" className="input-field" placeholder="City" required />
            </div>
          </div>
        </section>

        <section>
          <div className="auth-checkbox-group">
            <label className="auth-checkbox-label">
              <input type="checkbox" required />
              I agree to the Terms and Conditions of the Autism & ADHD platform.
            </label>
            <label className="auth-checkbox-label">
              <input type="checkbox" required />
              I confirm that the professional and medical registration information provided is accurate and valid.
            </label>
          </div>
        </section>

        <button type="submit" className="btn-full btn-auth-doctor" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Application'} <ArrowRight size={22} />
        </button>
      </form>

      <div className="auth-footer-text">
        Already registered? <Link to="/login/doctor" className="auth-footer-link">Login here</Link>
      </div>
      
      {/* Alert banner specific to this form */}
      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
        After registration, the account status will be Pending until approved by the system administrator.
      </div>
    </div>
  );
};

export default DoctorRegistration;
