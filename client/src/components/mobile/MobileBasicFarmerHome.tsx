import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MobileBottomNav } from './MobileBottomNav';

export const MobileBasicFarmerHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const tools = [
    { title: 'Weather', icon: 'partly_cloudy_day', path: '/sih/climate-risk', color: '#0284C7', bg: '#E0F2FE' },
    { title: 'Crop Guide', icon: 'route', path: '/crop-roadmap', color: '#16A34A', bg: '#DCFCE7' },
    { title: 'Market Prices', icon: 'storefront', path: '/marketplace', color: '#D97706', bg: '#FEF3C7' },
    { title: 'Leaf Scanner', icon: 'biotech', path: '/scanner', color: '#059669', bg: '#D1FAE5' },
    { title: 'Cost Calculator', icon: 'calculate', path: '/calculator', color: '#7C3AED', bg: '#EDE9FE' },
    { title: 'My Farm', icon: 'description', path: '/records', color: '#DC2626', bg: '#FEE2E2' },
    { title: 'Schemes', icon: 'account_balance', path: '/schemes', color: '#2563EB', bg: '#DBEAFE' },
    { title: 'Community', icon: 'groups', path: '/sih/aggregation', color: '#059669', bg: '#D1FAE5' },
    { title: 'Profile', icon: 'person', path: '/profile', color: '#4B5563', bg: '#F3F4F6' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#F8FAFC',
      paddingBottom: '80px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      {/* Top Header */}
      <header style={{
        padding: '1.25rem 1.25rem 0.85rem',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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
              padding: 0
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
          </button>

          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              Basic Farmer Needs
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.1rem 0 0 0', fontWeight: 500 }}>
              Everyday farming utilities
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/profile')}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: '#16A34A',
            color: '#FFFFFF',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          {user?.fullName ? user.fullName[0].toUpperCase() : '👨‍🌾'}
        </button>
      </header>

      {/* Main Grid for Tools */}
      <main style={{ padding: '1.25rem 1rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
          borderRadius: '16px',
          padding: '1.25rem',
          color: '#FFFFFF',
          marginBottom: '1.25rem',
          boxShadow: '0 6px 16px rgba(22, 163, 74, 0.25)'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0 }}>
            Welcome Back!
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.9)', marginTop: '0.25rem', margin: 0 }}>
            Manage your farm, track progress, and grow smarter.
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
