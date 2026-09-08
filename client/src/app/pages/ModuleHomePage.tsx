import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useIsMobile } from '../../hooks/useIsMobile';
import { MobileModuleHomePage } from '../../components/mobile/MobileModuleHomePage';
import { PriceRiskService } from '../../modules/sih/price-risk/priceRisk.service.js';
import { NotificationDrawer } from '../../components/notifications/NotificationDrawer';

interface SihCard {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  icon: string;
  path: string;
  image: string;
}

export const ModuleHomePage: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  if (isMobile) {
    return <MobileModuleHomePage />;
  }

  const reg = PriceRiskService.getFieldRegistration(user?.id || 'demo_farmer') || {
    fieldName: 'North Paddy Field',
    crop: 'Paddy',
    landSizeAcres: 0.4,
    district: 'Haldia',
    state: 'West Bengal'
  };

  const sihInnovations: SihCard[] = [
    {
      id: 'price-risk',
      title: 'Before You Sow',
      subtitle: 'Price-Decrement Risk',
      description: 'Pre-sowing market risk & price predictions',
      icon: 'psychology',
      path: '/sih/price-risk',
      image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'climate-risk',
      title: 'Climate Risk',
      subtitle: 'Aware Procurement',
      description: 'Weather insights & procurement planner',
      icon: 'partly_cloudy_day',
      path: '/sih/climate-risk',
      image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'aggregation',
      title: 'Small-Farm Aggregation',
      subtitle: 'Optimizer',
      description: 'Group buying & collective selling',
      icon: 'groups',
      path: '/sih/aggregation',
      image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'crop-insurance',
      title: 'Crop Risk & Insurance',
      subtitle: 'Verification',
      description: 'Satellite NDVI claim verification',
      icon: 'verified_user',
      path: '/sih/crop-insurance',
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'smart-mandi',
      title: 'Smart Mandi',
      subtitle: 'Intelligence',
      description: 'Best mandi prices & market router',
      icon: 'bar_chart',
      path: '/sih/smart-mandi',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'sahayak',
      title: 'Sahayak + WhatsApp',
      subtitle: 'Assisted Access',
      description: 'AI & human support in your language',
      icon: 'chat',
      path: '/sih/sahayak',
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const filteredInnovations = sihInnovations;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      color: '#0F172A',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* Top Main Navigation Header */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0.85rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src="/icons/icon-96.png"
            alt="BharatFarm"
            style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'contain' }}
          />
          <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1E293B', letterSpacing: '-0.02em' }}>BharatFarm</span>
        </div>

        {/* Header Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setIsNotificationsOpen(true)}
            title="Notifications"
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>notifications</span>
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              background: '#EF4444',
              border: '2px solid #FFFFFF'
            }} />
          </button>

          {/* User Avatar Circle */}
          <div
            onClick={() => navigate('/profile')}
            title={`View Profile & Settings (${user?.fullName || 'Farmer'})`}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#16A34A',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
            }}
          >
            {user?.fullName ? user.fullName[0].toUpperCase() : 'S'}
          </div>
        </div>
      </header>

      {/* Interactive Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Main Body */}
      <main style={{
        flex: 1,
        padding: '2.5rem 2rem',
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem'
      }}>

        {/* Welcome Banner */}
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 900,
            color: '#0F172A',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            Hello, Farmer! 👋
          </h1>
          <p style={{
            fontSize: '1rem',
            color: '#64748B',
            marginTop: '0.35rem',
            marginBottom: 0,
            fontWeight: 500
          }}>
            Choose an SIH innovation feature or open your everyday farming dashboard below.
          </p>
        </div>

        {/* Top Section: Field Mapping Registered Farm Status Card */}
        <div style={{
          background: '#F0FDF4',
          border: '1.5px solid #BBF7D0',
          borderRadius: '16px',
          padding: '1rem 1.35rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          boxShadow: '0 4px 12px rgba(22, 163, 74, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#DCFCE7',
              color: '#15803D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>map</span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534', fontSize: '0.95rem', fontWeight: 800 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#16A34A' }}>check_circle</span>
                <span>Registered Farm: {reg.fieldName} ({reg.crop}, {reg.landSizeAcres} Acres) in {reg.district}, {reg.state}</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#15803D', marginTop: '0.2rem', fontWeight: 500 }}>
                Field Mapping — Walk the Farm (SIH Innovation #6)
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/sih/field-mapping')}
            style={{
              background: '#16A34A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '0.65rem 1.25rem',
              fontSize: '0.86rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)'
            }}
          >
            <span>Update Registration</span>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
          </button>
        </div>

        {/* Section A: SIH Innovations (6 Cards) */}
        <section>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#16A34A' }}>eco</span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                SIH Innovation Modules
              </h2>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803D', background: '#DCFCE7', padding: '0.3rem 0.75rem', borderRadius: '14px' }}>
              6 Core Modules
            </span>
          </div>

          {/* Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.25rem'
          }}>
            {filteredInnovations.map((card) => (
              <div
                key={card.id}
                onClick={() => navigate(card.path)}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                className="sih-feature-card"
              >
                {/* Unsplash Image Header with Overlay */}
                <div style={{ position: 'relative', height: '140px', width: '100%', overflow: 'hidden' }}>
                  <img
                    src={card.image}
                    alt={card.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(15,23,42,0.6) 100%)'
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(4px)',
                    color: card.id === 'field-mapping' ? '#0369A1' : '#15803D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>{card.icon}</span>
                  </div>
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      margin: '0 0 0.2rem 0',
                      lineHeight: 1.2
                    }}>
                      {card.title}
                    </h3>

                    {card.subtitle && (
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: card.id === 'field-mapping' ? '#0284C7' : '#16A34A', marginBottom: '0.4rem' }}>
                        {card.subtitle}
                      </div>
                    )}

                    <p style={{
                      fontSize: '0.85rem',
                      color: '#64748B',
                      margin: 0,
                      lineHeight: 1.4,
                      fontWeight: 500
                    }}>
                      {card.description}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: '1rem'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: card.id === 'field-mapping' ? '#0284C7' : '#16A34A',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section B: Basic Farmer Needs (Separate Product/Module) */}
        <section>
          <div
            onClick={() => navigate('/dashboard')}
            style={{
              borderRadius: '20px',
              border: '1.5px solid #FDE047',
              boxShadow: '0 8px 20px rgba(234, 179, 8, 0.15)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '140px'
            }}
          >
            {/* Unsplash Background Banner */}
            <img
              src="https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1200&q=80"
              alt="Basic Farmer Needs"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.65) 100%)'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', zIndex: 2, padding: '2rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: '#16A34A',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(22, 163, 74, 0.3)'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>agriculture</span>
              </div>

              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 0.35rem 0' }}>
                  Basic Farmer Needs
                </h2>
                <p style={{ fontSize: '1rem', color: '#FCD34D', margin: 0, fontWeight: 700 }}>
                  Everyday farming companion (Weather, Schemes, Scanner, Marketplace)
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFFFFF', fontWeight: 800, fontSize: '1.1rem', zIndex: 2, paddingRight: '2rem' }}>
              <span>Open Dashboard</span>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_forward</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};
