import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { useAuth } from '../../context/AuthContext.js';

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
          background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(243,243,241,0.95) 100%)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <span className="badge badge-primary">Sync Status: Live</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>• Last updated just now</span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark-text)', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.fullName || 'Ramesh Patel'} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>
            Real-time farm intelligence & advisory for {user?.state || 'Punjab'}.
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

      {/* Grid Row 1: Metrics Banner Cards (Mobile: 2-column compact grid) */}
      <div className="mobile-grid-2">
        <div className="card-3d" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>PLANTED AREA</span>
              <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)', fontSize: '20px' }}>agriculture</span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--dark-text)', margin: '0.4rem 0 0.15rem 0' }}>
              5.0 <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Acres</span>
            </h2>
          </div>
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(34,37,31,0.08)', marginTop: '0.5rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Crop: <strong style={{ color: 'var(--dark-text)' }}>Wheat (Rabi)</strong>
            </p>
          </div>
        </div>

        <div className="card-3d" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>NDVI HEALTH</span>
              <span className="badge badge-primary">Good</span>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--dark-text)', margin: '0.4rem 0 0.15rem 0' }}>
              0.78 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ 1.0</span>
            </h2>
          </div>
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(34,37,31,0.08)', marginTop: '0.5rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Canopy density: <strong style={{ color: 'var(--dark-text)' }}>Healthy</strong>
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
              52% <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>Humidity</span>
            </h2>
          </div>
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(34,37,31,0.08)', marginTop: '0.5rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Irrigation: <strong style={{ color: 'var(--dark-text)' }}>Late Afternoon</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Grid Row 2: Action Companion & Weather Intelligence */}
      <div className="grid-dashboard">
        {/* Left Column (Span 8): Quick Actions + Crop Health Panel */}
        <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Card title="Smart Action Companion" subtitle="Instant access to AI farming tools & decision engines.">
            <div className="mobile-grid-2" style={{ marginTop: '0.5rem' }}>
              <Link to="/scanner" style={{ textDecoration: 'none' }}>
                <div
                  className="card-3d"
                  style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAF8 100%)',
                    height: '100%'
                  }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--signal-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--dark-text)', fontSize: '20px' }}>biotech</span>
                  </div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginTop: '0.6rem', color: 'var(--dark-text)' }}>Leaf Scanner</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: '1.3' }}>
                    Instant AI diagnosis & treatment dosage.
                  </p>
                </div>
              </Link>

              <Link to="/weather" style={{ textDecoration: 'none' }}>
                <div
                  className="card-3d"
                  style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAF8 100%)',
                    height: '100%'
                  }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ color: '#0284C7', fontSize: '20px' }}>water_drop</span>
                  </div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginTop: '0.6rem', color: 'var(--dark-text)' }}>Weather AI</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: '1.3' }}>
                    7-day forecast & irrigation advisories.
                  </p>
                </div>
              </Link>

              <Link to="/marketplace" style={{ textDecoration: 'none' }}>
                <div
                  className="card-3d"
                  style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAF8 100%)',
                    height: '100%'
                  }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined" style={{ color: '#D97706', fontSize: '20px' }}>storefront</span>
                  </div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginTop: '0.6rem', color: 'var(--dark-text)' }}>Mandi Market</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: '1.3' }}>
                    Buy inputs & sell produce directly.
                  </p>
                </div>
              </Link>
            </div>
          </Card>

          {/* Crop Health Panel */}
          <Card title="Crop Health Monitoring" subtitle="Field telemetry & pest risk alerts.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0.9rem', background: '#FFFDF5', border: '1px solid #FCD34D', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="material-symbols-outlined" style={{ color: '#D97706', fontSize: '20px' }}>warning</span>
                  <div>
                    <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--dark-text)' }}>Blight Alert</h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Block B (Wheat)</p>
                  </div>
                </div>
                <Link to="/scanner">
                  <Button variant="outline" size="sm">Inspect</Button>
                </Link>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0.9rem', background: 'rgba(215, 242, 26, 0.1)', border: '1px solid var(--signal-lime)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--dark-text)', fontSize: '20px' }}>check_circle</span>
                  <div>
                    <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--dark-text)' }}>Nitrogen Balance</h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Block A (Paddy)</p>
                  </div>
                </div>
                <span className="badge badge-primary">Healthy</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (Span 4): Weather Advisory Panel */}
        <div className="col-span-4">
          <Card title="Today's Weather Intelligence">
            <div style={{ marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(34,37,31,0.08)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--dark-text)' }}>partly_cloudy_day</span>
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

