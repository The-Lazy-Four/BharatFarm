import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';
import { MobileLandingPage } from '../../components/mobile/MobileLandingPage';
import { InstallCTA } from '../../components/pwa/InstallCTA.js';
import { useLanguage } from '../../context/LanguageContext';

export const LandingPage: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  if (isMobile) {
    return <MobileLandingPage />;
  }


  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      color: '#0F172A',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Header Navigation */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src="/logo.png"
            alt="BharatFarm"
            style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'contain' }}
          />
          <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1E293B', letterSpacing: '-0.02em' }}>BharatFarm</span>
        </div>

        {/* Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="landing-nav">
          <a href="#home" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>{t('common.home')}</a>
          <a href="#about" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>{t('common.about')}</a>
          <a href="#features" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>{t('common.features')}</a>
          <a href="#impact" style={{ color: '#475569', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>{t('common.impact')}</a>
        </nav>

        {/* CTA & Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            title={t('common.languageSelect')}
            style={{
              background: '#F1F5F9',
              color: '#0F172A',
              border: '1px solid #CBD5E1',
              borderRadius: '20px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="en">EN</option>
            <option value="hi">हिंदी</option>
            <option value="bn">বাংলা</option>
          </select>

          <Link
            to="/login"
            style={{
              color: '#15803D',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              padding: '0.5rem 1rem'
            }}
          >
            {t('common.login')}
          </Link>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: '#16A34A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '0.6rem 1.3rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
              transition: 'transform 0.15s ease, background 0.15s ease'
            }}
          >
            {t('landing.getStartedFree')}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" style={{
        padding: '4rem 2rem 5rem',
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '3rem',
        alignItems: 'center'
      }}>
        {/* Hero Left Content */}
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#DCFCE7',
            color: '#15803D',
            padding: '0.35rem 0.85rem',
            borderRadius: '20px',
            fontSize: '0.82rem',
            fontWeight: 800,
            marginBottom: '1.25rem'
          }}>
            <span>{t('landing.smartAgriPlatform')}</span>
          </div>

          <h1 style={{
            fontSize: '3.2rem',
            fontWeight: 900,
            lineHeight: 1.15,
            color: '#0F172A',
            letterSpacing: '-0.03em',
            margin: '0 0 1.25rem 0'
          }}>
            {t('landing.heroTitleMain')} <span style={{ color: '#16A34A' }}>{t('landing.heroHighlight')}</span>
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: '#475569',
            lineHeight: 1.6,
            margin: '0 0 2rem 0',
            maxWidth: '540px'
          }}>
            {t('landing.heroDesc')}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: '#16A34A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '0.9rem 1.8rem',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(22, 163, 74, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>{t('landing.getStarted')}</span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
            </button>

            <a
              href="#about"
              style={{
                background: '#FFFFFF',
                color: '#334155',
                border: '1px solid #CBD5E1',
                borderRadius: '12px',
                padding: '0.9rem 1.8rem',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
              }}
            >
              {t('landing.learnMore')}
            </a>

            {/* PWA Install CTA — only shows when installation is available */}
            <InstallCTA variant="button" />
          </div>

        </div>

        {/* Hero Right Visual Illustration / Image */}
        <div style={{ position: 'relative' }}>
          <div style={{
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
            border: '4px solid #FFFFFF',
            position: 'relative',
            height: '400px'
          }}>
            <img
              src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80"
              alt="Farmer standing in lush green field"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(15,23,42,0.6) 100%)'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '1.5rem',
              left: '1.5rem',
              right: '1.5rem',
              color: '#FFFFFF',
              zIndex: 2
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#86EFAC' }}>
                {t('landing.farmerFirstTag')}
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.2rem 0 0 0' }}>
                {t('landing.connectingFarmers')}
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats Section */}
      <section id="impact" style={{
        background: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0',
        padding: '3rem 2rem'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#16A34A', lineHeight: 1 }}>{t('landing.statFarmersVal')}</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748B', marginTop: '0.4rem' }}>{t('landing.statFarmersLabel')}</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#16A34A', lineHeight: 1 }}>{t('landing.statCropsVal')}</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748B', marginTop: '0.4rem' }}>{t('landing.statCropsLabel')}</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#16A34A', lineHeight: 1 }}>{t('landing.statDistrictsVal')}</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748B', marginTop: '0.4rem' }}>{t('landing.statDistrictsLabel')}</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#16A34A', lineHeight: 1 }}>{t('landing.statTelemetryVal')}</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748B', marginTop: '0.4rem' }}>{t('landing.statTelemetryLabel')}</div>
          </div>
        </div>
      </section>

      {/* About & Features Highlights */}
      <section id="features" style={{
        padding: '4.5rem 2rem',
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('landing.whyTag')}
          </span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0F172A', marginTop: '0.35rem' }}>
            {t('landing.whyTitle')}
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {[
            { icon: 'partly_cloudy_day', title: t('landing.feat1Title'), desc: t('landing.feat1Desc') },
            { icon: 'groups', title: t('landing.feat2Title'), desc: t('landing.feat2Desc') },
            { icon: 'satellite_alt', title: t('landing.feat3Title'), desc: t('landing.feat3Desc') },
            { icon: 'pin_drop', title: t('landing.feat4Title'), desc: t('landing.feat4Desc') },
            { icon: 'support_agent', title: t('landing.feat5Title'), desc: t('landing.feat5Desc') }
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '1.75rem',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#DCFCE7',
                color: '#15803D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>{item.icon}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{item.title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#0F172A',
        color: '#94A3B8',
        padding: '3rem 2rem 2rem',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          borderBottom: '1px solid #334155',
          paddingBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src="/logo.png"
              alt="BharatFarm"
              style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'contain' }}
            />
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>BharatFarm</span>
          </div>

          <div style={{ fontSize: '0.9rem' }}>
            {t('landing.sihPlatform')}
          </div>
        </div>

        <div style={{
          maxWidth: '1280px',
          margin: '1.5rem auto 0',
          textAlign: 'center',
          fontSize: '0.85rem'
        }}>
          {t('landing.rightsReserved', { year: new Date().getFullYear() })}
        </div>
      </footer>
    </div>
  );
};
