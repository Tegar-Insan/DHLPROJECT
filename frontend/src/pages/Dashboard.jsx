import React, { useState, useEffect } from 'react';
import { incidentsAPI } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await incidentsAPI.getStats();
      setStats(response.data);
    } catch (err) {
      setError('Failed to load dashboard stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Dashboard</h2>

      {error && <div className="alert alert-error">{error}</div>}

      {stats && (
        <>
          {/* Stats Cards */}
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-label">Total Incidents</div>
              <div className="stat-value">{stats.totalIncidents}</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#ff6b6b' }}>
              <div className="stat-label">Open</div>
              <div className="stat-value">{stats.openIncidents}</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#4ecdc4' }}>
              <div className="stat-label">In Progress</div>
              <div className="stat-value">{stats.inProgressIncidents}</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#51cf66' }}>
              <div className="stat-label">Resolved</div>
              <div className="stat-value">{stats.resolvedIncidents}</div>
            </div>
            <div className="stat-card" style={{ borderLeftColor: '#ffa94d' }}>
              <div className="stat-label">High Priority</div>
              <div className="stat-value">{stats.highPriorityIncidents}</div>
            </div>
          </div>

          {/* Priority Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Priority Distribution</h3>
              </div>
              <div style={{ paddingBottom: '15px' }}>
                {Object.entries(stats.priorityCounts).map(([priority, count]) => (
                  <div key={priority} style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`badge badge-${priority.toLowerCase()}`} style={{ minWidth: '60px', textAlign: 'center' }}>
                      {priority}
                    </span>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Category Breakdown</h3>
              </div>
              <div style={{ paddingBottom: '15px' }}>
                {stats.categoryBreakdown.map(cat => (
                  <div key={cat.category} style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{cat.category}</span>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Incidents */}
          {stats.recentIncidents && stats.recentIncidents.length > 0 && (
            <div className="card" style={{ marginTop: '20px' }}>
              <div className="card-header">
                <h3 className="card-title">Recent Incidents</h3>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tracking #</th>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentIncidents.map(incident => (
                    <tr key={incident.id}>
                      <td><strong>{incident.id}</strong></td>
                      <td>{incident.trackingNumber}</td>
                      <td>{incident.title}</td>
                      <td><span className={`badge badge-${incident.priority.toLowerCase()}`}>{incident.priority}</span></td>
                      <td><span className={`badge badge-${incident.status}`}>{incident.status.replace('_', ' ').toUpperCase()}</span></td>
                      <td style={{ fontSize: '12px' }}>{new Date(incident.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
