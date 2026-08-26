import { describe, it, expect, vi } from 'vitest';
import { WeatherRepository } from '../src/modules/weather/repositories/weather.repository.js';
import { WeatherService } from '../src/modules/weather/services/weather.service.js';

describe('Weather Intelligence Backend Module Integration', () => {
  const service = new WeatherService();
  const repository = new WeatherRepository();

  it('fetches live weather or falls back gracefully for valid coordinates', async () => {
    const result = await service.getWeatherForecast({ lat: 22.5726, lon: 88.3639, location: 'Kolkata' });
    expect(result).toBeDefined();
    expect(result.temperatureCelsius).toBeGreaterThan(-50);
    expect(result.daily.length).toBeGreaterThanOrEqual(5);
    expect(result.doList.length).toBeGreaterThan(0);
    expect(result.dontList.length).toBeGreaterThan(0);
    expect(['LIVE', 'OFFLINE']).toContain(result.source);
  }, 15000);

  it('resolves city name via geocoding', async () => {
    const geo = await service.geocodeCity('Punjab');
    expect(geo.length).toBeGreaterThan(0);
    expect(geo[0].latitude).toBeDefined();
    expect(geo[0].longitude).toBeDefined();
  }, 15000);

  it('throws error for invalid latitude bounds', async () => {
    await expect(service.getWeatherForecast({ lat: 120, lon: 88 })).rejects.toThrow('Invalid latitude');
  });

  it('handles offline fallback gracefully when network fetch fails', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      throw new Error('Network timeout');
    });
    const result = await repository.getWeather({ location: 'Hooghly' });
    expect(result.source).toBe('OFFLINE');
    expect(result.location).toBe('Hooghly');
    fetchSpy.mockRestore();
  });
});
