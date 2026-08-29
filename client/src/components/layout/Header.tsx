import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { useDataSaver } from '../../context/DataSaverContext.js';

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
  const { profileImage, getUserInitials } = useAuth();
  const { dataSaverMode, toggleDataSaverMode } = useDataSaver();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <>
      <header
        className="app-mobile-top-bar"
        style={{
          height: '56px',
          padding: '0 1rem',
          background: 'var(--surface-nav)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-default)',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--signal-lime)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--text-on-lime)' }}>
              agriculture
            </span>
          </div>
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              BharatFarm
            </h1>
            <span style={{ fontSize: '0.6rem', color: 'var(--emerald-primary)', fontWeight: 600 }}>
              Smart Farmer AI
            </span>
          </div>
        </div>

        {/* Right Controls: Data Saver Toggle, Theme Toggle, Notifications, Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Data Saver Mode Toggle */}
          <button
            onClick={toggleDataSaverMode}
            title={dataSaverMode ? 'Data Saver Enabled (Click to disable)' : 'Enable Mobile Data Saver Mode'}
            style={{
              background: dataSaverMode ? 'var(--signal-lime)' : 'var(--surface-1)',
              color: dataSaverMode ? 'var(--text-on-lime)' : 'var(--text-secondary)',
              border: `1px solid ${dataSaverMode ? 'var(--signal-lime)' : 'var(--border-default)'}`,
              borderRadius: '20px',
              padding: '0.25rem 0.6rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.725rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
              {dataSaverMode ? 'data_saver_on' : 'data_saver_off'}
            </span>
            <span className="header-datasaver-text">{dataSaverMode ? 'Data Saver' : 'Saver Off'}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border-default)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'var(--transition)'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
          </button>

          {/* Notification Bell Button */}
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            title="Notifications"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border-default)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              position: 'relative'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              notifications
            </span>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--signal-lime)'
              }} />
            )}
          </button>

          {/* User Profile Avatar Button */}
          <button
            onClick={() => navigate('/profile')}
            title="Profile & Settings"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--signal-lime)',
              color: 'var(--text-on-lime)',
              border: '1.5px solid var(--border-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 700,
              flexShrink: 0,
              cursor: 'pointer',
              overflow: 'hidden',
              padding: 0
            }}
          >
            {profileImage ? (
              <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              getUserInitials()
            )}
          </button>
        </div>
      </header>

      {/* Compact Mobile Notifications Drawer / Panel */}
      {isNotifOpen && (
        <div style={{
          position: 'fixed',
          top: '56px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--surface-overlay)',
          zIndex: 99,
          display: 'flex',
          justifyContent: 'center',
          padding: '0.75rem'
        }} onClick={() => setIsNotifOpen(false)}>
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              background: 'var(--surface-2)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-default)',
              padding: '1rem',
              maxHeight: '80vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              alignSelf: 'flex-start'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--text-primary)' }}>notifications</span>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Notifications</h3>
                {unreadCount > 0 && <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{unreadCount} new</span>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--emerald-primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                    Mark all read
                  </button>
                )}
                <button onClick={() => setIsNotifOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer', lineHeight: 1 }}>
                  ×
                </button>
              </div>
            </div>

            {notifications.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1.5rem 0' }}>
                No active notifications.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {notifications.map(item => (
                  <div
                    key={item.id}
                    className={`alert-${item.type}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                      opacity: item.read ? 0.75 : 1
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.title}</h4>
                      <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>{item.time}</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', opacity: 0.9, lineHeight: 1.3 }}>{item.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
