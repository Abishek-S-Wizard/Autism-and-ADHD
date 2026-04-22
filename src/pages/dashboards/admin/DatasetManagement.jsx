import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Database, Plus, Trash2, Link as LinkIcon, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import '../../../styles/adminModule.css';
import '../../../styles/cards.css';
import '../../../styles/buttons.css';

const DatasetManagement = () => {
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dataset_link: ''
    });

    useEffect(() => {
        fetchDatasets();
    }, []);

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.title.trim() || !formData.description.trim() || !formData.dataset_link.trim()) {
            setMessage({ type: 'error', text: 'All fields are required.' });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('datasets')
                .insert([formData]);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Dataset added successfully!' });
            setFormData({ title: '', description: '', dataset_link: '' });
            fetchDatasets();
        } catch (error) {
            setMessage({ type: 'error', text: `Error: ${error.message}` });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this dataset?')) return;

        try {
            const { error } = await supabase
                .from('datasets')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchDatasets();
        } catch (error) {
            alert(`Error deleting dataset: ${error.message}`);
        }
    };

    return (
        <div className="admin-container animate-fade-in">
            <Link to="/admin" className="admin-back-link">
                <ArrowLeft size={18} /> Back to Admin Portal
            </Link>

            <div className="admin-header">
                <h1 className="admin-title">Dataset Management</h1>
                <p className="admin-subtitle">
                    Upload and manage anonymized medical datasets for researcher access.
                </p>
            </div>

            <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                {/* Form Section */}
                <div className="card" style={{ height: 'fit-content' }}>
                    <div className="card-header">
                        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Plus size={20} color="var(--primary)" /> Add New Dataset
                        </h3>
                    </div>
                    
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                                Dataset Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                placeholder="e.g., Pediatric Facial Image Dataset"
                                className="input-field"
                                value={formData.title}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                            />
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                                Dataset Description
                            </label>
                            <textarea
                                name="description"
                                placeholder="Describe the dataset, its purpose, and any metadata details..."
                                className="input-field"
                                rows="4"
                                value={formData.description}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', resize: 'vertical' }}
                            ></textarea>
                        </div>

                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
                                Dataset Download Link
                            </label>
                            <input
                                type="url"
                                name="dataset_link"
                                placeholder="https://example.com/dataset.zip"
                                className="input-field"
                                value={formData.dataset_link}
                                onChange={handleInputChange}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                            />
                        </div>

                        {message.text && (
                            <div style={{ 
                                padding: '0.75rem', 
                                borderRadius: '0.5rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem',
                                fontSize: '0.9rem',
                                backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                                color: message.type === 'success' ? '#065f46' : '#991b1b',
                                border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`
                            }}>
                                {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                {message.text}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="btn btn-primary btn-full" 
                            disabled={submitting}
                            style={{ marginTop: '0.5rem' }}
                        >
                            {submitting ? 'Adding Dataset...' : 'Submit Dataset'}
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div className="dataset-list-section">
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', color: '#111827' }}>
                        Registered Datasets ({datasets.length})
                    </h3>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                            Fetching datasets...
                        </div>
                    ) : datasets.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                            <Database size={48} style={{ opacity: 0.2, marginBottom: '1rem', margin: '0 auto' }} />
                            <p>No datasets available. Use the form to add your first dataset.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {datasets.map(ds => (
                                <div key={ds.id} className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#111827', marginBottom: '0.35rem' }}>{ds.title}</h4>
                                            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.75rem', lineHeight: '1.5' }}>{ds.description}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '500' }}>
                                                    <LinkIcon size={14} /> 
                                                    <a href={ds.dataset_link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                                                        View Source
                                                    </a>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#9ca3af' }}>
                                                    <FileText size={14} /> Added {new Date(ds.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(ds.id)} 
                                            style={{ 
                                                background: 'none', 
                                                border: 'none', 
                                                color: '#ef4444', 
                                                cursor: 'pointer',
                                                padding: '0.5rem',
                                                borderRadius: '0.4rem',
                                                transition: 'all 0.2s ease'
                                            }}
                                            className="action-btn-delete"
                                            title="Delete Dataset"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DatasetManagement;
