import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { useIsMobile } from '../../hooks/useIsMobile';
import { MobileModuleHomePage } from '../../components/mobile/MobileModuleHomePage';
import { PriceRiskService } from '../../modules/sih/price-risk/priceRisk.service.js';
import { Header } from '../../components/layout/Header';
import { InstitutionalFooter } from '../../components/layout/InstitutionalFooter';

interface ServiceCard {
  id: string;
  title: string;
  department: string;
  description: string;
  icon: string;
  path: string;
  actionLabel: string;
  badge?: string;
  status: string;
}

export const ModuleHomePage: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  if (isMobile) {
    return <MobileModuleHomePage />;
  }

  const reg = PriceRiskService.getFieldRegistration(user?.id || 'demo_farmer') || {
    fieldName: 'North Paddy Field',
    crop: 'Paddy',
    landSizeAcres: 0.4,
    district: 'Haldia',
    state: 'West Bengal'
  };

  const portalServices: ServiceCard[] = [
    {
      id: 'climate-risk',
      title: t('sih.climateRiskNav') || 'Climate & Disaster Risk Intelligence',
      department: 'Agro-Meteorology & Risk Advisory',
      description: 'Block-level precipitation forecasts, flood probability assessment, extreme heat alerts, and field operation recommendations.',
      icon: 'partly_cloudy_day',
      path: '/sih/climate-risk',
      actionLabel: 'Access Risk Advisory',
      status: 'Live Advisory Active'
    },
    {
      id: 'smart-mandi',
      title: t('sih.smartMandiNav') || 'Smart Mandi Real-Time Prices',
      department: 'Agricultural Marketing & Price Intelligence',
      description: 'Real-time market prices across nearby APMC mandis, logistics cost breakdown, and net profit optimization per quintal.',
      icon: 'bar_chart',
      path: '/sih/smart-mandi',
      actionLabel: 'View Mandi Prices',
      status: 'Data Updated Today'
    },
    {
      id: 'aggregation',
      title: t('sih.aggregationNav') || 'Group Selling & Transport Pooling',
      department: 'Logistics Aggregation & Cooperative Pooling',
      description: 'Join verified regional farmer aggregation pools to reduce transport overhead and gain bulk bargaining power.',
      icon: 'groups',
      path: '/sih/smart-mandi?tab=sell',
      actionLabel: 'Join Aggregation Pool',
      status: 'Pools Open in District'
    },
    {
      id: 'crop-insurance',
      title: t('sih.cropInsuranceNav') || 'Crop Insurance Verification',
      department: 'Pradhan Mantri Fasal Bima / Satellite Claims',
      description: 'Transparent automated claim verification powered by satellite NDVI vegetative index telemetry and automated weather audits.',
      icon: 'verified_user',
      path: '/sih/crop-insurance',
      actionLabel: 'Check Claim Eligibility',
      status: 'Automated Audit Active'
    },
    {
      id: 'sahayak',
      title: t('sih.sahayakNav') || 'Sahayak AI Multilingual Assistant',
      department: 'Citizen Farmer Helpdesk & Advisory AI',
      description: 'Interactive voice and text farming advisory available in Hindi, Bengali, and English, with automated WhatsApp and IVR call support.',
      icon: 'chat',
      path: '/sih/sahayak',
      actionLabel: 'Consult Sahayak',
      status: '24/7 Virtual Helpdesk'
    },
    {
      id: 'price-risk',
      title: t('sih.priceRiskNav') || 'Before You Sow Price Advisory',
      department: 'Pre-Sowing Decision Intelligence',
      description: 'Forward-looking price projection based on national supply-demand trends before purchasing seed and commencing cultivation.',
      icon: 'psychology',
      path: '/sih/price-risk',
      actionLabel: 'Evaluate Crop Sowing',
      status: 'Kharif / Rabi Guidance'
    },
    {
      id: 'field-mapping',
      title: 'GIS Farm Boundary & Satellite Mapping',
      department: 'Cadastral & Geospatial Services',
      description: 'Interactive polygon mapping on high-resolution satellite imagery with automatic acreage calculation and GPS walk-the-farm logging.',
      icon: 'map',
      path: '/sih/field-mapping',
      actionLabel: 'View Cadastral Map',
      status: 'Field Registered'
    },
    {
      id: 'basic-dashboard',
      title: 'Farmer Operations Workspace',
      department: 'Integrated Farm Management System',
      description: 'Daily operational workspace covering crop roadmaps, AI leaf disease diagnostics, government scheme directory, and farm logbooks.',
      icon: 'dashboard',
      path: '/dashboard',
      actionLabel: 'Open Farmer Workspace',
      status: 'Active Profile'
    }
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
      {/* Universal Institutional Header */}
      <Header />

      {/* Main Container */}
      <main id="main-content" style={{
        flex: 1,
        padding: '2rem 1.5rem 3rem',
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>

        {/* ── SECTION B: HERO / WELCOME SECTION (Government-grade Public Banner) ── */}
        <section
          style={{
            background: '#FFFFFF',
            border: '1px solid #DCE2E8',
            borderRadius: 'var(--radius)',
            padding: '2rem 2.5rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: '2.5rem',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle Institutional Border Accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #12345A 0%, #168447 50%, #E99A32 100%)' }} />

          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#F1F5F9', border: '1px solid #DCE2E8', borderRadius: '4px', padding: '0.2rem 0.6rem', marginBottom: '1rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#168447' }}>verified</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#12345A', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                National Agricultural Digital Platform
              </span>
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#12345A', lineHeight: 1.2, margin: '0 0 1rem 0', letterSpacing: '-0.02em' }}>
              Empowering Indian Agriculture Through Digital Intelligence
            </h1>

            <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.6, margin: '0 0 1.5rem 0', maxWidth: '640px' }}>
              An integrated agricultural platform connecting farmers with intelligent tools, market insights, weather information, and data-driven farming support.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  background: '#12345A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.65rem 1.4rem',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 8px rgba(18, 52, 90, 0.2)'
                }}
              >
                <span>Access Farmer Workspace</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
              </button>

              <button
                onClick={() => navigate('/sih/climate-risk')}
                style={{
                  background: '#FFFFFF',
                  color: '#12345A',
                  border: '1px solid #CBD5E1',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#168447' }}>partly_cloudy_day</span>
                <span>Check Today's Weather Advisory</span>
              </button>
            </div>
          </div>

          {/* Quick Notice Panel */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1px solid #DCE2E8',
              borderRadius: 'var(--radius-sm)',
              padding: '1.25rem',
              fontSize: '0.82rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#12345A', marginBottom: '0.75rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#E99A32' }}>campaign</span>
              <span>Important Farmer Advisories</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li style={{ display: 'flex', gap: '0.5rem', lineHeight: 1.4 }}>
                <span style={{ color: '#168447', fontWeight: 700 }}>•</span>
                <span><strong>Mandi Rates:</strong> Live modal mandi prices for Paddy & Wheat refreshed as of today.</span>
              </li>
              <li style={{ display: 'flex', gap: '0.5rem', lineHeight: 1.4 }}>
                <span style={{ color: '#168447', fontWeight: 700 }}>•</span>
                <span><strong>Weather:</strong> Moderate rainfall likelihood in coastal eastern districts. Plan harvesting accordingly.</span>
              </li>
              <li style={{ display: 'flex', gap: '0.5rem', lineHeight: 1.4 }}>
                <span style={{ color: '#168447', fontWeight: 700 }}>•</span>
                <span><strong>Insurance:</strong> Automated satellite crop verification active for Kharif season policies.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── SECTION C: REGISTERED FARMER INFORMATION (Government Service Information Panel) ── */}
        <section
          style={{
            background: '#FFFFFF',
            border: '1px solid #DCE2E8',
            borderRadius: 'var(--radius)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.85rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '4px', background: '#E8F5E9', color: '#168447', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>badge</span>
              </div>
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#12345A', margin: 0 }}>
                  Registered Farmer & Land Record Details
                </h2>
                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Unique Farmer Digital Identification & Field Record
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: '#E8F5E9', color: '#168447', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(22, 132, 71, 0.2)' }}>
                Status: Verified Record
              </span>
              <button
                onClick={() => navigate('/sih/field-mapping')}
                style={{
                  background: '#FFFFFF',
                  color: '#12345A',
                  border: '1px solid #CBD5E1',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                <span>Update Registration</span>
              </button>
            </div>
          </div>

          {/* Structured Key-Value Metadata Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              background: '#F8FAFC',
              padding: '1.25rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #E2E8F0'
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Registered Field Name
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#172B45', marginTop: '0.2rem' }}>
                {reg.fieldName}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Primary Crop Cultivated
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#168447', marginTop: '0.2rem' }}>
                {reg.crop}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Land Holding
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#172B45', marginTop: '0.2rem' }}>
                {reg.landSizeAcres} Acres
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                District & State Jurisdiction
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#172B45', marginTop: '0.2rem' }}>
                {reg.district}, {reg.state}
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION D: AGRICULTURAL SERVICES DIRECTORY (Government-Style Service Cards) ── */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#12345A', margin: 0 }}>
                Digital Agriculture Services & Utilities
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.25rem 0 0' }}>
                National digital infrastructure tools available for field monitoring, market access, and financial protection.
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#12345A', background: '#F1F5F9', border: '1px solid #DCE2E8', padding: '0.3rem 0.75rem', borderRadius: '4px' }}>
              8 Services Available
            </span>
          </div>

          {/* Clean Government Service Card Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem'
            }}
          >
            {portalServices.map((service) => (
              <div
                key={service.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #DCE2E8',
                  borderRadius: 'var(--radius)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  overflow: 'hidden'
                }}
              >
                {/* Card Header Strip */}
                <div style={{ padding: '1.25rem 1.25rem 0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '4px',
                        background: '#EBF3FB',
                        color: '#12345A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{service.icon}</span>
                    </div>

                    <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#475569' }}>
                      {service.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#168447', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
                    {service.department}
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#12345A', margin: '0 0 0.5rem 0', lineHeight: 1.3 }}>
                    {service.title}
                  </h3>

                  <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    {service.description}
                  </p>
                </div>

                {/* Card Action Footer */}
                <div style={{ padding: '1rem 1.25rem', background: '#F8FAFC', borderTop: '1px solid #F1F5F9', marginTop: '1rem' }}>
                  <button
                    onClick={() => navigate(service.path)}
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      color: '#12345A',
                      border: '1px solid #CBD5E1',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.55rem 1rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <span>{service.actionLabel}</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Institutional Footer */}
      <InstitutionalFooter />
    </div>
  );
};
