import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SihLayout } from '../../shared/SihLayout';

export const ActionPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState('Haldia, West Bengal');
  const [showLocationModal, setShowLocationModal] = useState(false);

  const cityShort = selectedLocation.split(',')[0].trim();

  const handleMandiNav = (category?: string) => {
    if (category) {
      navigate(`/sih/smart-mandi?category=${encodeURIComponent(category.toLowerCase())}`);
    } else {
      navigate('/sih/smart-mandi');
    }
  };

  return (
    <SihLayout activeModuleId="climate-risk" moduleTitle="Action Planner" moduleIcon="checklist">
      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        paddingBottom: '84px',
        color: '#0f172a'
      }}>
        {/* Mobile Container max 440px to mimic mobile viewport perfectly */}
        <div style={{
          maxWidth: '440px',
          margin: '0 auto',
          padding: '0.75rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}>

          {/* ── 1. APP HEADER ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.2rem 0.1rem'
          }}>
            {/* Logo + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(21, 128, 61, 0.25)',
                flexShrink: 0
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C7 2 3 7 3 12C3 17 7 21 12 21C12 14 16 9 22 9C22 5 17 2 12 2Z" fill="#86efac"/>
                  <path d="M12 21C17 21 21 17 21 12C14 12 9 16 9 22" fill="#4ade80"/>
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#15803d',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em'
                }}>
                  BharatFarm
                </span>
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#64748b'
                }}>
                  Action Planner
                </span>
              </div>
            </div>

            {/* Location Selector Pill */}
            <button
              onClick={() => setShowLocationModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#1e293b',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#15803d">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>{cityShort}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
          </div>

          {/* ── 2. WEATHER ALERT CARD ── */}
          <div style={{
            background: '#fff0f3',
            border: '1.5px solid #fecdd3',
            borderRadius: '18px',
            padding: '1rem',
            position: 'relative',
            boxShadow: '0 2px 10px rgba(225, 29, 72, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              {/* Rain Cloud Icon */}
              <div style={{ flexShrink: 0, marginTop: '0.1rem' }}>
                <svg width="54" height="48" viewBox="0 0 64 56" fill="none">
                  {/* Cloud Body */}
                  <path d="M18 36C12.4772 36 8 31.5228 8 26C8 21.0503 11.595 16.9405 16.3533 16.1432C17.708 9.77443 23.3444 5 30 5C37.8931 5 44.3855 11.1645 44.9657 18.949C49.5298 19.866 53 23.8653 53 28.6667C53 34.19 48.5228 38.6667 43 38.6667" fill="#3b82f6"/>
                  <path d="M18 34C12.4772 34 8 29.5228 8 24C8 19.0503 11.595 14.9405 16.3533 14.1432C17.708 7.77443 23.3444 3 30 3C37.8931 3 44.3855 9.16453 44.9657 16.949C49.5298 17.866 53 21.8653 53 26.6667C53 32.19 48.5228 36.6667 43 36.6667" fill="#60a5fa"/>
                  {/* Rain Drops */}
                  <path d="M18 42L15 48" stroke="#2563eb" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M26 44L23 50" stroke="#2563eb" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M34 42L31 48" stroke="#2563eb" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M42 44L39 50" stroke="#2563eb" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>

              {/* Text content */}
              <div style={{ flex: 1, paddingRight: '1.2rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.35rem'
                }}>
                  <span style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '12px',
                    letterSpacing: '0.01em'
                  }}>
                    Heavy Rain Likely
                  </span>

                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#64748b'
                  }}>
                    Next 3–5 days
                  </span>
                </div>

                <div style={{
                  fontSize: '1.02rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.25,
                  marginBottom: '0.15rem'
                }}>
                  High chance of heavy rainfall
                </div>

                <div style={{
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: '#64748b'
                }}>
                  Fields may get waterlogged.
                </div>
              </div>

              {/* Red Chevron Arrow */}
              <div style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#dc2626'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </div>
          </div>

          {/* ── 3. DO THIS NOW ── */}
          <div style={{
            background: '#f0fdf4',
            border: '1.5px solid #dcfce7',
            borderRadius: '18px',
            padding: '0.9rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: 800,
              color: '#15803d',
              letterSpacing: '0.03em'
            }}>
              DO THIS NOW
            </div>

            {/* 3 Horizontal Action Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.55rem'
            }}>

              {/* Card 1: Clear drainage */}
              <div style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '0.7rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '102px',
                position: 'relative',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                cursor: 'pointer'
              }}>
                {/* Shovel Icon */}
                <div style={{ width: '28px', height: '28px' }}>
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                    <path d="M22 4L28 10L14 24L8 18L22 4Z" fill="#64748b"/>
                    <path d="M6 20L12 26L4 28L6 20Z" fill="#78350f"/>
                    <path d="M2 28C6 26 10 30 14 28" stroke="#a16207" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.15 }}>
                    Clear
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.15 }}>
                    drainage
                  </div>
                </div>
                <div style={{ position: 'absolute', right: '0.4rem', bottom: '0.5rem', color: '#16a34a' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
              </div>

              {/* Card 2: Prepare for harvest */}
              <div style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '0.7rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '102px',
                position: 'relative',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                cursor: 'pointer'
              }}>
                {/* Plant Leaf Icon */}
                <div style={{ width: '28px', height: '28px' }}>
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                    <path d="M8 26C8 18 14 10 24 8C24 18 18 26 8 26Z" fill="#22c55e"/>
                    <path d="M12 24C12 18 16 12 26 12" stroke="#15803d" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M6 28C10 24 14 20 18 18" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.15 }}>
                    Prepare
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.15 }}>
                    for harvest
                  </div>
                </div>
                <div style={{ position: 'absolute', right: '0.4rem', bottom: '0.5rem', color: '#16a34a' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
              </div>

              {/* Card 3: Buy inputs before rain */}
              <div
                onClick={() => handleMandiNav()}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '0.7rem 0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '102px',
                  position: 'relative',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                  cursor: 'pointer'
                }}
              >
                {/* Green Cart Icon */}
                <div style={{ width: '28px', height: '28px' }}>
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                    <path d="M4 6H8L11 20H26L29 10H10" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="13" cy="25" r="2.5" fill="#16a34a"/>
                    <circle cx="24" cy="25" r="2.5" fill="#16a34a"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.15 }}>
                    Buy inputs
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.15 }}>
                    before rain
                  </div>
                </div>
                <div style={{ position: 'absolute', right: '0.4rem', bottom: '0.5rem', color: '#16a34a' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
              </div>

            </div>
          </div>

          {/* ── 4. WARNING SECTION ── */}
          <div style={{
            background: '#fffbe6',
            border: '1.5px solid #fef08a',
            borderRadius: '18px',
            padding: '0.9rem 1rem',
            position: 'relative',
            boxShadow: '0 2px 8px rgba(217, 119, 6, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              {/* Orange Warning Triangle */}
              <div style={{ flexShrink: 0, marginTop: '0.15rem' }}>
                <svg width="36" height="34" viewBox="0 0 36 32" fill="none">
                  <path d="M18 2L34 30H2L18 2Z" fill="#f97316"/>
                  <rect x="16.5" y="11" width="3" height="10" rx="1.5" fill="#ffffff"/>
                  <circle cx="18" cy="25" r="1.75" fill="#ffffff"/>
                </svg>
              </div>

              {/* Warning Text */}
              <div style={{ flex: 1, paddingRight: '1.2rem' }}>
                <div style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: '#ea580c',
                  marginBottom: '0.15rem'
                }}>
                  Warning
                </div>

                <div style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.25,
                  marginBottom: '0.2rem'
                }}>
                  Heavy rain may block roads.
                </div>

                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#64748b'
                }}>
                  Buy seeds, fertilizer and other inputs early.
                </div>
              </div>

              {/* Orange Chevron Arrow */}
              <div style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#d97706'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </div>
          </div>

          {/* ── 5. ESSENTIALS TO BUY ── */}
          <div style={{
            background: '#f0f9ff',
            border: '1.5px solid #e0f2fe',
            borderRadius: '18px',
            padding: '0.9rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{
                fontSize: '0.88rem',
                fontWeight: 800,
                color: '#0284c7',
                letterSpacing: '0.03em'
              }}>
                ESSENTIALS TO BUY
              </span>

              <button
                onClick={() => handleMandiNav()}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#0284c7',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem'
                }}
              >
                <span>View in Mandi</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>

            {/* 4 Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.45rem'
            }}>
              {/* Card 1: Seeds */}
              <button
                onClick={() => handleMandiNav('seeds')}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '0.65rem 0.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  minHeight: '84px'
                }}
              >
                <div style={{ width: '28px', height: '28px' }}>
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                    <path d="M8 26C8 18 14 10 24 8C24 18 18 26 8 26Z" fill="#22c55e"/>
                    <path d="M6 28C10 24 14 20 18 18" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>
                  Seeds
                </span>
              </button>

              {/* Card 2: Fertilizer */}
              <button
                onClick={() => handleMandiNav('fertilizer')}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '0.65rem 0.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  minHeight: '84px'
                }}
              >
                <div style={{ width: '28px', height: '28px' }}>
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                    {/* Burlap Sack */}
                    <path d="M8 10C8 6 12 4 16 4C20 4 24 6 24 10L26 28H6L8 10Z" fill="#b45309"/>
                    {/* Sack Leaf Emblem */}
                    <circle cx="16" cy="18" r="4" fill="#ffffff"/>
                    <path d="M14 19C14 16 16 14 18 14C18 17 17 19 14 19Z" fill="#15803d"/>
                  </svg>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>
                  Fertilizer
                </span>
              </button>

              {/* Card 3: Pesticides */}
              <button
                onClick={() => handleMandiNav('pesticides')}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '0.65rem 0.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  minHeight: '84px'
                }}
              >
                <div style={{ width: '28px', height: '28px' }}>
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                    {/* Spray Bottle */}
                    <rect x="10" y="12" width="12" height="16" rx="3" fill="#dc2626"/>
                    <rect x="13" y="6" width="6" height="6" fill="#991b1b"/>
                    <path d="M16 6V2H21V6" stroke="#475569" strokeWidth="2"/>
                    {/* Leaf Emblem */}
                    <circle cx="16" cy="20" r="3.5" fill="#ffffff"/>
                    <path d="M14.5 21C14.5 18.5 16 17 17.5 17C17.5 19.5 16.5 21 14.5 21Z" fill="#15803d"/>
                  </svg>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>
                  Pesticides
                </span>
              </button>

              {/* Card 4: Farm Tools */}
              <button
                onClick={() => handleMandiNav('tools')}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '0.65rem 0.2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  minHeight: '84px'
                }}
              >
                <div style={{ width: '28px', height: '28px' }}>
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                    {/* Wrench */}
                    <path d="M22 6C19 6 17 8 17 11C17 12.5 17.5 13.8 18.4 14.8L8 25.2C7.2 26 7.2 27.2 8 28C8.8 28.8 10 28.8 10.8 28L21.2 17.6C22.2 18.5 23.5 19 25 19C28 19 30 17 30 14L25 14L22 11L22 6Z" fill="#334155"/>
                  </svg>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>
                  Farm Tools
                </span>
              </button>
            </div>
          </div>

        </div>

        {/* ── FIXED MOBILE BOTTOM NAVIGATION BAR ── */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '62px',
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 1000,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.04)',
          maxWidth: '440px',
          margin: '0 auto'
        }}>
          {/* Home */}
          <button
            onClick={() => navigate('/home')}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.2rem',
              color: '#64748b',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Home</span>
          </button>

          {/* Crops */}
          <button
            onClick={() => navigate('/sih/climate-risk')}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.2rem',
              color: '#64748b',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z"/>
              <path d="M12 6v12"/>
              <path d="M8 10c2 0 4 2 4 4"/>
              <path d="M16 10c-2 0-4 2-4 4"/>
            </svg>
            <span>Crops</span>
          </button>

          {/* Planner (Active - Highlighted Green) */}
          <button
            onClick={() => navigate('/planner')}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.2rem',
              color: '#16a34a',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span>Planner</span>
          </button>

          {/* More */}
          <button
            onClick={() => navigate('/home')}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.2rem',
              color: '#64748b',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
            <span>More</span>
          </button>
        </div>

        {/* Location Picker Modal */}
        {showLocationModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '1.25rem',
              width: '100%',
              maxWidth: '360px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Select Location</h3>
                <button
                  onClick={() => setShowLocationModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#64748b', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              {['Haldia, West Bengal', 'Purba Medinipur, West Bengal', 'Burdwan, West Bengal', 'Hooghly, West Bengal'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setSelectedLocation(preset);
                    setShowLocationModal(false);
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: selectedLocation === preset ? '#f0fdf4' : '#f8fafc',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    color: selectedLocation === preset ? '#15803d' : '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>📍</span>
                  <span>{preset}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </SihLayout>
  );
};
