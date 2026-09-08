import React from 'react';
import { ClimateAssessmentResult } from '../types';

interface Props {
  harvestAdvisory: ClimateAssessmentResult['harvestAdvisory'];
}

export const HarvestAdvisorySection: React.FC<Props> = ({ harvestAdvisory }) => {
  const isEarlyHarvest = harvestAdvisory.actionCode === 'CONSIDER EARLY HARVEST';
  const isProtect = harvestAdvisory.actionCode === 'PROTECT FIELD / IMPROVE DRAINAGE';
  const isDelay = harvestAdvisory.actionCode === 'DELAY HARVEST';

  const bannerBg = isEarlyHarvest ? 'linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)'
    : isProtect ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)'
    : isDelay ? 'linear-gradient(135deg, #713f12 0%, #ca8a04 100%)'
    : 'linear-gradient(135deg, #064e3b 0%, #16a34a 100%)';

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '16px',
      padding: '1.5rem',
      border: '1px solid #E2E8F0',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }}>
      <div>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          HARVEST & CUTTING DECISION ENGINE
        </span>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '0.2rem 0 0 0' }}>
          Agricultural Cutting & Harvest Action Recommendation
        </h3>
      </div>

      {/* Main Banner */}
      <div style={{
        background: bannerBg,
        borderRadius: '14px',
        padding: '1.35rem',
        color: '#FFFFFF',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.4rem', letterSpacing: '-0.01em' }}>
          {harvestAdvisory.headline}
        </div>

        <div style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.95)', lineHeight: 1.45, fontWeight: 500, background: 'rgba(0,0,0,0.15)', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
          <strong>Reason:</strong> "{harvestAdvisory.primaryReason}"
        </div>
      </div>

      {/* Action Checklist */}
      <div>
        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '0.6rem', textTransform: 'uppercase' }}>
          RECOMMENDED ACTION CHECKLIST
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {harvestAdvisory.actionSteps.map((step, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.65rem 0.85rem',
              background: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '0.83rem',
              fontWeight: 600,
              color: '#1E293B'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#16A34A' }}>check_circle</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
