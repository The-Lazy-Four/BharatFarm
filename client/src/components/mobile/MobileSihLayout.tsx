import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { MobileBottomNav } from './MobileBottomNav';

interface MobileSihLayoutProps {
  children: React.ReactNode;
  title: string;
  hideHeaderTitle?: boolean;
}

export const MobileSihLayout: React.FC<MobileSihLayoutProps> = ({ children, title, hideHeaderTitle }) => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { fontSize, setFontSize } = useAccessibility();

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'var(--app-bg)',
      color: 'var(--text-primary)',
      paddingBottom: '76px',
      fontFamily: 'var(--font-family)',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      {/* Institutional Top Strip for Mobile */}
      <div
        style={{
          background: '#0D233D',
          color: '#FFFFFF',
          padding: '0.2rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.68rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <span style={{ fontWeight: 600, color: '#E2E8F0' }}>BharatFarm Digital Agriculture</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <button
            onClick={() => setFontSize(fontSize === 'lg' ? 'md' : 'lg')}
            style={{
              background: 'transparent',
              color: '#FFFFFF',
              border: 'none',
              padding: '0 0.2rem',
              fontSize: '0.68rem',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            {fontSize === 'lg' ? 'A-' : 'A+'}
          </button>
        </div>
      </div>

      {/* Mobile Government Navigation Bar */}
      <header style={{
        padding: '0.65rem 0.85rem',
        background: '#FFFFFF',
        borderBottom: '2px solid #E99A32',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flex: 1, minWidth: 0 }}>
          <button
            onClick={() => navigate('/home')}
            style={{
              background: '#F1F5F9',
              border: '1px solid #DCE2E8',
              borderRadius: '4px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#12345A',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          </button>

          {!hideHeaderTitle && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.6rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                Service
              </div>
              <h1 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#12345A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {title}
              </h1>
            </div>
          )}
        </div>

        {/* Multilingual Selector */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          title={t('common.languageSelect')}
          style={{
            background: '#F8FAFC',
            color: '#12345A',
            border: '1px solid #DCE2E8',
            borderRadius: '4px',
            padding: '0.2rem 0.45rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            outline: 'none',
            flexShrink: 0
          }}
        >
          <option value="en">EN</option>
          <option value="hi">हिंदी</option>
          <option value="bn">বাংলা</option>
        </select>
      </header>

      {/* Content */}
      <main id="main-content" style={{ padding: '0.85rem', boxSizing: 'border-box' }}>
        {children}
      </main>

      {/* Bottom Nav */}
      <MobileBottomNav type="main" />
    </div>
  );
};
