import React from 'react';
import { WeatherForecast } from '../types/weather.types.js';
import { Card } from '../../../components/ui/Card.js';
import { WeatherStatus } from './WeatherStatus.js';
import { getWeatherIcon } from '../utils/weather.utils.js';

export const WeatherCard: React.FC<{ weather: WeatherForecast }> = ({ weather }) => {
  return (
    <Card title={`Location: ${weather.location}`} action={<WeatherStatus source={weather.source} />}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', margin: '1rem 0' }}>
        <span style={{ fontSize: '4rem' }}>{getWeatherIcon(weather.condition)}</span>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700 }}>{weather.temperatureCelsius}°C</h2>
          <p style={{ color: 'var(--text-muted)' }}>{weather.condition}</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <div><p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Humidity</p><p style={{ fontWeight: 600 }}>{weather.humidityPercent}%</p></div>
        <div><p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Wind</p><p style={{ fontWeight: 600 }}>{weather.windSpeedKmh} km/h</p></div>
        <div><p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rain Probability</p><p style={{ fontWeight: 600 }}>{weather.rainfallProbability}%</p></div>
      </div>
    </Card>
  );
};
