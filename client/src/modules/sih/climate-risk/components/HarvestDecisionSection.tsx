import React from 'react';
import { ClimateAssessmentResult } from '../types';

interface Props {
  harvestAdvisory: ClimateAssessmentResult['harvestAdvisory'];
  cropRisk: ClimateAssessmentResult['cropRisk'];
}

export const HarvestDecisionSection: React.FC<Props> = ({ harvestAdvisory, cropRisk }) => {
  const isEarly = harvestAdvisory.actionCode.includes('EARLY') || harvestAdvisory.actionCode.includes('PREPARE');
  const isDelay = harvestAdvisory.actionCode.includes('DELAY') || harvestAdvisory.actionCode.includes('PROTECT');
  const badgeColor = isEarly ? '#c2410c' : isDelay ? '#991b1b' : '#166534';
  const badgeBg = isEarly ? '#ffedd5' : isDelay ? '#fee2e2' : '#dcfce7';

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
          HARVEST DECISION
        </span>
        <span style={{
          background: badgeBg,
          color: badgeColor,
          fontSize: '0.68rem',
          fontWeight: 800,
          padding: '0.15rem 0.45rem',
          borderRadius: '4px'
        }}>
          {harvestAdvisory.actionCode}
        </span>
      </div>

      <div style={{ margin: '0.45rem 0' }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.25 }}>
          {harvestAdvisory.headline}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem', fontWeight: 600 }}>
          <strong>Why:</strong> {harvestAdvisory.primaryReason}
        </div>
      </div>

      <div style={{
        background: '#f8fafc',
        padding: '0.45rem 0.65rem',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.72rem'
      }}>
        <span style={{ color: '#64748b' }}>Crop & Stage:</span>
        <span style={{ fontWeight: 800, color: '#0f172a' }}>{cropRisk.cropName} • {cropRisk.cropStage}</span>
      </div>
    </div>
  );
};
