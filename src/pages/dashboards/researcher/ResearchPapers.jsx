import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, ExternalLink, Calendar, Users, BookOpen, Upload, Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import { researchService } from '../../../services/researchService';
import { supabase } from '../../../lib/supabase';
import '../../../styles/researchModule.css';
import '../../../styles/resourceList.css';
import '../../../styles/cards.css';
import '../../../styles/buttons.css';

const ResearchPapers = () => {
  const [papers, setPapers] = useState([]);
  const [myPapers, setMyPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [userId, setUserId] = useState(null);
  
  // Upload form state
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author_name: '',
    file: null,
    file_url: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const [approved, personal] = await Promise.all([
          researchService.fetchApprovedPapers(),
          researchService.fetchMyPapers(user.id)
        ]);
        setPapers(approved);
        setMyPapers(personal);
      }
    } catch (err) {
      console.error("Error fetching papers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      await researchService.uploadPaper(formData, userId, false);
      setUploadSuccess(true);
      setFormData({ title: '', description: '', author_name: '', file: null, file_url: '' });
      setTimeout(() => setShowUpload(false), 2000);
      fetchData();
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} color="#10b981" />;
      case 'rejected': return <XCircle size={16} color="#ef4444" />;
      default: return <Clock size={16} color="#f59e0b" />;
    }
  };

  return (
    <div className="research-container animate-fade-in">
      <Link to="/researcher" className="research-back-link">
        <ArrowLeft size={18} /> Back to Research Portal
      </Link>
      
      <div className="research-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="research-title">Research Papers</h1>
          <p className="research-subtitle">
            Peer-reviewed literature and community-contributed research repository.
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowUpload(!showUpload)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.8rem 1.5rem',
            background: showUpload ? '#64748b' : 'var(--primary)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
        >
          {showUpload ? <ArrowLeft size={18} /> : <Plus size={18} />}
          {showUpload ? 'Back to Library' : 'Submit Research'}
        </button>
      </div>

      {showUpload ? (
        <div className="card animate-scale-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', marginBottom: '1rem' }}>
              <Upload color="var(--primary)" size={32} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b' }}>Submit Your Research</h2>
            <p style={{ color: '#64748b' }}>Share your findings with the academic community.</p>
          </div>
          
          {uploadError && (
            <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <AlertCircle size={18} /> {uploadError}
            </div>
          )}

          {uploadSuccess && (
            <div style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <CheckCircle size={18} /> Submission successful! Awaiting administrator approval.
            </div>
          )}

          <form onSubmit={handleUpload} style={{ display: 'grid', gap: '1.5rem' }}>
            <div className="input-group">
              <label style={{ fontWeight: '600', color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Paper Title</label>
              <input type="text" name="title" className="input-field" value={formData.title} onChange={handleInputChange} required placeholder="Major findings in ASD behavioral markers..." style={{ padding: '0.75rem 1rem' }} />
            </div>
            <div className="input-group">
              <label style={{ fontWeight: '600', color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Author Name(s)</label>
              <input type="text" name="author_name" className="input-field" value={formData.author_name} onChange={handleInputChange} required placeholder="Dr. Alan Turing, et al." style={{ padding: '0.75rem 1rem' }} />
            </div>
            <div className="input-group">
              <label style={{ fontWeight: '600', color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Abstract / Description</label>
              <textarea name="description" className="input-field" rows="4" value={formData.description} onChange={handleInputChange} placeholder="Briefly summarize your research goals and findings..." style={{ padding: '0.75rem 1rem', resize: 'vertical' }} />
            </div>
            <div className="input-group">
              <label style={{ fontWeight: '600', color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Upload PDF or Provide Link</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <input type="file" name="file" className="input-field" accept=".pdf" onChange={handleInputChange} style={{ padding: '0.65rem', paddingLeft: '2.5rem' }} />
                  <FileText size={16} style={{ position: 'absolute', left: '1rem', top: '1rem', color: '#94a3b8' }} />
                </div>
                <div style={{ position: 'relative' }}>
                  <input type="url" name="file_url" className="input-field" value={formData.file_url} onChange={handleInputChange} placeholder="External URL (e.g. arXiv)" style={{ padding: '0.75rem 1rem', paddingLeft: '2.5rem' }} />
                  <ExternalLink size={16} style={{ position: 'absolute', left: '1rem', top: '1rem', color: '#94a3b8' }} />
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={uploadLoading} style={{ marginTop: '1rem', padding: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>
              {uploadLoading ? 'Uploading...' : 'Submit to Repository'}
            </button>
          </form>
        </div>
      ) : (
        <>
          <section style={{ marginBottom: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)' }}>
                <BookOpen color="var(--primary)" size={24} />
              </div>
              <h2 className="section-title" style={{ margin: 0, border: 'none', padding: 0 }}>Public Repository</h2>
            </div>
            
            <div className="papers-list-container">
              {papers.map((paper) => (
                <div key={paper.id} className="card paper-card animate-scale-in">
                  <h2 className="paper-title">{paper.title}</h2>
                  
                  <div className="paper-meta-row">
                    <div className="paper-meta-item">
                      <Users size={16} color="var(--primary)" /> <span className="paper-meta-value">{paper.author_name}</span>
                    </div>
                    <div className="paper-meta-item">
                      <Calendar size={16} color="#94a3b8" /> <span>{new Date(paper.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="paper-meta-item">
                      <span className="status-badge status-approved">
                        <CheckCircle size={14} /> Peer Reviewed
                      </span>
                    </div>
                  </div>

                  <div className="paper-abstract-box">
                    <h4 className="paper-abstract-title" style={{ fontSize: '0.9rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Abstract</h4>
                    <p className="paper-abstract-text">{paper.description || "No description provided."}</p>
                  </div>

                  <a href={paper.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontWeight: '600' }}>
                    View Publication <ExternalLink size={16} />
                  </a>
                </div>
              ))}
              {papers.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                  <div style={{ marginBottom: '1.5rem', opacity: 0.5 }}>
                    <BookOpen size={48} color="#94a3b8" />
                  </div>
                  <h3 style={{ color: '#475569', marginBottom: '0.5rem' }}>No approved papers available yet.</h3>
                  <p style={{ color: '#94a3b8' }}>Be the first to contribute to the repository!</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)' }}>
                <Clock color="#f59e0b" size={24} />
              </div>
              <h2 className="section-title" style={{ margin: 0, border: 'none', padding: 0 }}>My Submissions</h2>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div className="table-responsive-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Research Title</th>
                      <th>Submission Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myPapers.map((paper) => (
                      <tr key={paper.id}>
                        <td>
                          <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>{paper.title}</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Author: {paper.author_name}</div>
                        </td>
                        <td>
                          <div style={{ color: '#475569', fontSize: '0.9rem' }}>
                            {new Date(paper.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge status-${paper.status}`}>
                            {getStatusIcon(paper.status)}
                            <span style={{ textTransform: 'capitalize' }}>{paper.status}</span>
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <a href={paper.file_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', padding: '0.5rem', borderRadius: '8px', background: '#f1f5f9', color: 'var(--primary)', transition: 'all 0.2s' }}>
                            <ExternalLink size={18} />
                          </a>
                        </td>
                      </tr>
                    ))}
                    {myPapers.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
                          <div style={{ marginBottom: '1rem' }}>
                            <Plus size={32} opacity={0.3} />
                          </div>
                          You haven't submitted any research papers yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default ResearchPapers;
