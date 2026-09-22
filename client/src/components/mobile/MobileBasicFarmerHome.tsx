import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { MobileBottomNav } from './MobileBottomNav';

export const MobileBasicFarmerHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const tools = [
    { title: t('mobileHome.weather'), icon: 'partly_cloudy_day', path: '/sih/climate-risk', color: '#0284C7', bg: '#E0F2FE' },
    { title: t('mobileHome.cropGuide'), icon: 'route', path: '/crop-roadmap', color: '#16A34A', bg: '#DCFCE7' },
    { title: t('mobileHome.marketPrices'), icon: 'storefront', path: '/marketplace', color: '#D97706', bg: '#FEF3C7' },
    { title: t('mobileHome.leafScanner'), icon: 'biotech', path: '/scanner', color: '#059669', bg: '#D1FAE5' },
    { title: t('mobileHome.costCalculator'), icon: 'calculate', path: '/calculator', color: '#7C3AED', bg: '#EDE9FE' },
    { title: t('mobileHome.myFarm'), icon: 'description', path: '/records', color: '#DC2626', bg: '#FEE2E2' },
    { title: t('mobileHome.schemes'), icon: 'account_balance', path: '/schemes', color: '#2563EB', bg: '#DBEAFE' },
    { title: t('mobileHome.community'), icon: 'groups', path: '/sih/smart-mandi?tab=sell', color: '#059669', bg: '#D1FAE5' },
    { title: t('mobileHome.profile'), icon: 'person', path: '/profile', color: '#4B5563', bg: '#F3F4F6' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: '#F8FAFC',
      paddingBottom: '80px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      {/* Top Bar Header with Back Button */}
      <header style={{
        padding: '0.85rem 1rem',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <button
          onClick={() => navigate('/home')}
          style={{
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0F172A',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0
          }}
          aria-label="Back to Home"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
        </button>

        <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
          {t('home.basicFarmerNeedsTitle')}
        </h1>
      </header>

      {/* Main Grid for Tools */}
      <main style={{ padding: '0.85rem 0.75rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
          borderRadius: '16px',
          padding: '1.25rem',
          color: '#FFFFFF',
          marginBottom: '1.25rem',
          boxShadow: '0 6px 16px rgba(22, 163, 74, 0.25)'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0 }}>
            {t('mobileHome.welcomeBack')}
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.9)', marginTop: '0.25rem', margin: 0 }}>
            {t('mobileHome.welcomeMsg')}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem'
        }}>
          {tools.map((tool, idx) => (
            <div
              key={idx}
              onClick={() => navigate(tool.path)}
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '1rem 0.5rem',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '0.4rem'
              }}
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: tool.bg,
                color: tool.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{tool.icon}</span>
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                {tool.title}
              </span>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Nav with basic nav items */}
      <MobileBottomNav type="basic" />
    </div>
  );
};
