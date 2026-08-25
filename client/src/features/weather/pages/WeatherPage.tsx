import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card.js';
import { Input } from '../../../components/ui/Input.js';
import { Button } from '../../../components/ui/Button.js';
import { WeatherCard } from '../components/WeatherCard.js';
import { ForecastList } from '../components/ForecastList.js';
import { FarmingRecommendation } from '../components/FarmingRecommendation.js';
import { useWeatherContext } from '../../../context/WeatherContext.js';
import { Spinner } from '../../../components/ui/Spinner.js';

export const WeatherPage: React.FC = () => {
  const {
    weather,
    visual,
    farmActivities,
    advisoryText,
    isLoading,
    error,
    searchLocation,
    requestGpsLocation,
    refreshWeather
  } = useWeatherContext();

  const [locationInput, setLocationInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (locationInput.trim()) {
      searchLocation(locationInput.trim());
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="page-header-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <span className="badge badge-primary">Live Microclimate Telemetry</span>
            <span className={`badge ${weather.source === 'LIVE' ? 'badge-success' : 'badge-warning'}`}>
              {weather.source === 'LIVE' ? '🟢 LIVE OPEN-METEO' : '🟡 OFFLINE FALLBACK'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
            Weather Intelligence — Field-Ready Decision Support
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Precision rainfall probability, humidity alerts, and crop activity advisories for {weather.location}.
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ width: '220px' }}>
            <Input placeholder="Search city or district..." value={locationInput} onChange={e => setLocationInput(e.target.value)} />
          </div>
          <Button type="submit" size="sm">Search</Button>
          <Button type="button" variant="secondary" size="sm" onClick={requestGpsLocation}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>my_location</span> GPS Location
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={refreshWeather} style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span> Refresh
          </Button>
        </form>
      </div>

      {error && (
        <div className="alert-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>warning</span>
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid-dashboard">
          {/* Left Column (Span 8): Current Weather, AI Advisory & 7-Day Forecast */}
          <div className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <WeatherCard weather={weather} />
            <FarmingRecommendation advisory={advisoryText} doList={weather.doList} dontList={weather.dontList} />
            <ForecastList daily={weather.daily} />
          </div>

          {/* Right Column (Span 4): Contextual Weather Visual & Dynamic Activity Impact Guide */}
          <div className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Dynamic Weather Visual Backdrop Card */}
            <div className="card-feature-backed" style={{ minHeight: '160px', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <img src={visual.url} alt={visual.label} className="card-feature-bg" style={{ filter: 'brightness(1.08)' }} />
              <div className="card-feature-overlay" style={{ background: visual.overlayGradient }} />
              <div className="card-feature-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                <span className="badge" style={visual.bgBadgeStyle}>
                  {visual.icon} {visual.category} RADAR
                </span>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.3rem', color: '#FFFFFF' }}>
                    {visual.label}
                  </h4>
                  <p style={{ fontSize: '0.78rem', opacity: 0.95, color: '#FFFFFF', marginTop: '0.2rem', lineHeight: 1.35 }}>
                    {visual.farmerDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Weather-Calculated Activity Impact Guide Panel */}
            <Card title="Activity Impact Guide" subtitle="Weather suitability breakdown calculated for scheduled farm tasks.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                {farmActivities.map(act => {
                  let alertClass = 'alert-success';
                  let badgeClass = 'badge-primary';
                  if (act.status === 'CAUTION') {
                    alertClass = 'alert-warning';
                    badgeClass = 'badge-warning';
                  } else if (act.status === 'AVOID' || act.status === 'HIGH RISK') {
                    alertClass = 'alert-warning';
                    badgeClass = 'badge-danger';
                  }

                  return (
                    <div key={act.activity} className={alertClass} style={{ padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h5 style={{ fontSize: '0.88rem', fontWeight: 750, color: 'var(--text-primary)' }}>
                          {act.icon} {act.activity}
                        </h5>
                        <span className={`badge ${badgeClass}`} style={{ fontSize: '0.65rem', fontWeight: 800 }}>
                          {act.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', opacity: 0.9, marginTop: '0.3rem', lineHeight: 1.35, color: 'var(--text-primary)' }}>
                        {act.reason}
                      </p>
                      {act.recommendedTiming && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--emerald-primary)', fontWeight: 700, marginTop: '0.3rem' }}>
                          ⏱️ Timing: {act.recommendedTiming}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
