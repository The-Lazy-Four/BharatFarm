import React from 'react';
import { AssessmentHistoryItem } from '../types';

interface Props {
  history: AssessmentHistoryItem[];
}

export const HistoricalRiskSection: React.FC<Props> = ({ history }) => {
  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '16px',
      padding: '1.5rem',
      border: '1px solid #E2E8F0',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.1rem'
    }}>
      <div>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          ASSESSMENT ARCHIVE
        </span>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '0.2rem 0 0 0' }}>
          Historical Climate & Flood Risk Assessment Log
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
          Track past weather evaluations to identify seasonal vulnerability patterns across fields.
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.82rem',
          textAlign: 'left'
        }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569' }}>
              <th style={{ padding: '0.75rem', fontWeight: 800 }}>DATE</th>
              <th style={{ padding: '0.75rem', fontWeight: 800 }}>LOCATION</th>
              <th style={{ padding: '0.75rem', fontWeight: 800 }}>CROP</th>
              <th style={{ padding: '0.75rem', fontWeight: 800 }}>CLIMATE RISK</th>
              <th style={{ padding: '0.75rem', fontWeight: 800 }}>FLOOD RISK</th>
              <th style={{ padding: '0.75rem', fontWeight: 800 }}>ACTION RECOMMENDATION</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, idx) => (
              <tr key={item.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '0.75rem', fontWeight: 700, color: '#0F172A' }}>{item.date}</td>
                <td style={{ padding: '0.75rem', color: '#334155' }}>📍 {item.location}</td>
                <td style={{ padding: '0.75rem', fontWeight: 700, color: '#16A34A' }}>🌾 {item.crop}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{
                    background: item.climateRisk.includes('HIGH') ? '#ffedd5' : '#dcfce7',
                    color: item.climateRisk.includes('HIGH') ? '#c2410c' : '#166534',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px'
                  }}>
                    {item.climateRisk}
                  </span>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{
                    background: item.floodRisk.includes('SEVERE') ? '#fee2e2' : item.floodRisk.includes('MODERATE') ? '#fef9c3' : '#dcfce7',
                    color: item.floodRisk.includes('SEVERE') ? '#991b1b' : item.floodRisk.includes('MODERATE') ? '#854d0e' : '#166534',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px'
                  }}>
                    {item.floodRisk}
                  </span>
                </td>
                <td style={{ padding: '0.75rem', color: '#1E293B', fontWeight: 600 }}>{item.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
