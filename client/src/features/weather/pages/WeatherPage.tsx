import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card.js';
import { Input } from '../../../components/ui/Input.js';
import { Button } from '../../../components/ui/Button.js';
import { WeatherCard } from '../components/WeatherCard.js';
import { ForecastList } from '../components/ForecastList.js';
import { FarmingRecommendation } from '../components/FarmingRecommendation.js';
import { useWeather } from '../hooks/useWeather.js';
import { Spinner } from '../../../components/ui/Spinner.js';

export const WeatherPage: React.FC = () => {
  const { weather, isLoading, error, searchLocation, useMyLocation } = useWeather();
  const [locationInput, setLocationInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (locationInput.trim()) searchLocation(locationInput.trim());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.5rem',
        background: '#FFFFFF',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>Live Microclimate Telemetry</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Weather Intelligence — Field-Ready Decision Support
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Precision rainfall probability, humidity alerts, and crop activity advisories for your farm location.
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ width: '220px' }}>
            <Input placeholder="Search city or district..." value={locationInput} onChange={e => setLocationInput(e.target.value)} />
          </div>
          <Button type="submit" size="sm">Search</Button>
          <Button type="button" variant="secondary" size="sm" onClick={useMyLocation}>
            📍 My Location
          </Button>
        </form>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#FFFDF5', border: '1px solid #FCD34D', borderRadius: 'var(--radius-sm)', color: '#92400E', fontSize: '0.85rem' }}>
          ⚠️ {error}
        </div>
      )}

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid-dashboard">
          {/* Left Column (Span 8): Current Weather, AI Advisory & 7-Day Forecast */}
          <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <WeatherCard weather={weather} />
            <FarmingRecommendation advisory={weather.advisory} doList={weather.doList} dontList={weather.dontList} />
            <ForecastList daily={weather.daily} />
          </div>

          {/* Right Column (Span 4): Activity Impact & Climate Trend Panels (Stitch reference) */}
          <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Activity Impact Guidance Panel */}
            <Card title="Activity Impact Guide" subtitle="Weather suitability breakdown for scheduled farm tasks.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
                <div style={{ padding: '0.85rem', background: '#F0FDF4', borderRadius: 'var(--radius-sm)', border: '1px solid #B8E1C4' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>💦 Irrigation</h5>
                    <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Favorable</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Optimal low wind and soil absorption rates expected after 4:00 PM.
                  </p>
                </div>

                <div style={{ padding: '0.85rem', background: '#FFFDF5', borderRadius: 'var(--radius-sm)', border: '1px solid #FCD34D' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>🧪 Foliar Spraying</h5>
                    <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Caution</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Light gusty winds (14 km/h) — spray during early morning hours to prevent drift.
                  </p>
                </div>

                <div style={{ padding: '0.85rem', background: '#E0F2FE', borderRadius: 'var(--radius-sm)', border: '1px solid #7DD3FC' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>🚜 Harvesting & Drying</h5>
                    <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>Good</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Low rainfall risk for next 48 hours; dry storage conditions favorable.
                  </p>
                </div>
              </div>
            </Card>

            {/* Climate & Trend Analysis Panel */}
            <Card title="Trend Analysis" subtitle="7-day temperature and moisture trajectory.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem', background: 'var(--bg-main)', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Avg Max Temperature</span>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>33.2°C</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem', background: 'var(--bg-main)', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Accumulated Rain</span>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>8.5 mm</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem', background: 'var(--bg-main)', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fungal Spore Risk</span>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--accent-amber)' }}>Low-Moderate</strong>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
