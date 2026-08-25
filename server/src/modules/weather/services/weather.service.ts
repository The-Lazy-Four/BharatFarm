import { WeatherRepository } from '../repositories/weather.repository.js';
import { WeatherForecast, GeocodeResult } from '../types/weather.types.js';

export class WeatherService {
  private repository: WeatherRepository;

  constructor() {
    this.repository = new WeatherRepository();
  }

  async getWeatherForecast(params: { location?: string; lat?: number; lon?: number }): Promise<WeatherForecast> {
    return await this.repository.getWeather(params);
  }

  async geocodeCity(city: string): Promise<GeocodeResult[]> {
    return await this.repository.geocode(city);
  }
}
