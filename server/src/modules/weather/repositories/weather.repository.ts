import { WeatherForecast, DailyForecast, GeocodeResult } from '../types/weather.types.js';
import { MOCK_WEATHER_DATA } from '../mock/weather.mock.js';
import { WEATHER_CONSTANTS } from '../constants/weather.constants.js';
import { config } from '../../../config/env.js';
import { AiClient } from '../../../utils/aiClient.js';
import { logger } from '../../../utils/logger.js';

/**
 * Adapted from the OLD project's `GET /api/weather` and
 * `GET /api/weather/geocode` routes (server.js) plus the client-side
 * `processOpenMeteoData` / `updateFarmingTips` / `getAIWeatherAdvice`
 * logic (js/weather.js). Open-Meteo requires no API key, so — unlike
 * Scanner/KrishiBot — this can call a real provider even in a default
 * environment; the AI-generated advisory sentence layered on top still
 * respects AI_PROVIDER_API_KEY/USE_MOCK_DATA the same way.
 */

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const WEATHER_CODE_MAP: Record<number, { label: string; icon: string }> = {
  0: { label: 'Clear', icon: '☀️' },
  1: { label: 'Mainly Clear', icon: '🌤️' },
  2: { label: 'Partly Cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Fog', icon: '🌫️' },
  48: { label: 'Fog', icon: '🌫️' },
  51: { label: 'Light Drizzle', icon: '🌦️' },
  53: { label: 'Drizzle', icon: '🌦️' },
  55: { label: 'Dense Drizzle', icon: '🌦️' },
  61: { label: 'Light Rain', icon: '🌧️' },
  63: { label: 'Rain', icon: '🌧️' },
  65: { label: 'Heavy Rain', icon: '🌧️' },
  71: { label: 'Light Snow', icon: '❄️' },
  73: { label: 'Snow', icon: '❄️' },
  75: { label: 'Heavy Snow', icon: '❄️' },
  80: { label: 'Rain Showers', icon: '🌦️' },
  81: { label: 'Rain Showers', icon: '🌦️' },
  82: { label: 'Violent Showers', icon: '⛈️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm w/ Hail', icon: '⛈️' },
  99: { label: 'Thunderstorm w/ Hail', icon: '⛈️' }
};

function describeWeatherCode(code: number): { label: string; icon: string } {
  return WEATHER_CODE_MAP[code] ?? { label: 'Unknown', icon: '🌡️' };
}

export class WeatherRepository {
  async getWeather(params: { location?: string; lat?: number; lon?: number }): Promise<WeatherForecast> {
    if (params.lat !== undefined && (isNaN(params.lat) || params.lat < -90 || params.lat > 90)) {
      throw new Error('Invalid latitude provided. Must be between -90 and 90.');
    }
    if (params.lon !== undefined && (isNaN(params.lon) || params.lon < -180 || params.lon > 180)) {
      throw new Error('Invalid longitude provided. Must be between -180 and 180.');
    }

    try {
      let lat = params.lat;
      let lon = params.lon;
      let resolvedLocation = params.location;

      if (lat === undefined || lon === undefined) {
        if (params.location) {
          const geo = await this.geocode(params.location);
          const best = geo[0];
          if (!best) throw new Error(`No location found for "${params.location}"`);
          lat = best.latitude;
          lon = best.longitude;
          resolvedLocation = [best.name, best.admin1].filter(Boolean).join(', ');
        } else {
          lat = WEATHER_CONSTANTS.DEFAULT_LAT;
          lon = WEATHER_CONSTANTS.DEFAULT_LON;
          resolvedLocation = WEATHER_CONSTANTS.DEFAULT_LOCATION;
        }
      } else if (!resolvedLocation) {
        resolvedLocation = await this.reverseGeocode(lat, lon);
      }

      logger.info(`[Weather] Requesting live Open-Meteo forecast for ${resolvedLocation} (${lat}, ${lon})`);
      const forecast = await this.fetchForecast(lat, lon, resolvedLocation);
      return forecast;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.warn('[Weather] Live fetch failed, serving offline fallback', { error: message });
      return {
        ...MOCK_WEATHER_DATA,
        location: params.location || MOCK_WEATHER_DATA.location,
        source: 'OFFLINE',
        updatedAt: new Date().toISOString()
      };
    }
  }

  private async reverseGeocode(lat: number, lon: number): Promise<string> {
    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
      const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (response.ok) {
        const data = await response.json();
        const cityOrLocality = data.locality || data.city || data.principalSubdivision;
        const state = data.principalSubdivision;
        if (cityOrLocality && state && cityOrLocality !== state) {
          return `${cityOrLocality}, ${state}`;
        }
        if (cityOrLocality) return cityOrLocality;
      }
    } catch (err) {
      logger.warn('[Weather] Reverse geocoding failed, falling back to coordinate label');
    }
    return `Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`;
  }

  async geocode(city: string): Promise<GeocodeResult[]> {
    if (!city || !city.trim()) {
      return this.fallbackGeocode('hooghly');
    }

    try {
      const url = `${GEOCODE_URL}?name=${encodeURIComponent(city.trim())}&count=5&language=en&format=json`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error(`Geocoding API responded with status ${response.status}`);
      const data = await response.json();
      return (data.results || []) as GeocodeResult[];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.warn('[Weather] Geocoding failed, serving offline fallback locations', { error: message });
      return this.fallbackGeocode(city);
    }
  }

  /** Adapted from OLD project's hardcoded `mockLocations` fallback in `/api/weather/geocode`. */
  private fallbackGeocode(city: string): GeocodeResult[] {
    const KNOWN_LOCATIONS: Record<string, GeocodeResult> = {
      hooghly: { name: 'Hooghly', latitude: 22.9023, longitude: 88.3958, country: 'India', admin1: 'West Bengal' },
      kolkata: { name: 'Kolkata', latitude: 22.5726, longitude: 88.3639, country: 'India', admin1: 'West Bengal' },
      delhi: { name: 'New Delhi', latitude: 28.6139, longitude: 77.209, country: 'India', admin1: 'Delhi' },
      mumbai: { name: 'Mumbai', latitude: 19.076, longitude: 72.8777, country: 'India', admin1: 'Maharashtra' },
      punjab: { name: 'Ludhiana', latitude: 30.901, longitude: 75.8573, country: 'India', admin1: 'Punjab' }
    };

    const normalized = city.toLowerCase().trim();
    for (const [key, value] of Object.entries(KNOWN_LOCATIONS)) {
      if (normalized.includes(key)) return [value];
    }

    return [{ name: city, latitude: WEATHER_CONSTANTS.DEFAULT_LAT, longitude: WEATHER_CONSTANTS.DEFAULT_LON, country: 'India', admin1: 'Punjab' }];
  }

  private async fetchForecast(lat: number, lon: number, location: string): Promise<WeatherForecast> {
    const url =
      `${FORECAST_URL}?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,precipitation_probability_max` +
      `&timezone=auto&forecast_days=7`;

    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`Weather API responded with status ${response.status}`);
    const data = await response.json();

    const current = data.current;
    const daily = data.daily;
    const weatherMeta = describeWeatherCode(Number(current.weather_code));

    const dailyForecast: DailyForecast[] = (daily.time as string[]).map((dateStr, i) => {
      const code = Number(daily.weather_code[i]);
      const meta = describeWeatherCode(code);
      return {
        date: dateStr,
        dayLabel: DAY_LABELS[new Date(dateStr).getDay()],
        condition: meta.label,
        icon: meta.icon,
        tempMaxCelsius: Math.round(Number(daily.temperature_2m_max[i])),
        tempMinCelsius: Math.round(Number(daily.temperature_2m_min[i])),
        precipitationSum: Number(daily.precipitation_sum[i]) || 0,
        windSpeedMaxKmh: Math.round(Number(daily.wind_speed_10m_max[i]))
      };
    });

    const rainfallProbability = Number(daily.precipitation_probability_max?.[0]) || 0;
    const temperatureCelsius = Math.round(Number(current.temperature_2m));
    const humidityPercent = Math.round(Number(current.relative_humidity_2m));
    const windSpeedKmh = Math.round(Number(current.wind_speed_10m));

    const { doList, dontList } = this.buildFarmingTips({
      temperatureCelsius,
      humidityPercent,
      windSpeedKmh,
      rainfallProbability
    });

    const advisory = await this.generateAdvisory(location, {
      temperatureCelsius,
      humidityPercent,
      windSpeedKmh,
      rainfallProbability,
      condition: weatherMeta.label
    });

    return {
      location,
      temperatureCelsius,
      condition: weatherMeta.label,
      humidityPercent,
      windSpeedKmh,
      rainfallProbability,
      advisory,
      doList,
      dontList,
      daily: dailyForecast,
      source: 'LIVE',
      updatedAt: new Date().toISOString()
    };
  }

  /** Adapted from OLD project's `updateFarmingTips()` (js/weather.js) — a pure rule engine, ported 1:1. */
  private buildFarmingTips(w: {
    temperatureCelsius: number;
    humidityPercent: number;
    windSpeedKmh: number;
    rainfallProbability: number;
  }): { doList: string[]; dontList: string[] } {
    const doList: string[] = [];
    const dontList: string[] = [];

    if (w.rainfallProbability >= 70) {
      doList.push('Ensure proper drainage in fields to prevent waterlogging.');
      doList.push('Protect harvested crops or seedlings with temporary covers.');
      dontList.push('Do not apply fertilizers or pesticides during heavy rain.');
      dontList.push('Avoid new sowing until rainfall intensity decreases.');
    } else if (w.rainfallProbability > 30) {
      doList.push('Light rain expected. Reduce manual irrigation accordingly.');
      dontList.push('Delay spraying chemicals when possible.');
    } else {
      doList.push('Good window for fertilizer and crop care activities.');
    }

    if (w.temperatureCelsius > 38) {
      doList.push('Irrigate early morning or late evening to reduce evaporation.');
      dontList.push('Avoid heavy field work during peak afternoon heat.');
    } else if (w.temperatureCelsius < 10) {
      doList.push('Use crop cover to reduce frost stress on young plants.');
      dontList.push('Avoid late evening irrigation in cold weather.');
    }

    if (w.windSpeedKmh > 25) {
      doList.push('Secure small structures and support taller plants.');
      dontList.push('Do not spray chemicals in strong wind.');
    }

    if (w.humidityPercent > 80 && w.temperatureCelsius > 25 && w.rainfallProbability < 70) {
      doList.push('Inspect crops for fungal spots and early pest symptoms.');
      dontList.push('Avoid dense canopy conditions that trap moisture.');
    }

    if (doList.length === 0) doList.push('Weather is stable. Continue routine field activities.');
    if (dontList.length === 0) dontList.push('No major restrictions. Keep monitoring changing conditions.');

    return { doList, dontList };
  }

  /** Adapted from OLD project's `getAIWeatherAdvice()` — AI text when configured, rule-based fallback otherwise. */
  private async generateAdvisory(
    location: string,
    w: { temperatureCelsius: number; humidityPercent: number; windSpeedKmh: number; rainfallProbability: number; condition: string }
  ): Promise<string> {
    if (AiClient.isConfigured()) {
      try {
        const prompt = `You are a crop weather expert. Today's weather in ${location}: Temperature ${w.temperatureCelsius}°C, Humidity ${w.humidityPercent}%, Rain probability ${w.rainfallProbability}%, Wind speed ${w.windSpeedKmh} km/h, Condition ${w.condition}. Provide two short, practical sentences of advice for farmers. Respond with plain text only, no markdown.`;
        const advice = await AiClient.chat([{ role: 'user', content: prompt }]);
        if (advice.trim()) return advice.trim();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        logger.warn('[Weather] AI advisory generation failed, using rule-based advisory', { error: message });
      }
    }

    if (w.rainfallProbability >= 70) {
      return 'High rain expected. Avoid fertilizer application and maintain drainage channels.';
    }
    if (w.temperatureCelsius > 38) {
      return 'High heat today. Irrigate in cool hours and avoid midday field stress.';
    }
    if (w.humidityPercent > 80) {
      return 'High humidity can trigger fungal issues. Monitor leaves and improve airflow.';
    }
    return 'Weather looks suitable for regular farming activities today.';
  }
}
