import React from 'react';
import { DailyForecast } from '../types/weather.types';
import { Card } from '@core/ui/Card';

export const ForecastList: React.FC<{ daily: DailyForecast[] }> = ({ daily }) => {
  if (!daily || daily.length === 0) return null;

  return (
    <Card title="📅 7-Day Precision Agronomic Forecast" subtitle="Daily temperature span, rainfall accumulation, and weather conditions.">
      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', padding: '0.5rem 0', scrollbarWidth: 'thin' }}>
        {daily.map((day, idx) => {
          const isToday = idx === 0;
          return (
            <div
              key={day.date}
              style={{
                minWidth: '130px',
                flex: '1 0 130px',
                background: isToday ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                padding: '0.85rem 0.65rem',
                borderRadius: '8px',
                textAlign: 'center',
                border: isToday ? '2px solid var(--emerald-primary)' : '1px solid var(--border-subtle)',
                position: 'relative'
              }}
            >
              {isToday && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    background: 'var(--emerald-primary)',
                    color: '#FFFFFF',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}
                >
                  TODAY
                </span>
              )}
              <p style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{day.dayLabel}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>{day.date}</p>
              <p style={{ fontSize: '2.2rem', margin: '0.2rem 0', lineHeight: 1 }}>{day.icon}</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {day.condition}
              </p>
              <div style={{ margin: '0.5rem 0', fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                {day.tempMaxCelsius}° <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {day.tempMinCelsius}°</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.35rem' }}>
                <div>💧 {day.precipitationSum > 0 ? `${day.precipitationSum}mm` : '0mm'}</div>
                <div>💨 {day.windSpeedMaxKmh} km/h</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

