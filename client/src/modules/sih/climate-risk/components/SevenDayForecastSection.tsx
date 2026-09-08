import React from 'react';
import { DailyForecastItem } from '../types';

interface Props {
  daily: DailyForecastItem[];
}

export const SevenDayForecastSection: React.FC<Props> = ({ daily }) => {
  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '10px',
      padding: '0.85rem 1rem',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em' }}>
          7-DAY FORECAST
        </span>
        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Real Daily Values</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))',
        gap: '0.5rem'
      }}>
        {daily.slice(0, 7).map((day, idx) => {
          const isToday = idx === 0;
          const icon = day.condition.includes('Heavy') || day.precipitation > 25
            ? '🌧️'
            : day.condition.includes('Rain')
            ? '🌦️'
            : day.condition.includes('Cloud')
            ? '⛅'
            : '☀️';

          return (
            <div
              key={idx}
              style={{
                background: isToday ? '#f0fdf4' : '#f8fafc',
                border: `1px solid ${isToday ? '#86efac' : '#e2e8f0'}`,
                borderRadius: '8px',
                padding: '0.6rem 0.4rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem'
              }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isToday ? '#166534' : '#334155' }}>
                {isToday ? 'TODAY' : day.dayName.slice(0, 3).toUpperCase()}
              </span>
              <span style={{ fontSize: '1.3rem', margin: '0.1rem 0' }}>{icon}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                {Math.round(day.maxTemp)}°
              </span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: day.precipitation > 5 ? '#0284c7' : '#94a3b8'
              }}>
                {Number(day.precipitation.toFixed(1))} mm
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
