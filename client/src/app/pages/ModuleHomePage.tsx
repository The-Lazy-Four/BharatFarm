import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';

interface ModuleCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  imageUrl: string;
  path: string;
  badge?: string;
  actionText: string;
}

export const ModuleHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const modules: ModuleCard[] = [
    {
      id: 'climate-risk',
      title: 'Climate-Risk-Aware Procurement',
      subtitle: 'Weather radar, spray advisories & harvest window planning',
      icon: '🌦️',
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85',
      path: '/innovations/climate-risk',
      badge: 'Weather & Risk',
      actionText: 'Open Climate Planner'
    },
    {
      id: 'aggregation-optimizer',
      title: 'Small-Farm Aggregation',
      subtitle: 'Group buying for inputs & collective produce selling pool',
      icon: '🤝',
      imageUrl: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1000&q=85',
      path: '/innovations/aggregation-optimizer',
      badge: 'Group Power',
      actionText: 'Open Aggregator'
    },
    {
      id: 'satellite-insurance',
      title: 'Crop Risk & Insurance',
      subtitle: 'Satellite damage audit & AI leaf scanner diagnostic',
      icon: '🛰️',
      imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1000&q=85',
      path: '/innovations/satellite-insurance',
      badge: 'Audit & Health',
      actionText: 'Open Crop Risk'
    },
    {
      id: 'smart-mandi',
      title: 'Smart Mandi Intelligence',
      subtitle: 'Live APMC mandi rates & shortest distance profit router',
      icon: '📍',
      imageUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1000&q=85',
      path: '/innovations/smart-mandi',
      badge: 'Live Mandi & Freight',
      actionText: 'Open Smart Mandi'
    },
    {
      id: 'sahayak',
      title: 'Sahayak & WhatsApp',
      subtitle: '24/7 WhatsApp AI companion & local human Sahayak access',
      icon: '💬',
      imageUrl: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1000&q=85',
      path: '/innovations/sahayak',
      badge: 'Voice & WhatsApp',
      actionText: 'Open Sahayak'
    },
    {
      id: 'basic-farmer-needs',
      title: 'Basic Farmer Needs',
      subtitle: 'Complete everyday platform dashboard & farm utilities',
      icon: '👨‍🌾',
      imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1000&q=85',
      path: '/dashboard',
      badge: 'Full Dashboard',
      actionText: 'Open Dashboard'
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
      
      {/* Standalone Clean App Header */}
      <header style={{
        padding: '1.25rem 2rem',
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
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(22, 163, 74, 0.4)'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#FFFFFF' }}>agriculture</span>
          </div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>BharatFarm</h1>
            <span style={{ fontSize: '0.68rem', color: 'var(--signal-lime, #16a34a)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>MODULAR AGRI PLATFORM</span>
          </div>
        </div>

        {/* User Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={toggleTheme}
            style={{
              background: 'var(--surface-1, rgba(255,255,255,0.1))',
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

          <button
            onClick={logout}
            style={{
              background: 'rgba(220, 38, 38, 0.12)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              color: '#dc2626',
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
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main style={{ flex: 1, padding: '2.5rem 2rem', maxWidth: '1320px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        
        {/* Title Heading */}
        <div style={{ marginBottom: '2.25rem', textAlign: 'left' }}>
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
            marginBottom: '0.6rem'
          }}>
            Welcome, {user?.fullName || 'Farmer'} 👋
          </span>

          <h2 style={{
            fontSize: '2.4rem',
            fontWeight: 900,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            margin: 0,
            lineHeight: 1.15
          }}>
            Choose what you need today
          </h2>

          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            marginTop: '0.4rem',
            marginBottom: 0,
            fontWeight: 500
          }}>
            Tap any module card below to launch its dedicated application workspace.
          </p>
        </div>

        {/* 6 Large Image-Based Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.75rem'
        }}>
          {modules.map((module) => (
            <div
              key={module.id}
              onClick={() => navigate(module.path)}
              style={{
                position: 'relative',
                height: '330px',
                borderRadius: '22px',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                border: module.id === 'basic-farmer-needs'
                  ? '2px solid var(--signal-lime, #22c55e)'
                  : '1px solid rgba(255, 255, 255, 0.18)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.6rem',
                boxSizing: 'border-box'
              }}
              className="module-visual-card"
            >
              {/* Background Image */}
              <img
                src={module.imageUrl}
                alt={module.title}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 1,
                  transition: 'transform 0.4s ease',
                  filter: 'brightness(0.72)'
                }}
                className="card-bg-img"
              />

              {/* Readability Gradient */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(4, 18, 9, 0.9) 100%)',
                zIndex: 2
              }} />

              {/* Card Top */}
              <div style={{ position: 'relative', zIndex: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.22)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.25)'
                }}>
                  {module.icon}
                </div>

                {module.badge && (
                  <span style={{
                    background: module.id === 'basic-farmer-needs' ? '#22c55e' : 'rgba(255, 255, 255, 0.25)',
                    color: module.id === 'basic-farmer-needs' ? '#04210e' : '#ffffff',
                    backdropFilter: 'blur(8px)',
                    padding: '0.35rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase'
                  }}>
                    {module.badge}
                  </span>
                )}
              </div>

              {/* Card Bottom */}
              <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  margin: 0,
                  lineHeight: 1.25,
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}>
                  {module.title}
                </h3>

                <p style={{
                  fontSize: '0.88rem',
                  color: 'rgba(255, 255, 255, 0.92)',
                  margin: 0,
                  lineHeight: 1.35,
                  fontWeight: 500
                }}>
                  {module.subtitle}
                </p>

                <div style={{
                  marginTop: '0.7rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: module.id === 'basic-farmer-needs' ? '#22c55e' : '#ffffff',
                  color: module.id === 'basic-farmer-needs' ? '#04210e' : '#0d2818',
                  padding: '0.65rem 1.2rem',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  alignSelf: 'flex-start',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.35)'
                }}>
                  <span>{module.actionText}</span>
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
