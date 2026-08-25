import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

/**
 * MobileNavigation — Bottom tab bar + slide-up drawer
 * Updated to Stitch warm palette with signal-lime active states.
 */

const primaryNavItems = [
  { path: '/', label: 'Home', icon: 'dashboard' },
  { path: '/scanner', label: 'Scanner', icon: 'biotech' },
  { path: '/weather', label: 'Weather', icon: 'cloud' },
  { path: '/marketplace', label: 'Market', icon: 'storefront' }
];

const secondaryNavItems = [
  { path: '/marketplace', label: 'Marketplace', icon: 'storefront', desc: 'Inputs & produce Mandi' },
  { path: '/groupbuying', label: 'Group Buying', icon: 'group', desc: 'Pool orders for bulk savings' },
  { path: '/schemes', label: 'Govt Schemes', icon: 'account_balance', desc: 'Central & state subsidies' },
  { path: '/calculator', label: 'Farm Calculator', icon: 'calculate', desc: 'Fertilizer & yield estimator' },
  { path: '/loan-eligibility', label: 'Loan Eligibility', icon: 'credit_card', desc: 'KCC & credit scoring' },
  { path: '/records', label: 'Farm Records', icon: 'description', desc: 'Crop logs & field history' },
  { path: '/orders', label: 'Orders & Delivery', icon: 'local_shipping', desc: 'Track inputs & OTP delivery' },
  { path: '/profile', label: 'Profile & Settings', icon: 'settings', desc: 'Farmer details & language' }
];

export const MobileNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isSecondaryActive = secondaryNavItems.some(item => location.pathname.startsWith(item.path));

  return (
    <>
      {/* Slide-Up Mobile Drawer */}
      {isOpen && (
        <div
          className="app-mobile-nav-backdrop"
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(34, 37, 31, 0.4)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxHeight: '80vh',
              background: 'var(--card-bg)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '1.25rem 1rem 2rem 1rem',
              overflowY: 'auto',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark-text)' }}>BharatFarm Ecosystem</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Select a tool or service below</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'var(--card-gray)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  color: 'var(--dark-text)'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {secondaryNavItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0.85rem',
                    borderRadius: '16px',
                    background: isActive ? 'var(--signal-lime)' : 'var(--card-gray)',
                    border: 'none',
                    textDecoration: 'none'
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--dark-text)' }}>{item.icon}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-text)' }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', lineHeight: '1.2' }}>
                    {item.desc}
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Nav Bar */}
      <nav
        className="app-mobile-nav"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'var(--sidebar-bg)',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 999,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.04)'
        }}
      >
        {primaryNavItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.15rem',
              fontSize: '0.65rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--dark-text)' : 'var(--text-muted)',
              textDecoration: 'none',
              background: isActive ? 'var(--signal-lime)' : 'transparent',
              padding: '0.3rem 0.6rem',
              borderRadius: '12px'
            })}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: isSecondaryActive ? 'var(--signal-lime)' : 'transparent',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.15rem',
            fontSize: '0.65rem',
            fontWeight: isSecondaryActive ? 600 : 400,
            color: isSecondaryActive ? 'var(--dark-text)' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.3rem 0.6rem',
            borderRadius: '12px'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>apps</span>
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
