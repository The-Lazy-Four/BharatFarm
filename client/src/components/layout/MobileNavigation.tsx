import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const primaryNavItems = [
  { path: '/', label: 'Home', icon: '📊' },
  { path: '/krishibot', label: 'KrishiBot', icon: '🤖' },
  { path: '/scanner', label: 'Scanner', icon: '🍃' },
  { path: '/weather', label: 'Weather', icon: '🌤️' }
];

const secondaryNavItems = [
  { path: '/marketplace', label: 'Marketplace', icon: '🚜', desc: 'Inputs & produce Mandi' },
  { path: '/groupbuying', label: 'Group Buying', icon: '👥', desc: 'Pool orders for bulk savings' },
  { path: '/schemes', label: 'Govt Schemes', icon: '🏛️', desc: 'Central & state subsidies' },
  { path: '/calculator', label: 'Farm Calculator', icon: '🧮', desc: 'Fertilizer & yield estimator' },
  { path: '/loan-eligibility', label: 'Loan Eligibility', icon: '💳', desc: 'KCC & credit scoring' },
  { path: '/records', label: 'Farm Records', icon: '📋', desc: 'Crop logs & field history' },
  { path: '/orders', label: 'Orders & Delivery', icon: '📦', desc: 'Track inputs & OTP delivery' },
  { path: '/profile', label: 'Profile & Settings', icon: '⚙️', desc: 'Farmer details & language' }
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
            background: 'rgba(0,0,0,0.4)',
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
              background: '#FFFFFF',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              padding: '1.25rem 1rem 2rem 1rem',
              overflowY: 'auto',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>BharatFarm Ecosystem</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Select a tool or service below</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'var(--bg-main)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  fontSize: '1rem',
                  cursor: 'pointer'
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
                    borderRadius: '12px',
                    background: isActive ? '#E6F4EA' : 'var(--bg-main)',
                    border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    textDecoration: 'none'
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{item.label}</span>
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
          background: '#FFFFFF',
          borderTop: '1px solid var(--border-color)',
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
              color: isActive ? 'var(--primary)' : 'var(--text-muted)'
            })}
          >
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.15rem',
            fontSize: '0.65rem',
            fontWeight: isSecondaryActive ? 600 : 400,
            color: isSecondaryActive ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>📱</span>
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
