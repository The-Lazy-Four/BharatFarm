import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { MobileBottomNav } from './MobileBottomNav';

interface MobileSihLayoutProps {
  children: React.ReactNode;
  title: string;
  hideHeaderTitle?: boolean;
}

export const MobileSihLayout: React.FC<MobileSihLayoutProps> = ({ children, title, hideHeaderTitle }) => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#F8FAFC',
      paddingBottom: '70px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      {/* Mobile Top Bar */}
      <header style={{
        padding: '0.85rem 1rem',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
          <button
            onClick={() => navigate('/home')}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0F172A',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
          </button>

          {!hideHeaderTitle && (
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </h1>
          )}
        </div>

        {/* Multilingual Selector */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          title={t('common.languageSelect')}
          style={{
            background: '#F1F5F9',
            color: '#0F172A',
            border: '1px solid #CBD5E1',
            borderRadius: '20px',
            padding: '0.25rem 0.5rem',
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
      <main style={{ padding: '1rem', boxSizing: 'border-box' }}>
        {children}
      </main>

      {/* Bottom Nav */}
      <MobileBottomNav type="main" />
    </div>
  );
};
