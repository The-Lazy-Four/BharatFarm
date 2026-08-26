import React from 'react';
import { WeatherForecast } from '../types/weather.types.js';
import { Card } from '../../../components/ui/Card.js';
import { WeatherStatus } from './WeatherStatus.js';
import { getWeatherVisual } from '../utils/weatherVisuals.js';

export const WeatherCard: React.FC<{ weather: WeatherForecast }> = ({ weather }) => {
  const visual = getWeatherVisual(weather.condition);
  let updatedTimeStr = 'Just now';
  if (weather.updatedAt) {
    const parsedDate = new Date(weather.updatedAt);
    if (!isNaN(parsedDate.getTime())) {
      updatedTimeStr = parsedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  return (
    <Card action={<WeatherStatus source={weather.source} />}>
      {/* Weather Visual Background Header */}
      <div
        className="card-feature-backed"
        style={{
          minHeight: '210px',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          marginBottom: '1rem',
          position: 'relative'
        }}
      >
        <img
          src={visual.url}
          alt={visual.label}
          className="card-feature-bg"
          style={{ filter: 'brightness(1.05) contrast(1.05)', transition: 'all 0.5s ease' }}
        />
        <div className="card-feature-overlay" style={{ background: visual.overlayGradient }} />

        <div className="card-feature-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span className="badge" style={visual.bgBadgeStyle}>
                {visual.icon} {visual.label.toUpperCase()}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.85)', background: 'rgba(0, 0, 0, 0.4)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                Updated: {updatedTimeStr}
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.5rem' }}>
              📍 {weather.location}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '3.6rem', lineHeight: 1 }}>{visual.icon}</span>
              <div>
                <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1, letterSpacing: '-0.03em' }}>
                  {weather.temperatureCelsius}°C
                </div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)', marginTop: '0.25rem' }}>
                  Feels like {weather.temperatureCelsius}°C • {weather.condition}
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.45)', backdropFilter: 'blur(8px)', padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', fontWeight: 700 }}>Farmer Guidance</div>
              <div style={{ fontSize: '0.78rem', color: '#FFFFFF', maxWidth: '280px', marginTop: '0.15rem', lineHeight: 1.3 }}>
                {visual.farmerDescription}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Key Telemetry Indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
        <div className="inset-stat" style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>HUMIDITY</span>
          <strong style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 800 }}>💧 {weather.humidityPercent}%</strong>
        </div>
        <div className="inset-stat" style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>WIND SPEED</span>
          <strong style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 800 }}>💨 {weather.windSpeedKmh} km/h</strong>
        </div>
        <div className="inset-stat" style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>RAIN CHANCE</span>
          <strong style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 800 }}>☔ {weather.rainfallProbability}%</strong>
        </div>
        <div className="inset-stat" style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)' }}>
          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>TODAY'S RAIN</span>
          <strong style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 800 }}>🌧️ {weather.daily?.[0]?.precipitationSum || 0} mm</strong>
        </div>
      </div>
    </Card>
  );
};
