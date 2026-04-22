import React from 'react';
import { Clock, Check, X, FileText, ExternalLink } from 'lucide-react';

const ApprovalPanel = ({ pendingPapers, onApprove, onReject }) => {
  if (pendingPapers.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px dashed var(--primary)' }}>
        <Clock size={32} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
        <h4 style={{ margin: 0, color: '#666' }}>No pending papers to review.</h4>
      </div>
    );
  }

  return (
    <div className="approval-panel-grid" style={{ display: 'grid', gap: '1rem' }}>
      {pendingPapers.map((paper) => (
        <div key={paper.id} className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)' }}>
              <FileText color="#f59e0b" size={24} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0' }}>{paper.title}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                By {paper.author_name} • Uploaded by {paper.uploader?.email || 'Unknown'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a href={paper.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '8px' }}>
              <ExternalLink size={18} />
            </a>
            <button onClick={() => onApprove(paper.id)} className="btn btn-success" style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#10b981', color: 'white', border: 'none' }}>
              <Check size={18} />
            </button>
            <button onClick={() => onReject(paper.id)} className="btn btn-danger" style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#ef4444', color: 'white', border: 'none' }}>
              <X size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApprovalPanel;
