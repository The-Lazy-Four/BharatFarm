import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

interface MobileBottomNavProps {
  type?: 'main' | 'basic';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ type = 'main' }) => {
  const { t } = useLanguage();

  const mainItems = [
    { to: '/home', label: t('mobileHome.bottomHome'), icon: 'home' },
    { to: '/demo', label: t('mobileHome.bottomDemo'), icon: 'play_circle' },
    { to: '/sih/sahayak', label: t('mobileHome.bottomSahayak'), icon: 'chat' },
    { to: '/profile', label: t('mobileHome.bottomProfile'), icon: 'person' },
  ];

  const basicItems = [
    { to: '/dashboard', label: t('mobileHome.bottomHome'), icon: 'home' },
    { to: '/demo', label: t('mobileHome.bottomDemo'), icon: 'play_circle' },
    { to: '/sih/sahayak', label: t('mobileHome.bottomSahayak'), icon: 'chat' },
    { to: '/profile', label: t('mobileHome.bottomProfile'), icon: 'person' },
  ];

  const items = type === 'basic' ? basicItems : mainItems;

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '66px',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 1000,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.05)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: '0.5rem',
        paddingRight: '0.5rem'
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
            textDecoration: 'none',
            color: isActive ? '#15803D' : '#64748B',
            fontWeight: isActive ? 800 : 500,
            fontSize: '0.72rem',
            width: '24%',
            transition: 'all 0.2s ease'
          })}
        >
          {({ isActive }) => (
            <>
              <div
                style={{
                  width: isActive ? '54px' : '36px',
                  height: '32px',
                  borderRadius: '16px',
                  backgroundColor: isActive ? '#16A34A' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  marginBottom: '2px'
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: '22px',
                    color: isActive ? '#FFFFFF' : '#64748B',
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    transition: 'color 0.2s ease'
                  }}
                >
                  {item.icon}
                </span>
              </div>
              <span style={{ lineHeight: 1.1 }}>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
