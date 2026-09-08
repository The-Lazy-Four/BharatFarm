import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MobileBottomNav } from './MobileBottomNav';
import { PriceRiskService } from '../../modules/sih/price-risk/priceRisk.service';

export const MobileModuleHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const reg = PriceRiskService.getFieldRegistration(user?.id || 'demo_farmer') || {
    fieldName: 'North Paddy Field',
    crop: 'Paddy',
    landSizeAcres: 0.4,
    district: 'Haldia',
    state: 'West Bengal'
  };

  const cards = [
    {
      id: 'price-risk',
      title: 'Before You Sow',
      subtitle: 'Price-Decrement Risk',
      description: 'Market risk & price predictions',
      icon: 'psychology',
      path: '/sih/price-risk',
      bg: '#ECFDF5',
      color: '#059669',
      image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'climate-risk',
      title: 'Climate Risk',
      subtitle: 'Aware Procurement',
      description: 'Weather insights & procurement',
      icon: 'partly_cloudy_day',
      path: '/sih/climate-risk',
      bg: '#EFF6FF',
      color: '#1D4ED8',
      image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'aggregation',
      title: 'Small-Farm Aggregation',
      subtitle: 'Optimizer',
      description: 'Group buying & selling together',
      icon: 'groups',
      path: '/sih/aggregation',
      bg: '#F0FDF4',
      color: '#15803D',
      image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'crop-insurance',
      title: 'Crop Risk & Insurance',
      subtitle: 'Verification',
      description: 'Crop health & claim support',
      icon: 'verified_user',
      path: '/sih/crop-insurance',
      bg: '#FEFCE8',
      color: '#A16207',
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'smart-mandi',
      title: 'Smart Mandi',
      subtitle: 'Intelligence',
      description: 'Best mandi prices & markets',
      icon: 'bar_chart',
      path: '/sih/smart-mandi',
      bg: '#FFF7ED',
      color: '#C2410C',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'sahayak',
      title: 'Sahayak + WhatsApp',
      subtitle: 'Assisted Access',
      description: 'AI & human support in your language',
      icon: 'chat',
      path: '/sih/sahayak',
      bg: '#F5F3FF',
      color: '#6D28D9',
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'basic-needs',
      title: 'Basic Farmer Needs',
      subtitle: 'Everyday Tools',
      description: 'Everyday farming tools & utilities',
      icon: 'agriculture',
      path: '/dashboard',
      bg: '#FEF9C3',
      color: '#854D0E',
      isBasic: true,
      image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=600&q=80'
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
            SIH Innovations & Farming Tools
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

      {/* Main 2-Column Grid for Module Cards */}
      <main style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Top Section: Field Mapping Registered Farm Banner */}
        <div
          onClick={() => navigate('/sih/field-mapping')}
          style={{
            background: '#F0FDF4',
            border: '1.5px solid #BBF7D0',
            borderRadius: '16px',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.08)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#16A34A', flexShrink: 0 }}>
              check_circle
            </span>
            <div>
              <div style={{ color: '#166534', fontSize: '0.82rem', fontWeight: 800, lineHeight: 1.2 }}>
                Registered Farm: {reg.fieldName} ({reg.crop}, {reg.landSizeAcres} Acres) in {reg.district}, {reg.state}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 600, marginTop: '0.15rem' }}>
                Field Mapping — Walk the Farm
              </div>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/sih/field-mapping');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#15803D',
              fontSize: '0.78rem',
              fontWeight: 800,
              textDecoration: 'underline',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            Update Registration
          </button>
        </div>

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
                border: card.isBasic ? '1.5px solid #FDE047' : '1px solid #E2E8F0',
                boxShadow: card.isBasic ? '0 4px 12px rgba(234, 179, 8, 0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflow: 'hidden',
                gridColumn: card.isBasic ? 'span 2' : 'span 1'
              }}
            >
              <div style={{ position: 'relative', height: card.isBasic ? '110px' : '90px', width: '100%', overflow: 'hidden' }}>
                <img
                  src={card.image}
                  alt={card.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(15,23,42,0.6) 100%)'
                }} />
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{card.icon}</span>
                </div>
              </div>

              <div style={{ padding: '0.75rem 0.85rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.15rem 0', lineHeight: 1.2 }}>
                    {card.title}
                  </h2>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: card.color, marginBottom: '0.25rem' }}>
                    {card.subtitle}
                  </div>

                  <p style={{ fontSize: '0.7rem', color: '#64748B', margin: 0, lineHeight: 1.3, fontWeight: 500 }}>
                    {card.description}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: card.color }}>
                    arrow_forward
                  </span>
                </div>
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
