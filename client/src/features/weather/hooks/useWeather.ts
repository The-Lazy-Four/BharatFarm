import { useState, useEffect, useCallback } from 'react';
import { WeatherForecast } from '../types/weather.types.js';
import { WeatherApi } from '../services/weatherApi.js';
import { MOCK_WEATHER } from '../mock/weather.mock.js';

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherForecast>(MOCK_WEATHER);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (params: { location?: string; lat?: number; lon?: number } = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await WeatherApi.getWeather(params);
      if (data) {
        setWeather(data);
      } else {
        setWeather(MOCK_WEATHER);
        setError('Could not reach the weather service, showing offline data.');
      }
    } catch {
      setWeather(MOCK_WEATHER);
      setError('Could not reach the weather service, showing offline data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      position => {
        load({ lat: position.coords.latitude, lon: position.coords.longitude });
      },
      () => {
        setError('Unable to fetch your location. Try searching for a city instead.');
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  return { weather, isLoading, error, searchLocation: (location: string) => load({ location }), useMyLocation };
};
