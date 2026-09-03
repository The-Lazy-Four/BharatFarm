import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.js';
import { useTheme } from '../../../context/ThemeContext.js';

interface SihInnovationCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  imageUrl: string;
  path: string;
  badge: string;
  actionText: string;
}

export const SihDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const sihInnovations: SihInnovationCard[] = [
    {
      id: 'climate-risk',
      title: 'Climate-Risk-Aware Procurement',
      subtitle: 'Weather radar, spray advisories & harvest window planning',
      icon: '🌦️',
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85',
      path: '/sih/climate-risk',
      badge: 'Climate & Risk',
      actionText: 'Open Workspace'
    },
    {
      id: 'aggregation',
      title: 'Small-Farm Aggregation',
      subtitle: 'Group buying for inputs & collective produce selling pool',
      icon: '🤝',
      imageUrl: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1000&q=85',
      path: '/sih/aggregation',
      badge: 'Group Power',
      actionText: 'Open Workspace'
    },
    {
      id: 'crop-risk-insurance',
      title: 'Crop Risk & Insurance',
      subtitle: 'Satellite damage audit & AI leaf scanner diagnostic',
      icon: '🛰️',
      imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1000&q=85',
      path: '/sih/crop-insurance',
      badge: 'Satellite Audit',
      actionText: 'Open Workspace'
    },
    {
      id: 'smart-mandi',
      title: 'Smart Mandi Intelligence',
      subtitle: 'Live APMC mandi rates & shortest distance profit router',
      icon: '📍',
      imageUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1000&q=85',
      path: '/sih/smart-mandi',
      badge: 'Mandi Freight',
      actionText: 'Open Workspace'
    },
    {
      id: 'sahayak',
      title: 'Sahayak & WhatsApp',
      subtitle: '24/7 WhatsApp AI companion & local human Sahayak access',
      icon: '💬',
      imageUrl: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1000&q=85',
      path: '/sih/sahayak',
      badge: 'Voice & WA',
      actionText: 'Open Workspace'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--surface-0, #091a10)',
      color: 'var(--text-primary, #ffffff)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-family, sans-serif)'
    }}>
      
      {/* SIH Dashboard Header */}
      <header style={{
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
        background: 'var(--surface-nav-glass, rgba(9, 26, 16, 0.95))',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* Back to Module Home & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/module-home')}
            style={{
              background: 'var(--surface-1, rgba(255,255,255,0.08))',
              border: '1px solid var(--border-default, rgba(255,255,255,0.15))',
              color: 'var(--text-primary)',
              borderRadius: '10px',
              padding: '0.45rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
            <span>Module Home</span>
          </button>

          <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle, rgba(255,255,255,0.15))' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.35)'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#FFFFFF' }}>rocket_launch</span>
            </div>
            <div>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>
                SIH Innovation Platform
              </h1>
              <span style={{ fontSize: '0.68rem', color: 'var(--signal-lime, #16a34a)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Module Launcher Dashboard
              </span>
            </div>
          </div>
        </div>

        {/* User Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'var(--text-primary)',
              borderRadius: '10px',
              padding: '0.45rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <span>👨‍🌾</span>
            <span>Basic Needs</span>
          </button>

          <button
            onClick={toggleTheme}
            style={{
              background: 'var(--surface-1, rgba(255,255,255,0.08))',
              border: '1px solid var(--border-default, rgba(255,255,255,0.15))',
              color: 'var(--text-primary)',
              borderRadius: '10px',
              padding: '0.45rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--signal-lime)' }}>
              {theme === 'light' ? 'light_mode' : 'dark_mode'}
            </span>
            <span>{theme === 'light' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1280px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        
        {/* Title Heading */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{
            background: 'var(--signal-lime-soft, rgba(22, 163, 74, 0.15))',
            color: 'var(--signal-lime, #16a34a)',
            fontWeight: 800,
            fontSize: '0.78rem',
            padding: '0.3rem 0.75rem',
            borderRadius: '8px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: '0.5rem'
          }}>
            Select SIH Innovation Workspace
          </span>

          <h2 style={{
            fontSize: '2.2rem',
            fontWeight: 900,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            margin: 0,
            lineHeight: 1.15
          }}>
            Innovation Launcher
          </h2>

          <p style={{
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            marginTop: '0.35rem',
            marginBottom: 0,
            fontWeight: 500
          }}>
            Tap an innovation card below to enter its dedicated feature workspace.
          </p>
        </div>

        {/* 5 Visual Innovation Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {sihInnovations.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(item.path)}
              style={{
                position: 'relative',
                height: '310px',
                borderRadius: '20px',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 12px 28px rgba(0,0,0,0.3)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
                boxSizing: 'border-box'
              }}
              className="module-visual-card"
            >
              {/* Background Image */}
              <img
                src={item.imageUrl}
                alt={item.title}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 1,
                  filter: 'brightness(0.72)',
                  transition: 'transform 0.4s ease'
                }}
                className="card-bg-img"
              />

              {/* Readability Gradient */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(4, 18, 9, 0.9) 100%)',
                zIndex: 2
              }} />

              {/* Card Top */}
              <div style={{ position: 'relative', zIndex: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.22)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.25)'
                }}>
                  {item.icon}
                </div>

                <span style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  backdropFilter: 'blur(8px)',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}>
                  {item.badge}
                </span>
              </div>

              {/* Card Bottom */}
              <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  margin: 0,
                  lineHeight: 1.25,
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}>
                  {item.title}
                </h3>

                <p style={{
                  fontSize: '0.85rem',
                  color: 'rgba(255, 255, 255, 0.92)',
                  margin: 0,
                  lineHeight: 1.35,
                  fontWeight: 500
                }}>
                  {item.subtitle}
                </p>

                <div style={{
                  marginTop: '0.6rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: '#ffffff',
                  color: '#0d2818',
                  padding: '0.6rem 1.1rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  alignSelf: 'flex-start',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.35)'
                }}>
                  <span>{item.actionText}</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
};
