import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WeatherForecast } from '../modules/basic-farmer-needs/weather/types/weather.types.js';
import { WeatherApi } from '../modules/basic-farmer-needs/weather/services/weatherApi.js';
import { MOCK_WEATHER } from '../modules/basic-farmer-needs/weather/mock/weather.mock.js';
import { getWeatherVisual, WeatherVisualConfig } from '../modules/basic-farmer-needs/weather/utils/weatherVisuals.js';
import { calculateFarmRecommendations, generateAgriAdvisoryText, FarmActivityStatus } from '../modules/basic-farmer-needs/weather/utils/weatherRules.js';

export interface WeatherContextType {
  weather: WeatherForecast;
  visual: WeatherVisualConfig;
  farmActivities: FarmActivityStatus[];
  advisoryText: string;
  isLoading: boolean;
  error: string | null;
  locationPermissionState: 'prompt' | 'granted' | 'denied' | 'unsupported';
  gpsCoords: { lat?: number; lon?: number };
  searchLocation: (location: string) => Promise<void>;
  requestGpsLocation: () => void;
  refreshWeather: () => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weather, setWeather] = useState<WeatherForecast>(MOCK_WEATHER);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [locationPermissionState, setLocationPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [gpsCoords, setGpsCoords] = useState<{ lat?: number; lon?: number }>({});
  const [lastParams, setLastParams] = useState<{ location?: string; lat?: number; lon?: number }>({});

  const applyWeatherData = (data: WeatherForecast) => {
    setWeather(data);
    setError(null);
  };

  const fetchWeather = useCallback(async (params: { location?: string; lat?: number; lon?: number } = {}) => {
    setIsLoading(true);
    setLastParams(params);

    const cacheKey = params.lat !== undefined && params.lon !== undefined
      ? `bf_weather_${params.lat.toFixed(2)}_${params.lon.toFixed(2)}`
      : `bf_weather_${(params.location || 'default').toLowerCase()}`;

    // Check if offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const stored = localStorage.getItem(cacheKey) || localStorage.getItem('bf_weather_last');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as WeatherForecast;
          setWeather({ ...parsed, source: 'OFFLINE' });
          setError('Offline — showing last available weather');
          setIsLoading(false);
          return;
        } catch {
          // Ignore json parse error
        }
      }
    }

    try {
      const data = await WeatherApi.getWeather(params);
      if (data) {
        setWeather(data);
        setError(null);
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem('bf_weather_last', JSON.stringify(data));
      } else {
        setError('Weather API returned null response from server.');
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      // Attempt cached fallback when network/server fetch fails
      const stored = localStorage.getItem(cacheKey) || localStorage.getItem('bf_weather_last');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as WeatherForecast;
          setWeather({ ...parsed, source: 'OFFLINE' });
          setError(null);
          setIsLoading(false);
          return;
        } catch {}
      }
      setWeather({ ...MOCK_WEATHER, source: 'OFFLINE' });
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestGpsLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationPermissionState('unsupported');
      setError('Geolocation is not supported by your browser.');
      fetchWeather({ location: 'Hooghly, West Bengal' });
      return;
    }

    setIsLoading(true);
    const handleSuccess = (position: GeolocationPosition) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      setGpsCoords({ lat, lon });
      setLocationPermissionState('granted');
      fetchWeather({ lat, lon });
    };

    const handleError = (err: GeolocationPositionError) => {
      if (err.code === err.TIMEOUT) {
        // Fallback to low accuracy search if high accuracy times out
        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          () => {
            setLocationPermissionState('denied');
            setError('Location request timed out. Displaying regional forecast for West Bengal.');
            fetchWeather({ location: 'Hooghly, West Bengal' });
          },
          { enableHighAccuracy: false, timeout: 5000 }
        );
        return;
      }

      setLocationPermissionState('denied');
      let msg = 'Location permission is needed for local weather and farm advice.';
      if (err.code === err.PERMISSION_DENIED) {
        msg = 'Location permission denied. Showing regional forecast for West Bengal.';
      }
      setError(msg);
      fetchWeather({ location: 'Hooghly, West Bengal' });
    };

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 300000 }
    );
  }, [fetchWeather]);

  const searchLocation = useCallback(async (location: string) => {
    await fetchWeather({ location });
  }, [fetchWeather]);

  const refreshWeather = useCallback(async () => {
    if (gpsCoords.lat !== undefined && gpsCoords.lon !== undefined) {
      requestGpsLocation();
    } else {
      await fetchWeather(lastParams);
    }
  }, [gpsCoords, lastParams, fetchWeather, requestGpsLocation]);

  // Request browser geolocation immediately on application startup
  useEffect(() => {
    requestGpsLocation();
  }, [requestGpsLocation]);

  const visual = getWeatherVisual(weather.condition);
  const farmActivities = calculateFarmRecommendations(weather);
  const advisoryText = weather.advisory || generateAgriAdvisoryText(weather);

  return (
    <WeatherContext.Provider
      value={{
        weather,
        visual,
        farmActivities,
        advisoryText,
        isLoading,
        error,
        locationPermissionState,
        gpsCoords,
        searchLocation,
        requestGpsLocation,
        refreshWeather
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeatherContext = (): WeatherContextType => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeatherContext must be used within a WeatherProvider');
  }
  return context;
};

/** Compatibility adapter hook for components using legacy useWeather syntax */
export const useWeather = () => {
  const ctx = useWeatherContext();
  return {
    weather: ctx.weather,
    isLoading: ctx.isLoading,
    error: ctx.error,
    searchLocation: ctx.searchLocation,
    useMyLocation: ctx.requestGpsLocation,
    refreshWeather: ctx.refreshWeather
  };
};
