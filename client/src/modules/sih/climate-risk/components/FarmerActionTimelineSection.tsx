import React from 'react';
import { ClimateAssessmentResult } from '../types';

interface Props {
  plan: ClimateAssessmentResult['farmerActionPlan'];
}

export const FarmerActionTimelineSection: React.FC<Props> = ({ plan }) => {
  const steps = [
    { label: 'NOW', text: plan.today[0] || 'Inspect and clear field drainage exits', color: '#16a34a' },
    { label: '24H', text: plan.next24h[0] || 'Prepare harvest logistics & avoid spraying', color: '#0284c7' },
    { label: '48H', text: plan.next48h[0] || 'Move cut produce to covered storage', color: '#d97706' }
  ];

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '10px',
      padding: '0.85rem 1rem',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em' }}>
          ACTION TIMELINE
        </span>
        <span style={{ fontSize: '0.66rem', color: '#94a3b8' }}>3-Phase Plan</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {steps.map((step, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: '#f8fafc',
              border: '1px solid #f1f5f9',
              borderRadius: '6px',
              padding: '0.4rem 0.65rem'
            }}
          >
            <span style={{
              background: step.color,
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: '0.68rem',
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              minWidth: '34px',
              textAlign: 'center'
            }}>
              {step.label}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#1e293b', fontWeight: 600, lineHeight: 1.3 }}>
              {step.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
