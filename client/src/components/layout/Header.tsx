import React, { useState } from 'react';
import { useNavigate, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useDataSaver } from '../../context/DataSaverContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { useAccessibility } from '../../context/AccessibilityContext.js';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'warning' | 'info' | 'success';
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Wheat Blight Risk Alert',
    message: 'High humidity detected in Ludhiana. Inspect crop leaves via Leaf Scanner.',
    time: '10m ago',
    type: 'warning',
    read: false
  },
  {
    id: 'n2',
    title: 'Order Dispatched',
    message: 'NPK 19-19-19 Fertilizer shipment (ORD-8821) is out for delivery.',
    time: '1h ago',
    type: 'info',
    read: false
  },
  {
    id: 'n3',
    title: 'Group Buying Pool Active',
    message: 'Bio-Pesticide pool reached 80% quota in Khanna block.',
    time: '3h ago',
    type: 'success',
    read: true
  }
];

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, profileImage, getUserInitials } = useAuth();
  const { dataSaverMode, toggleDataSaverMode } = useDataSaver();
  const { language, setLanguage, t } = useLanguage();
  const { fontSize, setFontSize, skipToContent } = useAccessibility();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const todayStr = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, boxShadow: 'var(--shadow-sm)' }}>
      {/* Skip to Content Link (GIGW 3.0 accessibility requirement) */}
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

      {/* ── TOP UTILITY STRIP (GIGW 3.0 Standard) ────────────────────────── */}
      <div
        style={{
          background: '#0D233D',
          color: '#E2E8F0',
          padding: '0.3rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          fontFamily: 'var(--font-family)'
        }}
      >
        {/* Left: National Digital Public Infrastructure Strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E' }} />
            <span style={{ fontWeight: 600, letterSpacing: '0.02em', color: '#F8FAFC' }}>
              Digital Agriculture Public Infrastructure
            </span>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
          <span style={{ color: '#94A3B8' }}>{todayStr}</span>
        </div>

        {/* Right: Accessibility Controls (Font Size, Language, Data Saver, High Contrast) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
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

          {/* Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#E99A32' }}>
              translate
            </span>
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

          {/* Data Saver Mode Pill */}
          <button
            onClick={toggleDataSaverMode}
            title={dataSaverMode ? t('header.saverOnTitle') : t('header.saverOffTitle')}
            style={{
              background: dataSaverMode ? '#168447' : 'rgba(255,255,255,0.08)',
              color: '#FFFFFF',
              border: `1px solid ${dataSaverMode ? '#22C55E' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: '4px',
              padding: '0.2rem 0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              {dataSaverMode ? 'data_saver_on' : 'data_saver_off'}
            </span>
            <span>{dataSaverMode ? 'Saver: ON' : 'Saver: OFF'}</span>
          </button>

          {/* High Contrast Theme Switch */}
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? t('header.themeSwitchDark') : t('header.themeSwitchLight')}
            style={{
              background: 'transparent',
              color: '#E2E8F0',
              border: 'none',
              padding: '0.2rem',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
          </button>
        </div>
      </div>

      {/* ── MAIN INSTITUTIONAL IDENTITY HEADER ──────────────────────────── */}
      <div
        style={{
          background: '#FFFFFF',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #DCE2E8'
        }}
      >
        {/* Brand Logo & National Agriculture Portal Heading */}
        <div
          onClick={() => navigate('/home')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}
        >
          <img
            src="/logo.png"
            alt="BharatFarm Emblem"
            style={{ width: '42px', height: '42px', objectFit: 'contain' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#12345A', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Bharat<span style={{ color: '#168447' }}>Farm</span>
              </span>
              <span
                style={{
                  background: '#E8F5E9',
                  color: '#168447',
                  border: '1px solid rgba(22, 132, 71, 0.3)',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  letterSpacing: '0.04em'
                }}
              >
                PUBLIC PLATFORM
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, letterSpacing: '0.01em' }}>
              Smart Tools. Stronger Farmers.
            </div>
          </div>
        </div>

        {/* Right Action Icons: Notification Drawer & Farmer Account */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Notifications Trigger */}
          <button
            onClick={() => setIsNotifOpen(prev => !prev)}
            title="System Notices & Alerts"
            style={{
              position: 'relative',
              background: '#F1F5F9',
              border: '1px solid #DCE2E8',
              borderRadius: '6px',
              padding: '0.45rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#12345A',
              cursor: 'pointer'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              notifications
            </span>
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#DC2626',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #FFFFFF'
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Pill */}
          <div
            onClick={() => navigate('/profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              background: '#F8FAFC',
              border: '1px solid #DCE2E8',
              cursor: 'pointer'
            }}
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Farmer Profile"
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#12345A',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}
              >
                {getUserInitials()}
              </div>
            )}
            <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#172B45' }}>
                {user?.fullName || 'Registered Farmer'}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748B' }}>
                {user?.state || 'Verified Profile'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PRIMARY NAVIGATION BAR (Institutional Portal Menu) ───────────── */}
      <nav
        style={{
          background: '#12345A',
          color: '#FFFFFF',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '3px solid #E99A32',
          fontFamily: 'var(--font-family)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', overflowX: 'auto' }}>
          <NavLink
            to="/home"
            style={({ isActive }) => ({
              padding: '0.75rem 1rem',
              color: isActive ? '#FFFFFF' : '#CBD5E1',
              background: isActive ? '#1E4670' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.85rem',
              borderBottom: isActive ? '3px solid #E99A32' : '3px solid transparent',
              marginBottom: '-3px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap'
            })}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>home</span>
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/dashboard"
            style={({ isActive }) => ({
              padding: '0.75rem 1rem',
              color: isActive ? '#FFFFFF' : '#CBD5E1',
              background: isActive ? '#1E4670' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.85rem',
              borderBottom: isActive ? '3px solid #E99A32' : '3px solid transparent',
              marginBottom: '-3px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap'
            })}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>dashboard</span>
            <span>Farmer Workspace</span>
          </NavLink>

          <NavLink
            to="/sih/climate-risk"
            style={({ isActive }) => ({
              padding: '0.75rem 1rem',
              color: isActive ? '#FFFFFF' : '#CBD5E1',
              background: isActive ? '#1E4670' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.85rem',
              borderBottom: isActive ? '3px solid #E99A32' : '3px solid transparent',
              marginBottom: '-3px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap'
            })}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>partly_cloudy_day</span>
            <span>Climate & Disaster Risk</span>
          </NavLink>

          <NavLink
            to="/sih/smart-mandi"
            style={({ isActive }) => ({
              padding: '0.75rem 1rem',
              color: isActive ? '#FFFFFF' : '#CBD5E1',
              background: isActive ? '#1E4670' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.85rem',
              borderBottom: isActive ? '3px solid #E99A32' : '3px solid transparent',
              marginBottom: '-3px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap'
            })}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bar_chart</span>
            <span>Smart Mandi</span>
          </NavLink>

          <NavLink
            to="/sih/crop-insurance"
            style={({ isActive }) => ({
              padding: '0.75rem 1rem',
              color: isActive ? '#FFFFFF' : '#CBD5E1',
              background: isActive ? '#1E4670' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.85rem',
              borderBottom: isActive ? '3px solid #E99A32' : '3px solid transparent',
              marginBottom: '-3px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap'
            })}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified_user</span>
            <span>Crop Insurance</span>
          </NavLink>

          <NavLink
            to="/sih/sahayak"
            style={({ isActive }) => ({
              padding: '0.75rem 1rem',
              color: isActive ? '#FFFFFF' : '#CBD5E1',
              background: isActive ? '#1E4670' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.85rem',
              borderBottom: isActive ? '3px solid #E99A32' : '3px solid transparent',
              marginBottom: '-3px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap'
            })}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chat</span>
            <span>Sahayak AI</span>
          </NavLink>

          <NavLink
            to="/sih/field-mapping"
            style={({ isActive }) => ({
              padding: '0.75rem 1rem',
              color: isActive ? '#FFFFFF' : '#CBD5E1',
              background: isActive ? '#1E4670' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.85rem',
              borderBottom: isActive ? '3px solid #E99A32' : '3px solid transparent',
              marginBottom: '-3px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap'
            })}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>map</span>
            <span>Field Mapping</span>
          </NavLink>
        </div>

        {/* Right Navigation Shortcut: Demo & Help */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <NavLink
            to="/demo"
            style={{
              padding: '0.4rem 0.75rem',
              background: '#E99A32',
              color: '#12345A',
              fontWeight: 700,
              fontSize: '0.78rem',
              borderRadius: '4px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>play_circle</span>
            <span>Video Demo</span>
          </NavLink>
        </div>
      </nav>

      {/* ── NOTIFICATION DRAWER / DROPDOWN ──────────────────────────────── */}
      {isNotifOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: '1.5rem',
            width: '360px',
            maxWidth: '90vw',
            background: '#FFFFFF',
            border: '1px solid #DCE2E8',
            borderRadius: '0 0 8px 8px',
            boxShadow: '0 8px 24px rgba(18, 52, 90, 0.15)',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              background: '#12345A',
              color: '#FFFFFF',
              padding: '0.75rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Platform Alerts & Advisories</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: 'transparent',
                  color: '#E99A32',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Mark all read
              </button>
            )}
          </div>
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid #F1F5F9',
                  background: n.read ? '#FFFFFF' : '#F8FAFC'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#172B45' }}>{n.title}</span>
                  <span style={{ fontSize: '0.68rem', color: '#64748B' }}>{n.time}</span>
                </div>
                <p style={{ fontSize: '0.76rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
