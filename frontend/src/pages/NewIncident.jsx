import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { incidentsAPI, processAPI } from '../api';

export default function NewIncident() {
  const [formData, setFormData] = useState({
    trackingNumber: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    category: 'General'
  });

  const [classificationResult, setClassificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const categories = ['Damage', 'Delivery', 'Payment', 'Address', 'Documentation', 'Other'];
  const priorities = ['HIGH', 'MEDIUM', 'LOW', 'ZERO'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClassify = async () => {
    if (!formData.description.trim()) {
      setError('Please enter a description to classify');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await processAPI.classify(formData.description);
      setClassificationResult(response.data);
      // Auto-fill based on classification
      setFormData(prev => ({
        ...prev,
        title: response.data.title || prev.title,
        priority: response.data.priority || prev.priority,
        category: response.data.category || prev.category
      }));
    } catch (err) {
      setError('Classification failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.trackingNumber || !formData.title || !formData.description) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await incidentsAPI.create(formData);
      setSuccess('Incident created successfully!');
      setTimeout(() => navigate('/incidents'), 2000);
    } catch (err) {
      setError('Failed to create incident: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Create New Incident</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tracking Number *</label>
          <input
            type="text"
            name="trackingNumber"
            placeholder="e.g., MY987623400"
            value={formData.trackingNumber}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            placeholder="Brief title of the incident"
            value={formData.title}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            placeholder="Detailed description of the incident"
            value={formData.description}
            onChange={handleChange}
            disabled={loading}
          />
          <button
            type="button"
            onClick={handleClassify}
            className="btn btn-secondary btn-small"
            style={{ marginTop: '10px' }}
            disabled={loading}
          >
            🤖 Classify with AI
          </button>
          {classificationResult && (
            <div style={{
              marginTop: '15px',
              padding: '15px',
              backgroundColor: '#f0f8ff',
              borderRadius: '4px',
              fontSize: '13px'
            }}>
              <strong>AI Classification:</strong><br />
              Priority: {classificationResult.priority} | Category: {classificationResult.category}
              {classificationResult.suggestions?.length > 0 && (
                <>
                  <br />Suggestions: {classificationResult.suggestions.join(', ')}
                </>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>Priority *</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              disabled={loading}
            >
              {priorities.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Incident'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/incidents')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
