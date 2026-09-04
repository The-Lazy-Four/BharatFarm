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
        to="/home"
        className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
          home
        </span>
        <span>Home</span>
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
        to="/scanner"
        className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
          biotech
        </span>
        <span>Scanner</span>
      </NavLink>

      <NavLink
        to="/marketplace"
        className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
          storefront
        </span>
        <span>Mandi</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
          person
        </span>
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};
