import React, { useState } from 'react';
import { Card } from '../../components/ui/Card.js';
import { Input } from '../../components/ui/Input.js';

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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(15, 56, 34, 0.97) 0%, rgba(20, 83, 45, 0.93) 100%)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-3d)',
        color: '#FFFFFF'
      }}>
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
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid rgba(34,37,31,0.15)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem 1rem',
                    color: 'var(--dark-text)',
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
              <div style={{ padding: '1rem', background: 'rgba(215, 242, 26, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--signal-lime)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>UREA (46% N)</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark-text)', margin: '0.2rem 0' }}>
                  {fertilizerRequirements.ureaKg} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>kg</span>
                </h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>split into 2 splits</span>
              </div>

              <div style={{ padding: '1rem', background: '#FFFDF5', borderRadius: 'var(--radius-sm)', border: '1px solid #FCD34D' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>DAP (18-46-0)</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#D97706', margin: '0.2rem 0' }}>
                  {fertilizerRequirements.dapKg} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>kg</span>
                </h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>basal application</span>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(2, 132, 199, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid #7DD3FC' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>POTASH (MOP)</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0284C7', margin: '0.2rem 0' }}>
                  {fertilizerRequirements.mopKg} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>kg</span>
                </h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>at tillering stage</span>
              </div>

              <div style={{ padding: '1rem', background: 'var(--card-gray)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(34,37,31,0.1)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CERTIFIED SEED</span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--dark-text)', margin: '0.2rem 0' }}>
                  {fertilizerRequirements.seedKg} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>kg</span>
                </h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>high germ rate</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (Span 4): Input Cost & Optimization Suggestion (Stitch reference) */}
        <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Expenditure & Profitability Panel */}
          <Card title="Input Costs Breakdown" subtitle={`Calculated per ${area} Acre(s)`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(215, 242, 26, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--signal-lime)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ESTIMATED TOTAL COST</span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--dark-text)', margin: '0.25rem 0' }}>
                  ₹{fertilizerRequirements.estimatedCost.toLocaleString('en-IN')}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>~₹{(fertilizerRequirements.estimatedCost / area).toFixed(0)} per acre</p>
              </div>

              <div style={{ padding: '1rem', background: 'var(--card-gray)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(34,37,31,0.1)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>PROJECTED GROSS REVENUE</span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--dark-text)', margin: '0.25rem 0' }}>
                  ₹{fertilizerRequirements.expectedRevenue.toLocaleString('en-IN')}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Based on {fertilizerRequirements.expectedYieldQuintal} Quintals @ ₹2,275 MSP</p>
              </div>
            </div>
          </Card>

          {/* Stitch Optimization Suggestion Alert */}
          <Card title="Optimization Suggestion">
            <div style={{ padding: '0.85rem', background: '#FFFDF5', border: '1px solid #FCD34D', borderRadius: 'var(--radius-sm)' }}>
              <p style={{ fontSize: '0.85rem', color: '#92400E', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>lightbulb</span> Input Cost Savings Tip
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--dark-text)', marginTop: '0.35rem', lineHeight: '1.4' }}>
                Your estimated fertilizer expenditure is ~12% higher than regional average for {crop}. Consider pooling orders in <strong>Group Buying</strong> to save up to ₹250 per bag.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
