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
      <div className="page-header-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <span className="badge badge-primary">Sync Status: Live</span>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.85)' }}>• Real-time AI connected</span>
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

      {/* Mobile-Only Prominent Sahayak Card */}
      <div className="mobile-only-sahayak" style={{ marginTop: '0.25rem' }}>
        <Link to="/sahayak" className="card-feature-backed" style={{ minHeight: '140px', display: 'block' }}>
          <img src={FEATURE_IMAGES.sahayak.url} alt="Sahayak Assistance" className="card-feature-bg" />
          <div className="card-feature-overlay" style={{ background: 'linear-gradient(135deg, rgba(8, 30, 15, 0.85) 0%, rgba(5, 18, 8, 0.95) 100%)' }} />
          <div className="card-feature-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-primary" style={{ background: 'var(--signal-lime)', color: 'var(--text-on-lime)', fontWeight: 800 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', marginRight: '4px', verticalAlign: 'middle' }}>verified</span>
                  SAHAYAK ASSISTANCE
                </span>
                <div className="card-feature-action">→</div>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.4rem', color: '#FFFFFF' }}>Need help using BharatFarm?</h3>
              <p style={{ fontSize: '0.78rem', opacity: 0.92, lineHeight: 1.3, color: '#FFFFFF', marginTop: '0.2rem' }}>
                Connect with a verified local helper who can assist you with the app.
              </p>
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--signal-lime)', fontWeight: 700 }}>Get Assistance</span>
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>• Learn how it works</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Grid Row 1: Key Telemetry Cards + Desktop Sahayak Compact Card */}
      <div className="telemetry-grid">
        <div className="card-3d" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>PLANTED AREA</span>
              <span className="material-symbols-outlined" style={{ color: 'var(--emerald-primary)', fontSize: '20px' }}>agriculture</span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.4rem 0 0.15rem 0' }}>
              5.0 <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Acres</span>
            </h2>
          </div>
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', marginTop: '0.5rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Crop: <strong style={{ color: 'var(--text-primary)' }}>Wheat (Rabi Season)</strong>
            </p>
          </div>
        </div>

        <div className="card-3d" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>CROP CANOPY HEALTH</span>
              <span className="badge badge-success">Good (0.78)</span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.4rem 0 0.15rem 0' }}>
              Optimal <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>NDVI</span>
            </h2>
          </div>
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', marginTop: '0.5rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--emerald-primary)' }}>
              Chlorophyll Index: <strong>Normal</strong>
            </p>
          </div>
        </div>

        <div className="card-3d" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>SOIL MOISTURE</span>
              <span className="badge badge-warning">Moderate</span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.4rem 0 0.15rem 0' }}>
              52% <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>Root Zone</span>
            </h2>
          </div>
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', marginTop: '0.5rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Irrigation: <strong style={{ color: 'var(--text-primary)' }}>Late Afternoon</strong>
            </p>
          </div>
        </div>

        {/* Desktop-Only Compact Sahayak Card */}
        <div className="desktop-only-sahayak">
          <Link to="/sahayak" className="card-feature-backed" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <img src={FEATURE_IMAGES.sahayak.url} alt="Sahayak" className="card-feature-bg" />
            <div className="card-feature-overlay" style={{ background: 'linear-gradient(135deg, rgba(8, 30, 15, 0.88) 0%, rgba(5, 18, 8, 0.96) 100%)' }} />
            <div className="card-feature-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-primary" style={{ background: 'var(--signal-lime)', color: 'var(--text-on-lime)', fontWeight: 700, fontSize: '0.68rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '13px', marginRight: '3px', verticalAlign: 'middle' }}>verified</span>
                    VERIFIED SAHAYAK
                  </span>
                  <div className="card-feature-action" style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}>→</div>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.4rem', color: '#FFFFFF' }}>Sahayak</h3>
                <p style={{ fontSize: '0.76rem', opacity: 0.92, lineHeight: 1.3, color: '#FFFFFF', marginTop: '0.25rem' }}>
                  Need help using BharatFarm? Get assistance from a verified local Sahayak for digital farming services.
                </p>
              </div>
              <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--signal-lime)' }}>Get Assistance</span>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>How it works</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Grid Row 2: Agricultural Feature Hub — 2-Column on Mobile, 2-Column on Desktop */}
      <Card title="Farmer Companion Services" subtitle="Tap any tool to open interactive smart advisory.">
        <div className="mobile-feature-grid" style={{ marginTop: '0.75rem' }}>
          {/* Card 1 — KrishiBot AI */}
          <Link to="/krishibot" className="card-feature-backed" style={{ minHeight: '180px' }}>
            <img src={FEATURE_IMAGES.krishibot.url} alt="KrishiBot AI" className="card-feature-bg" />
            <div className="card-feature-overlay" />
            <div className="card-feature-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-primary">AI POWERED</span>
                <div className="card-feature-action">→</div>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.5rem', color: '#FFFFFF' }}>KrishiBot AI</h3>
              <p style={{ fontSize: '0.82rem', opacity: 0.92, lineHeight: 1.35, color: '#FFFFFF' }}>
                Voice & text farming advisor in regional languages.
              </p>
            </div>
          </Link>

          {/* Card 2 — Leaf Scanner */}
          <Link to="/scanner" className="card-feature-backed" style={{ minHeight: '180px' }}>
            <img src={FEATURE_IMAGES.scanner.url} alt="Leaf Scanner" className="card-feature-bg" />
            <div className="card-feature-overlay" />
            <div className="card-feature-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-success">VISION DIAGNOSIS</span>
                <div className="card-feature-action">→</div>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.5rem', color: '#FFFFFF' }}>Leaf Scanner</h3>
              <p style={{ fontSize: '0.82rem', opacity: 0.92, lineHeight: 1.35, color: '#FFFFFF' }}>
                Snap crop leaves for instant pest & disease treatment.
              </p>
            </div>
          </Link>

          {/* Card 3 — Mandi Marketplace */}
          <Link to="/marketplace" className="card-feature-backed" style={{ minHeight: '180px' }}>
            <img src={FEATURE_IMAGES.marketplace.url} alt="Mandi Marketplace" className="card-feature-bg" />
            <div className="card-feature-overlay" />
            <div className="card-feature-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-primary">MANDI RATES</span>
                <div className="card-feature-action">→</div>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.5rem', color: '#FFFFFF' }}>Mandi Marketplace</h3>
              <p style={{ fontSize: '0.82rem', opacity: 0.92, lineHeight: 1.35, color: '#FFFFFF' }}>
                Live crop prices & buy quality farming inputs.
              </p>
            </div>
          </Link>

          {/* Card 4 — Weather AI */}
          <Link to="/weather" className="card-feature-backed" style={{ minHeight: '180px' }}>
            <img src={FEATURE_IMAGES.weather.url} alt="Weather AI" className="card-feature-bg" />
            <div className="card-feature-overlay" />
            <div className="card-feature-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-primary">7-DAY FORECAST</span>
                <div className="card-feature-action">→</div>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.5rem', color: '#FFFFFF' }}>Weather AI</h3>
              <p style={{ fontSize: '0.82rem', opacity: 0.92, lineHeight: 1.35, color: '#FFFFFF' }}>
                Hyperlocal rainfall alerts & irrigation schedules.
              </p>
            </div>
          </Link>

          {/* Card 5 — Group Buying */}
          <Link to="/groupbuying" className="card-feature-backed" style={{ minHeight: '180px' }}>
            <img src={FEATURE_IMAGES.groupbuying.url} alt="Group Buying" className="card-feature-bg" />
            <div className="card-feature-overlay" />
            <div className="card-feature-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-success">SAVE UP TO 30%</span>
                <div className="card-feature-action">→</div>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.5rem', color: '#FFFFFF' }}>Group Buying</h3>
              <p style={{ fontSize: '0.82rem', opacity: 0.92, lineHeight: 1.35, color: '#FFFFFF' }}>
                Pool fertilizer & seed orders with neighborhood farmers.
              </p>
            </div>
          </Link>

          {/* Card 6 — Government Schemes */}
          <Link to="/schemes" className="card-feature-backed" style={{ minHeight: '180px' }}>
            <img src={FEATURE_IMAGES.schemes.url} alt="Government Schemes" className="card-feature-bg" />
            <div className="card-feature-overlay" />
            <div className="card-feature-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-primary">SUBSIDIES</span>
                <div className="card-feature-action">→</div>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.5rem', color: '#FFFFFF' }}>Govt Schemes</h3>
              <p style={{ fontSize: '0.82rem', opacity: 0.92, lineHeight: 1.35, color: '#FFFFFF' }}>
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
              <div className="alert-warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>warning</span>
                  <div>
                    <h5 style={{ fontSize: '0.88rem', fontWeight: 700 }}>Wheat Blight Alert</h5>
                    <p style={{ fontSize: '0.75rem', opacity: 0.85 }}>Block B (5.0 Acres) • Moderate Risk</p>
                  </div>
                </div>
                <Link to="/scanner">
                  <Button variant="outline" size="sm">Inspect</Button>
                </Link>
              </div>

              <div className="alert-success" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
                  <div>
                    <h5 style={{ fontSize: '0.88rem', fontWeight: 700 }}>Nitrogen Balance Optimal</h5>
                    <p style={{ fontSize: '0.75rem', opacity: 0.85 }}>Block A (Paddy) • Next Fert: 12 Days</p>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--emerald-primary)' }}>partly_cloudy_day</span>
                <div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>32°C</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ludhiana, Punjab • Partly Cloudy</p>
                </div>
              </div>

              <div className="alert-warning">
                <p style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span> Advisory
                </p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', lineHeight: '1.35' }}>
                  Skip overhead sprinkler irrigation today due to expected late evening showers.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div className="inset-stat">
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Wind Speed</span>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>14 km/h</strong>
                </div>
                <div className="inset-stat">
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Humidity</span>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>65%</strong>
                </div>
                <div className="inset-stat">
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rain Chance</span>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>20%</strong>
                </div>
                <div className="inset-stat">
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>UV Index</span>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>5 (Mod)</strong>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
