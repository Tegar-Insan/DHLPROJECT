import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { incidentsAPI } from '../api';

export default function IncidentList() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: ''
  });

  const priorities = ['HIGH', 'MEDIUM', 'LOW', 'ZERO'];
  const statuses = ['open', 'in_progress', 'resolved'];
  const categories = ['Damage', 'Delivery', 'Payment', 'Address', 'Documentation', 'Other'];

  useEffect(() => {
    fetchIncidents();
  }, [filters]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await incidentsAPI.getAll(filters);
      setIncidents(response.data);
    } catch (err) {
      setError('Failed to load incidents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this incident?')) return;
    try {
      await incidentsAPI.delete(id);
      setIncidents(incidents.filter(i => i.id !== id));
    } catch (err) {
      setError('Failed to delete incident');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#333' }}>Incidents</h2>
        <Link to="/new-incident" className="btn btn-primary">➕ New Incident</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label style={{ marginBottom: '5px' }}>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Statuses</option>
              {statuses.map(s => (
                <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label style={{ marginBottom: '5px' }}>Priority</label>
            <select name="priority" value={filters.priority} onChange={handleFilterChange}>
              <option value="">All Priorities</option>
              {priorities.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label style={{ marginBottom: '5px' }}>Category</label>
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="card">
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : incidents.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>No incidents found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tracking #</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map(incident => (
                <tr key={incident.id}>
                  <td><strong>{incident.id}</strong></td>
                  <td>{incident.trackingNumber}</td>
                  <td>{incident.title}</td>
                  <td>{incident.category}</td>
                  <td><span className={`badge badge-${incident.priority.toLowerCase()}`}>{incident.priority}</span></td>
                  <td><span className={`badge badge-${incident.status}`}>{incident.status.replace('_', ' ').toUpperCase()}</span></td>
                  <td style={{ fontSize: '12px' }}>{new Date(incident.createdAt).toLocaleDateString()}</td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/incidents/${incident.id}`} className="btn btn-secondary btn-small">View</Link>
                    <button onClick={() => handleDelete(incident.id)} className="btn btn-danger btn-small">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
