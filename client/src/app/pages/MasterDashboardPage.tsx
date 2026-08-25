import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { useAuth } from '../../context/AuthContext.js';

export const MasterDashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Top Welcome Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.5rem',
        background: '#FFFFFF',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-primary">Sync Status: All data up to date</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>• Last synced 2 mins ago</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Welcome back, {user?.fullName || 'Ramesh Patel'} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Here's what's happening in your farm today ({user?.state || 'Punjab'}).
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/scanner">
            <Button variant="primary" size="md">
              <span style={{ fontSize: '1.1rem' }}>🍃</span> Leaf Scanner
            </Button>
          </Link>
          <Link to="/krishibot">
            <Button variant="secondary" size="md">
              <span style={{ fontSize: '1.1rem' }}>🤖</span> Ask KrishiBot
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid Row 1: Metrics Banner Cards */}
      <div className="grid-dashboard">
        <div className="col-span-4">
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>PLANTED AREA</span>
                <span style={{ fontSize: '1.25rem' }}>🌾</span>
              </div>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary)', margin: '0.5rem 0 0.25rem 0' }}>
                5.0 <span style={{ fontSize: '1rem', fontWeight: 600 }}>Acres</span>
              </h2>
            </div>
            <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', marginTop: '0.75rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Crop: <strong style={{ color: 'var(--text-main)' }}>Wheat (Rabi)</strong> • Stage: <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Vegetative</span>
              </p>
            </div>
          </Card>
        </div>

        <div className="col-span-4">
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>NDVI HEALTH INDEX</span>
                <span className="badge badge-primary">Good</span>
              </div>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#166534', margin: '0.5rem 0 0.25rem 0' }}>
                0.78 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ 1.0</span>
              </h2>
            </div>
            <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', marginTop: '0.75rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Satellite vegetation index shows overall healthy canopy density.
              </p>
            </div>
          </Card>
        </div>

        <div className="col-span-4">
          <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>SOIL MOISTURE</span>
                <span className="badge badge-warning">Moderate</span>
              </div>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent-amber)', margin: '0.5rem 0 0.25rem 0' }}>
                52% <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Humidity</span>
              </h2>
            </div>
            <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', marginTop: '0.75rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Optimal condition for planned fertigation in late afternoon.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Grid Row 2: Action Companion, Crop Health Panel & Weather Intelligence */}
      <div className="grid-dashboard">
        {/* Left Column (Span 8): Quick Actions + Crop Issues Panel */}
        <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="Quick Action Companion" subtitle="Instant access to smart farming intelligence and decision engines.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
              <Link to="/scanner" style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '1.25rem',
                  background: 'var(--bg-card-hover)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-color)',
                  transition: 'var(--transition)',
                  height: '100%'
                }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#E6F4EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    🧪
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '0.75rem', color: 'var(--text-main)' }}>What to Spray?</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: '1.4' }}>
                    Scan crop leaves to detect diseases early and calculate dosage.
                  </p>
                </div>
              </Link>

              <Link to="/weather" style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '1.25rem',
                  background: 'var(--bg-card-hover)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-color)',
                  transition: 'var(--transition)',
                  height: '100%'
                }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    💧
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '0.75rem', color: 'var(--text-main)' }}>When to Irrigate?</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: '1.4' }}>
                    Real-time precipitation alerts and crop water stress advisories.
                  </p>
                </div>
              </Link>

              <Link to="/marketplace" style={{ textDecoration: 'none' }}>
                <div style={{
                  padding: '1.25rem',
                  background: 'var(--bg-card-hover)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-color)',
                  transition: 'var(--transition)',
                  height: '100%'
                }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    🌾
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '0.75rem', color: 'var(--text-main)' }}>Where to Sell?</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: '1.4' }}>
                    Access direct farm-gate buyers and check live Mandi crop prices.
                  </p>
                </div>
              </Link>
            </div>
          </Card>

          {/* Crop Health & Issues Panel matching Stitch */}
          <Card title="Crop Health Monitoring" subtitle="Recent field telemetry and potential risk assessments.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: '#FFFDF5', border: '1px solid #FCD34D', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🍂</span>
                  <div>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>Leaf Blight Risk (Low)</h5>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Block B (Wheat) • Detected 1 day ago</p>
                  </div>
                </div>
                <Link to="/scanner">
                  <Button variant="outline" size="sm">Inspect Scan</Button>
                </Link>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: '#F0FDF4', border: '1px solid #B8E1C4', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🌱</span>
                  <div>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>Nitrogen Balance Optimal</h5>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Block A (Paddy) • Recommended top dressing scheduled</p>
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
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '3rem' }}>🌤️</span>
                <div>
                  <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>32°C</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ludhiana, Punjab • Partly Cloudy</p>
                </div>
              </div>

              <div style={{ padding: '0.85rem', background: '#FFFDF5', border: '1px solid #FCD34D', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ fontSize: '0.85rem', color: '#92400E', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>⚠️</span> Advisory Recommendation
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '0.35rem', lineHeight: '1.4' }}>
                  Skip overhead sprinkler irrigation today. Light rainfall probability expected in late evening.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <div style={{ padding: '0.6rem', background: 'var(--bg-main)', borderRadius: '6px' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem' }}>Wind Speed</span>
                  <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>14 km/h</strong>
                </div>
                <div style={{ padding: '0.6rem', background: 'var(--bg-main)', borderRadius: '6px' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem' }}>Humidity</span>
                  <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>65%</strong>
                </div>
                <div style={{ padding: '0.6rem', background: 'var(--bg-main)', borderRadius: '6px' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem' }}>Rain Chance</span>
                  <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>20%</strong>
                </div>
                <div style={{ padding: '0.6rem', background: 'var(--bg-main)', borderRadius: '6px' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem' }}>UV Index</span>
                  <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>Moderate (5)</strong>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
