import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { useAuth } from '../../context/AuthContext.js';

export const MasterDashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Welcome & Sync Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Sync Status: All data up to date</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Welcome back, {user?.fullName || 'Ramesh Patel'} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Here's what's happening in your farm today ({user?.state || 'Punjab'}).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/scanner">
            <Button variant="primary">🍃 Scan Crop Leaf</Button>
          </Link>
          <Link to="/krishibot">
            <Button variant="secondary">🤖 Ask KrishiBot</Button>
          </Link>
        </div>
      </div>

      {/* Grid Row 1: Farm Metrics */}
      <div className="grid-dashboard">
        <div className="col-span-4">
          <Card>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Planted Area</p>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', margin: '0.25rem 0' }}>5.0 <span style={{ fontSize: '1rem' }}>Acres</span></h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Crop: <strong style={{ color: 'var(--text-main)' }}>Wheat (Rabi)</strong> • Stage: Vegetative</p>
          </Card>
        </div>

        <div className="col-span-4">
          <Card>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>NDVI Health Score</p>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981', margin: '0.25rem 0' }}>0.78 <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>Good</span></h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Satellite vegetation index looks healthy</p>
          </Card>
        </div>

        <div className="col-span-4">
          <Card>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Soil Moisture / Humidity</p>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)', margin: '0.25rem 0' }}>52% <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>Moderate</span></h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Optimal condition for scheduled fertigation</p>
          </Card>
        </div>
      </div>

      {/* Grid Row 2: Action Modules & Weather Advisory */}
      <div className="grid-dashboard">
        <div className="col-span-8">
          <Card title="Quick Action Companion">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <Link to="/scanner" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '1.25rem', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', height: '100%' }}>
                  <span style={{ fontSize: '1.75rem' }}>🧪</span>
                  <h4 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: 'var(--text-main)' }}>What to Spray?</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Scan leaf images for instant disease detection and fungicide dosage.
                  </p>
                </div>
              </Link>

              <Link to="/weather" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '1.25rem', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', height: '100%' }}>
                  <span style={{ fontSize: '1.75rem' }}>💧</span>
                  <h4 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: 'var(--text-main)' }}>When to Irrigate?</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Check real-time rain probability and moisture advisories.
                  </p>
                </div>
              </Link>

              <Link to="/marketplace" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '1.25rem', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', height: '100%' }}>
                  <span style={{ fontSize: '1.75rem' }}>🌾</span>
                  <h4 style={{ fontSize: '1.1rem', marginTop: '0.5rem', color: 'var(--text-main)' }}>Where to Sell?</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Connect direct with buyers and check local Mandi prices.
                  </p>
                </div>
              </Link>
            </div>
          </Card>
        </div>

        <div className="col-span-4">
          <Card title="Today's Weather Advisory">
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '2.5rem' }}>🌤️</span>
                <div>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>32°C</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ludhiana, Punjab • Partly Cloudy</p>
                </div>
              </div>

              <div style={{ padding: '0.75rem', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>Recommendation:</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  Skip overhead irrigation today. Rain expected in 6 hours.
                </p>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Wind: 14 km/h</span>
                <span>Humidity: 65%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
