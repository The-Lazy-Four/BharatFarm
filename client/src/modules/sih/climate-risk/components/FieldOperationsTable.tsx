import React, { useState } from 'react';
import { ClimateAssessmentResult } from '../types';

interface Props {
  advisories: ClimateAssessmentResult['operationalAdvisories'];
}

export const FieldOperationsTable: React.FC<Props> = ({ advisories }) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const rows = [
    { activity: 'Spraying', icon: '💨', data: advisories.spraying },
    { activity: 'Irrigation', icon: '💧', data: advisories.irrigation },
    { activity: 'Fertilizer', icon: '🌱', data: advisories.fertilizer },
    { activity: 'Field Work', icon: '🚜', data: advisories.fieldWork },
    { activity: 'Drying', icon: '☀️', data: advisories.drying }
  ];

  const getBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes('AVOID') || s.includes('STOP') || s.includes('HALT') || s.includes('HIGH')) {
      return { text: '❌ Avoid', color: '#991b1b', bg: '#fee2e2' };
    }
    if (s.includes('POSTPONE') || s.includes('REDUCE') || s.includes('CAUTION') || s.includes('MODERATE')) {
      return { text: '⏸ Postpone', color: '#854d0e', bg: '#fef9c3' };
    }
    return { text: '✓ Proceed', color: '#166534', bg: '#dcfce7' };
  };

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
          FIELD OPERATIONS
        </span>
        <span style={{ fontSize: '0.66rem', color: '#94a3b8' }}>Click row for reason</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {rows.map((row, idx) => {
          const badge = getBadge(row.data.status);
          const isExpanded = expandedIdx === idx;

          return (
            <div
              key={idx}
              onClick={() => setExpandedIdx(isExpanded ? null : idx)}
              style={{
                background: isExpanded ? '#f8fafc' : '#ffffff',
                border: '1px solid #f1f5f9',
                borderRadius: '6px',
                padding: '0.35rem 0.55rem',
                cursor: 'pointer',
                transition: 'background 0.15s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.82rem' }}>{row.icon}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>{row.activity}</span>
                </div>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: badge.color,
                  background: badge.bg,
                  padding: '0.1rem 0.4rem',
                  borderRadius: '4px'
                }}>
                  {badge.text}
                </span>
              </div>
              {isExpanded && (
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.3rem', paddingLeft: '1.2rem', lineHeight: 1.3 }}>
                  {row.data.guidance}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
