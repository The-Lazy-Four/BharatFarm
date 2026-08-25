import { ApiClient } from '../../../services/apiClient.js';
import { WeatherForecast, GeocodeResult } from '../types/weather.types.js';

export class WeatherApi {
  static async getWeather(params: { location?: string; lat?: number; lon?: number } = {}): Promise<WeatherForecast | null> {
    const query = new URLSearchParams();
    if (params.location) query.set('location', params.location);
    if (params.lat !== undefined) query.set('lat', String(params.lat));
    if (params.lon !== undefined) query.set('lon', String(params.lon));
    const qs = query.toString();
    const res = await ApiClient.get<WeatherForecast>(`/weather${qs ? `?${qs}` : ''}`);
    return res.data || null;
  }

  static async geocode(city: string): Promise<GeocodeResult[]> {
    const res = await ApiClient.get<GeocodeResult[]>(`/weather/geocode?city=${encodeURIComponent(city)}`);
    return res.data || [];
  }
}
