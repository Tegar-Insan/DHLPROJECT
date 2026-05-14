import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <div className="navbar">
      <h1 style={{ color: '#d4001c', fontSize: '20px' }}>
        DHL APSSC Incident Management System
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span style={{ color: '#666' }}>
          Welcome, <strong>{user?.name}</strong>
        </span>
        <span
          style={{
            padding: '4px 12px',
            backgroundColor: '#d4001c',
            color: 'white',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          {user?.role.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
