import React from 'react';
import { FileText, ExternalLink, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';

const PaperTable = ({ papers, onStatusChange, onDelete }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="status-badge status-approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> Approved</span>;
      case 'rejected':
        return <span className="status-badge status-rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="status-badge status-pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Pending</span>;
    }
  };

  return (
    <div className="card table-container" style={{ padding: '0' }}>
      <div className="table-responsive-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Paper Title</th>
              <th>Author</th>
              <th>Uploaded By</th>
              <th>Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {papers.map((paper) => (
              <tr key={paper.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)' }}>
                      <FileText size={18} color="#3B82F6" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="font-semibold">{paper.title}</span>
                      <small style={{ color: '#666' }}>{paper.description?.substring(0, 50)}...</small>
                    </div>
                  </div>
                </td>
                <td className="text-secondary font-medium">{paper.author_name}</td>
                <td>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Researcher Account
                  </div>
                </td>
                <td className="text-secondary" style={{ fontSize: '0.9rem' }}>
                  {new Date(paper.created_at).toLocaleDateString()}
                </td>
                <td>{getStatusBadge(paper.status)}</td>
                <td className="action-cell">
                  <a href={paper.file_url} target="_blank" rel="noopener noreferrer" className="action-btn" title="View/Download" style={{ color: 'var(--primary)' }}>
                    <ExternalLink size={16} />
                  </a>
                  
                  {paper.status === 'pending' && (
                    <>
                      <button onClick={() => onStatusChange(paper.id, 'approved')} className="action-btn action-approve" title="Approve">
                        <CheckCircle size={16} />
                      </button>
                      <button onClick={() => onStatusChange(paper.id, 'rejected')} className="action-btn action-reject" title="Reject">
                        <XCircle size={16} />
                      </button>
                    </>
                  )}

                  {paper.status !== 'pending' && (
                    <button onClick={() => onStatusChange(paper.id, 'pending')} className="action-btn" title="Mark as Pending" style={{ color: '#666' }}>
                      <Clock size={16} />
                    </button>
                  )}

                  <button onClick={() => onDelete(paper.id)} className="action-btn action-delete" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {papers.length === 0 && (
              <tr>
                <td colSpan="6" className="table-empty-state">No research papers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaperTable;
