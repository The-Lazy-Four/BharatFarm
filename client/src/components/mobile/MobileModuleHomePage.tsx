import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { usePWA } from '../../context/PWAContext.js';
import { MobileBottomNav } from './MobileBottomNav.js';
import { PriceRiskService } from '../../modules/sih/price-risk/priceRisk.service.js';
import { ClimateRiskService } from '../../modules/sih/climate-risk/climateRisk.service.js';

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
    route: '/sih/smart-mandi?tab=sell'
  }
];

export const MobileModuleHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { subscribeToNotifications, pushSubscription } = usePWA();

  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFS);

  // Weather state from real service
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherTemp, setWeatherTemp] = useState<number>(28);
  const [weatherCondition, setWeatherCondition] = useState<string>('Partly Sunny');
  const [rainProbability, setRainProbability] = useState<number>(15);

  const reg = PriceRiskService.getFieldRegistration(user?.id || 'demo_farmer') || {
    fieldName: 'North Paddy Field',
    crop: 'Paddy',
    landSizeAcres: 0.4,
    district: 'Haldia',
    state: 'West Bengal',
    latitude: 22.0667,
    longitude: 88.0667
  };

  const farmerName = user?.fullName || 'Farmer';

  // Fetch real weather using ClimateRiskService
  useEffect(() => {
    let isMounted = true;
    const loadWeather = async () => {
      try {
        const full = await ClimateRiskService.fetchFullAssessment(
          `${reg.district}, ${reg.state}`,
          reg.crop || 'Paddy',
          'Flowering',
          reg.latitude,
          reg.longitude
        );
        if (isMounted && full?.weather) {
          setWeatherTemp(Math.round(full.weather.temperatureCelsius ?? 28));
          setWeatherCondition(full.weather.condition || 'Partly Cloudy');
          setRainProbability(full.weather.rainfallProbability ?? 20);
        }
      } catch (err) {
        console.warn('Could not fetch live weather, using fallback:', err);
      } finally {
        if (isMounted) setWeatherLoading(false);
      }
    };

    loadWeather();
    return () => {
      isMounted = false;
    };
  }, [reg.district, reg.state, reg.crop, reg.latitude, reg.longitude]);

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      maxWidth: '100%',
      background: '#F7F4EC', // Warm agricultural off-white
      paddingBottom: '84px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      boxSizing: 'border-box',
      overflowX: 'hidden',
      color: '#18231B' // Dark earthy green-charcoal text
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
        borderBottom: '1px solid #EAE4D5',
        boxShadow: '0 1px 3px rgba(24, 35, 27, 0.04)'
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
              color: '#174A2A',
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}>
              Bharat<span style={{ color: '#4F7D32' }}>Farm</span>
            </div>
            <div style={{
              fontSize: '0.62rem',
              color: '#6B7280',
              fontWeight: 600,
              letterSpacing: '0.01em',
              lineHeight: 1
            }}>
              Smart Tools. Stronger Farmers.
            </div>
          </div>
        </div>

        {/* Right header controls: Language + Notification + Profile */}
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
                background: '#F2EDE2',
                color: '#18231B',
                border: '1px solid #D9D2C3',
                borderRadius: '9999px',
                padding: '0.25rem 1.3rem 0.25rem 0.6rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
                height: '30px'
              }}
            >
              <option value="en">EN</option>
              <option value="hi">हिन्दी</option>
              <option value="bn">বাংলা</option>
            </select>
            <span
              className="material-symbols-outlined"
              style={{
                position: 'absolute',
                right: '4px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '14px',
                color: '#6B7280',
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
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#F2EDE2',
              border: '1px solid #D9D2C3',
              color: '#18231B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              padding: 0
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#174A2A' }}>
              notifications
            </span>
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#DC2626'
              }} />
            )}
          </button>

          {/* User Profile Avatar Circle */}
          <button
            onClick={() => navigate('/profile')}
            title={t('moduleHome.profileTitle', { name: farmerName })}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#174A2A',
              color: '#FFFFFF',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              padding: 0
            }}
          >
            {user?.fullName ? user.fullName[0].toUpperCase() : 'S'}
          </button>
        </div>
      </header>

      {/* Greeting Banner */}
      <section style={{
        position: 'relative',
        padding: '0.85rem 1rem 0.75rem',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(234, 243, 222, 0.7) 0%, rgba(247, 244, 236, 0.95) 100%)',
        borderBottom: '1px solid #EAE4D5'
      }}>
        {/* Subtle landscape texture */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
          opacity: 0.12,
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              fontSize: '1.28rem',
              fontWeight: 900,
              color: '#18231B',
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}>
              Hello, {farmerName}! 👋
            </h1>
            <p style={{
              fontSize: '0.74rem',
              color: '#4B5563',
              margin: '0.15rem 0 0 0',
              fontWeight: 600,
              lineHeight: 1.3
            }}>
              {t('home.empowerTagline')}
            </p>
          </div>

          {/* Decorative agricultural badge */}
          <div style={{
            textAlign: 'right',
            userSelect: 'none',
            flexShrink: 0
          }}>
            <div style={{
              fontFamily: '"Caveat", "Brush Script MT", cursive, sans-serif',
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#8A6545',
              lineHeight: 1.05,
              transform: 'rotate(-2deg)'
            }}>
              For a Stronger<br />
              <span style={{ fontSize: '1.1rem', color: '#174A2A', fontWeight: 800 }}>Bharat</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Notification Drawer Modal */}
      {showNotifDrawer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(24, 35, 27, 0.65)',
            backdropFilter: 'blur(2px)',
            zIndex: 999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '1rem'
          }}
          onClick={() => setShowNotifDrawer(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              background: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
              padding: '1rem',
              maxHeight: '80vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              marginTop: '1rem'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EAE4D5', paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="material-symbols-outlined" style={{ color: '#174A2A', fontSize: '20px' }}>notifications</span>
                <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#18231B', margin: 0 }}>
                  {t('notifications.agriNotifs')}
                </h3>
              </div>
              <button
                onClick={() => setShowNotifDrawer(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.1rem', color: '#6B7280', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    setShowNotifDrawer(false);
                    navigate(n.route);
                  }}
                  style={{
                    background: '#FDFBF7',
                    border: '1px solid #EAE4D5',
                    borderRadius: '10px',
                    padding: '0.6rem 0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#174A2A' }}>{n.title}</span>
                    <span style={{ fontSize: '0.62rem', color: '#6B7280', fontWeight: 600 }}>{n.time}</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#374151', margin: 0, lineHeight: 1.3 }}>{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Body */}
      <main style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>

        {/* 2. FARM CONTEXT CARD — Real, trustworthy farm passport */}
        <section style={{
          background: '#FFFFFF',
          border: '1px solid #DFD9C9',
          borderRadius: '14px',
          padding: '0.85rem 0.95rem',
          boxShadow: '0 1px 3px rgba(24, 35, 27, 0.04)'
        }}>
          {/* Tag header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
            <div style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              color: '#8A6545', // Earth/soil accent
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              {t('home.yourFarmTitle')}
            </div>

            <button
              onClick={() => navigate('/sih/field-mapping')}
              style={{
                background: '#16A34A',
                border: '1px solid #15803D',
                borderRadius: '9999px',
                padding: '0.28rem 0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.28rem',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#FFFFFF',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#FFFFFF' }}>
                edit
              </span>
              <span>{t('home.updateBtn')}</span>
            </button>
          </div>

          {/* Farm details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              overflow: 'hidden',
              flexShrink: 0,
              border: '1px solid #DFD9C9'
            }}>
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=200&q=80"
                alt={reg.fieldName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '0.98rem',
                fontWeight: 800,
                color: '#18231B',
                lineHeight: 1.25,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {reg.fieldName}
              </div>

              <div style={{
                fontSize: '0.76rem',
                color: '#4B5563',
                fontWeight: 600,
                marginTop: '0.12rem'
              }}>
                {reg.crop} · {reg.landSizeAcres} {language === 'hi' ? 'एकड़' : language === 'bn' ? 'একর' : 'acres'}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.72rem',
                color: '#6B7280',
                fontWeight: 500,
                marginTop: '0.2rem'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#8A6545' }}>
                  location_on
                </span>
                <span>{reg.district}, {reg.state}</span>
              </div>
            </div>
          </div>

          {/* Quick field shortcuts */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '0.7rem',
            paddingTop: '0.6rem',
            borderTop: '1px dashed #EAE4D5',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#174A2A'
          }}>
            <div
              onClick={() => navigate('/sih/field-mapping')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#4F7D32' }}>map</span>
              <span>{t('home.fieldMappingShort')}</span>
            </div>
            <span style={{ color: '#D9D2C3' }}>•</span>
            <div
              onClick={() => navigate('/sih/climate-risk')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#4F7D32' }}>psychology</span>
              <span>{t('home.soilInsights')}</span>
            </div>
            <span style={{ color: '#D9D2C3' }}>•</span>
            <div
              onClick={() => navigate('/sih/field-mapping')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#4F7D32' }}>directions_walk</span>
              <span>{t('home.walkTheFarm')}</span>
            </div>
          </div>
        </section>

        {/* 3. "TODAY ON YOUR FARM" — Contextual Weather & Decision Card with Image */}
        <section style={{
          background: '#FFFFFF',
          border: '1px solid #DFD9C9',
          borderRadius: '14px',
          padding: '0.85rem 0.95rem',
          boxShadow: '0 1px 3px rgba(24, 35, 27, 0.04)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
          }}>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              color: '#8A6545',
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              {t('home.todayOnFarmTitle')}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#6B7280', fontWeight: 600 }}>
              {reg.district}
            </span>
          </div>

          <div
            onClick={() => navigate('/sih/climate-risk')}
            style={{
              borderRadius: '14px',
              overflow: 'hidden',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '135px',
              padding: '0.85rem 0.95rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              boxSizing: 'border-box'
            }}
          >
            {/* Full Card Weather Background Image */}
            <img
              src={
                rainProbability >= 60
                  ? 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=600&q=80' // Rain, storm clouds & dark field
                  : rainProbability >= 30
                  ? 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=600&q=80' // Sky & clouds
                  : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80' // Golden hour farm field
              }
              alt={weatherCondition}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 0
              }}
            />

            {/* Dark agricultural gradient overlay for text readability */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.7) 45%, rgba(15, 23, 42, 0.92) 100%)',
              zIndex: 1
            }} />

            {/* Top Row: Weather stats & emoji */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                    {weatherLoading ? '--' : `${weatherTemp}°C`}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#86EFAC', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {weatherLoading ? t('home.weatherChecking') : `${weatherCondition} · ${rainProbability}% rain`}
                  </span>
                </div>

                <div style={{
                  fontSize: '0.74rem',
                  color: '#F1F5F9',
                  fontWeight: 500,
                  marginTop: '0.25rem',
                  lineHeight: 1.3,
                  textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                }}>
                  {rainProbability >= 60
                    ? (language === 'hi' ? 'भारी बारिश संभव — कटाई सुरक्षित करें' : language === 'bn' ? 'ভারী বৃষ্টির সম্ভাবনা — ফসল রক্ষা করুন' : 'Rain expected — protect harvested crop')
                    : t('home.weatherSummaryStable')}
                </div>
              </div>

              {/* Weather Icon Badge */}
              <span style={{
                background: 'rgba(255, 255, 255, 0.92)',
                borderRadius: '8px',
                padding: '4px 7px',
                fontSize: '1.1rem',
                lineHeight: 1,
                boxShadow: '0 2px 5px rgba(0,0,0,0.25)'
              }}>
                {rainProbability >= 60 ? '🌧️' : rainProbability >= 30 ? '🌦️' : '☀️'}
              </span>
            </div>

            {/* Bottom Row: Plan Harvesting Action Bar */}
            <div style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '0.55rem',
              marginTop: '0.45rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.25)',
              fontSize: '0.74rem',
              fontWeight: 800,
              color: '#86EFAC'
            }}>
              <span>{t('home.weatherPlanHarvesting')}</span>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#14532D', fontWeight: 800 }}>
                  arrow_forward
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. PRIMARY FARMER ACTIONS — Task Oriented (What do you want to do?) */}
        <section>
          <div style={{
            fontSize: '0.94rem',
            fontWeight: 800,
            color: '#18231B',
            marginBottom: '0.55rem',
            letterSpacing: '-0.01em'
          }}>
            {t('home.whatToDoTitle')}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.65rem'
          }}>
            {/* Task 1: Before You Sow — Full Image Card */}
            <div
              onClick={() => navigate('/sih/price-risk')}
              style={{
                height: '110px',
                borderRadius: '14px',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '0.5rem 0.55rem',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                boxSizing: 'border-box'
              }}
            >
              {/* Full Card Background Image */}
              <img
                src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=400&q=80"
                alt={t('home.beforeYouSowTitle')}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 0
                }}
              />

              {/* Dark Gradient Overlay for text legibility */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(24, 35, 27, 0.15) 0%, rgba(24, 35, 27, 0.35) 40%, rgba(24, 35, 27, 0.92) 80%, rgba(24, 35, 27, 0.98) 100%)',
                zIndex: 1
              }} />

              {/* Floating Emoji Badge Top-Left */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.92)',
                  borderRadius: '7px',
                  padding: '2px 5px',
                  fontSize: '0.8rem',
                  lineHeight: 1,
                  display: 'inline-block',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }}>
                  🌱
                </span>
              </div>

              {/* Bottom Text Content */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  lineHeight: 1.15,
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }}>
                  {t('home.beforeYouSowTitle')}
                </div>
                <div style={{
                  fontSize: '0.62rem',
                  color: '#E2E8F0',
                  fontWeight: 500,
                  marginTop: '0.1rem',
                  lineHeight: 1.15
                }}>
                  {t('home.beforeYouSowSub')}
                </div>
              </div>
            </div>

            {/* Task 2: Where to Sell? — Full Image Card */}
            <div
              onClick={() => navigate('/sih/smart-mandi')}
              style={{
                height: '110px',
                borderRadius: '14px',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '0.5rem 0.55rem',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                boxSizing: 'border-box'
              }}
            >
              {/* Full Card Background Image */}
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80"
                alt={t('home.whereToSellTitle')}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 0
                }}
              />

              {/* Dark Gradient Overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(24, 35, 27, 0.15) 0%, rgba(24, 35, 27, 0.35) 40%, rgba(24, 35, 27, 0.92) 80%, rgba(24, 35, 27, 0.98) 100%)',
                zIndex: 1
              }} />

              {/* Floating Emoji Badge Top-Left */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.92)',
                  borderRadius: '7px',
                  padding: '2px 5px',
                  fontSize: '0.8rem',
                  lineHeight: 1,
                  display: 'inline-block',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }}>
                  📍
                </span>
              </div>

              {/* Bottom Text Content */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  lineHeight: 1.15,
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }}>
                  {t('home.whereToSellTitle')}
                </div>
                <div style={{
                  fontSize: '0.62rem',
                  color: '#E2E8F0',
                  fontWeight: 500,
                  marginTop: '0.1rem',
                  lineHeight: 1.15
                }}>
                  {t('home.whereToSellSub')}
                </div>
              </div>
            </div>

            {/* Task 3: Sell Together — Full Image Card */}
            <div
              onClick={() => navigate('/sih/smart-mandi?tab=sell')}
              style={{
                height: '110px',
                borderRadius: '14px',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '0.5rem 0.55rem',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                boxSizing: 'border-box'
              }}
            >
              {/* Full Card Background Image */}
              <img
                src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=400&q=80"
                alt={t('home.sellTogetherTitle')}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 0
                }}
              />

              {/* Dark Gradient Overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(24, 35, 27, 0.15) 0%, rgba(24, 35, 27, 0.35) 40%, rgba(24, 35, 27, 0.92) 80%, rgba(24, 35, 27, 0.98) 100%)',
                zIndex: 1
              }} />

              {/* Floating Emoji Badge Top-Left */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.92)',
                  borderRadius: '7px',
                  padding: '2px 5px',
                  fontSize: '0.8rem',
                  lineHeight: 1,
                  display: 'inline-block',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }}>
                  👥
                </span>
              </div>

              {/* Bottom Text Content */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  lineHeight: 1.15,
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }}>
                  {t('home.sellTogetherTitle')}
                </div>
                <div style={{
                  fontSize: '0.62rem',
                  color: '#E2E8F0',
                  fontWeight: 500,
                  marginTop: '0.1rem',
                  lineHeight: 1.15
                }}>
                  {t('home.sellTogetherSub')}
                </div>
              </div>
            </div>

            {/* Task 4: Protect My Crop — Full Image Card */}
            <div
              onClick={() => navigate('/sih/crop-insurance')}
              style={{
                height: '110px',
                borderRadius: '14px',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '0.5rem 0.55rem',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                boxSizing: 'border-box'
              }}
            >
              {/* Full Card Background Image */}
              <img
                src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=400&q=80"
                alt={t('home.protectCropTitle')}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 0
                }}
              />

              {/* Dark Gradient Overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(24, 35, 27, 0.15) 0%, rgba(24, 35, 27, 0.35) 40%, rgba(24, 35, 27, 0.92) 80%, rgba(24, 35, 27, 0.98) 100%)',
                zIndex: 1
              }} />

              {/* Floating Emoji Badge Top-Left */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.92)',
                  borderRadius: '7px',
                  padding: '2px 5px',
                  fontSize: '0.8rem',
                  lineHeight: 1,
                  display: 'inline-block',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }}>
                  🛡️
                </span>
              </div>

              {/* Bottom Text Content */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  lineHeight: 1.15,
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }}>
                  {t('home.protectCropTitle')}
                </div>
                <div style={{
                  fontSize: '0.62rem',
                  color: '#E2E8F0',
                  fontWeight: 500,
                  marginTop: '0.1rem',
                  lineHeight: 1.15
                }}>
                  {t('home.protectCropSub')}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SAHAYAK — Enlarged & Prominent Assistant Card */}
        <section
          onClick={() => navigate('/sih/sahayak')}
          style={{
            background: '#F0E9DC',
            border: '1px solid #D9D2C3',
            borderRadius: '16px',
            padding: '1.05rem 1.15rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.9rem',
            boxShadow: '0 2px 6px rgba(24, 35, 27, 0.05)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              border: '2.5px solid #174A2A',
              boxShadow: '0 2px 8px rgba(23, 74, 42, 0.25)'
            }}>
              <img
                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=300&q=80"
                alt="Sahayak"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#174A2A', lineHeight: 1.2 }}>
                {t('home.askSahayakTitle')}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#4B5563', fontWeight: 600, marginTop: '0.2rem', lineHeight: 1.3 }}>
                {t('home.askSahayakSubtitle')}
              </div>
            </div>
          </div>

          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid #DFD9C9',
            boxShadow: '0 2px 5px rgba(0,0,0,0.06)'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#174A2A', fontWeight: 800 }}>
              arrow_forward
            </span>
          </div>
        </section>

        {/* 6. MORE FARM TOOLS — Enlarged & Prominent Utility Card */}
        <section
          onClick={() => navigate('/dashboard')}
          style={{
            background: '#FFFFFF',
            border: '1px solid #DFD9C9',
            borderRadius: '16px',
            padding: '1.05rem 1.15rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.9rem',
            boxShadow: '0 2px 6px rgba(24, 35, 27, 0.04)',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '12px',
              overflow: 'hidden',
              flexShrink: 0,
              border: '1.5px solid #DFD9C9',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}>
              <img
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=300&q=80"
                alt="Tools"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#18231B', lineHeight: 1.2 }}>
                {t('home.moreFarmToolsTitle')} →
              </div>
              <div style={{ fontSize: '0.74rem', color: '#6B7280', fontWeight: 500, marginTop: '0.2rem', lineHeight: 1.3 }}>
                {t('home.moreFarmToolsSubtitle')}
              </div>
            </div>
          </div>

          <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#8A6545', fontWeight: 700 }}>
            chevron_right
          </span>
        </section>

        {/* 7. RESTRAINED BHARATFARM BRAND BANNER */}
        <section style={{
          padding: '0.65rem 0.85rem',
          textAlign: 'center',
          color: '#8A6545',
          fontSize: '0.72rem',
          fontWeight: 600,
          lineHeight: 1.4
        }}>
          <div>🌾 {t('home.bannerSustainableBharat')}</div>
          <div style={{ fontSize: '0.64rem', color: '#9CA3AF', marginTop: '0.15rem' }}>
            BharatFarm v2.0 · Simple & Reliable for Indian Agriculture
          </div>
        </section>

      </main>

      {/* 8. Fixed Bottom Navigation */}
      <MobileBottomNav type="main" />
    </div>
  );
};


