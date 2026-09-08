import React, { useState } from 'react';
import { FloodRiskAssessment } from '../types';

interface Props {
  flood: FloodRiskAssessment;
}

export const FloodRiskSection: React.FC<Props> = ({ flood }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStyle = (level: string) => {
    switch (level) {
      case 'SEVERE': return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
      case 'HIGH': return { bg: '#ffedd5', color: '#c2410c', border: '#fdba74' };
      case 'MODERATE': return { bg: '#fef9c3', color: '#854d0e', border: '#fde047' };
      default: return { bg: '#dcfce7', color: '#166534', border: '#86efac' };
    }
  };

  const style = getStyle(flood.riskLevel);

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '10px',
      padding: '0.85rem 1rem',
      border: `1px solid ${style.border}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em' }}>
            FLOOD RISK ASSESSMENT
          </span>
          <span style={{ fontSize: '0.64rem', color: '#94a3b8' }}>Weather-based</span>
        </div>
        <span style={{
          background: style.bg,
          color: style.color,
          fontSize: '0.68rem',
          fontWeight: 800,
          padding: '0.15rem 0.45rem',
          borderRadius: '4px'
        }}>
          {flood.riskLevel} ({flood.floodScore}/100)
        </span>
      </div>

      {/* Main Drivers Stack */}
      <div style={{ margin: '0.5rem 0' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
          Key Drivers (Next 48–72h):
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {flood.reasons.slice(0, 3).map((r, i) => (
            <div key={i} style={{ fontSize: '0.74rem', color: '#334155', display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
              <span style={{ color: style.color, fontWeight: 900 }}>•</span>
              <span>{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Collapsible Model Details toggle */}
      <div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontSize: '0.7rem',
            color: '#0284c7',
            fontWeight: 700,
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          {showDetails ? 'Hide Model Weights ▲' : 'View Risk Model Weights ▼'}
        </button>

        {showDetails && (
          <div style={{
            marginTop: '0.5rem',
            padding: '0.45rem',
            background: '#f8fafc',
            borderRadius: '6px',
            fontSize: '0.68rem',
            color: '#475569',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.25rem'
          }}>
            <div>Rain Intensity: 30%</div>
            <div>Water Level: 25%</div>
            <div>Rain Prob: 15%</div>
            <div>Elevation: 10%</div>
            <div>Susceptibility: 15%</div>
            <div>Soil Drainage: 5%</div>
          </div>
        )}
      </div>
    </div>
  );
};
