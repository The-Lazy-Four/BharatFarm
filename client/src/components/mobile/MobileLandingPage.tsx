import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { InstallCTA } from '../pwa/InstallCTA.js';

// High Quality Unsplash Agricultural Photography
const SLIDES = [
  {
    id: 'farmer',
    eyebrow: 'BHARATFARM',
    title: 'Smarter Farming.\nBrighter Tomorrow.',
    description: 'One unified platform to help farmers make better decisions with weather, market intelligence, crop safety, and community support.',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1080&q=85',
    chips: ['🌾 Smart Agri', '👨‍🌾 Farmer First']
  },
  {
    id: 'climate-crop',
    eyebrow: 'INTELLIGENCE & RISK',
    title: 'See Risk.\nAct Earlier.',
    description: 'Real-time climate intelligence and crop health insights help you plan ahead and protect your harvest before adverse weather strikes.',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1080&q=85',
    chips: ['🌦 Climate Risk', '🌱 Crop Health', '🛰 Satellite Data']
  },
  {
    id: 'market-mandi',
    eyebrow: 'MARKET ACCESS',
    title: 'Find Better Markets.\nSell Smarter.',
    description: 'Compare live mandi opportunities, discover better prices, and strengthen your selling power through group farmer aggregation.',
    image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1080&q=85',
    chips: ['📊 Smart Mandi', '🤝 Aggregation', '💰 Best Value']
  },
  {
    id: 'ecosystem',
    eyebrow: 'BHARATFARM ECOSYSTEM',
    title: 'Your Farm.\nYour Data. Your Decisions.',
    description: 'From GIS field mapping and crop insurance to mandis, climate intelligence, and Sahayak AI — smart agriculture for every Indian farm.',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1080&q=85',
    chips: ['🌦 Climate', '🤝 Aggregation', '📊 Mandi', '🤖 Sahayak', '📍 Field Mapping']
  }
];

const FEATURE_CHIPS = [
  { icon: '🌦', text: 'Climate Risk Intelligence Ready' },
  { icon: '🛰', text: 'Crop Intelligence Satellite Ready' },
  { icon: '📊', text: 'Smart Mandi Insights Ready' },
  { icon: '🤝', text: 'Farmer Aggregation Network Ready' },
  { icon: '💬', text: 'Sahayak AI Assistant Available' },
  { icon: '📍', text: 'GIS Field Mapping System Ready' }
];

export const MobileLandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Check if onboarding was previously completed
  const [showSplash, setShowSplash] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [currentChipIndex, setCurrentChipIndex] = useState(0);

  // Touch Swipe Handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Preload Slide 1 & 2 Images
  useEffect(() => {
    SLIDES.slice(0, 2).forEach(s => {
      const img = new Image();
      img.src = s.image;
    });

    const completed = localStorage.getItem('bharatfarm_onboarding_completed') === 'true';
    setHasCompletedOnboarding(completed);
  }, []);

  // Cinematic Splash Feature Popup Timer (Runs during splash screen)
  useEffect(() => {
    if (!showSplash) return;

    const chipInterval = setInterval(() => {
      setCurrentChipIndex((prev) => (prev + 1) % FEATURE_CHIPS.length);
    }, 450);

    // Transition out of Splash Screen after ~2.2 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2200);

    return () => {
      clearInterval(chipInterval);
      clearTimeout(splashTimer);
    };
  }, [showSplash]);

  // Complete Onboarding Action
  const handleFinishOnboarding = () => {
    localStorage.setItem('bharatfarm_onboarding_completed', 'true');
    navigate('/login');
  };

  // Touch Handlers for horizontal swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold) {
      // Swipe Left -> Next Slide
      if (activeSlide < SLIDES.length - 1) {
        setActiveSlide(prev => prev + 1);
      }
    } else if (diff < -threshold) {
      // Swipe Right -> Prev Slide
      if (activeSlide > 0) {
        setActiveSlide(prev => prev - 1);
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // ── 1. CINEMATIC SPLASH LOADER ───────────────────────────────────────────
  if (showSplash) {
    const activeChip = FEATURE_CHIPS[currentChipIndex];

    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'radial-gradient(circle at center, #0b2915 0%, #041208 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        padding: '2rem',
        boxSizing: 'border-box'
      }}>
        {/* Brand Logo with Soft Glow */}
        <div style={{
          position: 'relative',
          marginBottom: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            position: 'absolute',
            inset: '-12px',
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%',
            animation: 'pulseGlow 2s infinite ease-in-out'
          }} />
          <img
            src="/logo.png"
            alt="BharatFarm"
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '22px',
              objectFit: 'contain',
              position: 'relative',
              zIndex: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            }}
          />
        </div>

        <h1 style={{
          fontSize: '2rem',
          fontWeight: 900,
          margin: '0 0 0.25rem 0',
          letterSpacing: '-0.03em',
          color: '#FFFFFF'
        }}>
          BharatFarm
        </h1>
        <p style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: '#4ADE80',
          margin: 0,
          letterSpacing: '0.08em',
          textTransform: 'uppercase'
        }}>
          Smart Agri · Brighter India
        </p>

        {/* Animated Feature Popup Notification Card */}
        <div style={{
          marginTop: '2.5rem',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div
            key={activeChip.text}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              backdropFilter: 'blur(12px)',
              padding: '0.6rem 1.25rem',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              animation: 'chipFadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{activeChip.icon}</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#E2E8F0' }}>
              {activeChip.text}
            </span>
          </div>
        </div>

        {/* Progress Bar Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '2.5rem',
          width: '140px',
          height: '4px',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: '100%',
            background: '#22C55E',
            borderRadius: '2px',
            animation: 'loadingProgress 2.2s ease-in-out forwards'
          }} />
        </div>

        {/* Embedded Keyframe Animations */}
        <style>{`
                    @keyframes pulseGlow {
                        0%, 100% { opacity: 0.4; transform: scale(1); }
                        50% { opacity: 0.8; transform: scale(1.15); }
                    }
                    @keyframes chipFadeUp {
                        0% { opacity: 0; transform: translateY(8px); }
                        100% { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes loadingProgress {
                        0% { width: 0%; }
                        100% { width: 100%; }
                    }
                `}</style>
      </div>
    );
  }

  // ── 2. RETURNING USER DIRECT SCREEN (Skip Carousel if already onboarding done) ──
  if (hasCompletedOnboarding) {
    return (
      <div style={{
        minHeight: '100dvh',
        width: '100vw',
        background: '#041208',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#FFFFFF',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        boxSizing: 'border-box'
      }}>
        <img
          src={SLIDES[3].image}
          alt="BharatFarm"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.65)'
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(4,18,8,0.4) 0%, rgba(4,18,8,0.92) 80%)'
        }} />

        {/* Header Logo */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: 'max(1.5rem, env(safe-area-inset-top)) 1.5rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <img src="/logo.png" alt="BharatFarm" style={{ width: '44px', height: '44px', borderRadius: '12px' }} />
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, margin: 0, lineHeight: 1.1 }}>BharatFarm</h1>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4ADE80' }}>Smart Agri · Brighter India</span>
          </div>
        </div>

        {/* Main Welcome Card */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: '1.5rem',
          paddingBottom: 'max(2rem, env(safe-area-inset-bottom))'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem', lineHeight: 1.2 }}>
            Welcome Back to BharatFarm
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#CBD5E1', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
            Your unified intelligent platform for weather risk, smart mandis, and crop management.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
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
                boxShadow: '0 6px 20px rgba(22, 163, 74, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <span>Sign In / Enter App</span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
            </button>

            <InstallCTA
              variant="button"
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: '14px',
                justifyContent: 'center',
                fontSize: '0.95rem'
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── 3. FULLSCREEN 4-SLIDE ONBOARDING CAROUSEL ────────────────────────────
  const currentSlide = SLIDES[activeSlide];

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        minHeight: '100dvh',
        width: '100vw',
        background: '#041208',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#FFFFFF',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Background Photography with Crossfade & Gradient Overlay */}
      {SLIDES.map((slide, idx) => (
        <div
          key={slide.id}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: activeSlide === idx ? 1 : 0,
            transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: 'none'
          }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.75)'
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(4,18,8,0.35) 0%, rgba(4,18,8,0.65) 50%, rgba(4,18,8,0.96) 90%)'
          }} />
        </div>
      ))}

      {/* Top Bar: Brand Logo + Skip Button */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: 'max(1.25rem, env(safe-area-inset-top)) 1.25rem 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <img
            src="/logo.png"
            alt="BharatFarm"
            style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'contain' }}
          />
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', display: 'block', lineHeight: 1 }}>
              BharatFarm
            </span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4ADE80', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Agri PWA
            </span>
          </div>
        </div>

        {/* Skip option (only on slides 1-3) */}
        {activeSlide < SLIDES.length - 1 && (
          <button
            onClick={handleFinishOnboarding}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              color: '#E2E8F0',
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Skip
          </button>
        )}
      </div>

      {/* Bottom Content Area */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '1.5rem',
        paddingBottom: 'max(1.75rem, env(safe-area-inset-bottom))',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {/* Feature Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {currentSlide.chips.map((chip) => (
            <span
              key={chip}
              style={{
                background: 'rgba(34, 197, 94, 0.2)',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                color: '#4ADE80',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '0.25rem 0.65rem',
                borderRadius: '12px',
                backdropFilter: 'blur(4px)'
              }}
            >
              {chip}
            </span>
          ))}
        </div>

        {/* Slide Text Content */}
        <div>
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            color: '#22C55E',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '0.35rem',
            display: 'block'
          }}>
            {currentSlide.eyebrow}
          </span>
          <h2 style={{
            fontSize: '1.9rem',
            fontWeight: 900,
            lineHeight: 1.15,
            margin: '0 0 0.6rem 0',
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            whiteSpace: 'pre-line'
          }}>
            {currentSlide.title}
          </h2>
          <p style={{
            fontSize: '0.92rem',
            color: '#CBD5E1',
            margin: 0,
            lineHeight: 1.5,
            fontWeight: 500
          }}>
            {currentSlide.description}
          </p>
        </div>

        {/* Progress Indicators (Dots) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0.25rem 0' }}>
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              style={{
                width: activeSlide === idx ? '28px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: activeSlide === idx ? '#22C55E' : 'rgba(255,255,255,0.3)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {activeSlide === SLIDES.length - 1 ? (
            <button
              onClick={handleFinishOnboarding}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '16px',
                background: '#16A34A',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 800,
                fontSize: '1.05rem',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(22, 163, 74, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'transform 0.15s ease'
              }}
            >
              <span>Get Started</span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveSlide(prev => prev + 1)}
              style={{
                width: '100%',
                padding: '0.95rem',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(10px)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <span>Next</span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
            </button>
          )}

          {/* PWA Install CTA integrated seamlessly */}
          <InstallCTA
            variant="button"
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              borderRadius: '16px',
              justifyContent: 'center',
              fontSize: '0.92rem'
            }}
          />
        </div>
      </div>
    </div>
  );
};
