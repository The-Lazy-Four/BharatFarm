import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';

const primaryItems = [
  { path: '/', label: 'Home', icon: 'dashboard' },
  { path: '/scanner', label: 'Scanner', icon: 'biotech' },
  { path: '/weather', label: 'Weather', icon: 'cloud' },
  { path: '/marketplace', label: 'Market', icon: 'storefront' }
];

const extraItems = [
  { path: '/groupbuying', label: 'Group Buying', icon: 'group' },
  { path: '/records', label: 'Farm Records', icon: 'description' },
  { path: '/schemes', label: 'Govt Schemes', icon: 'account_balance' },
  { path: '/calculator', label: 'Farm Calculator', icon: 'calculate' },
  { path: '/loan-eligibility', label: 'Loan Eligibility', icon: 'credit_card' },
  { path: '/orders', label: 'Orders', icon: 'local_shipping' },
  { path: '/profile', label: 'Profile', icon: 'settings' }
];

export const MobileNavigation: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Drawer Overlay */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--surface-overlay)',
            backdropFilter: 'blur(4px)',
            zIndex: 90
          }}
        />
      )}

      {/* Drawer Menu */}
      {drawerOpen && (
        <div
          className="mobile-nav-drawer"
          style={{
            position: 'fixed',
            bottom: '56px',
            left: 0,
            right: 0,
            zIndex: 95,
            padding: '1.25rem 1rem 1.5rem 1rem',
            maxHeight: '70vh',
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--signal-lime)',
                color: 'var(--text-on-lime)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 700
              }}>
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'R'}
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.fullName || 'Ramesh Patel'}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.state || 'Punjab'} • Farmer</p>
              </div>
            </div>

            {/* Theme Toggle Button inside Drawer */}
            <button
              onClick={toggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--surface-1)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                {theme === 'light' ? 'dark_mode' : 'light_mode'}
              </span>
              <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' }}>
            {extraItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setDrawerOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'var(--signal-lime)' : 'var(--surface-1)',
                  color: isActive ? 'var(--text-on-lime)' : 'var(--text-primary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  border: '1px solid var(--border-default)'
                })}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar */}
      <nav
        className="app-mobile-nav mobile-nav-surface"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '56px',
          zIndex: 100,
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 0.5rem'
        }}
      >
        {primaryItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* Menu Toggle */}
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className={`mobile-nav-item${drawerOpen ? ' active' : ''}`}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            {drawerOpen ? 'close' : 'menu'}
          </span>
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
