import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';

interface SihShellProps {
  children: React.ReactNode;
  activeModuleId: 'climate-risk' | 'aggregation' | 'crop-risk-insurance' | 'smart-mandi' | 'sahayak';
  moduleTitle: string;
  moduleIcon: string;
  moduleBadge: string;
}

export const SihLayout: React.FC<SihShellProps> = ({
  children,
  activeModuleId,
  moduleTitle,
  moduleIcon,
  moduleBadge
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sihModules = [
    { id: 'climate-risk', label: 'Climate Risk', icon: '🌦️', path: '/innovations/climate-risk' },
    { id: 'aggregation', label: 'Aggregation', icon: '🤝', path: '/innovations/aggregation-optimizer' },
    { id: 'crop-risk-insurance', label: 'Crop Insurance', icon: '🛰️', path: '/innovations/satellite-insurance' },
    { id: 'smart-mandi', label: 'Smart Mandi', icon: '📍', path: '/innovations/smart-mandi' },
    { id: 'sahayak', label: 'Sahayak & WA', icon: '💬', path: '/innovations/sahayak' },
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
      
      {/* Lightweight SIH Navigation Header */}
      <header style={{
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
        background: 'var(--surface-nav-glass, rgba(9, 26, 16, 0.95))',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* Left Branding & Back Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/module-home')}
            style={{
              background: 'var(--surface-1, rgba(255,255,255,0.08))',
              border: '1px solid var(--border-default, rgba(255,255,255,0.15))',
              color: 'var(--text-primary)',
              borderRadius: '10px',
              padding: '0.4rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
            <span>Module Home</span>
          </button>

          <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle, rgba(255,255,255,0.15))' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>{moduleIcon}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{moduleTitle}</h1>
                <span style={{
                  background: 'var(--signal-lime-soft, rgba(22, 163, 74, 0.15))',
                  color: 'var(--signal-lime, #16a34a)',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                  textTransform: 'uppercase'
                }}>
                  {moduleBadge}
                </span>
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>SIH INNOVATION WORKSPACE</span>
            </div>
          </div>
        </div>

        {/* Center Desktop Navigation Tabs */}
        <nav className="sih-desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {sihModules.map((m) => {
            const isActive = m.id === activeModuleId;
            return (
              <button
                key={m.id}
                onClick={() => navigate(m.path)}
                style={{
                  background: isActive ? 'var(--signal-lime, #16a34a)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right User Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/dashboard')}
            title="Open Basic Farmer Needs Dashboard"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'var(--text-primary)',
              borderRadius: '8px',
              padding: '0.4rem 0.75rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <span>👨‍🌾</span>
            <span className="sih-desktop-text">Basic Needs</span>
          </button>

          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {theme === 'light' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sih-mobile-toggle"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'none'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          background: 'var(--surface-nav, #0c2014)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.75rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}>
          {sihModules.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setMobileMenuOpen(false);
                navigate(m.path);
              }}
              style={{
                background: m.id === activeModuleId ? 'var(--signal-lime)' : 'transparent',
                color: m.id === activeModuleId ? '#ffffff' : 'var(--text-primary)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.6rem 0.85rem',
                textAlign: 'left',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Module Content Viewport */}
      <main style={{ flex: 1, width: '100%', boxSizing: 'border-box' }}>
        {children}
      </main>
    </div>
  );
};
