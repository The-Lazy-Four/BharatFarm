import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const InstitutionalFooter: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        background: '#12345A',
        color: '#FFFFFF',
        borderTop: '3px solid #E99A32',
        fontSize: '0.85rem',
        marginTop: 'auto',
        fontFamily: 'var(--font-family)'
      }}
    >
      {/* Tricolor Subtle Top Bar */}
      <div style={{ display: 'flex', height: '3px', width: '100%' }}>
        <div style={{ flex: 1, background: '#FF9933' }} />
        <div style={{ flex: 1, background: '#FFFFFF' }} />
        <div style={{ flex: 1, background: '#138808' }} />
      </div>

      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '2.5rem 1.5rem 1.5rem',
          boxSizing: 'border-box'
        }}
      >
        {/* Main Footer Columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}
        >
          {/* Col 1: Platform Identity */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
              <img
                src="/logo.png"
                alt="BharatFarm Logo"
                style={{ width: '36px', height: '36px', borderRadius: '4px', background: '#FFFFFF', padding: '2px' }}
              />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.01em', color: '#FFFFFF' }}>
                  Bharat<span style={{ color: '#E99A32' }}>Farm</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#CBD5E1', fontWeight: 500 }}>
                  Smart Tools. Stronger Farmers.
                </div>
              </div>
            </div>
            <p style={{ color: '#CBD5E1', lineHeight: 1.6, fontSize: '0.82rem', margin: 0 }}>
              National-scale agricultural digital platform integrating climate risk forecasts, smart mandi prices, group aggregation, and AI advisory for Indian farmers.
            </p>
          </div>

          {/* Col 2: Agricultural Services */}
          <div>
            <h4 style={{ color: '#E99A32', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Farmer Services
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <Link to="/home" style={{ color: '#E2E8F0', textDecoration: 'none', transition: 'color 0.2s' }}>
                  Digital Agriculture Hub
                </Link>
              </li>
              <li>
                <Link to="/sih/climate-risk" style={{ color: '#E2E8F0', textDecoration: 'none' }}>
                  Climate & Disaster Risk
                </Link>
              </li>
              <li>
                <Link to="/sih/smart-mandi" style={{ color: '#E2E8F0', textDecoration: 'none' }}>
                  Smart Mandi & Live Prices
                </Link>
              </li>
              <li>
                <Link to="/sih/smart-mandi?tab=sell" style={{ color: '#E2E8F0', textDecoration: 'none' }}>
                  Group Aggregation Optimizer
                </Link>
              </li>
              <li>
                <Link to="/sih/crop-insurance" style={{ color: '#E2E8F0', textDecoration: 'none' }}>
                  Crop Insurance & Verification
                </Link>
              </li>
              <li>
                <Link to="/sih/sahayak" style={{ color: '#E2E8F0', textDecoration: 'none' }}>
                  Sahayak Voice & WhatsApp AI
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Field Utilities & Resources */}
          <div>
            <h4 style={{ color: '#E99A32', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Everyday Tools
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <Link to="/dashboard" style={{ color: '#E2E8F0', textDecoration: 'none' }}>
                  Farmer Workspace Dashboard
                </Link>
              </li>
              <li>
                <Link to="/scanner" style={{ color: '#E2E8F0', textDecoration: 'none' }}>
                  AI Leaf Health Scanner
                </Link>
              </li>
              <li>
                <Link to="/sih/field-mapping" style={{ color: '#E2E8F0', textDecoration: 'none' }}>
                  GIS Field Boundary Mapping
                </Link>
              </li>
              <li>
                <Link to="/sih/price-risk" style={{ color: '#E2E8F0', textDecoration: 'none' }}>
                  Before You Sow Price Advisory
                </Link>
              </li>
              <li>
                <Link to="/schemes" style={{ color: '#E2E8F0', textDecoration: 'none' }}>
                  Government Schemes Directory
                </Link>
              </li>
              <li>
                <Link to="/demo" style={{ color: '#E2E8F0', textDecoration: 'none' }}>
                  Platform Demonstration Videos
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Public Disclaimers & Transparency */}
          <div>
            <h4 style={{ color: '#E99A32', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Platform Information
            </h4>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.35rem' }}>
                INDEPENDENT INITIATIVE
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', lineHeight: 1.5, margin: 0 }}>
                BharatFarm is an independent digital public good designed following GIGW 3.0 accessibility guidelines. Live mandi data is integrated via government open APIs.
              </p>
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#94A3B8' }}>
              <div>Supported Languages: English, हिन्दी, বাংলা</div>
              <div style={{ marginTop: '0.2rem' }}>PWA Offline & Data-Saver Enabled</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Accessibility Links */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.78rem',
            color: '#94A3B8'
          }}
        >
          <div>
            © {currentYear} BharatFarm Platform. Designed in accordance with Guidelines for Indian Government Websites (GIGW 3.0).
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Hyperlinking Policy</span>
            <span>Accessibility Statement</span>
            <span>Help & Feedback</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
