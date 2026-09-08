import React from 'react';
import { ClimateAssessmentResult } from '../types';

interface Props {
  cropRisk: ClimateAssessmentResult['cropRisk'];
}

export const CropRiskSection: React.FC<Props> = ({ cropRisk }) => {
  const getBadge = (level: string) => {
    switch (level) {
      case 'SEVERE': return { bg: '#fee2e2', color: '#991b1b' };
      case 'HIGH': return { bg: '#ffedd5', color: '#c2410c' };
      case 'MODERATE': return { bg: '#fef9c3', color: '#854d0e' };
      default: return { bg: '#dcfce7', color: '#166534' };
    }
  };

  const badge = getBadge(cropRisk.cropRiskLevel);

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '10px',
      padding: '0.85rem 1rem',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em' }}>
          {cropRisk.cropName.toUpperCase()} • {cropRisk.cropStage.toUpperCase()}
        </span>
        <span style={{
          background: badge.bg,
          color: badge.color,
          fontSize: '0.68rem',
          fontWeight: 800,
          padding: '0.15rem 0.45rem',
          borderRadius: '4px'
        }}>
          {cropRisk.cropRiskLevel} ({cropRisk.cropRiskScore}/100)
        </span>
      </div>

      <div style={{ margin: '0.5rem 0' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
          Stress Drivers:
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {cropRisk.factors.slice(0, 3).map((f, i) => (
            <div key={i} style={{ fontSize: '0.74rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ color: badge.color, fontWeight: 900 }}>•</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: '#f8fafc',
        padding: '0.45rem 0.65rem',
        borderRadius: '6px',
        fontSize: '0.72rem',
        fontWeight: 700,
        color: '#0f172a'
      }}>
        Primary Action: <span style={{ color: '#166534' }}>{cropRisk.potentialExposure || 'Protect field drainage'}</span>
      </div>
    </div>
  );
};
