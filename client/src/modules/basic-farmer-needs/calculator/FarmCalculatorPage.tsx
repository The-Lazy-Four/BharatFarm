import React, { useState } from 'react';
import { Card } from '@core/ui/Card';
import { Input } from '@core/ui/Input';
import { FEATURE_IMAGES } from '@core/constants/featureImages';

export const FarmCalculatorPage: React.FC = () => {
  const [area, setArea] = useState<number>(2.5);
  const [crop, setCrop] = useState<string>('wheat');

  const fertilizerRequirements = {
    ureaKg: Math.round(area * 45),
    dapKg: Math.round(area * 30),
    mopKg: Math.round(area * 15),
    seedKg: Math.round(area * 40),
    estimatedCost: Math.round(area * 3200),
    expectedYieldQuintal: Math.round(area * 18),
    expectedRevenue: Math.round(area * 18 * 2275)
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="page-header-banner">
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>Agronomic Cost & Yield Matrix</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
            Farm Calculator — Input Dosage & Profitability Engine
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Calculate exact seed, fertilizer dosage, total input expenditure, and projected harvest profitability.
          </p>
        </div>
      </div>

      {/* Main Grid Layout matching Stitch */}
      <div className="grid-dashboard">
        {/* Left Column (Span 8): Field Inputs & Requirement Breakdown */}
        <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card title="🌱 Field & Crop Parameters" subtitle="Specify your cultivated land area and target crop.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>
              <Input
                label="Land Size (Acres)"
                type="number"
                value={area}
                onChange={e => setArea(Number(e.target.value) || 0)}
                step="0.5"
                min="0.1"
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Target Crop</label>
                <select
                  value={crop}
                  onChange={e => setCrop(e.target.value)}
                  className="input-field"
                  style={{
                    padding: '0.65rem 1rem',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    outline: 'none'
                  }}
                >
                  <option value="wheat">Wheat (PBW 725 - Rabi)</option>
                  <option value="paddy">Paddy / Rice (Kharif)</option>
                  <option value="mustard">Mustard (Pusa 30)</option>
                  <option value="maize">Maize (Hybrid)</option>
                  <option value="cotton">Cotton (Bt Hybrid)</option>
                </select>
              </div>
            </div>
          </Card>

          <Card title="📜 Input Requirements & Dosages" subtitle="Precision recommendation based on PAU agricultural guidelines.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
              <div className="alert-success">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>UREA (46% N)</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.2rem 0' }}>
                  {fertilizerRequirements.ureaKg} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>kg</span>
                </h3>
                <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>split into 2 splits</span>
              </div>

              <div className="alert-warning">
                <span style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 600 }}>DAP (18-46-0)</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.2rem 0' }}>
                  {fertilizerRequirements.dapKg} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>kg</span>
                </h3>
                <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>basal application</span>
              </div>

              <div className="alert-info">
                <span style={{ fontSize: '0.75rem', opacity: 0.85, fontWeight: 600 }}>MOP (60% K)</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.2rem 0' }}>
                  {fertilizerRequirements.mopKg} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>kg</span>
                </h3>
                <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>potash supplement</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (Span 4): Hero Card & Financial Summary */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Farm Calculator Image Hero Card */}
          <div className="card-feature-backed" style={{ minHeight: '140px' }}>
            <img src={FEATURE_IMAGES.calculator.url} alt="Farm Financial Budget" className="card-feature-bg" />
            <div className="card-feature-overlay" />
            <div className="card-feature-content">
              <span className="badge badge-primary">PAU Algorithm</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.3rem', color: '#FFFFFF' }}>Agri-Financial Planning</h4>
              <p style={{ fontSize: '0.75rem', opacity: 0.88, color: '#FFFFFF' }}>Accurate crop economics and expected yield returns.</p>
            </div>
          </div>

          <Card title="💰 Expected Returns Summary">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
              <div className="inset-stat">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ESTIMATED INPUT COST</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.15rem 0' }}>
                  ₹{fertilizerRequirements.estimatedCost.toLocaleString()}
                </h3>
              </div>

              <div className="inset-stat">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PROJECTED YIELD</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--emerald-primary)', margin: '0.15rem 0' }}>
                  {fertilizerRequirements.expectedYieldQuintal} Quintals
                </h3>
              </div>

              <div className="inset-stat">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ESTIMATED REVENUE (MSP)</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.15rem 0' }}>
                  ₹{fertilizerRequirements.expectedRevenue.toLocaleString()}
                </h3>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

