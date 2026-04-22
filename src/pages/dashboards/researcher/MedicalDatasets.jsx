import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Database, HardDrive, Cpu, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import '../../../styles/researchModule.css';
import '../../../styles/resourceList.css';
import '../../../styles/cards.css';
import '../../../styles/buttons.css';

const MedicalDatasets = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('datasets')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setDatasets(data || []);
      } catch (error) {
        console.error('Error fetching datasets:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();
  }, []);

  const handleDownload = (link) => {
    window.open(link, '_blank');
  };

  return (
    <div className="research-container animate-fade-in">
      <Link to="/researcher" className="research-back-link">
        <ArrowLeft size={18} /> Back to Research Portal
      </Link>
      
      <div className="research-header">
        <h1 className="research-title">Medical Datasets</h1>
        <p className="research-subtitle">
          Anonymized datasets for machine learning training.
        </p>
      </div>

      <div className="resource-notice-banner">
        <Cpu color="var(--primary)" size={24} style={{ flexShrink: 0 }} />
        <p className="resource-notice-text">
          <strong>Notice:</strong> All datasets are thoroughly scrubbed of Personally Identifiable Information (PII) to comply with HIPAA and GDPR research exemptions. By downloading these archives, you agree to the standard institutional data usage agreement.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem', gap: '1rem', color: '#6b7280' }}>
          <Loader2 className="animate-spin" size={32} />
          <p>Fetching latest research datasets...</p>
        </div>
      ) : datasets.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
          <Database size={48} style={{ opacity: 0.2, marginBottom: '1rem', margin: '0 auto' }} />
          <p>Requesting new records... No datasets are currently available for download.</p>
        </div>
      ) : (
        <div className="datasets-grid">
          {datasets.map((dataset) => (
            <div key={dataset.id} className="card dataset-card">
              <div className="dataset-card-body">
                <h3 className="dataset-title">
                  {dataset.title}
                </h3>
                <p className="dataset-description">
                  {dataset.description}
                </p>
              </div>
              <div className="dataset-card-footer">
                <div className="dataset-meta-info" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#64748b' }}>
                  <HardDrive size={16} /> Data Access: External Link
                </div>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => handleDownload(dataset.dataset_link)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
                >
                  <Download size={16} /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalDatasets;
