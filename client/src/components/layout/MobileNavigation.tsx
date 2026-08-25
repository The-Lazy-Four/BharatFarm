import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/krishibot', label: 'Bot', icon: '🤖' },
  { path: '/scanner', label: 'Scan', icon: '🍃' },
  { path: '/marketplace', label: 'Market', icon: '🚜' },
  { path: '/weather', label: 'Weather', icon: '🌤️' },
  { path: '/schemes', label: 'Schemes', icon: '🏛️' }
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
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-color)',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 100
      }}
    >
      {navItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.15rem',
            fontSize: '0.65rem',
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
