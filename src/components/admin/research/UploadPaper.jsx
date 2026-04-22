import React, { useState } from 'react';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { researchService } from '../../../services/researchService';
import { supabase } from '../../../lib/supabase';

const UploadPaper = ({ onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author_name: '',
    file: null,
    file_url: ''
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      await researchService.uploadPaper(formData, user.id, true);
      
      setSuccess(true);
      setFormData({ title: '', description: '', author_name: '', file: null, file_url: '' });
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Upload size={20} color="var(--primary)" /> Upload New Research Paper
      </h3>

      {error && (
        <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {success && (
        <div style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={16} /> Paper uploaded successfully and automatically approved!
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div className="input-group">
          <label>Paper Title</label>
          <input 
            type="text" 
            name="title" 
            className="input-field" 
            placeholder="e.g., ML analysis of ASD markers" 
            value={formData.title}
            onChange={handleChange}
            required 
          />
        </div>

        <div className="input-group">
          <label>Author Name(s)</label>
          <input 
            type="text" 
            name="author_name" 
            className="input-field" 
            placeholder="e.g., Dr. Jane Doe" 
            value={formData.author_name}
            onChange={handleChange}
            required 
          />
        </div>

        <div className="input-group">
          <label>Description</label>
          <textarea 
            name="description" 
            className="input-field" 
            rows="3" 
            placeholder="Briefly describe the research findings..."
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="input-group">
          <label>File (PDF) or Online Link</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="file" 
              name="file" 
              className="input-field" 
              accept=".pdf" 
              onChange={handleChange}
              style={{ flex: 1 }}
            />
            <div style={{ display: 'flex', alignItems: 'center' }}>OR</div>
            <input 
              type="url" 
              name="file_url" 
              className="input-field" 
              placeholder="https://..." 
              value={formData.file_url}
              onChange={handleChange}
              style={{ flex: 1 }}
            />
          </div>
          <small style={{ color: '#666', marginTop: '0.25rem' }}>Preferably upload a PDF or provide a direct link.</small>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
          {loading ? 'Processing...' : 'Publish Paper'}
        </button>
      </form>
    </div>
  );
};

export default UploadPaper;
