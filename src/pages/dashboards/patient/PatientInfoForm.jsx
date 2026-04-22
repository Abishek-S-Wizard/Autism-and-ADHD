import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, Activity, Pill, AlertCircle, Moon, FileText, Save, Loader2, Droplet } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import '../../../styles/patientProfile.css';

const PatientInfoForm = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [formData, setFormData] = useState({
    mobile: '',
    address: '',
    existing_conditions: '',
    medications: '',
    allergies: '',
    blood_group: '',
    sleep_pattern: 'Normal',
    behavior_notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Fetch from patients (primary table)
      const { data: registration, error: regError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (regError) throw regError;
      setPatientData(registration);

      if (!registration) {
        setError("Your account is not registered in the clinical patients list. Submission will fail due to profiling constraints.");
      }

      // Fetch from patient_details (extended table)
      const { data: details, error: detError } = await supabase
        .from('patient_details')
        .select('*')
        .eq('patient_id', user.id)
        .maybeSingle();

      if (detError) throw detError;
      if (details) {
        setFormData({
          mobile: details.mobile || '',
          address: details.address || '',
          existing_conditions: details.existing_conditions || '',
          medications: details.medications || '',
          allergies: details.allergies || '',
          blood_group: details.blood_group || '',
          sleep_pattern: details.sleep_pattern || 'Normal',
          behavior_notes: details.behavior_notes || ''
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      // setError(err.message); // Don't block if registration exists but details don't
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User session not found");

      const payload = {
        patient_id: user.id,
        ...formData
      };

      // Upsert into patient_details
      // Using upsert with a where clause or just checking if it exists
      const { data: existing } = await supabase
        .from('patient_details')
        .select('id')
        .eq('patient_id', user.id)
        .maybeSingle();

      let result;
      if (existing) {
        result = await supabase
          .from('patient_details')
          .update(payload)
          .eq('patient_id', user.id);
      } else {
        result = await supabase
          .from('patient_details')
          .insert(payload);
      }

      if (result.error) throw result.error;

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
        <h1 className="profile-title">Update Health Profile</h1>
        <p className="profile-subtitle">Provide your medical details and daily observations to help your doctor monitor your progress effectively.</p>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444' }}>
          <p style={{ color: '#ef4444', margin: 0 }}>{error}</p>
        </div>
      )}

      {success && (
        <div className="card" style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981' }}>
          <p style={{ color: '#10b981', margin: 0 }}>Information updated successfully!</p>
        </div>
      )}

      <div className="profile-card">
        <form onSubmit={handleSubmit} className="profile-form">
          {/* Section 1: Basic Details (Read Only) */}
          <section>
            <h3 className="profile-section-title"><User size={20} color="var(--primary)" /> Basic Details</h3>
            <div className="profile-grid-3">
              <div className="profile-field">
                <label className="profile-label">Full Name</label>
                <input type="text" value={patientData?.full_name || ''} className="profile-input profile-input-readonly" disabled />
              </div>
              <div className="profile-field">
                <label className="profile-label">Date of Birth</label>
                <input type="text" value={patientData?.dob || ''} className="profile-input profile-input-readonly" disabled />
              </div>
              <div className="profile-field">
                <label className="profile-label">Age</label>
                <input type="text" value={calculateAge(patientData?.dob)} className="profile-input profile-input-readonly" disabled />
              </div>
              <div className="profile-field">
                <label className="profile-label">Gender</label>
                <input type="text" value={patientData?.gender || ''} className="profile-input profile-input-readonly" disabled />
              </div>
              <div className="profile-field">
                <label className="profile-label">Caregiver Name</label>
                <input type="text" value={patientData?.guardian_name || ''} className="profile-input profile-input-readonly" disabled />
              </div>
              <div className="profile-field">
                <label className="profile-label">Relationship</label>
                <input type="text" value={patientData?.relationship || ''} className="profile-input profile-input-readonly" disabled />
              </div>
            </div>
          </section>

          {/* Section 2: Contact Details */}
          <section>
            <h3 className="profile-section-title"><Phone size={20} color="var(--primary)" /> Contact Details</h3>
            <div className="profile-grid-2">
              <div className="profile-field">
                <label className="profile-label">Email Address</label>
                <input type="email" value={patientData?.email || ''} className="profile-input profile-input-readonly" disabled />
              </div>
              <div className="profile-field">
                <label className="profile-label">Mobile Number</label>
                <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} className="profile-input" placeholder="+1 (555) 000-0000" required />
              </div>
              <div className="profile-field" style={{ gridColumn: '1 / -1' }}>
                <label className="profile-label"><MapPin size={16} style={{ marginBottom: '-3px' }} /> Address (Street, City, State, Pincode)</label>
                <textarea name="address" value={formData.address} onChange={handleChange} className="profile-input" rows="2" placeholder="Enter your full address..." required style={{ resize: 'none' }}></textarea>
              </div>
            </div>
          </section>

          {/* Section 3: Medical Info */}
          <section>
            <h3 className="profile-section-title"><Activity size={20} color="var(--primary)" /> Medical Info</h3>
            <div className="profile-grid-2">
              <div className="profile-field">
                <label className="profile-label"><Droplet size={16} /> Blood Group</label>
                <select name="blood_group" value={formData.blood_group} onChange={handleChange} className="profile-input" required>
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div className="profile-field">
                <label className="profile-label"><AlertCircle size={16} /> Allergies</label>
                <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} className="profile-input" placeholder="e.g. Peanuts, Penicillin" />
              </div>
              <div className="profile-field">
                <label className="profile-label"><FileText size={16} /> Existing Conditions</label>
                <textarea name="existing_conditions" value={formData.existing_conditions} onChange={handleChange} className="profile-input" rows="2" placeholder="e.g. Asthma, Diabetes" style={{ resize: 'none' }}></textarea>
              </div>
              <div className="profile-field">
                <label className="profile-label"><Pill size={16} /> Current Medications</label>
                <textarea name="medications" value={formData.medications} onChange={handleChange} className="profile-input" rows="2" placeholder="List medications you are taking" style={{ resize: 'none' }}></textarea>
              </div>
            </div>
          </section>

          {/* Section 4: Daily Observation */}
          <section>
            <h3 className="profile-section-title"><Moon size={20} color="var(--primary)" /> Daily Observation</h3>
            <div className="profile-grid-2">
              <div className="profile-field">
                <label className="profile-label">Sleep Pattern</label>
                <select name="sleep_pattern" value={formData.sleep_pattern} onChange={handleChange} className="profile-input">
                  <option value="Normal">Normal</option>
                  <option value="Disturbed">Disturbed</option>
                </select>
              </div>
              <div className="profile-field" style={{ gridColumn: '1 / -1' }}>
                <label className="profile-label">Behavior Notes</label>
                <textarea name="behavior_notes" value={formData.behavior_notes} onChange={handleChange} className="profile-input" rows="3" placeholder="Describe any notable behavioral patterns or changes noticed recently..." style={{ resize: 'none' }}></textarea>
              </div>
            </div>
          </section>

          <div className="profile-footer">
            <button type="submit" className="profile-save-btn" disabled={saving || !patientData}>
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Saving Information...' : 'Save & Update Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientInfoForm;
