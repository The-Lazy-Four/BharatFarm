import React from 'react';
import { ClimateAlert } from '../types';

interface Props {
  alerts: ClimateAlert[];
}

export const ClimateAlertsSection: React.FC<Props> = ({ alerts }) => {
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
          ACTIVE ALERTS
        </span>
        <span style={{ fontSize: '0.66rem', color: '#dc2626', fontWeight: 800 }}>
          {alerts.length} Active
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {alerts.slice(0, 3).map((alert) => {
          const isCrit = alert.severity === 'CRITICAL';
          const dotColor = isCrit ? '#dc2626' : '#ea580c';

          return (
            <div
              key={alert.id}
              style={{
                background: isCrit ? '#fef2f2' : '#fffbeb',
                border: `1px solid ${isCrit ? '#fecaca' : '#fde68a'}`,
                borderRadius: '6px',
                padding: '0.45rem 0.65rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ color: dotColor, fontSize: '0.85rem' }}>●</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>{alert.title}</span>
                </div>
                <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 600 }}>{alert.expectedTimeWindow}</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.2rem', paddingLeft: '1rem', fontWeight: 600 }}>
                {alert.recommendedAction}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
