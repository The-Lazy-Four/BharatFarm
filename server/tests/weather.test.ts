import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WeatherRepository } from '../src/modules/weather/repositories/weather.repository.js';
import { WeatherService } from '../src/modules/weather/services/weather.service.js';
import { config } from '../src/config/env.js';

describe('Weather Intelligence Phase 13 Complete Production Suite', () => {
  let service: WeatherService;
  let repository: WeatherRepository;

  beforeEach(() => {
    (config as any).useMockData = false;
    service = new WeatherService();
    repository = new WeatherRepository();
    WeatherRepository.clearCache();
  });

  it('1. live weather response contract verification for valid coordinates', async () => {
    const result = await service.getWeatherForecast({ lat: 22.5726, lon: 88.3639, location: 'Kolkata' });
    expect(result).toBeDefined();
    expect(result.location).toBe('Kolkata');
    expect(result.temperatureCelsius).toBeGreaterThan(-50);
    expect(result.humidityPercent).toBeGreaterThanOrEqual(0);
    expect(result.windSpeedKmh).toBeGreaterThanOrEqual(0);
    expect(result.daily.length).toBe(7);
    expect(result.doList.length).toBeGreaterThan(0);
    expect(result.dontList.length).toBeGreaterThan(0);
    expect(result.source).toBe('LIVE');
    expect(result.updatedAt).toBeTruthy();
  }, 15000);

  it('2. throws error for invalid latitude coordinates (> 90)', async () => {
    service = new WeatherService();
    await expect(service.getWeatherForecast({ lat: 120, lon: 88.36 })).rejects.toThrow('Invalid latitude');
  });

  it('3. handles geocoding resolution for city names', async () => {
    service = new WeatherService();
    const geo = await service.geocodeCity('Punjab');
    expect(geo.length).toBeGreaterThan(0);
    expect(geo[0].latitude).toBeDefined();
    expect(geo[0].longitude).toBeDefined();
  }, 15000);

  it('4. isolation of geocoding failure using reverse geocode coordinate label', async () => {
    repository = new WeatherRepository();
    const result = await repository.getWeather({ lat: 15.3173, lon: 75.7139 });
    expect(result).toBeDefined();
    expect(result.location).toBeTruthy();
    expect(result.temperatureCelsius).toBeGreaterThan(-50);
  }, 15000);

  it('5. Open-Meteo network failure in production mode throws structured error', async () => {
    repository = new WeatherRepository();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      throw new Error('Network timeout simulation');
    });
    await expect(repository.getWeather({ location: 'Hooghly' })).rejects.toThrow('Open-Meteo Weather Fetch Failed');
    fetchSpy.mockRestore();
  });

  it('6. server-side weather cache hit returns source CACHED', async () => {
    repository = new WeatherRepository();
    const first = await repository.getWeather({ lat: 28.6139, lon: 77.2090, location: 'New Delhi' });
    expect(first.source).toBe('LIVE');

    const second = await repository.getWeather({ lat: 28.6139, lon: 77.2090, location: 'New Delhi' });
    expect(second.source).toBe('CACHED');
  }, 15000);

  it('7. concurrent duplicate request deduplication reuses in-flight promise', async () => {
    repository = new WeatherRepository();
    const [p1, p2] = await Promise.all([
      repository.getWeather({ lat: 19.0760, lon: 72.8777, location: 'Mumbai' }),
      repository.getWeather({ lat: 19.0760, lon: 72.8777, location: 'Mumbai' })
    ]);
    expect(p1).toBeDefined();
    expect(p2).toBeDefined();
    expect(p2.source).toBe('CACHED');
  }, 15000);

  it('8. mock mode when USE_MOCK_DATA=true returns source MOCK', async () => {
    (config as any).useMockData = true;
    repository = new WeatherRepository();
    const result = await repository.getWeather({ location: 'Mock Farm' });
    expect(result).toBeDefined();
    expect(result.source).toBe('MOCK');
    (config as any).useMockData = false;
  });

  it('9. forecast day label formatting and timezone date stability', async () => {
    repository = new WeatherRepository();
    const result = await repository.getWeather({ lat: 22.5726, lon: 88.3639 });
    expect(result.daily.length).toBe(7);
    result.daily.forEach(day => {
      expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).toContain(day.dayLabel);
    });
  }, 15000);
});
