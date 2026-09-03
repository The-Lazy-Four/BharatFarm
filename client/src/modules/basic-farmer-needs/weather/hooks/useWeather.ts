import { useState, useEffect, useCallback } from 'react';
import { WeatherForecast } from '../types/weather.types';
import { WeatherApi } from '../services/weatherApi';
import { MOCK_WEATHER } from '../mock/weather.mock';

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherForecast>(MOCK_WEATHER);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastParams, setLastParams] = useState<{ location?: string; lat?: number; lon?: number }>({});

  const load = useCallback(async (params: { location?: string; lat?: number; lon?: number } = {}) => {
    setIsLoading(true);
    setError(null);
    setLastParams(params);
    try {
      const data = await WeatherApi.getWeather(params);
      if (data) {
        setWeather(data);
      } else {
        setWeather(MOCK_WEATHER);
        setError('Could not reach live weather service. Displaying offline forecast.');
      }
    } catch {
      setWeather(MOCK_WEATHER);
      setError('Could not reach live weather service. Displaying offline forecast.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser. Using search instead.');
      load({ location: 'Hooghly, West Bengal' });
      return;
    }
    setIsLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      position => {
        load({ lat: position.coords.latitude, lon: position.coords.longitude });
      },
      err => {
        let msg = 'Unable to access live GPS location. Showing regional forecast.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission denied. Enter a city manually or allow access.';
        }
        setError(msg);
        load({ location: 'Hooghly, West Bengal' });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, [load]);

  const refreshWeather = useCallback(() => {
    if (lastParams.lat !== undefined && lastParams.lon !== undefined) {
      if (navigator.geolocation) {
        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(
          pos => load({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          () => load(lastParams),
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } else {
        load(lastParams);
      }
    } else {
      load(lastParams);
    }
  }, [lastParams, load]);

  useEffect(() => {
    useMyLocation();
  }, [useMyLocation]);

  return {
    weather,
    isLoading,
    error,
    searchLocation: (location: string) => load({ location }),
    useMyLocation,
    refreshWeather
  };
};
