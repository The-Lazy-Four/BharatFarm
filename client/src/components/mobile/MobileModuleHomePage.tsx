import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { usePWA } from '../../context/PWAContext.js';
import { MobileBottomNav } from './MobileBottomNav.js';
import { PriceRiskService } from '../../modules/sih/price-risk/priceRisk.service.js';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'climate' | 'mandi' | 'aggregation' | 'system';
  route: string;
}

const INITIAL_NOTIFS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'BharatFarm Climate Alert 🌧️',
    message: 'Heavy rainfall is expected in Haldia tomorrow. Review harvest plan.',
    time: '10m ago',
    type: 'climate',
    route: '/sih/climate-risk'
  },
  {
    id: 'n2',
    title: 'BharatFarm Mandi Alert 📊',
    message: 'Kolkata mandi currently offers a higher estimated net return for Paddy (+₹140/quintal).',
    time: '1h ago',
    type: 'mandi',
    route: '/sih/smart-mandi'
  },
  {
    id: 'n3',
    title: 'BharatFarm Aggregation Update 🤝',
    message: 'Your Haldia group-selling pool has reached 80% of its target quota.',
    time: '3h ago',
    type: 'aggregation',
    route: '/sih/aggregation'
  }
];

export const MobileModuleHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { subscribeToNotifications, pushSubscription } = usePWA();

  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFS);
  const [sendingTest, setSendingTest] = useState(false);
  const [testSuccess, setTestSuccess] = useState('');

  const reg = PriceRiskService.getFieldRegistration(user?.id || 'demo_farmer') || {
    fieldName: 'North Paddy Field',
    crop: 'Paddy',
    landSizeAcres: 0.4,
    district: 'Haldia',
    state: 'West Bengal'
  };

  const farmerName = user?.fullName || 'Farmer';

  const sendTestAlert = async (category: 'climate' | 'mandi' | 'aggregation') => {
    setSendingTest(true);
    setTestSuccess('');
    try {
      const res = await fetch('/api/push/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          title: category === 'climate' ? 'BharatFarm Climate Alert 🌧️' : category === 'mandi' ? 'BharatFarm Mandi Alert 📍' : 'BharatFarm Aggregation Update 🤝',
          body: category === 'climate' ? 'Heavy rainfall warning in your region. Protect your harvested paddy.' : category === 'mandi' ? 'Ludhiana mandi prices spiked by 8%! Sell now.' : 'Group buying fertilizer order confirmed.',
          url: category === 'climate' ? '/sih/climate-risk' : category === 'mandi' ? '/sih/smart-mandi' : '/sih/aggregation'
        })
      });

      if (res.ok) {
        setTestSuccess(`Live PWA Push Alert sent to Android Tray!`);
      } else {
        setTestSuccess(`In-app notification created!`);
      }

      // Add to local list
      const newNotif: NotificationItem = {
        id: 'n_' + Date.now(),
        title: category === 'climate' ? 'BharatFarm Climate Alert 🌧️' : category === 'mandi' ? 'BharatFarm Mandi Alert 📍' : 'BharatFarm Aggregation Update 🤝',
        message: category === 'climate' ? 'Heavy rainfall expected tomorrow. Protect your crops.' : category === 'mandi' ? 'Mandi price update for Paddy.' : 'Group selling pool updated.',
        time: 'Just now',
        type: category,
        route: category === 'climate' ? '/sih/climate-risk' : category === 'mandi' ? '/sih/smart-mandi' : '/sih/aggregation'
      };

      setNotifications(prev => [newNotif, ...prev]);
    } catch {
      setTestSuccess('Notification added locally.');
    } finally {
      setSendingTest(false);
    }
  };

  const solutions = [
    {
      id: 'price-risk',
      title: t('sih.priceRiskNav'),
      subtitle: t('sih.priceRiskSubtitle'),
      description: t('sih.priceRiskDesc'),
      badgeIcon: 'eco',
      badgeBg: '#FFFFFF',
      badgeColor: '#15803D',
      path: '/sih/price-risk',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80' // sprout seedling in rich dark soil
    },
    {
      id: 'climate-risk',
      title: t('sih.climateRiskNav'),
      subtitle: t('sih.climateRiskSubtitle'),
      description: t('sih.climateRiskDesc'),
      badgeIcon: 'wb_sunny',
      badgeBg: '#FFFFFF',
      badgeColor: '#1D4ED8',
      path: '/sih/climate-risk',
      image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=600&q=80' // dark rain/weather landscape
    },
    {
      id: 'aggregation',
      title: t('sih.aggregationNav'),
      subtitle: t('sih.aggregationSubtitle'),
      description: t('sih.aggregationDesc'),
      badgeIcon: 'group',
      badgeBg: '#FFFFFF',
      badgeColor: '#0D9488',
      path: '/sih/aggregation',
      image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80' // field workers collective farming
    },
    {
      id: 'crop-insurance',
      title: t('sih.cropInsuranceNav'),
      subtitle: t('sih.cropInsuranceSubtitle'),
      description: t('sih.cropInsuranceDesc'),
      badgeIcon: 'verified_user',
      badgeBg: '#FFFFFF',
      badgeColor: '#D97706',
      path: '/sih/crop-insurance',
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80' // green sapling crop insurance
    },
    {
      id: 'smart-mandi',
      title: t('sih.smartMandiNav'),
      subtitle: t('sih.smartMandiSubtitle'),
      description: t('sih.smartMandiDesc'),
      badgeIcon: 'bar_chart',
      badgeBg: '#FFFFFF',
      badgeColor: '#DC2626',
      path: '/sih/smart-mandi',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80' // fresh market produce
    },
    {
      id: 'sahayak',
      title: t('sih.sahayakNav'),
      subtitle: t('sih.sahayakSubtitle'),
      description: t('sih.sahayakDesc'),
      badgeIcon: 'chat',
      badgeBg: '#FFFFFF',
      badgeColor: '#7C3AED',
      path: '/sih/sahayak',
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80' // lush field / sahayak AI
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#F8FAFC',
      paddingBottom: '82px',
      fontFamily: 'Urbanist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      {/* 1. COMPACT HEADER */}
      <header style={{
        padding: '0.65rem 1rem',
        background: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <img
            src="/logo.png"
            alt="BharatFarm"
            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
          />
          <div>
            <div style={{
              fontSize: '1.15rem',
              fontWeight: 900,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}>
              Bharat<span style={{ color: '#16A34A' }}>Farm</span>
            </div>
            <div style={{
              fontSize: '0.62rem',
              color: '#64748B',
              fontWeight: 600,
              letterSpacing: '0.01em',
              lineHeight: 1
            }}>
              Smart Tools. Stronger Farmers.
            </div>
          </div>
        </div>

        {/* Right header controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {/* Language selector pill */}
          <div style={{ position: 'relative' }}>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              title={t('common.languageSelect')}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                background: '#F1F5F9',
                color: '#1E293B',
                border: '1px solid #CBD5E1',
                borderRadius: '9999px',
                padding: '0.3rem 1.4rem 0.3rem 0.65rem',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
                height: '32px'
              }}
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="bn">BN</option>
            </select>
            <span
              className="material-symbols-outlined"
              style={{
                position: 'absolute',
                right: '5px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '14px',
                color: '#64748B',
                pointerEvents: 'none'
              }}
            >
              keyboard_arrow_down
            </span>
          </div>

          {/* Notification Button */}
          <button
            onClick={() => setShowNotifDrawer(true)}
            title={t('common.notifications')}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              color: '#1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#1E293B' }}>
              notifications
            </span>
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#EF4444',
                border: '1.5px solid #FFFFFF'
              }} />
            )}
          </button>

          {/* User Avatar Circle */}
          <button
            onClick={() => navigate('/profile')}
            title={t('moduleHome.profileTitle', { name: farmerName })}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: '#143621',
              color: '#FFFFFF',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            {user?.fullName ? user.fullName[0].toUpperCase() : 'S'}
          </button>
        </div>
      </header>

      {/* Interactive Notification Drawer Modal */}
      {showNotifDrawer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '1rem'
        }} onClick={() => setShowNotifDrawer(false)}>
          <div style={{
            width: '100%',
            maxWidth: '440px',
            background: '#FFFFFF',
            borderRadius: '18px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            padding: '1.15rem',
            maxHeight: '85vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            marginTop: '1.5rem'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="material-symbols-outlined" style={{ color: '#16A34A', fontSize: '22px' }}>notifications</span>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {t('notifications.agriNotifs')}
                </h3>
              </div>
              <button
                onClick={() => setShowNotifDrawer(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#64748B', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Notification Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    setShowNotifDrawer(false);
                    navigate(n.route);
                  }}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '0.65rem 0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.15rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>{n.title}</span>
                    <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>{n.time}</span>
                  </div>
                  <p style={{ fontSize: '0.74rem', color: '#475569', margin: 0, lineHeight: 1.3 }}>{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. COMPACT HERO / GREETING SECTION (Occupies ~15-20% viewport, no vertical waste) */}
      <section style={{
        position: 'relative',
        padding: '1rem 1rem 0.85rem',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(236, 253, 245, 0.5) 0%, rgba(248, 250, 252, 0.95) 100%)',
        borderBottom: '1px solid #F1F5F9'
      }}>
        {/* Real agricultural landscape background image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
          opacity: 0.18,
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              fontSize: '1.35rem',
              fontWeight: 900,
              color: '#0F172A',
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}>
              Hello, {farmerName}! 👋
            </h1>
            <p style={{
              fontSize: '0.78rem',
              color: '#475569',
              margin: '0.2rem 0 0 0',
              fontWeight: 600,
              lineHeight: 1.3
            }}>
              {t('home.empowerTagline')}
            </p>
          </div>

          {/* Decorative compact badge */}
          <div style={{
            textAlign: 'right',
            userSelect: 'none',
            flexShrink: 0
          }}>
            <div style={{
              fontFamily: '"Caveat", "Brush Script MT", cursive, sans-serif',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#92400E',
              lineHeight: 1.05,
              transform: 'rotate(-3deg)'
            }}>
              For a Stronger<br />
              <span style={{ fontSize: '1.2rem', color: '#15803D', fontWeight: 800 }}>Bharat</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main dashboard content */}
      <main style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* 3. COMPACT REGISTERED FARM CARD */}
        <div style={{
          background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
          border: '1px solid #BBF7D0',
          borderRadius: '16px',
          padding: '0.85rem 1rem',
          boxShadow: '0 2px 8px rgba(22, 163, 74, 0.06)',
          position: 'relative'
        }}>
          {/* Top Row: Leaf Icon + Farm details + Update button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#16A34A', fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#14532D', letterSpacing: '0.01em' }}>
                {t('home.registeredFarmTitle')}
              </span>
            </div>

            <button
              onClick={() => navigate('/sih/field-mapping')}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '9999px',
                padding: '0.2rem 0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#1E293B',
                cursor: 'pointer'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#475569' }}>
                edit
              </span>
              <span>{t('home.updateBtn')}</span>
            </button>
          </div>

          <div style={{
            fontSize: '0.92rem',
            fontWeight: 800,
            color: '#0F172A',
            lineHeight: 1.25,
            marginBottom: '0.2rem'
          }}>
            {reg.fieldName} <span style={{ fontWeight: 600, color: '#475569', fontSize: '0.82rem' }}>({reg.crop} • {reg.landSizeAcres} Acres)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#059669' }}>
              location_on
            </span>
            <span>{reg.district}, {reg.state}</span>
          </div>

          {/* Sub-Actions Row: Field Map | Soil | Walk Farm */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            marginTop: '0.65rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid rgba(22, 163, 74, 0.2)',
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#15803D'
          }}>
            <span
              onClick={() => navigate('/sih/field-mapping')}
              style={{ cursor: 'pointer' }}
            >
              {t('home.fieldMappingShort')}
            </span>
            <span style={{ color: '#86EFAC' }}>|</span>
            <span
              onClick={() => navigate('/sih/climate-risk')}
              style={{ cursor: 'pointer' }}
            >
              {t('home.soilInsights')}
            </span>
            <span style={{ color: '#86EFAC' }}>|</span>
            <span
              onClick={() => navigate('/sih/field-mapping')}
              style={{ cursor: 'pointer' }}
            >
              {t('home.walkTheFarm')}
            </span>
          </div>
        </div>

        {/* 4. "OUR SOLUTIONS" 2-COLUMN COMPACT MOBILE GRID (~175px Height per tile) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
            <div>
              <h2 style={{
                fontSize: '1.05rem',
                fontWeight: 900,
                color: '#0F172A',
                margin: 0,
                letterSpacing: '-0.01em'
              }}>
                {t('home.solutionsTitle')}
              </h2>
              <p style={{
                fontSize: '0.72rem',
                color: '#64748B',
                margin: '0.1rem 0 0 0',
                fontWeight: 500
              }}>
                {t('home.solutionsSubtitle')}
              </p>
            </div>
            <span
              onClick={() => navigate('/sih/price-risk')}
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                color: '#15803D',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.15rem'
              }}
            >
              {t('common.viewAll')} →
            </span>
          </div>

          {/* 2-Column Grid: Proportioned compact tiles (170–185px) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem'
          }}>
            {solutions.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(item.path)}
                style={{
                  height: '175px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  boxSizing: 'border-box'
                }}
              >
                {/* Top ~45% Image header with subtle dark gradient overlay */}
                <div style={{ position: 'relative', height: '78px', width: '100%', overflow: 'hidden' }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.45) 100%)'
                  }} />

                  {/* Icon badge */}
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    left: '6px',
                    width: '26px',
                    height: '26px',
                    borderRadius: '8px',
                    background: item.badgeBg,
                    color: item.badgeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                      {item.badgeIcon}
                    </span>
                  </div>
                </div>

                {/* Bottom content area: Title, Subtitle, Arrow */}
                <div style={{
                  padding: '0.55rem 0.65rem 0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  flex: 1
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      margin: '0 0 0.15rem 0',
                      lineHeight: 1.2
                    }}>
                      {item.title}
                    </h3>
                    {item.subtitle ? (
                      <div style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: '#15803D',
                        lineHeight: 1.15
                      }}>
                        {item.subtitle}
                      </div>
                    ) : (
                      <div style={{
                        fontSize: '0.66rem',
                        color: '#64748B',
                        lineHeight: 1.15,
                        fontWeight: 500
                      }}>
                        {item.description}
                      </div>
                    )}
                  </div>

                  {/* Small Action Arrow */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: '#F1F5F9',
                      color: '#1E293B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px', fontWeight: 800 }}>
                        arrow_forward
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Basic Farmer Needs (Everyday Tools) Card - Directly below the 2-column grid */}
          <div
            onClick={() => navigate('/dashboard')}
            style={{
              marginTop: '0.75rem',
              borderRadius: '16px',
              border: '1.5px solid #FDE047',
              boxShadow: '0 4px 14px rgba(234, 179, 8, 0.12)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              background: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Top landscape farm photo header */}
            <div style={{ position: 'relative', height: '90px', width: '100%', overflow: 'hidden' }}>
              <img
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80"
                alt="Basic Farmer Needs"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 40%'
                }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.05) 0%, rgba(15, 23, 42, 0.35) 100%)'
              }} />

              {/* Top-left tractor icon badge in white rounded box */}
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: '#FFFFFF',
                color: '#B45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.16)'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  agriculture
                </span>
              </div>
            </div>

            {/* Bottom content area */}
            <div style={{
              padding: '0.65rem 0.85rem 0.6rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem'
            }}>
              <div>
                <h3 style={{
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: '0 0 0.15rem 0',
                  lineHeight: 1.2
                }}>
                  {t('home.basicFarmerNeedsTitle')}
                </h3>
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#B45309',
                  lineHeight: 1.15,
                  marginBottom: '0.15rem'
                }}>
                  {t('home.everydayTools')}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: '#64748B',
                  lineHeight: 1.2,
                  fontWeight: 500
                }}>
                  {t('home.everydayToolsDesc')}
                </div>
              </div>

              {/* Bottom-right arrow */}
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: '#FEF3C7',
                color: '#B45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', fontWeight: 800 }}>
                  arrow_forward
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. BRAND / IMPACT BANNER (Compact) */}
        <div style={{
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          minHeight: '85px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)'
        }}>
          {/* Background: Farmer in field */}
          <img
            src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80"
            alt="Indian Farmer in Field"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 30%'
            }}
          />

          {/* Gradient overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(254, 252, 232, 0.94) 0%, rgba(254, 252, 232, 0.7) 48%, rgba(15, 50, 28, 0.95) 70%, rgba(10, 36, 20, 0.98) 100%)'
          }} />

          {/* Banner text */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            padding: '0.75rem 0.9rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <div style={{ maxWidth: '160px' }}>
              <p style={{
                fontFamily: '"Caveat", "Brush Script MT", cursive, sans-serif',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#1E293B',
                margin: 0,
                lineHeight: 1.15,
                fontStyle: 'italic'
              }}>
                {t('home.bannerQuote')}
              </p>
            </div>

            <div style={{ textAlign: 'left', color: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.1rem' }}>
                <img
                  src="/logo.png"
                  alt="BharatFarm"
                  style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                />
                <span style={{ fontSize: '0.92rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                  Bharat<span style={{ color: '#86EFAC' }}>Farm</span>
                </span>
              </div>
              <div style={{ fontSize: '0.64rem', color: '#CBD5E1', fontWeight: 600, lineHeight: 1.2 }}>
                {t('home.bannerForFarmers')}<br />
                {t('home.bannerSustainableBharat')}
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* 7. Fixed Bottom Navigation */}
      <MobileBottomNav type="main" />
    </div>
  );
};

