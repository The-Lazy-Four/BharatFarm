import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';

/**
 * Sidebar — Stitch Master Style Fix design.
 * Warm gray background, Material icons, signal-lime active state,
 * BharatFarm logo at top, notification/settings/user at bottom.
 */

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/scanner', label: 'Leaf Scanner Intelligence', icon: 'biotech' },
  { path: '/weather', label: 'Weather Intelligence', icon: 'cloud' },
  { path: '/marketplace', label: 'Marketplace', icon: 'storefront' },
  { path: '/groupbuying', label: 'Group Buying', icon: 'group' },
  { path: '/records', label: 'Farm Records', icon: 'description' },
  { path: '/schemes', label: 'Government Schemes', icon: 'account_balance' },
  { path: '/calculator', label: 'Farm Calculator', icon: 'calculate' },
  { path: '/loan-eligibility', label: 'Loan Eligibility', icon: 'credit_card' },
  { path: '/orders', label: 'Orders & Delivery', icon: 'local_shipping' },
  { path: '/profile', label: 'Profile & Settings', icon: 'settings' }
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  return (
    <aside className="app-sidebar" style={{
      width: '260px',
      background: 'var(--sidebar-bg)',
      padding: '2rem 0',
      flexDirection: 'column',
      gap: '0.25rem',
      overflowY: 'auto',
      position: 'sticky',
      top: 0,
      height: '100vh'
    }}>
      {/* Logo Section */}
      <div style={{ padding: '0 2rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--dark-text)' }}>agriculture</span>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--dark-text)', letterSpacing: '-0.02em' }}>BharatFarm</h1>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.7rem 1rem',
              borderRadius: '16px',
              fontSize: '0.9rem',
              fontWeight: isActive ? 600 : 500,
              background: isActive ? 'var(--signal-lime)' : 'transparent',
              color: isActive ? 'var(--dark-text)' : 'rgba(34, 37, 31, 0.7)',
              transition: 'var(--transition)',
              textDecoration: 'none'
            })}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '20px' }}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section: Notification, Settings, User */}
      <div style={{ padding: '0 2rem', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Notification link */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(34, 37, 31, 0.7)', transition: 'var(--transition)', textDecoration: 'none' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>notifications</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Notification</span>
          <span style={{
            marginLeft: 'auto',
            background: 'var(--signal-lime)',
            color: 'var(--dark-text)',
            fontSize: '10px',
            fontWeight: 700,
            padding: '0.15rem 0.5rem',
            borderRadius: 'var(--radius-pill)'
          }}>2</span>
        </a>

        {/* Settings link */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(34, 37, 31, 0.7)', transition: 'var(--transition)', textDecoration: 'none' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>settings</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Setting</span>
        </a>

        {/* User Profile */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          paddingTop: '1.5rem',
          marginTop: '0.5rem',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--dark-text)' }}>person</span>
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--dark-text)' }}>{user?.fullName || 'Alex Jackson'}</span>
        </div>
      </div>
    </aside>
  );
};
