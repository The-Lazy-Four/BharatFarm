import { Request, Response } from 'express';
import { WeatherService } from '../services/weather.service.js';
import { ApiResponse } from '../../../utils/apiResponse.js';

export class WeatherController {
  private service: WeatherService;

  constructor() {
    this.service = new WeatherService();
  }

  getWeather = async (req: Request, res: Response): Promise<void> => {
    const location = req.query.location as string | undefined;
    const lat = req.query.lat !== undefined ? Number(req.query.lat) : undefined;
    const lon = req.query.lon !== undefined ? Number(req.query.lon) : undefined;
    const weather = await this.service.getWeatherForecast({ location, lat, lon });
    ApiResponse.success(res, weather, 'Weather details retrieved');
  };

  geocode = async (req: Request, res: Response): Promise<void> => {
    const city = req.query.city as string | undefined;
    if (!city) {
      ApiResponse.error(res, 'Query parameter "city" is required', 'VALIDATION_ERROR', 400);
      return;
    }
    const results = await this.service.geocodeCity(city);
    ApiResponse.success(res, results, 'Geocoding results retrieved');
  };
}
