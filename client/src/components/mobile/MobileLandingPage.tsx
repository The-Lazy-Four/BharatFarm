import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const MobileLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    { title: 'Grow Smarter, Live Better', caption: 'Empowering Farmers with Technology' },
    { title: 'AI Field Telemetry', caption: 'Real-time soil & weather insights' },
    { title: 'Direct Mandi Access', caption: 'Get best prices across markets' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(180deg, #F0FDF4 0%, #DCFCE7 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      {/* Top Header Logo */}
      <div style={{
        padding: '1.5rem 1.25rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        zIndex: 2
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#FFFFFF' }}>agriculture</span>
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
          BharatFarm
        </h1>
        <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#15803D', margin: 0 }}>
          {slides[activeSlide].title}
        </p>
      </div>

      {/* Middle Illustration / Background Area */}
      <div style={{
        flex: 1,
        margin: '1.5rem 1.25rem',
        borderRadius: '24px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'flex-end',
        background: '#0F172A'
      }}>
        <img
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80"
          alt="Agriculture field background"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.85)'
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 40%, rgba(15,23,42,0.85) 100%)'
        }} />

        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: '1.5rem',
          color: '#FFFFFF',
          width: '100%',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#E2E8F0', margin: '0 0 1rem 0' }}>
            {slides[activeSlide].caption}
          </p>

          {/* Carousel Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                style={{
                  width: activeSlide === idx ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: activeSlide === idx ? '#22C55E' : 'rgba(255,255,255,0.4)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA Area */}
      <div style={{
        padding: '0 1.25rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        zIndex: 2
      }}>
        <button
          onClick={() => navigate('/login')}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '14px',
            background: '#16A34A',
            color: '#FFFFFF',
            border: 'none',
            fontWeight: 800,
            fontSize: '1.05rem',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(22, 163, 74, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <span>Get Started</span>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
        </button>

        <button
          onClick={() => navigate('/login')}
          style={{
            width: '100%',
            padding: '0.85rem',
            borderRadius: '14px',
            background: '#FFFFFF',
            color: '#15803D',
            border: '1.5px solid #16A34A',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer'
          }}
        >
          Login to Existing Account
        </button>
      </div>
    </div>
  );
};
