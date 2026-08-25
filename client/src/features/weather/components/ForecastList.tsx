import React from 'react';
import { DailyForecast } from '../types/weather.types.js';

export const ForecastList: React.FC<{ daily: DailyForecast[] }> = ({ daily }) => {
  if (daily.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '0.5rem 0' }}>
      {daily.map(day => (
        <div
          key={day.date}
          style={{
            minWidth: '110px',
            background: 'var(--bg-card)',
            padding: '1rem',
            borderRadius: 'var(--radius)',
            textAlign: 'center',
            border: '1px solid var(--border-color)'
          }}
        >
          <p style={{ fontWeight: 600 }}>{day.dayLabel}</p>
          <p style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>{day.icon}</p>
          <p style={{ fontSize: '0.9rem' }}>
            {day.tempMaxCelsius}° / {day.tempMinCelsius}°
          </p>
          {day.precipitationSum > 0 && (
            <p style={{ fontSize: '0.7rem', color: 'var(--primary)', marginTop: '0.25rem' }}>💧 {day.precipitationSum}mm</p>
          )}
        </div>
      ))}
    </div>
  );
};
