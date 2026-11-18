import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { useLanguage } from '../../context/LanguageContext.js';

const portalNavSections = [
  {
    category: 'Citizen Farmer Services',
    items: [
      { path: '/home', label: 'National Portal Home', icon: 'account_balance' },
      { path: '/dashboard', label: 'Farmer Workspace', icon: 'dashboard' },
      { path: '/scanner', label: 'AI Leaf Health Scanner', icon: 'biotech' },
      { path: '/crop-roadmap', label: 'Crop Growth Roadmap', icon: 'route' },
      { path: '/schemes', label: 'Govt Schemes Directory', icon: 'policy' }
    ]
  },
  {
    category: 'Market & Risk Intelligence',
    items: [
      { path: '/sih/climate-risk', label: 'Climate & Disaster Risk', icon: 'partly_cloudy_day' },
      { path: '/sih/smart-mandi', label: 'Smart Mandi Real Prices', icon: 'bar_chart' },
      { path: '/sih/crop-insurance', label: 'Crop Insurance Verification', icon: 'verified_user' },
      { path: '/sih/field-mapping', label: 'GIS Field Mapping', icon: 'map' },
      { path: '/sih/sahayak', label: 'Sahayak Multilingual AI', icon: 'chat' }
    ]
  },
  {
    category: 'Operations & Utilities',
    items: [
      { path: '/marketplace', label: 'Inputs Marketplace', icon: 'storefront' },
      { path: '/records', label: 'Farm Log Records', icon: 'description' },
      { path: '/calculator', label: 'Fertilizer Calculator', icon: 'calculate' },
      { path: '/loan-eligibility', label: 'KCC Loan Eligibility', icon: 'credit_card' },
      { path: '/orders', label: 'Orders & Dispatches', icon: 'local_shipping' }
    ]
  }
];

export const Sidebar: React.FC = () => {
  const { user, profileImage, getUserInitials } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <aside
      className="app-sidebar sidebar-surface"
      style={{
        width: '260px',
        padding: '1.25rem 0',
        flexDirection: 'column',
        gap: '0.2rem',
        overflowY: 'auto',
        position: 'sticky',
        top: 0,
        height: '100vh',
        flexShrink: 0,
        background: '#FFFFFF',
        borderRight: '1px solid #DCE2E8'
      }}
    >
      {/* Institutional Emblem Section */}
      <div style={{ padding: '0 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <img
          src="/logo.png"
          alt="BharatFarm"
          style={{ width: '38px', height: '38px', borderRadius: '4px', objectFit: 'contain', flexShrink: 0 }}
        />
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#12345A', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Bharat<span style={{ color: '#168447' }}>Farm</span>
          </h1>
          <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            PUBLIC INFRASTRUCTURE
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav style={{ flex: 1, padding: '0 0.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {portalNavSections.map((sec, sIdx) => (
          <div key={sIdx}>
            <div style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              color: '#12345A',
              padding: '0.2rem 0.5rem 0.4rem 0.5rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              borderBottom: '1px solid #F1F5F9',
              marginBottom: '0.35rem'
            }}>
              {sec.category}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              {sec.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard' || item.path === '/home'}
                  className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                  </div>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Profile Strip */}
      <div style={{ padding: '0 1rem', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid #DCE2E8' }}>
        <NavLink
          to="/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.5rem',
            borderRadius: '6px',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            textDecoration: 'none'
          }}
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt="Farmer Profile"
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#12345A',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 800
              }}
            >
              {getUserInitials()}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#172B45', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.fullName || 'Registered Farmer'}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
              {user?.district ? `${user.district}, ${user.state}` : 'Farmer Citizen Account'}
            </span>
          </div>
        </NavLink>
      </div>
    </aside>
  );
};
