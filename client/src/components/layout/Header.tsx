import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';

/**
 * Mobile Top Bar Header Component
 * Farmer-first, compact header for mobile/PWA viewports.
 * Displays Logo, title, theme switcher, notification badge, and profile avatar.
 */
export const Header: React.FC = () => {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(false);

  return (
    <header
      className="app-mobile-top-bar"
      style={{
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        background: 'rgba(15, 56, 34, 0.95)', // Deep forest green
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: '#FFFFFF',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
    >
      {/* LEFT: Logo & Name */}
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#FFFFFF',
          textDecoration: 'none'
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'var(--signal-lime)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--dark-text)',
            fontWeight: 800
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            agriculture
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            BharatFarm
          </span>
          <span style={{ fontSize: '0.65rem', color: '#D7F21A', fontWeight: 600 }}>
            Smart Farmer AI
          </span>
        </div>
      </Link>

      {/* RIGHT: Actions (Theme Toggle, Notifications, Profile Avatar) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {/* Theme Toggle Button */}
        <button
          onClick={() => setIsDark(!isDark)}
          title="Toggle Display Mode"
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            {isDark ? 'dark_mode' : 'light_mode'}
          </span>
        </button>

        {/* Notifications Icon with Badge */}
        <Link
          to="/profile"
          style={{
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.12)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            textDecoration: 'none'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            notifications
          </span>
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              background: 'var(--signal-lime)',
              color: 'var(--dark-text)',
              fontSize: '9px',
              fontWeight: 800,
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            2
          </span>
        </Link>

        {/* Profile Avatar */}
        <Link
          to="/profile"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--signal-lime)',
            border: '1px solid rgba(255,255,255,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--dark-text)',
            fontWeight: 700,
            fontSize: '0.85rem'
          }}
        >
          {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'R'}
        </Link>
      </div>
    </header>
  );
};

