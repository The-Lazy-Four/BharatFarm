import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/krishibot', label: 'KrishiBot Assistant', icon: '🤖' },
  { path: '/scanner', label: 'Leaf Scanner Intelligence', icon: '🍃' },
  { path: '/weather', label: 'Weather Intelligence', icon: '🌤️' },
  { path: '/marketplace', label: 'Marketplace', icon: '🚜' },
  { path: '/groupbuying', label: 'Group Buying', icon: '👥' },
  { path: '/records', label: 'Farm Records', icon: '📋' },
  { path: '/schemes', label: 'Government Schemes', icon: '🏛️' },
  { path: '/calculator', label: 'Farm Calculator', icon: '🧮' },
  { path: '/loan-eligibility', label: 'Loan Eligibility', icon: '💳' },
  { path: '/orders', label: 'Orders & Delivery', icon: '📦' },
  { path: '/profile', label: 'Profile & Settings', icon: '⚙️' }
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="app-sidebar" style={{
      width: '260px',
      borderRight: '1px solid var(--border-color)',
      padding: '1.25rem 0.75rem',
      flexDirection: 'column',
      gap: '0.25rem',
      background: 'var(--bg-sidebar)',
      overflowY: 'auto'
    }}>
      {navItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.7rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            fontWeight: isActive ? 600 : 500,
            background: isActive ? '#E6F4EA' : 'transparent',
            color: isActive ? 'var(--primary)' : 'var(--text-muted)',
            borderLeft: isActive ? '4px solid var(--primary)' : '4px solid transparent',
            transition: 'var(--transition)'
          })}
        >
          <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </aside>
  );
};
