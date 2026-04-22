import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, List, PlusCircle, CheckCircle } from 'lucide-react';
import { researchService } from '../../../services/researchService';
import UploadPaper from '../../../components/admin/research/UploadPaper';
import PaperTable from '../../../components/admin/research/PaperTable';
import ApprovalPanel from '../../../components/admin/research/ApprovalPanel';

import '../../../styles/adminModule.css';

const ResearchPapers = () => {
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'upload', 'approval'
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const data = await researchService.fetchAllPapers();
      setPapers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await researchService.updatePaperStatus(id, status);
      fetchPapers();
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this paper?")) {
      try {
        await researchService.deletePaper(id);
        fetchPapers();
      } catch (err) {
        alert("Error deleting paper: " + err.message);
      }
    }
  };

  const pendingPapers = papers.filter(p => p.status === 'pending');

  return (
    <div className="admin-container animate-fade-in">
      <Link to="/admin" className="admin-back-link">
        <ArrowLeft size={18} /> Back to Admin Portal
      </Link>
      
      <div className="admin-header">
        <h1 className="admin-title">Research Papers Repository</h1>
        <p className="admin-subtitle">
          Manage, approve, and publish scientific literature for the research community.
        </p>
      </div>

      <div className="admin-tabs-wrapper" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button 
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`} 
          onClick={() => setActiveTab('list')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'list' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'list' ? 'var(--primary)' : '#64748b', cursor: 'pointer', fontWeight: '600' }}
        >
          <List size={18} /> All Papers
        </button>
        <button 
          className={`tab-btn ${activeTab === 'approval' ? 'active' : ''}`} 
          onClick={() => setActiveTab('approval')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'approval' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'approval' ? 'var(--primary)' : '#64748b', cursor: 'pointer', fontWeight: '600' }}
        >
          <Clock size={18} /> Approvals {pendingPapers.length > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', padding: '0.1rem 0.5rem', fontSize: '0.75rem' }}>{pendingPapers.length}</span>}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`} 
          onClick={() => setActiveTab('upload')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'upload' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'upload' ? 'var(--primary)' : '#64748b', cursor: 'pointer', fontWeight: '600' }}
        >
          <PlusCircle size={18} /> Upload Paper
        </button>
      </div>

      {activeTab === 'list' && (
        <PaperTable 
          papers={papers} 
          onStatusChange={handleStatusChange} 
          onDelete={handleDelete} 
        />
      )}

      {activeTab === 'approval' && (
        <div style={{ maxWidth: '800px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Review Pending Uploads</h3>
          <ApprovalPanel 
            pendingPapers={pendingPapers} 
            onApprove={(id) => handleStatusChange(id, 'approved')}
            onReject={(id) => handleStatusChange(id, 'rejected')}
          />
        </div>
      )}

      {activeTab === 'upload' && (
        <div style={{ maxWidth: '800px' }}>
          <UploadPaper onUploadSuccess={() => { setActiveTab('list'); fetchPapers(); }} />
        </div>
      )}

    </div>
  );
};

export default ResearchPapers;
