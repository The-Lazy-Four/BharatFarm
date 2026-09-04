import React from 'react';
import { NavLink } from 'react-router-dom';

interface MobileBottomNavProps {
  type?: 'main' | 'basic';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ type = 'main' }) => {
  const mainItems = [
    { to: '/home', label: 'Home', icon: 'home' },
    { to: '/schemes', label: 'Learn', icon: 'menu_book' },
    { to: '/sih/climate-risk', label: 'Alerts', icon: 'notifications' },
    { to: '/profile', label: 'Profile', icon: 'person' },
  ];

  const basicItems = [
    { to: '/dashboard', label: 'Home', icon: 'home' },
    { to: '/calculator', label: 'Tools', icon: 'build' },
    { to: '/marketplace', label: 'Community', icon: 'groups' },
    { to: '/profile', label: 'Profile', icon: 'person' },
  ];

  const items = type === 'basic' ? basicItems : mainItems;

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 1000,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            textDecoration: 'none',
            color: isActive ? '#16A34A' : '#64748B',
            fontWeight: isActive ? 700 : 500,
            fontSize: '0.72rem',
            width: '25%'
          })}
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '22px',
                  color: isActive ? '#16A34A' : '#64748B'
                }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
