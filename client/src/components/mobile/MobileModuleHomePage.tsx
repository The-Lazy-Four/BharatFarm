import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MobileBottomNav } from './MobileBottomNav';

export const MobileModuleHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const cards = [
    {
      id: 'climate-risk',
      title: 'Climate Risk',
      description: 'Weather insights & procurement',
      icon: 'partly_cloudy_day',
      path: '/sih/climate-risk',
      bg: '#EFF6FF',
      color: '#1D4ED8'
    },
    {
      id: 'aggregation',
      title: 'Small-Farm Aggregation',
      description: 'Group buying & selling together',
      icon: 'groups',
      path: '/sih/aggregation',
      bg: '#F0FDF4',
      color: '#15803D'
    },
    {
      id: 'crop-insurance',
      title: 'Crop Risk & Insurance',
      description: 'Crop health & claim support',
      icon: 'verified_user',
      path: '/sih/crop-insurance',
      bg: '#FEFCE8',
      color: '#A16207'
    },
    {
      id: 'smart-mandi',
      title: 'Smart Mandi',
      description: 'Best mandi prices & nearest markets',
      icon: 'bar_chart',
      path: '/sih/smart-mandi',
      bg: '#FFF7ED',
      color: '#C2410C'
    },
    {
      id: 'sahayak',
      title: 'Sahayak + WhatsApp',
      description: 'AI & human support in your language',
      icon: 'chat',
      path: '/sih/sahayak',
      bg: '#F5F3FF',
      color: '#6D28D9'
    },
    {
      id: 'basic-needs',
      title: 'Basic Farmer Needs',
      description: 'Everyday farming tools & utilities',
      icon: 'agriculture',
      path: '/dashboard',
      bg: '#FEF9C3',
      color: '#854D0E',
      isBasic: true
    }
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
      {/* Top Bar Greeting */}
      <header style={{
        padding: '1.25rem 1.25rem 0.75rem',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Hello, Farmer! 👋
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.15rem 0 0 0', fontWeight: 500 }}>
            Choose what you need today
          </p>
        </div>

        {/* User Profile Avatar */}
        <button
          onClick={() => navigate('/profile')}
          title="Profile & Settings"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
            color: '#FFFFFF',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1rem',
            boxShadow: '0 4px 10px rgba(22, 163, 74, 0.25)',
            cursor: 'pointer'
          }}
        >
          {user?.fullName ? user.fullName[0].toUpperCase() : '👨‍🌾'}
        </button>
      </header>

      {/* Main 2-Column Grid for 6 Module Cards */}
      <main style={{ padding: '1.25rem 1rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.85rem'
        }}>
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => navigate(card.path)}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '1rem 0.85rem',
                border: card.isBasic ? '1.5px solid #FDE047' : '1px solid #E2E8F0',
                boxShadow: card.isBasic ? '0 4px 12px rgba(234, 179, 8, 0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '140px'
              }}
            >
              <div>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: card.bg,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.65rem'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{card.icon}</span>
                </div>

                <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.25rem 0', lineHeight: 1.2 }}>
                  {card.title}
                </h2>

                <p style={{ fontSize: '0.72rem', color: '#64748B', margin: 0, lineHeight: 1.3, fontWeight: 500 }}>
                  {card.description}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: card.color }}>
                  arrow_forward
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav type="main" />
    </div>
  );
};
