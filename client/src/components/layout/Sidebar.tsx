import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/scanner', label: 'Leaf Scanner AI', icon: 'biotech' },
  { path: '/weather', label: 'Weather Intelligence', icon: 'cloud' },
  { path: '/marketplace', label: 'Marketplace', icon: 'storefront' },
  { path: '/groupbuying', label: 'Group Buying', icon: 'group' },
  { path: '/records', label: 'Farm Records', icon: 'description' },
  { path: '/schemes', label: 'Govt Schemes', icon: 'account_balance' },
  { path: '/calculator', label: 'Farm Calculator', icon: 'calculate' },
  { path: '/loan-eligibility', label: 'Loan Eligibility', icon: 'credit_card' },
  { path: '/orders', label: 'Orders & Delivery', icon: 'local_shipping' },
  { path: '/profile', label: 'Profile & Settings', icon: 'settings' }
];

export const Sidebar: React.FC = () => {
  const { user, profileImage, getUserInitials } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside
      className="app-sidebar sidebar-surface"
      style={{
        width: '250px',
        padding: '1.5rem 0',
        flexDirection: 'column',
        gap: '0.2rem',
        overflowY: 'auto',
        position: 'sticky',
        top: 0,
        height: '100vh',
        flexShrink: 0
      }}
    >
      {/* Logo Section */}
      <div style={{ padding: '0 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'var(--signal-lime)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--text-on-lime)' }}>agriculture</span>
        </div>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>BharatFarm</h1>
          <span style={{ fontSize: '0.62rem', color: 'var(--emerald-primary)', fontWeight: 600 }}>Smart Farmer AI</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '0 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '19px', flexShrink: 0 }}>
              {item.icon}
            </span>
            <span style={{ fontSize: '0.85rem' }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom: Theme Control & User Profile */}
      <div style={{ padding: '0 1.5rem', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '1.25rem' }}>
        {/* Desktop Theme Switcher */}
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 0.85rem',
            borderRadius: '12px',
            background: 'var(--surface-1)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--emerald-primary)' }}>
              {theme === 'light' ? 'light_mode' : 'dark_mode'}
            </span>
            <span>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>Switch</span>
        </button>

        {/* User Profile Footer */}
        <NavLink
          to="/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            paddingTop: '0.85rem',
            marginTop: '0.25rem',
            borderTop: '1px solid var(--border-default)',
            textDecoration: 'none'
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--signal-lime)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: 'var(--text-on-lime)',
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            {profileImage ? (
              <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              getUserInitials()
            )}
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
              {user?.fullName || 'Ramesh Patel'}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {user?.state || 'Punjab'} • Farmer
            </span>
          </div>
        </NavLink>
      </div>
    </aside>
  );
};
