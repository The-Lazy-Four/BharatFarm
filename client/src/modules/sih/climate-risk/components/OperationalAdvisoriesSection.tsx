import React from 'react';
import { ClimateAssessmentResult } from '../types';

interface Props {
  advisories: ClimateAssessmentResult['operationalAdvisories'];
}

export const OperationalAdvisoriesSection: React.FC<Props> = ({ advisories }) => {
  const items = [
    { title: 'SPRAYING', icon: 'cleaning_services', data: advisories.spraying },
    { title: 'IRRIGATION', icon: 'water_drop', data: advisories.irrigation },
    { title: 'FERTILIZER', icon: 'eco', data: advisories.fertilizer },
    { title: 'FIELD WORK', icon: 'agriculture', data: advisories.fieldWork },
    { title: 'OUTDOOR DRYING', icon: 'wb_sunny', data: advisories.drying }
  ];

  const getStatusBadge = (status: string) => {
    if (status === 'SAFE' || status === 'NORMAL' || status === 'PROCEED' || status === 'PERMITTED' || status === 'RECOMMENDED') {
      return { bg: '#dcfce7', color: '#15803d' };
    }
    if (status === 'CAUTION' || status === 'REDUCE') {
      return { bg: '#fef9c3', color: '#854d0e' };
    }
    return { bg: '#fee2e2', color: '#991b1b' };
  };

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
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          OPERATIONAL SUITABILITY
        </span>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '0.2rem 0 0 0' }}>
          Field Operations Weather Advisory Matrix
        </h3>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '0.85rem'
      }}>
        {items.map((item, idx) => {
          const badge = getStatusBadge(item.data.status);
          return (
            <div key={idx} style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '1rem',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#0284C7' }}>
                    {item.icon}
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#0F172A' }}>
                    {item.title}
                  </span>
                </div>

                <span style={{
                  background: badge.bg,
                  color: badge.color,
                  fontSize: '0.65rem',
                  fontWeight: 850,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '999px'
                }}>
                  {item.data.status}
                </span>
              </div>

              <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0, lineHeight: 1.35 }}>
                {item.data.guidance}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
