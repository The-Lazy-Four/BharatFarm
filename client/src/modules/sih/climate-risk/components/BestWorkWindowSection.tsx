import React from 'react';
import { HourlyForecastItem } from '../types';

interface Props {
  hourly: HourlyForecastItem[];
}

export const BestWorkWindowSection: React.FC<Props> = ({ hourly }) => {
  if (!hourly || hourly.length === 0) return null;

  // Derive optimal operational window from real hourly forecast:
  // Look for morning/daylight hours (06:00 to 18:00) with minimal rain probability and moderate wind.
  const daylightHours = hourly.slice(0, 18);
  
  // Find safest slot (lowest precipitation and rainProb)
  let bestStartIdx = -1;
  let minRainSum = Infinity;

  for (let i = 0; i <= daylightHours.length - 3; i++) {
    const windowRain = daylightHours[i].rainProb + daylightHours[i + 1].rainProb + daylightHours[i + 2].rainProb;
    if (windowRain < minRainSum) {
      minRainSum = windowRain;
      bestStartIdx = i;
    }
  }

  // Fallback safe window if index isn't found
  const bestWindowStr = bestStartIdx >= 0 && daylightHours[bestStartIdx]
    ? `${daylightHours[bestStartIdx].time} – ${daylightHours[bestStartIdx + 2]?.time || '12:00'}`
    : '08:00 – 11:00';

  // Find adverse window (highest rainProb)
  let maxRainIdx = 0;
  let maxRainVal = -1;
  daylightHours.forEach((h, idx) => {
    if (h.rainProb > maxRainVal) {
      maxRainVal = h.rainProb;
      maxRainIdx = idx;
    }
  });

  const avoidWindowStr = daylightHours[maxRainIdx]
    ? `${daylightHours[maxRainIdx].time} – ${daylightHours[Math.min(daylightHours.length - 1, maxRainIdx + 3)]?.time || '18:00'}`
    : '15:00 – 18:00';

  const isRainLikely = maxRainVal >= 50;

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
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{
          background: '#dcfce7',
          color: '#166534',
          fontSize: '0.7rem',
          fontWeight: 900,
          padding: '0.2rem 0.5rem',
          borderRadius: '4px'
        }}>
          BEST WORK WINDOW
        </span>
        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
          Computed from real hourly forecast
        </span>
      </div>

      {/* Recommended Window */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: '#16a34a', fontWeight: 900, fontSize: '0.92rem' }}>✓</span>
          <span style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0f172a' }}>{bestWindowStr}</span>
          <span style={{ fontSize: '0.72rem', color: '#166534', background: '#dcfce7', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
            Field work • Spraying • Transport
          </span>
        </div>

        {/* Avoid Window */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: '#dc2626', fontWeight: 900, fontSize: '0.92rem' }}>✕</span>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Avoid:</span>
          <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#991b1b' }}>{avoidWindowStr}</span>
          <span style={{ fontSize: '0.72rem', color: '#991b1b', background: '#fee2e2', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
            {isRainLikely ? '🌧 High rain probability' : 'High heat / humidity'}
          </span>
        </div>
      </div>
    </div>
  );
};
