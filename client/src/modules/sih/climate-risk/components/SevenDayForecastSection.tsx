import React from 'react';
import { DailyForecastItem } from '../types';
import { useLanguage } from '../../../../context/LanguageContext';

interface Props {
  daily: DailyForecastItem[];
}

export const SevenDayForecastSection: React.FC<Props> = ({ daily }) => {
  const { t } = useLanguage();
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
          {t('sih.forecast7Day')}
        </span>
        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{t('sih.realDailyValues')}</span>
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

          const getLocalizedDay = () => {
            if (isToday) return t('weatherPage.todayBadge').toUpperCase();
            try {
              if (day.date) {
                const d = new Date(day.date);
                if (!isNaN(d.getTime())) {
                  return d.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();
                }
              }
            } catch (e) {
              // fallback
            }
            return day.dayName.slice(0, 3).toUpperCase();
          };

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
                {getLocalizedDay()}
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
