import React from 'react';
import { WeatherData } from '../types';

interface Props {
  weather: WeatherData;
}

export const CurrentWeatherSection: React.FC<Props> = ({ weather }) => {
  const icon = weather.condition.includes('Rain') ? '🌧️' : weather.condition.includes('Cloud') ? '⛅' : '☀️';

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '10px',
      padding: '0.85rem 1rem',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.75rem'
    }}>
      {/* Left: Temp + Condition */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '2rem', lineHeight: 1 }}>{icon}</span>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
              {Math.round(weather.temperatureCelsius)}°C
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
              {weather.condition}
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.15rem' }}>
            Feels {Math.round(weather.feelsLikeCelsius)}°C • Updated {new Date(weather.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Right: Key Decision Metrics in a clean row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center', background: '#f8fafc', padding: '0.35rem 0.65rem', borderRadius: '6px' }}>
          <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 700, display: 'block' }}>RAIN PROB</span>
          <span style={{ fontSize: '0.86rem', fontWeight: 800, color: weather.rainfallProbability >= 50 ? '#0284c7' : '#0f172a' }}>
            {Math.round(weather.rainfallProbability)}%
          </span>
        </div>

        <div style={{ textAlign: 'center', background: '#f8fafc', padding: '0.35rem 0.65rem', borderRadius: '6px' }}>
          <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 700, display: 'block' }}>RAIN EXP</span>
          <span style={{ fontSize: '0.86rem', fontWeight: 800, color: weather.expectedRainfallMm >= 20 ? '#dc2626' : '#0f172a' }}>
            {Number(weather.expectedRainfallMm.toFixed(1))} mm
          </span>
        </div>

        <div style={{ textAlign: 'center', background: '#f8fafc', padding: '0.35rem 0.65rem', borderRadius: '6px' }}>
          <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 700, display: 'block' }}>HUMIDITY</span>
          <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
            {Math.round(weather.humidityPercent)}%
          </span>
        </div>

        <div style={{ textAlign: 'center', background: '#f8fafc', padding: '0.35rem 0.65rem', borderRadius: '6px' }}>
          <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 700, display: 'block' }}>WIND</span>
          <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>
            {Math.round(weather.windSpeedKmh)} km/h
          </span>
        </div>
      </div>
    </div>
  );
};
