import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { useAuth } from '../../context/AuthContext.js';
import { FEATURE_IMAGES } from '../../constants/featureImages.js';

export const MasterDashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Top Welcome Header Bar */}
      <div
        className="card-3d"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(15, 56, 34, 0.95) 0%, rgba(20, 83, 45, 0.9) 100%)',
          color: '#FFFFFF'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <span className="badge badge-primary">Sync Status: Live</span>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.8)' }}>• Real-time AI connected</span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Namaste, {user?.fullName || 'Ramesh Patel'} 👋
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.85rem', marginTop: '0.15rem' }}>
            Smart agricultural companion & AI crop health advisor for {user?.state || 'Punjab'}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/scanner">
            <Button variant="primary" size="md">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>biotech</span> Leaf Scanner
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid Row 1: Key Telemetry Cards */}
      <div className="mobile-grid-2">
        <div className="card-3d" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>PLANTED AREA</span>
              <span className="material-symbols-outlined" style={{ color: 'var(--emerald-primary)', fontSize: '20px' }}>agriculture</span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--dark-text)', margin: '0.4rem 0 0.15rem 0' }}>
              5.0 <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Acres</span>
            </h2>
          </div>
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(34,37,31,0.08)', marginTop: '0.5rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Crop: <strong style={{ color: 'var(--dark-text)' }}>Wheat (Rabi Season)</strong>
            </p>
          </div>
        </div>

        <div className="card-3d" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CROP CANOPY HEALTH</span>
              <span className="badge badge-success">Good (0.78)</span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--dark-text)', margin: '0.4rem 0 0.15rem 0' }}>
              Optimal <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>NDVI</span>
            </h2>
          </div>
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(34,37,31,0.08)', marginTop: '0.5rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Chlorophyll Index: <strong style={{ color: 'var(--emerald-primary)' }}>Normal</strong>
            </p>
          </div>
        </div>

        <div className="card-3d" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>SOIL MOISTURE</span>
              <span className="badge badge-warning">Moderate</span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--dark-text)', margin: '0.4rem 0 0.15rem 0' }}>
              52% <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>Root Zone</span>
            </h2>
          </div>
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(34,37,31,0.08)', marginTop: '0.5rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Irrigation: <strong style={{ color: 'var(--dark-text)' }}>Late Afternoon</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Grid Row 2: Agricultural Feature Hub (Image-backed Cards) */}
      <Card title="Farmer Companion Services" subtitle="Tap any tool to open interactive smart advisory.">
        <div className="mobile-grid-2" style={{ marginTop: '0.5rem' }}>
          {/* 1. KrishiBot AI */}
          <Link to="/scanner" className="card-feature-backed">
            <img src={FEATURE_IMAGES.krishibot.url} alt="KrishiBot" className="card-feature-bg" />
            <div className="card-feature-overlay" />
            <div className="card-feature-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-primary">AI Powered</span>
                <div className="card-feature-action">→</div>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.5rem' }}>KrishiBot AI</h3>
              <p style={{ fontSize: '0.75rem', opacity: 0.9, lineHeight: 1.3 }}>
                Voice & text farming advisor in regional languages.
              </p>
            </div>
          </Link>

          {/* 2. Leaf Scanner */}
          <Link to="/scanner" className="card-feature-backed">
            <img src={FEATURE_IMAGES.scanner.url} alt="Leaf Scanner" className="card-feature-bg" />
            <div className="card-feature-overlay" />
            <div className="card-feature-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-success">Vision Diagnosis</span>
                <div className="card-feature-action">→</div>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.5rem' }}>Leaf Scanner</h3>
              <p style={{ fontSize: '0.75rem', opacity: 0.9, lineHeight: 1.3 }}>
                Snap crop leaves for instant pest & disease treatment.
              </p>
            </div>
          </Link>

          {/* 3. Mandi Market */}
          <Link to="/marketplace" className="card-feature-backed">
            <img src={FEATURE_IMAGES.marketplace.url} alt="Marketplace" className="card-feature-bg" />
            <div className="card-feature-overlay" />
            <div className="card-feature-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-primary">Mandi Rates</span>
                <div className="card-feature-action">→</div>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.5rem' }}>Mandi Marketplace</h3>
              <p style={{ fontSize: '0.75rem', opacity: 0.9, lineHeight: 1.3 }}>
                Live crop prices & buy quality farming inputs.
              </p>
            </div>
          </Link>

          {/* 4. Weather AI */}
          <Link to="/weather" className="card-feature-backed">
            <img src={FEATURE_IMAGES.weather.url} alt="Weather AI" className="card-feature-bg" />
            <div className="card-feature-overlay" />
            <div className="card-feature-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-primary">7-Day Forecast</span>
                <div className="card-feature-action">→</div>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.5rem' }}>Weather AI</h3>
              <p style={{ fontSize: '0.75rem', opacity: 0.9, lineHeight: 1.3 }}>
                Hyperlocal rainfall alerts & irrigation schedules.
              </p>
            </div>
          </Link>

          {/* 5. Group Buying */}
          <Link to="/groupbuying" className="card-feature-backed">
            <img src={FEATURE_IMAGES.groupbuying.url} alt="Group Buying" className="card-feature-bg" />
            <div className="card-feature-overlay" />
            <div className="card-feature-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-success">Save up to 30%</span>
                <div className="card-feature-action">→</div>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.5rem' }}>Group Buying</h3>
              <p style={{ fontSize: '0.75rem', opacity: 0.9, lineHeight: 1.3 }}>
                Pool fertilizer & seed orders with neighborhood farmers.
              </p>
            </div>
          </Link>

          {/* 6. Government Schemes */}
          <Link to="/schemes" className="card-feature-backed">
            <img src={FEATURE_IMAGES.schemes.url} alt="Government Schemes" className="card-feature-bg" />
            <div className="card-feature-overlay" />
            <div className="card-feature-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-primary">Subsidies</span>
                <div className="card-feature-action">→</div>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.5rem' }}>Govt Schemes</h3>
              <p style={{ fontSize: '0.75rem', opacity: 0.9, lineHeight: 1.3 }}>
                Check PM-KISAN, soil health card & subsidy eligibility.
              </p>
            </div>
          </Link>
        </div>
      </Card>

      {/* Grid Row 3: Action Companion & Weather Intelligence */}
      <div className="grid-dashboard">
        {/* Left Column (Span 8): Crop Health Panel */}
        <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Card title="Crop Health & Pest Advisories" subtitle="Field telemetry & real-time risk alerts.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0.9rem', background: '#FFFDF5', border: '1px solid #FCD34D', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="material-symbols-outlined" style={{ color: '#D97706', fontSize: '20px' }}>warning</span>
                  <div>
                    <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--dark-text)' }}>Wheat Blight Alert</h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Block B (5.0 Acres) • Moderate Risk</p>
                  </div>
                </div>
                <Link to="/scanner">
                  <Button variant="outline" size="sm">Inspect</Button>
                </Link>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0.9rem', background: 'rgba(215, 242, 26, 0.15)', border: '1px solid var(--emerald-primary)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--emerald-dark)', fontSize: '20px' }}>check_circle</span>
                  <div>
                    <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--dark-text)' }}>Nitrogen Balance Optimal</h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Block A (Paddy) • Next Fert: 12 Days</p>
                  </div>
                </div>
                <span className="badge badge-success">Healthy</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (Span 4): Weather Advisory Panel */}
        <div className="col-span-4">
          <Card title="Today's Weather Intelligence">
            <div style={{ marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(34,37,31,0.08)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--emerald-dark)' }}>partly_cloudy_day</span>
                <div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark-text)' }}>32°C</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ludhiana, Punjab • Partly Cloudy</p>
                </div>
              </div>

              <div style={{ padding: '0.75rem', background: '#FFFDF5', border: '1px solid #FCD34D', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontSize: '0.8rem', color: '#92400E', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span> Advisory
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--dark-text)', marginTop: '0.25rem', lineHeight: '1.35' }}>
                  Skip overhead sprinkler irrigation today due to expected late evening showers.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ padding: '0.5rem', background: 'var(--card-gray)', borderRadius: '10px' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem' }}>Wind Speed</span>
                  <strong style={{ color: 'var(--dark-text)', fontSize: '0.88rem' }}>14 km/h</strong>
                </div>
                <div style={{ padding: '0.5rem', background: 'var(--card-gray)', borderRadius: '10px' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem' }}>Humidity</span>
                  <strong style={{ color: 'var(--dark-text)', fontSize: '0.88rem' }}>65%</strong>
                </div>
                <div style={{ padding: '0.5rem', background: 'var(--card-gray)', borderRadius: '10px' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem' }}>Rain Chance</span>
                  <strong style={{ color: 'var(--dark-text)', fontSize: '0.88rem' }}>20%</strong>
                </div>
                <div style={{ padding: '0.5rem', background: 'var(--card-gray)', borderRadius: '10px' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem' }}>UV Index</span>
                  <strong style={{ color: 'var(--dark-text)', fontSize: '0.88rem' }}>5 (Mod)</strong>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};


