import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/krishibot', label: 'KrishiBot Assistant', icon: '🤖' },
  { path: '/scanner', label: 'Leaf Scanner', icon: '🍃' },
  { path: '/marketplace', label: 'Marketplace', icon: '🚜' },
  { path: '/weather', label: 'Weather Forecast', icon: '🌤️' },
  { path: '/groupbuying', label: 'Group Buying', icon: '👥' },
  { path: '/schemes', label: 'Government Schemes', icon: '🏛️' }
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="app-sidebar" style={{
      width: '260px',
      borderRight: '1px solid var(--border-color)',
      padding: '1.5rem 1rem',
      flexDirection: 'column',
      gap: '0.5rem',
      background: 'var(--bg-dark)'
    }}>
      {navItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius)',
            fontSize: '0.95rem',
            fontWeight: isActive ? 600 : 400,
            background: isActive ? 'var(--bg-card-hover)' : 'transparent',
            color: isActive ? 'var(--primary)' : 'var(--text-muted)',
            borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent'
          })}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </aside>
  );
};
