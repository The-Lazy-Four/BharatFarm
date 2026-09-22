import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
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
  const { language, setLanguage, t } = useLanguage();
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
      title: t('sih.priceRiskNav'),
      subtitle: t('sih.priceRiskSubtitle'),
      description: t('sih.priceRiskDesc'),
      icon: 'psychology',
      path: '/sih/price-risk',
      image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'climate-risk',
      title: t('sih.climateRiskNav'),
      subtitle: t('sih.climateRiskSubtitle'),
      description: t('sih.climateRiskDesc'),
      icon: 'partly_cloudy_day',
      path: '/sih/climate-risk',
      image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'aggregation',
      title: t('sih.aggregationNav'),
      subtitle: t('sih.aggregationSubtitle'),
      description: t('sih.aggregationDesc'),
      icon: 'groups',
      path: '/sih/aggregation',
      image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'crop-insurance',
      title: t('sih.cropInsuranceNav'),
      subtitle: t('sih.cropInsuranceSubtitle'),
      description: t('sih.cropInsuranceDesc'),
      icon: 'verified_user',
      path: '/sih/crop-insurance',
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'smart-mandi',
      title: t('sih.smartMandiNav'),
      subtitle: t('sih.smartMandiSubtitle'),
      description: t('sih.smartMandiDesc'),
      icon: 'bar_chart',
      path: '/sih/smart-mandi',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'sahayak',
      title: t('sih.sahayakNav'),
      subtitle: t('sih.sahayakSubtitle'),
      description: t('sih.sahayakDesc'),
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
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src="/logo.png"
            alt="BharatFarm"
            style={{ width: '38px', height: '38px', objectFit: 'contain' }}
          />
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Bharat<span style={{ color: '#16A34A' }}>Farm</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
              Smart Tools. Stronger Farmers.
            </div>
          </div>
        </div>

        {/* Header Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Language Selector Dropdown */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            title={t('common.languageSelect')}
            style={{
              background: '#F8FAFC',
              color: '#0F172A',
              border: '1.5px solid #E2E8F0',
              borderRadius: '20px',
              padding: '0.35rem 0.85rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="en">EN</option>
            <option value="hi">हिंदी</option>
            <option value="bn">বাংলা</option>
          </select>
          <button
            onClick={() => setIsNotificationsOpen(true)}
            title={t('common.notifications')}
            style={{
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#334155',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>notifications</span>
            <span style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#EF4444',
              border: '2px solid #FFFFFF'
            }} />
          </button>

          {/* User Avatar Circle */}
          <div
            onClick={() => navigate('/profile')}
            title={t('moduleHome.profileTitle', { name: user?.fullName || 'Farmer' })}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#143621',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(20, 54, 33, 0.25)'
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

        {/* Welcome Banner with Landscape background */}
        <div style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          padding: '2rem 2.5rem',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
          border: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            opacity: 0.18,
            pointerEvents: 'none'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{
              fontSize: '2.2rem',
              fontWeight: 900,
              color: '#0F172A',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              letterSpacing: '-0.02em'
            }}>
              {t('home.welcomeUser', { name: user?.fullName || 'Farmer' })}
            </h1>
            <p style={{
              fontSize: '1.05rem',
              color: '#475569',
              marginTop: '0.45rem',
              marginBottom: 0,
              fontWeight: 600
            }}>
              {t('home.empowerTagline')}
            </p>
          </div>

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'right' }}>
            <div style={{
              fontFamily: '"Caveat", "Brush Script MT", cursive, sans-serif',
              fontSize: '1.6rem',
              fontWeight: 700,
              color: '#92400E',
              lineHeight: 1.1
            }}>
              For a Stronger <span style={{ color: '#15803D', fontWeight: 800 }}>Bharat</span>
            </div>
          </div>
        </div>

        {/* Top Section: Field Mapping Registered Farm Status Card */}
        <div style={{
          background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
          border: '1.5px solid #BBF7D0',
          borderRadius: '20px',
          padding: '1.25rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          flexWrap: 'wrap',
          boxShadow: '0 4px 16px rgba(22, 163, 74, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#BBF7D0',
              color: '#15803D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>potted_plant</span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#14532D', fontSize: '0.86rem', fontWeight: 800 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#16A34A', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span>{t('home.registeredFarmTitle')}</span>
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginTop: '0.15rem' }}>
                {reg.fieldName} <span style={{ fontWeight: 600, color: '#475569', fontSize: '1rem' }}>({reg.crop}, {reg.landSizeAcres} Acres)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: '#15803D', marginTop: '0.2rem', fontWeight: 600 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
                <span>{reg.district}, {reg.state}</span>
                <span style={{ margin: '0 0.4rem', color: '#86EFAC' }}>•</span>
                <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/sih/field-mapping')}>{t('home.fieldMappingShort')}</span>
                <span style={{ margin: '0 0.4rem', color: '#86EFAC' }}>•</span>
                <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/sih/climate-risk')}>{t('home.soilInsights')}</span>
                <span style={{ margin: '0 0.4rem', color: '#86EFAC' }}>•</span>
                <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/sih/field-mapping')}>{t('home.walkTheFarm')}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/sih/field-mapping')}
            style={{
              background: '#16A34A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.65rem 1.4rem',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
            }}
          >
            <span>{t('home.updateRegistration')}</span>
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
                {t('home.sihModulesTitle')}
              </h2>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803D', background: '#DCFCE7', padding: '0.3rem 0.75rem', borderRadius: '14px' }}>
              {t('home.sihModulesCount')}
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
                  {t('home.basicFarmerNeedsTitle')}
                </h2>
                <p style={{ fontSize: '1rem', color: '#FCD34D', margin: 0, fontWeight: 700 }}>
                  {t('home.basicFarmerNeedsDesc')}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFFFFF', fontWeight: 800, fontSize: '1.1rem', zIndex: 2, paddingRight: '2rem' }}>
              <span>{t('home.openDashboard')}</span>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_forward</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};
