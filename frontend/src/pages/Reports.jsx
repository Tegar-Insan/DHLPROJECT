import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../api';

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getSummary();
      setReport(response.data);
    } catch (err) {
      setError('Failed to load report');
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
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Management Reports</h2>

      {error && <div className="alert alert-error">{error}</div>}

      {report && (
        <>
          {/* Executive Summary */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <h3 className="card-title">Executive Summary</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <p style={{ color: '#999', fontSize: '12px', marginBottom: '8px' }}>Total Incidents</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4001c' }}>
                  {report.totalIncidents}
                </p>
              </div>
              <div>
                <p style={{ color: '#999', fontSize: '12px', marginBottom: '8px' }}>Report Generated</p>
                <p style={{ fontSize: '14px' }}>
                  {new Date(report.generatedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p style={{ color: '#999', fontSize: '12px', marginBottom: '8px' }}>Avg Resolution Time</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {report.avgResolutionTime}h
                </p>
              </div>
            </div>
          </div>

          {/* Trend Analysis */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <h3 className="card-title">Incident Trends</h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>This Week</td>
                  <td style={{ fontWeight: 'bold' }}>{report.incidentsTrend.thisWeek}</td>
                </tr>
                <tr>
                  <td>Last Week</td>
                  <td style={{ fontWeight: 'bold' }}>{report.incidentsTrend.lastWeek}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Status Distribution */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Status Distribution</h3>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Count</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report.statusDistribution).map(([status, count]) => (
                    <tr key={status}>
                      <td><span className={`badge badge-${status}`}>{status.replace('_', ' ').toUpperCase()}</span></td>
                      <td style={{ fontWeight: 'bold' }}>{count}</td>
                      <td>{((count / report.totalIncidents) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Priority Distribution</h3>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Priority</th>
                    <th>Count</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report.priorityDistribution).map(([priority, count]) => (
                    <tr key={priority}>
                      <td><span className={`badge badge-${priority.toLowerCase()}`}>{priority}</span></td>
                      <td style={{ fontWeight: 'bold' }}>{count}</td>
                      <td>{((count / report.totalIncidents) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="card" style={{ marginTop: '20px' }}>
            <div className="card-header">
              <h3 className="card-title">Category Breakdown</h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {report.categoryBreakdown.map(cat => (
                  <tr key={cat.category}>
                    <td><strong>{cat.category}</strong></td>
                    <td>{cat.count}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: `${(cat.count / report.totalIncidents) * 200}px`,
                          height: '20px',
                          backgroundColor: '#d4001c',
                          borderRadius: '3px'
                        }}></div>
                        {((cat.count / report.totalIncidents) * 100).toFixed(1)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
