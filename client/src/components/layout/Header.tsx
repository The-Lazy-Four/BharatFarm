import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Header — Hidden in the Stitch Master Style Fix design.
 * Logo and nav are in the sidebar. This component is kept but renders
 * a minimal mobile-only header for small screens.
 */
export const Header: React.FC = () => {
  return (
    <header className="app-header" style={{
      height: '56px',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1rem',
      background: 'var(--sidebar-bg)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <Link to="/" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>agriculture</span>
        <span>BharatFarm</span>
      </Link>
    </header>
  );
};
