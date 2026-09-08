import React from 'react';
import { NavLink } from 'react-router-dom';

export const MobileNavigation: React.FC = () => {
  return (
    <nav
      className="app-mobile-nav mobile-nav-surface"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 0.5rem',
        zIndex: 50,
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <NavLink
        to="/home"
        className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          textDecoration: 'none',
          color: isActive ? '#16A34A' : '#64748B',
          fontWeight: isActive ? 700 : 500,
          fontSize: '0.72rem'
        })}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
          home
        </span>
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/demo"
        className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          textDecoration: 'none',
          color: isActive ? '#16A34A' : '#64748B',
          fontWeight: isActive ? 700 : 500,
          fontSize: '0.72rem'
        })}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
          play_circle
        </span>
        <span>Demo</span>
      </NavLink>

      <NavLink
        to="/sih/sahayak"
        className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          textDecoration: 'none',
          color: isActive ? '#16A34A' : '#64748B',
          fontWeight: isActive ? 700 : 500,
          fontSize: '0.72rem'
        })}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
          chat
        </span>
        <span>Sahaya</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
        style={({ isActive }) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          textDecoration: 'none',
          color: isActive ? '#16A34A' : '#64748B',
          fontWeight: isActive ? 700 : 500,
          fontSize: '0.72rem'
        })}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
          person
        </span>
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};
