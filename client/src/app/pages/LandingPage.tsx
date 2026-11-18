import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';
import { MobileLandingPage } from '../../components/mobile/MobileLandingPage';
import { useLanguage } from '../../context/LanguageContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { InstitutionalFooter } from '../../components/layout/InstitutionalFooter';

export const LandingPage: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { fontSize, setFontSize, skipToContent } = useAccessibility();

  if (isMobile) {
    return <MobileLandingPage />;
  }

  const todayStr = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--app-bg)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-family)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Skip to Main Content */}
      <a
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          skipToContent();
        }}
        className="skip-to-content-link"
      >
        Skip to Main Content
      </a>

      {/* ── TOP UTILITY STRIP ────────────────────────────────────────────── */}
      <div
        style={{
          background: '#0D233D',
          color: '#E2E8F0',
          padding: '0.3rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E' }} />
          <span style={{ fontWeight: 600, color: '#F8FAFC' }}>
            National Agricultural Digital Infrastructure Initiative
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
          <span style={{ color: '#94A3B8' }}>{todayStr}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Font Size A- / A / A+ */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', padding: '0.1rem 0.25rem', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.68rem', color: '#94A3B8', marginRight: '0.2rem', paddingLeft: '0.2rem' }}>Text:</span>
            <button
              onClick={() => setFontSize('sm')}
              title="Decrease Font Size"
              style={{
                background: fontSize === 'sm' ? '#12345A' : 'transparent',
                color: '#FFFFFF',
                border: fontSize === 'sm' ? '1px solid #E99A32' : 'none',
                borderRadius: '3px',
                padding: '0.1rem 0.35rem',
                fontSize: '0.7rem',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('md')}
              title="Standard Font Size"
              style={{
                background: fontSize === 'md' ? '#12345A' : 'transparent',
                color: '#FFFFFF',
                border: fontSize === 'md' ? '1px solid #E99A32' : 'none',
                borderRadius: '3px',
                padding: '0.1rem 0.35rem',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              title="Increase Font Size"
              style={{
                background: fontSize === 'lg' ? '#12345A' : 'transparent',
                color: '#FFFFFF',
                border: fontSize === 'lg' ? '1px solid #E99A32' : 'none',
                borderRadius: '3px',
                padding: '0.1rem 0.35rem',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              A+
            </button>
          </div>

          {/* Multilingual Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#E99A32' }}>translate</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              title={t('common.languageSelect')}
              style={{
                background: '#12345A',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '4px',
                padding: '0.2rem 0.4rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="bn">বাংলা</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── MAIN PORTAL HEADER ───────────────────────────────────────────── */}
      <header
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #DCE2E8',
          padding: '0.85rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <img
            src="/logo.png"
            alt="BharatFarm Emblem"
            style={{ width: '42px', height: '42px', objectFit: 'contain' }}
          />
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#12345A', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Bharat<span style={{ color: '#168447' }}>Farm</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
              Smart Tools. Stronger Farmers.
            </div>
          </div>
        </div>

        {/* Primary Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a href="#services" style={{ color: '#172B45', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' }}>
            Digital Services
          </a>
          <a href="#about" style={{ color: '#172B45', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' }}>
            About Platform
          </a>
          <a href="#schemes" style={{ color: '#172B45', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' }}>
            Schemes & Mandi
          </a>
          <a href="#contact" style={{ color: '#172B45', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem' }}>
            Help & Advisory
          </a>
        </nav>

        {/* Auth Entry Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            to="/login"
            style={{
              color: '#12345A',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              padding: '0.5rem 0.95rem',
              border: '1px solid #CBD5E1',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            {t('common.login') || "Log In"}
          </Link>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: '#12345A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '0.55rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(18, 52, 90, 0.2)'
            }}
          >
            {t('landing.getStartedFree') || "Access Portal"}
          </button>
        </div>
      </header>

      {/* Tricolor Accent Strip */}
      <div style={{ display: 'flex', height: '3px', width: '100%' }}>
        <div style={{ flex: 1, background: '#FF9933' }} />
        <div style={{ flex: 1, background: '#FFFFFF' }} />
        <div style={{ flex: 1, background: '#138808' }} />
      </div>

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <main id="main-content">
        <section
          style={{
            padding: '3.5rem 2rem 4rem',
            maxWidth: '1280px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.9fr',
            gap: '3rem',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#E8F5E9',
              color: '#168447',
              border: '1px solid rgba(22, 132, 71, 0.25)',
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 800,
              marginBottom: '1.25rem'
            }}>
              <span>NATIONAL DIGITAL AGRICULTURE PLATFORM</span>
            </div>

            <h1 style={{
              fontSize: '2.8rem',
              fontWeight: 900,
              lineHeight: 1.2,
              color: '#12345A',
              letterSpacing: '-0.02em',
              margin: '0 0 1.25rem 0'
            }}>
              Empowering Indian Agriculture Through Digital Intelligence
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: '#334155',
              lineHeight: 1.6,
              margin: '0 0 2rem 0',
              maxWidth: '580px'
            }}>
              An integrated agricultural platform connecting farmers with intelligent tools, market insights, weather information, and data-driven farming support.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: '#12345A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1.75rem',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(18, 52, 90, 0.25)'
                }}
              >
                <span>Enter Farmer Portal</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
              </button>

              <button
                onClick={() => navigate('/demo')}
                style={{
                  background: '#FFFFFF',
                  color: '#12345A',
                  border: '1px solid #CBD5E1',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1.4rem',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#E99A32' }}>play_circle</span>
                <span>Watch Demonstration</span>
              </button>
            </div>
          </div>

          {/* Institutional Highlights Card */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #DCE2E8',
              borderRadius: 'var(--radius)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #F1F5F9' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#168447' }}>verified_user</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#12345A', margin: 0 }}>
                Platform Telemetry & Features
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { title: 'Block-Level Climate Forecasts', desc: 'Predictive rainfall, extreme weather, and heat alerts directly calibrated for Indian agro-climatic zones.', icon: 'partly_cloudy_day' },
                { title: 'Real-Time APMC Mandi Prices', desc: 'Accurate price discovery and group transport pooling to maximize farmer net realizations per quintal.', icon: 'bar_chart' },
                { title: 'Automated Satellite Verification', desc: 'NDVI satellite imagery audit trails for objective crop insurance assessment and damage claims.', icon: 'satellite_alt' },
                { title: 'Multilingual Sahayak AI', desc: 'Voice, WhatsApp, and text interactions in regional languages to ensure universal accessibility.', icon: 'chat' }
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '4px', background: '#F1F5F9', color: '#12345A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{f.icon}</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#172B45', margin: '0 0 0.2rem 0' }}>{f.title}</h4>
                    <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CORE SERVICES SECTION ────────────────────────────────────────── */}
        <section
          id="services"
          style={{
            background: '#FFFFFF',
            borderTop: '1px solid #DCE2E8',
            borderBottom: '1px solid #DCE2E8',
            padding: '3.5rem 2rem'
          }}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#168447', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                DIGITAL PUBLIC INFRASTRUCTURE
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#12345A', margin: '0.35rem 0 0.5rem 0' }}>
                Key Agricultural Digital Services
              </h2>
              <p style={{ fontSize: '0.92rem', color: '#64748B', maxWidth: '640px', margin: '0 auto' }}>
                Designed in compliance with Indian digital public good standards to empower farmers across sowing, monitoring, selling, and risk protection.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {[
                { title: 'Climate Risk Planner', desc: 'Actionable agro-advisory based on real-time IMD weather and flood forecasts.', icon: 'partly_cloudy_day' },
                { title: 'Smart Mandi Real Prices', desc: 'Comparative net profit calculations across nearby mandis including transport deductions.', icon: 'bar_chart' },
                { title: 'Group Aggregation Pools', desc: 'Farmer pooling system to share logistics and negotiate collective market rates.', icon: 'groups' },
                { title: 'Crop Insurance Verification', desc: 'Satellite NDVI verification verifying yield loss objectively for insurance compensation.', icon: 'verified_user' },
                { title: 'AI Leaf Health Diagnostics', desc: 'Point-and-click computer vision diagnosing crop leaf diseases and curative remedies.', icon: 'biotech' },
                { title: 'GIS Cadastral Field Mapping', desc: 'Accurate boundary polygon mapping with GPS tracking on high-resolution satellite imagery.', icon: 'map' }
              ].map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1px solid #DCE2E8',
                    borderRadius: 'var(--radius)',
                    padding: '1.5rem',
                    background: '#F8FAFC'
                  }}
                >
                  <div style={{ width: '42px', height: '42px', borderRadius: '4px', background: '#EBF3FB', color: '#12345A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{s.icon}</span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#12345A', margin: '0 0 0.4rem 0' }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Institutional Footer */}
      <InstitutionalFooter />
    </div>
  );
};
