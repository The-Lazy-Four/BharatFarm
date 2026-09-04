import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileBottomNav } from './MobileBottomNav';

interface MobileSihLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const MobileSihLayout: React.FC<MobileSihLayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();

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
        gap: '0.75rem',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
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
            padding: 0
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
        </button>

        <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0, flex: 1 }}>
          {title}
        </h1>
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
