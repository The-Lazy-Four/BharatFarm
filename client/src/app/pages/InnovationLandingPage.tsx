import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';

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

export const InnovationLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Visual Header */}
      <div style={{
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{
            background: 'var(--signal-lime, #16a34a)',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.75rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            BharatFarm
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Welcome back, {user?.fullName || 'Farmer'} 👋
          </span>
        </div>

        <h1 style={{
          fontSize: '2.2rem',
          fontWeight: 900,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          margin: 0
        }}>
          Choose what you need today
        </h1>

        <p style={{
          fontSize: '0.95rem',
          color: 'var(--text-secondary)',
          margin: 0,
          fontWeight: 500
        }}>
          Select an agricultural innovation workspace or open the complete farmer dashboard.
        </p>
      </div>

      {/* 6 Large Visual Module Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.5rem'
      }}>
        {modules.map((module) => (
          <div
            key={module.id}
            onClick={() => navigate(module.path)}
            style={{
              position: 'relative',
              height: '320px',
              borderRadius: '20px',
              overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              border: module.id === 'basic-farmer-needs'
                ? '2px solid var(--signal-lime, #22c55e)'
                : '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '1.5rem'
            }}
            className="module-visual-card"
          >
            {/* Background Unsplash Image */}
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
                filter: 'brightness(0.75)'
              }}
              className="card-bg-img"
            />

            {/* Gradient Overlays for High Contrast Readability */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(4, 18, 9, 0.88) 100%)',
              zIndex: 2
            }} />

            {/* Top Bar inside Card */}
            <div style={{ position: 'relative', zIndex: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}>
                {module.icon}
              </div>

              {module.badge && (
                <span style={{
                  background: module.id === 'basic-farmer-needs' ? '#22c55e' : 'rgba(255, 255, 255, 0.25)',
                  color: module.id === 'basic-farmer-needs' ? '#04210e' : '#ffffff',
                  backdropFilter: 'blur(8px)',
                  padding: '0.3rem 0.75rem',
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

            {/* Bottom Content inside Card */}
            <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h2 style={{
                fontSize: '1.45rem',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: 0,
                lineHeight: 1.25,
                textShadow: '0 2px 4px rgba(0,0,0,0.4)'
              }}>
                {module.title}
              </h2>

              <p style={{
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.9)',
                margin: 0,
                lineHeight: 1.35,
                fontWeight: 500
              }}>
                {module.subtitle}
              </p>

              {/* Action Button */}
              <div style={{
                marginTop: '0.6rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: module.id === 'basic-farmer-needs' ? '#22c55e' : 'rgba(255, 255, 255, 0.95)',
                color: module.id === 'basic-farmer-needs' ? '#04210e' : '#0d2818',
                padding: '0.6rem 1.1rem',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: 800,
                alignSelf: 'flex-start',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                transition: 'background 0.2s ease'
              }}>
                <span>{module.actionText}</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
