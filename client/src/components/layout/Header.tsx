import React from 'react';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  return (
    <header style={{
      height: '64px',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      background: '#FFFFFF',
      boxShadow: 'var(--shadow-sm)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <Link to="/" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{ fontSize: '1.5rem' }}>🌾</span>
        <span>BharatFarm</span>
      </Link>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          Smart AgriTech Ecosystem
        </span>
      </div>
    </header>
  );
};
