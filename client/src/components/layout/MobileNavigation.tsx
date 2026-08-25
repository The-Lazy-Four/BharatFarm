import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Home', icon: '📊' },
  { path: '/krishibot', label: 'Bot', icon: '🤖' },
  { path: '/scanner', label: 'Scan', icon: '🍃' },
  { path: '/weather', label: 'Weather', icon: '🌤️' },
  { path: '/marketplace', label: 'Market', icon: '🚜' }
];

export const MobileNavigation: React.FC = () => {
  return (
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
        zIndex: 100,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.04)'
      }}
    >
      {navItems.map(item => (
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
    </nav>
  );
};
