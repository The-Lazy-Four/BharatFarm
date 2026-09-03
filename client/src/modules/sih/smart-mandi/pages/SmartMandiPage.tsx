import React, { useState, useEffect } from 'react';
import { SihLayout } from '../../shared/SihLayout';
import { useAuth } from '@core/context/AuthContext';
import { SmartMandiService, MandiRoute } from '../smartMandi.service';

export const SmartMandiPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedCrop, setSelectedCrop] = useState<string>('Wheat');
  const [quantityQtl, setQuantityQtl] = useState<number>(50);
  const [routes, setRoutes] = useState<MandiRoute[]>([]);

  useEffect(() => {
    const res = SmartMandiService.getMandiRecommendations(selectedCrop, user?.district || 'Ludhiana');
    setRoutes(res);
  }, [selectedCrop, user]);

  const bestMandi = routes[0];
  const secondMandi = routes[1];
  const profitAdvantage = bestMandi && secondMandi ? bestMandi.netReturnPerQtl - secondMandi.netReturnPerQtl : 0;

  return (
    <SihLayout
      activeModuleId="smart-mandi"
      moduleTitle="Smart Mandi Intelligence"
      moduleIcon="📍"
      moduleBadge="Net-Return Router"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1280px', margin: '0 auto', padding: '1.25rem 1rem 3rem' }}>
        
        {/* Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #052613 0%, #15803d 100%)',
          borderRadius: '20px',
          padding: '1.5rem',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{ background: '#22c55e', color: '#04210e', fontWeight: 900, fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '6px', textTransform: 'uppercase' }}>
                SIH MODULE 4
              </span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>• ML Shortest-Distance Profit Engine</span>
            </div>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
              ML-Based Smart Mandi Net-Profit Router
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.9)', marginTop: '0.3rem', maxWidth: '780px', lineHeight: 1.4 }}>
              Intelligent APMC price intelligence factoring in distance-based freight transit costs to determine the single highest net-profit mandi.
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>DECISION FORMULA</span>
            <strong style={{ color: '#22c55e', fontSize: '0.85rem' }}>Net Return = Mandi Price - Transport Freight</strong>
          </div>
        </div>

        {/* Inputs & Quick Calculator */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          {/* Crop Selector */}
          <div style={{
            background: 'var(--surface-1, #0d2818)',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
            borderRadius: '18px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Select Crop to Sell:
            </label>

            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: 'var(--surface-0, #041209)',
                border: '1px solid var(--border-default, rgba(255,255,255,0.2))',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 700
              }}
            >
              <option value="Wheat">Wheat (PBW 725)</option>
              <option value="Basmati Rice">Basmati Rice (1121)</option>
              <option value="Mustard">Mustard (Pusa 30)</option>
            </select>
          </div>

          {/* Tonnage Input */}
          <div style={{
            background: 'var(--surface-1, #0d2818)',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
            borderRadius: '18px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Harvest Batch Quantity (Quintals):
            </label>

            <input
              type="number"
              value={quantityQtl}
              onChange={(e) => setQuantityQtl(Number(e.target.value))}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: 'var(--surface-0, #041209)',
                border: '1px solid var(--border-default, rgba(255,255,255,0.2))',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 700
              }}
            />
          </div>
        </div>

        {/* Highest Net-Profit Recommendation Highlight Banner */}
        {bestMandi && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.08)',
            border: '2px solid #22c55e',
            borderRadius: '20px',
            padding: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🌟</span>
                <span style={{ background: '#22c55e', color: '#04210e', fontWeight: 900, fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                  OPTIMAL MANDI ROUTE RECOMMENDATION
                </span>
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', margin: '0.3rem 0 0.1rem 0' }}>
                {bestMandi.mandiName}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                📍 {bestMandi.distanceKm} km away ({bestMandi.transitTimeMinutes} mins travel) • ML 3-Day Forecast: <strong style={{ color: '#22c55e' }}>{bestMandi.trend}</strong>
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>TOTAL NET BATCH PROFIT ({quantityQtl} QTL)</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#22c55e', margin: 0 }}>
                ₹{(bestMandi.netReturnPerQtl * quantityQtl).toLocaleString()}
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 700 }}>
                +₹{(profitAdvantage * quantityQtl).toLocaleString()} higher net profit than nearer Mandis
              </span>
            </div>
          </div>
        )}

        {/* Live Mandi Route Comparisons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            📊 Distance & Freight Cost Comparison Matrix
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {routes.map((mandi) => (
              <div
                key={mandi.mandiId}
                style={{
                  background: 'var(--surface-1, #0d2818)',
                  border: mandi.isOptimalChoice ? '2px solid #22c55e' : '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
                  borderRadius: '16px',
                  padding: '1.2rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {mandi.isOptimalChoice && (
                      <span style={{ background: '#22c55e', color: '#04210e', fontWeight: 900, fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        RECOMMENDED
                      </span>
                    )}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      📍 {mandi.distanceKm} km away
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: '0.3rem 0 0.2rem 0' }}>
                    {mandi.mandiName}
                  </h3>

                  <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span>Live Gross Price: <strong style={{ color: '#ffffff' }}>₹{mandi.grossPricePerQtl}/Qtl</strong></span>
                    <span>Transit Freight: <strong style={{ color: '#dc2626' }}>-₹{mandi.transportCostPerQtl}/Qtl</strong></span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>NET PROFIT PER QTL</span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: mandi.isOptimalChoice ? '#22c55e' : '#ffffff', margin: 0 }}>
                    ₹{mandi.netReturnPerQtl}
                  </h3>
                  <button
                    onClick={() => alert(`Initiating navigation route to ${mandi.mandiName}`)}
                    style={{
                      marginTop: '0.35rem',
                      background: mandi.isOptimalChoice ? '#22c55e' : 'rgba(255,255,255,0.1)',
                      color: mandi.isOptimalChoice ? '#04210e' : '#ffffff',
                      border: 'none',
                      padding: '0.45rem 0.9rem',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    Navigate & Dispatch ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </SihLayout>
  );
};
