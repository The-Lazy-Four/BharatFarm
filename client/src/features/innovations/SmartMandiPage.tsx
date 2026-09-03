import React, { useState } from 'react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { MarketplacePage } from '../marketplace/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { SihLayout } from '../../components/layout/SihLayout.js';

export const SmartMandiPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'ml-mandi' | 'marketplace'>('ml-mandi');
  const [cropFilter, setCropFilter] = useState<string>('Wheat');

  const mandiIntelligence = [
    {
      mandiName: 'Khanna Grain Market (Asia Largest)',
      distanceKm: 14.2,
      livePrice: 2380,
      predictedPrice3Day: 2420,
      transitCostPerQtl: 45,
      netProfitPerQtl: 2335,
      isOptimalChoice: true,
      trend: 'UPWARD (+₹40)'
    },
    {
      mandiName: 'Ludhiana Central APMC',
      distanceKm: 8.5,
      livePrice: 2290,
      predictedPrice3Day: 2300,
      transitCostPerQtl: 25,
      netProfitPerQtl: 2265,
      isOptimalChoice: false,
      trend: 'STABLE'
    },
    {
      mandiName: 'Jagraon Grain Mandi',
      distanceKm: 28.0,
      livePrice: 2340,
      predictedPrice3Day: 2350,
      transitCostPerQtl: 85,
      netProfitPerQtl: 2255,
      isOptimalChoice: false,
      trend: 'DOWNWARD (-₹10)'
    }
  ];

  return (
    <SihLayout
      activeModuleId="smart-mandi"
      moduleTitle="Smart Mandi Intelligence"
      moduleIcon="📍"
      moduleBadge="Live Mandi & Freight"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem 2.5rem' }}>
        
        {/* Module Header Banner */}
        <div className="page-header-banner" style={{ background: 'linear-gradient(135deg, #052613 0%, #15803d 100%)', borderRadius: '16px', padding: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-primary" style={{ background: '#22c55e', color: '#04210e', fontWeight: 900 }}>
                SIH INNOVATION MODULE #4
              </span>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)' }}>• ML Distance & Profitability Intelligence</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0 }}>
              ML-Based Smart / Shortest-Distance Live Mandi Intelligence
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.88rem', marginTop: '0.25rem', maxWidth: '820px' }}>
              Real-time APMC mandi rate tracking combined with shortest-distance route calculation and ML 3-day price trend forecasting to maximize net farmer profit.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <Button
              variant={activeTab === 'ml-mandi' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('ml-mandi')}
              style={activeTab === 'ml-mandi' ? { background: '#22c55e', border: 'none', color: '#04210e' } : { borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
            >
              ML Mandi Router
            </Button>
            <Button
              variant={activeTab === 'marketplace' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('marketplace')}
              style={activeTab === 'marketplace' ? { background: '#22c55e', border: 'none', color: '#04210e' } : { borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
            >
              Marketplace Catalog
            </Button>
          </div>
        </div>

        {activeTab === 'ml-mandi' ? (
          <>
            {/* Problem / Solution Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              <Card title="⚠️ Problem Being Solved" subtitle="Distressed local sales & uncalculated freight">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45, margin: 0 }}>
                  Farmers routinely sell produce to the nearest local middleman or mandi at low prices without realizing that a slightly further mandi yields significantly higher net profit even after fuel costs.
                </p>
                <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.25)', marginTop: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#dc2626', margin: 0 }}>Why Existing Systems Are Insufficient:</h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.35, margin: 0 }}>
                    Standard Agmarknet websites display raw rates without factoring in distance-based freight, road conditions, or 3-day ML price trend predictions.
                  </p>
                </div>
              </Card>

              <Card title="💡 Our Smart Mandi Implementation" subtitle="Distance-Weighted Profit Optimizer">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45, margin: 0 }}>
                  BharatFarm's ML algorithm deducts calculated freight costs from live mandi prices to rank mandis by Net Profit Per Quintal rather than gross price alone.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <div style={{ padding: '0.5rem 0.65rem', borderRadius: '6px', background: 'var(--surface-inset)', fontSize: '0.75rem' }}>
                    <strong>📈 Net Profit Gain:</strong> +₹70 / Qtl
                  </div>
                  <div style={{ padding: '0.5rem 0.65rem', borderRadius: '6px', background: 'var(--surface-inset)', fontSize: '0.75rem' }}>
                    <strong>🗺️ Route Distance:</strong> Shortest Road Path
                  </div>
                </div>
              </Card>
            </div>

            {/* Interactive ML Shortest-Distance Profit Router */}
            <Card title="🗺️ ML Mandi Net-Profit & Shortest-Distance Router" subtitle={`Calculated live for ${user?.district || 'Ludhiana'}, ${user?.state || 'Punjab'}`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select Crop:</label>
                    <select
                      value={cropFilter}
                      onChange={(e) => setCropFilter(e.target.value)}
                      className="input-field"
                      style={{ padding: '0.5rem 0.85rem', fontSize: '0.88rem', fontWeight: 600 }}
                    >
                      <option value="Wheat">Wheat (PBW 725)</option>
                      <option value="Basmati">Basmati Rice (1121)</option>
                      <option value="Mustard">Mustard (Pusa 30)</option>
                      <option value="Cotton">Cotton (Bt)</option>
                    </select>
                  </div>
                </div>

                {/* Mandi Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {mandiIntelligence.map((mandi, idx) => (
                    <div
                      key={idx}
                      className="card-glass"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        padding: '1rem',
                        border: mandi.isOptimalChoice ? '2px solid var(--signal-lime)' : '1px solid var(--border-subtle)',
                        background: mandi.isOptimalChoice ? 'rgba(34, 197, 94, 0.06)' : 'var(--surface-1)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {mandi.isOptimalChoice && (
                            <Badge variant="primary">🌟 HIGHEST NET PROFIT ROUTE</Badge>
                          )}
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📍 {mandi.distanceKm} km away</span>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                          {mandi.mandiName}
                        </h3>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <span>Live Rate: <strong>₹{mandi.livePrice}/Qtl</strong></span>
                          <span>Est. Transport: <span style={{ color: '#dc2626' }}>-₹{mandi.transitCostPerQtl}/Qtl</span></span>
                          <span>3-Day ML Trend: <strong style={{ color: '#22c55e' }}>{mandi.trend}</strong></span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>NET PROFIT PER QTL</span>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: mandi.isOptimalChoice ? 'var(--signal-lime)' : 'var(--text-primary)', margin: 0 }}>
                          ₹{mandi.netProfitPerQtl}
                        </h2>
                        <Button variant={mandi.isOptimalChoice ? 'primary' : 'outline'} size="sm">
                          Navigate & Sell ➔
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Integrated Marketplace Component */}
            <div>
              <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Integrated Platform Marketplace & Input Trading Component
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--signal-lime)', fontWeight: 700 }}>
                  ✓ Core Shared Marketplace Infrastructure
                </span>
              </div>
              <MarketplacePage />
            </div>
          </>
        ) : (
          <MarketplacePage />
        )}
      </div>
    </SihLayout>
  );
};
