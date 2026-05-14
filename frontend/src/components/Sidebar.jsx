import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Incidents', path: '/incidents', icon: '📋' },
    { label: 'New Incident', path: '/new-incident', icon: '➕' },
    { label: 'Reports', path: '/reports', icon: '📈' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      <div className="sidebar-logo">DHL</div>
      <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>Incident Management</p>
      
      <nav className="nav-menu">
        {menuItems.map((item) => (
          <li key={item.path} className="nav-item">
            <Link
              to={item.path}
              className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <span style={{ marginRight: '8px' }}>{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #555' }}>
        <p style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>Logged in as:</p>
        <p style={{ fontSize: '14px', color: 'white', fontWeight: 'bold', marginBottom: '15px' }}>
          {user?.name} ({user?.role})
        </p>
        <button
          onClick={logout}
          className="btn btn-secondary"
          style={{ width: '100%' }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
