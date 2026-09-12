import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.js';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { MobileSihLayout } from '../../../components/mobile/MobileSihLayout';
import { NotificationDrawer } from '../../../components/notifications/NotificationDrawer';

interface SihShellProps {
  children: React.ReactNode;
  activeModuleId: 'climate-risk' | 'aggregation' | 'crop-insurance' | 'smart-mandi' | 'sahayak' | 'price-risk' | 'field-mapping';
  moduleTitle: string;
  moduleIcon?: string;
  moduleBadge?: string;
}

export const SihLayout: React.FC<SihShellProps> = ({
  children,
  activeModuleId,
  moduleTitle
}) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  if (isMobile) {
    return <MobileSihLayout title={moduleTitle}>{children}</MobileSihLayout>;
  }


  const sihNavItems = [
    { id: 'climate-risk', label: 'Climate Risk', icon: 'partly_cloudy_day', path: '/sih/climate-risk' },
    { id: 'aggregation', label: 'Aggregation', icon: 'groups', path: '/sih/aggregation' },
    { id: 'crop-insurance', label: 'Crop Insurance', icon: 'verified_user', path: '/sih/crop-insurance' },
    { id: 'smart-mandi', label: 'Smart Mandi', icon: 'bar_chart', path: '/sih/smart-mandi' },
    { id: 'sahayak', label: 'Sahayak', icon: 'eco', path: '/sih/sahayak' },
    { id: 'price-risk', label: 'Before You Sow', icon: 'psychology', path: '/sih/price-risk' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      color: '#0F172A',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* Top Header */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {/* Brand */}
        <div
          onClick={() => navigate('/home')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <img
            src="/logo.png"
            alt="BharatFarm"
            style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'contain' }}
          />
          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E293B', letterSpacing: '-0.02em' }}>BharatFarm</span>
        </div>

        {/* User Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            onClick={() => setIsNotificationsOpen(true)}
            title="Notifications"
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>notifications</span>
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#EF4444',
              border: '2px solid #FFFFFF'
            }} />
          </button>

          <div
            onClick={() => navigate('/profile')}
            title={`View Profile & Settings (${user?.fullName || 'Farmer'})`}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#16A34A',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            {user?.fullName ? user.fullName[0].toUpperCase() : 'S'}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sih-mobile-toggle"
            style={{
              background: 'none',
              border: 'none',
              color: '#0F172A',
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

      {/* Main Body Layout (Left Sidebar Rail + Content) */}
      <div style={{ display: 'flex', flex: 1 }}>

        {/* Compact Left Sidebar Rail */}
        <aside style={{
          width: '240px',
          background: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          padding: '1.25rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          flexShrink: 0
        }} className="sih-left-sidebar">
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#94A3B8',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '0.4rem 0.75rem 0.6rem'
          }}>
            SIH MODULES
          </div>

          {sihNavItems.map((item) => {
            const isActive = item.id === activeModuleId;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 0.85rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? '#DCFCE7' : 'transparent',
                  color: isActive ? '#15803D' : '#475569',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: isActive ? '#16A34A' : '#64748B' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <button
              onClick={() => navigate('/home')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#334155',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
              <span>Back to Home</span>
            </button>
          </div>
        </aside>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '57px',
            left: 0,
            right: 0,
            background: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            padding: '1rem',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
          }}>
            {sihNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(item.path);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: item.id === activeModuleId ? '#DCFCE7' : 'transparent',
                  color: item.id === activeModuleId ? '#15803D' : '#334155',
                  fontWeight: 800,
                  fontSize: '0.95rem'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main Content Area */}
        <main style={{
          flex: 1,
          padding: '2rem',
          maxWidth: '1200px',
          boxSizing: 'border-box'
        }}>
          {children}
        </main>
      </div>

      {/* Interactive Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

    </div>
  );
};
