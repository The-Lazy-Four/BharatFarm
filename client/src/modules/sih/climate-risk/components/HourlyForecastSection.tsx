import React from 'react';
import { HourlyForecastItem } from '../types';

interface Props {
  hourly: HourlyForecastItem[];
}

export const HourlyForecastSection: React.FC<Props> = ({ hourly }) => {
  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '16px',
      padding: '1.5rem',
      border: '1px solid #E2E8F0',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          NEXT 24-HOUR HOURLY TELEMETRY
        </span>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', margin: '0.2rem 0 0 0' }}>
          Hourly Field Activity Decision Timeline
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
          Use hourly rain probability and wind speed to decide spraying, irrigation, harvest, transport, and drying operations.
        </p>
      </div>

      {/* Horizontal Scrollable Hourly Cards */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        scrollbarWidth: 'thin'
      }}>
        {hourly.slice(0, 24).map((h, idx) => (
          <div
            key={idx}
            style={{
              minWidth: '110px',
              background: h.rainProb > 60 ? '#FEF2F2' : h.rainProb > 40 ? '#FFFBEB' : '#F8FAFC',
              border: `1px solid ${h.rainProb > 60 ? '#FECACA' : h.rainProb > 40 ? '#FDE68A' : '#E2E8F0'}`,
              borderRadius: '12px',
              padding: '0.75rem 0.6rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.35rem',
              flexShrink: 0
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>
              {h.time}
            </span>

            <span style={{ fontSize: '1.4rem' }}>
              {h.condition.includes('Rain') || h.precipitation > 2 ? '🌧️' : h.condition.includes('Cloud') ? '⛅' : '☀️'}
            </span>

            <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0F172A' }}>
              {h.temp}°C
            </span>

            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284C7' }}>
              ☔ {h.rainProb}%
            </div>

            <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
              🌧️ {h.precipitation} mm
            </div>

            <div style={{ fontSize: '0.68rem', color: '#475569' }}>
              💨 {h.windSpeed} km/h
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
