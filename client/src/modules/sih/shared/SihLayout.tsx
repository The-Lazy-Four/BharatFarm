import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext.js';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { MobileSihLayout } from '../../../components/mobile/MobileSihLayout';
import { Header } from '../../../components/layout/Header';
import { InstitutionalFooter } from '../../../components/layout/InstitutionalFooter';

interface SihShellProps {
  children: React.ReactNode;
  activeModuleId: 'climate-risk' | 'aggregation' | 'crop-insurance' | 'smart-mandi' | 'sahayak' | 'price-risk' | 'field-mapping';
  moduleTitle: string;
  moduleIcon?: string;
  moduleBadge?: string;
  hideMobileHeaderTitle?: boolean;
}

export const SihLayout: React.FC<SihShellProps> = ({
  children,
  activeModuleId,
  moduleTitle,
  hideMobileHeaderTitle
}) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { t } = useLanguage();

  if (isMobile) {
    return <MobileSihLayout title={moduleTitle} hideHeaderTitle={hideMobileHeaderTitle}>{children}</MobileSihLayout>;
  }

  const sihNavItems = [
    { id: 'climate-risk', label: t('sih.climateRiskNav') || 'Climate Risk', icon: 'partly_cloudy_day', path: '/sih/climate-risk' },
    { id: 'aggregation', label: t('sih.aggregationNav') || 'Group Aggregation', icon: 'groups', path: '/sih/smart-mandi?tab=sell' },
    { id: 'crop-insurance', label: t('sih.cropInsuranceNav') || 'Crop Insurance', icon: 'verified_user', path: '/sih/crop-insurance' },
    { id: 'smart-mandi', label: t('sih.smartMandiNav') || 'Smart Mandi', icon: 'bar_chart', path: '/sih/smart-mandi' },
    { id: 'sahayak', label: t('sih.sahayakNav') || 'Sahayak AI', icon: 'chat', path: '/sih/sahayak' },
    { id: 'price-risk', label: t('sih.priceRiskNav') || 'Price Risk', icon: 'psychology', path: '/sih/price-risk' },
    { id: 'field-mapping', label: 'Field Mapping', icon: 'map', path: '/sih/field-mapping' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--app-bg)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-family)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Universal Government-style Header */}
      <Header />

      {/* Main Body Layout (Left Sidebar Rail + Breadcrumb + Content) */}
      <div style={{ display: 'flex', flex: 1 }}>

        {/* Structured Left Navigation Rail */}
        <aside style={{
          width: '260px',
          background: 'var(--surface-1)',
          borderRight: '1px solid var(--border-default)',
          padding: '1.25rem 0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          flexShrink: 0
        }} className="sih-left-sidebar">
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: 'var(--gov-navy)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '0.4rem 0.75rem 0.6rem',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--gov-saffron)' }}>
              account_balance
            </span>
            <span>Digital Agriculture Services</span>
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
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  borderLeft: isActive ? '3px solid var(--gov-navy)' : '3px solid transparent',
                  background: isActive ? '#EBF3FB' : 'transparent',
                  color: isActive ? 'var(--gov-navy)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '19px', color: isActive ? 'var(--gov-navy)' : 'var(--text-muted)' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <NavLink
              to="/home"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
                background: 'var(--surface-3)',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.82rem',
                textDecoration: 'none'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
              <span>Back to Portal Home</span>
            </NavLink>
          </div>
        </aside>

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Breadcrumb strip */}
          <div
            style={{
              padding: '0.65rem 2rem',
              background: '#FFFFFF',
              borderBottom: '1px solid var(--border-default)',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--text-muted)'
            }}
          >
            <NavLink to="/home" style={{ color: 'var(--gov-navy)', textDecoration: 'none', fontWeight: 600 }}>
              National Portal
            </NavLink>
            <span>/</span>
            <span>Agricultural Intelligence Services</span>
            <span>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{moduleTitle}</span>
          </div>

          <main id="main-content" style={{
            flex: 1,
            padding: '2rem',
            maxWidth: '1280px',
            width: '100%',
            boxSizing: 'border-box',
            margin: '0 auto'
          }}>
            {children}
          </main>

          <InstitutionalFooter />
        </div>
      </div>
    </div>
  );
};
