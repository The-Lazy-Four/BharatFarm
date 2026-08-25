import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card.js';
import { Input } from '../../../components/ui/Input.js';
import { Button } from '../../../components/ui/Button.js';
import { WeatherCard } from '../components/WeatherCard.js';
import { ForecastList } from '../components/ForecastList.js';
import { FarmingRecommendation } from '../components/FarmingRecommendation.js';
import { useWeather } from '../hooks/useWeather.js';
import { Spinner } from '../../../components/ui/Spinner.js';
import { FEATURE_IMAGES } from '../../../constants/featureImages.js';

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
      <div className="page-header-banner">
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>Live Microclimate Telemetry</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
            Weather Intelligence — Field-Ready Decision Support
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Precision rainfall probability, humidity alerts, and crop activity advisories for your farm location.
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ width: '220px' }}>
            <Input placeholder="Search city or district..." value={locationInput} onChange={e => setLocationInput(e.target.value)} />
          </div>
          <Button type="submit" size="sm">Search</Button>
          <Button type="button" variant="secondary" size="sm" onClick={useMyLocation}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>my_location</span> My Location
          </Button>
        </form>
      </div>

      {error && (
        <div className="alert-warning">
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

          {/* Right Column (Span 4): Weather Hero Card & Activity Impact */}
          <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Contextual Weather Hero Card */}
            <div className="card-feature-backed" style={{ minHeight: '140px' }}>
              <img src={FEATURE_IMAGES.weather.url} alt="Weather Field Advisory" className="card-feature-bg" />
              <div className="card-feature-overlay" />
              <div className="card-feature-content">
                <span className="badge badge-primary">Hyperlocal Radar</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.3rem', color: '#FFFFFF' }}>Irrigation & Spray Advisory</h4>
                <p style={{ fontSize: '0.75rem', opacity: 0.88, color: '#FFFFFF' }}>Real-time microclimate predictions for crop protection.</p>
              </div>
            </div>

            {/* Activity Impact Guidance Panel */}
            <Card title="Activity Impact Guide" subtitle="Weather suitability breakdown for scheduled farm tasks.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
                <div className="alert-success">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700 }}>💦 Irrigation</h5>
                    <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Favorable</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.25rem' }}>
                    Optimal low wind and soil absorption rates expected after 4:00 PM.
                  </p>
                </div>

                <div className="alert-warning">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700 }}>🧪 Foliar Spraying</h5>
                    <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Caution</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.25rem' }}>
                    Light gusty winds (14 km/h) — spray during early morning hours to prevent drift.
                  </p>
                </div>

                <div className="alert-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700 }}>🌾 Harvesting</h5>
                    <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>High Suitability</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.25rem' }}>
                    Dry canopy conditions ideal for combine harvester operations.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
