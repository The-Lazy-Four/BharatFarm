import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.js';

interface SihShellProps {
  children: React.ReactNode;
  activeModuleId: 'climate-risk' | 'aggregation' | 'crop-insurance' | 'smart-mandi' | 'sahayak';
  moduleTitle: string;
  moduleIcon?: string;
  moduleBadge?: string;
}

export const SihLayout: React.FC<SihShellProps> = ({
  children,
  activeModuleId
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sihNavItems = [
    { id: 'climate-risk', label: 'Climate Risk', icon: 'partly_cloudy_day', path: '/sih/climate-risk' },
    { id: 'aggregation', label: 'Aggregation', icon: 'groups', path: '/sih/aggregation' },
    { id: 'crop-insurance', label: 'Crop Insurance', icon: 'verified_user', path: '/sih/crop-insurance' },
    { id: 'smart-mandi', label: 'Smart Mandi', icon: 'bar_chart', path: '/sih/smart-mandi' },
    { id: 'sahayak', label: 'Sahayak', icon: 'eco', path: '/sih/sahayak' },
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
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#FFFFFF' }}>agriculture</span>
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E293B', letterSpacing: '-0.02em' }}>BharatFarm</span>
        </div>

        {/* Global Search Bar */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '380px', margin: '0 1rem' }} className="header-search-bar">
          <input
            type="text"
            placeholder="Search..."
            style={{
              width: '100%',
              padding: '0.5rem 1rem 0.5rem 2.4rem',
              borderRadius: '20px',
              border: '1px solid #CBD5E1',
              background: '#F1F5F9',
              fontSize: '0.85rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <span className="material-symbols-outlined" style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '18px',
            color: '#64748B'
          }}>search</span>
        </div>

        {/* User Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
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
              cursor: 'pointer'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>notifications</span>
          </button>

          <div
            onClick={logout}
            title={`Logged in as ${user?.fullName || 'Farmer'} (Click to Logout)`}
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

    </div>
  );
};
