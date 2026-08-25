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
    estimatedCost: Math.round(area * 3200),
    expectedYieldQuintal: Math.round(area * 18)
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <Card title="Farm Input & Yield Calculator" subtitle="Estimate exact seed, fertilizer, and water requirements based on your land size and crop choice.">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Input
            label="Land Size (Acres)"
            type="number"
            value={area}
            onChange={e => setArea(Number(e.target.value) || 0)}
            step="0.5"
            min="0.1"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Target Crop</label>
            <select
              value={crop}
              onChange={e => setCrop(e.target.value)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)',
                padding: '0.66rem 1rem',
                color: 'var(--text-main)',
                fontSize: '0.95rem'
              }}
            >
              <option value="wheat">Wheat (Rabi)</option>
              <option value="paddy">Paddy / Rice (Kharif)</option>
              <option value="mustard">Mustard</option>
              <option value="maize">Maize</option>
              <option value="cotton">Cotton</option>
            </select>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <Card>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Required Urea</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.25rem' }}>
            {fertilizerRequirements.ureaKg} <span style={{ fontSize: '1rem' }}>kg</span>
          </h3>
        </Card>
        <Card>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Required DAP</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.25rem' }}>
            {fertilizerRequirements.dapKg} <span style={{ fontSize: '1rem' }}>kg</span>
          </h3>
        </Card>
        <Card>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated Input Cost</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent)', marginTop: '0.25rem' }}>
            ₹{fertilizerRequirements.estimatedCost.toLocaleString('en-IN')}
          </h3>
        </Card>
        <Card>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Projected Yield</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#60a5fa', marginTop: '0.25rem' }}>
            {fertilizerRequirements.expectedYieldQuintal} <span style={{ fontSize: '1rem' }}>Quintals</span>
          </h3>
        </Card>
      </div>
    </div>
  );
};
