import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { incidentsAPI } from '../api';

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const statuses = ['open', 'in_progress', 'resolved'];

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const fetchIncident = async () => {
    try {
      setLoading(true);
      const response = await incidentsAPI.getById(id);
      setIncident(response.data);
      setNewStatus(response.data.status);
    } catch (err) {
      setError('Failed to load incident');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const updatedIncident = {
        ...incident,
        notes: [...incident.notes, {
          author: 'current_user',
          content: newNote,
          createdAt: new Date().toISOString()
        }]
      };
      await incidentsAPI.update(id, updatedIncident);
      setIncident(updatedIncident);
      setNewNote('');
    } catch (err) {
      setError('Failed to add note');
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      const response = await incidentsAPI.updateStatus(id, newStatus);
      setIncident(response.data);
    } catch (err) {
      setError('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!incident) {
    return <div className="alert alert-error">Incident not found</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#333' }}>{incident.title}</h2>
        <button onClick={() => navigate('/incidents')} className="btn btn-secondary">← Back</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Main Details Card */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <h3 className="card-title">Incident Details</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div>
              <p style={{ color: '#999', fontSize: '12px', marginBottom: '5px' }}>ID</p>
              <p style={{ fontWeight: 'bold', fontSize: '16px' }}>{incident.id}</p>
            </div>
            <div>
              <p style={{ color: '#999', fontSize: '12px', marginBottom: '5px' }}>Tracking Number</p>
              <p style={{ fontWeight: 'bold', fontSize: '16px' }}>{incident.trackingNumber}</p>
            </div>
            <div>
              <p style={{ color: '#999', fontSize: '12px', marginBottom: '5px' }}>Priority</p>
              <p><span className={`badge badge-${incident.priority.toLowerCase()}`}>{incident.priority}</span></p>
            </div>
            <div>
              <p style={{ color: '#999', fontSize: '12px', marginBottom: '5px' }}>Category</p>
              <p style={{ fontWeight: 'bold' }}>{incident.category}</p>
            </div>
            <div>
              <p style={{ color: '#999', fontSize: '12px', marginBottom: '5px' }}>Created</p>
              <p>{new Date(incident.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p style={{ color: '#999', fontSize: '12px', marginBottom: '5px' }}>Assigned To</p>
              <p>{incident.assignedTo || 'Unassigned'}</p>
            </div>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
            <p style={{ color: '#999', fontSize: '12px', marginBottom: '8px' }}>Description</p>
            <p>{incident.description}</p>
          </div>
        </div>

        {/* Status Update Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Update Status</h3>
          </div>
          <div className="form-group">
            <label>Current Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              disabled={updating}
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleStatusUpdate}
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={updating || newStatus === incident.status}
          >
            {updating ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>

      {/* Notes Section */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h3 className="card-title">Notes & Activity</h3>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Add a Note</label>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            style={{ marginBottom: '10px' }}
          />
          <button
            onClick={handleAddNote}
            className="btn btn-primary"
            disabled={!newNote.trim()}
          >
            Add Note
          </button>
        </div>

        <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '20px' }}>
          {incident.notes && incident.notes.length > 0 ? (
            <div>
              {incident.notes.map((note, idx) => (
                <div key={idx} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong>{note.author}</strong>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p>{note.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#999', textAlign: 'center' }}>No notes yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
