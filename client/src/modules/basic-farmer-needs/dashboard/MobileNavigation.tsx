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
        zIndex: 50
      }}
    >
      <NavLink
        to="/"
        end
        className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
          auto_awesome
        </span>
        <span>Showcase</span>
      </NavLink>

      <NavLink
        to="/dashboard"
        className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
          dashboard
        </span>
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/innovations/climate-risk"
        className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
          cyclone
        </span>
        <span>Climate</span>
      </NavLink>

      <NavLink
        to="/innovations/smart-mandi"
        className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
          distance
        </span>
        <span>Mandi ML</span>
      </NavLink>

      <NavLink
        to="/innovations/sahayak"
        className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
          handshake
        </span>
        <span>Sahayak</span>
      </NavLink>
    </nav>
  );
};
