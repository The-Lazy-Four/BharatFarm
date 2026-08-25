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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <Card title="Find Weather For Your Farm">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <Input placeholder="Search city or district..." value={locationInput} onChange={e => setLocationInput(e.target.value)} />
          </div>
          <Button type="submit">🔍 Search</Button>
          <Button type="button" variant="secondary" onClick={useMyLocation}>
            📍 Use My Location
          </Button>
        </form>
        {error && <p style={{ color: 'var(--accent)', fontSize: '0.85rem', marginTop: '0.5rem' }}>⚠️ {error}</p>}
      </Card>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <WeatherCard weather={weather} />
          <FarmingRecommendation advisory={weather.advisory} doList={weather.doList} dontList={weather.dontList} />
          <ForecastList daily={weather.daily} />
        </>
      )}
    </div>
  );
};
