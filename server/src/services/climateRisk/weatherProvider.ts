export interface HourlyForecastItem {
  time: string;
  temp: number;
  rainProb: number;
  precipitation: number;
  windSpeed: number;
  condition: string;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  condition: string;
  minTemp: number;
  maxTemp: number;
  rainProb: number;
  precipitation: number;
  windSpeed: number;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
}

export interface WeatherData {
  location: string;
  latitude: number;
  longitude: number;
  temperatureCelsius: number;
  humidityPercent: number;
  rainfallProbability: number;
  expectedRainfallMm: number;
  windSpeedKmh: number;
  condition: string;
  feelsLikeCelsius: number;
  pressureHpa?: number;
  uvIndex?: number;
  visibilityKm?: number;
  updatedAt: string;
  source: 'LIVE_OPEN_METEO' | 'DEMO_FALLBACK';
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}

export interface WeatherDataProvider {
  getWeather(locationName: string, lat?: number, lon?: number): Promise<WeatherData>;
}

// Preset location coordinates in India
export const LOCATION_COORDINATES: Record<string, { lat: number; lon: number; name: string }> = {
  'haldia': { lat: 22.0667, lon: 88.0667, name: 'Haldia, West Bengal' },
  'ludhiana': { lat: 30.9010, lon: 75.8573, name: 'Ludhiana, Punjab' },
  'burdwan': { lat: 23.2324, lon: 87.8615, name: 'Burdwan, West Bengal' },
  'kharagpur': { lat: 22.3460, lon: 87.2320, name: 'Kharagpur, West Bengal' },
  'murshidabad': { lat: 24.1750, lon: 88.2800, name: 'Murshidabad, West Bengal' },
  'nashik': { lat: 19.9975, lon: 73.7898, name: 'Nashik, Maharashtra' }
};

export class OpenMeteoWeatherProvider implements WeatherDataProvider {
  async getWeather(locationName: string, inputLat?: number, inputLon?: number): Promise<WeatherData> {
    const locKey = locationName.toLowerCase().split(',')[0].trim();
    const preset = LOCATION_COORDINATES[locKey];
    const lat = inputLat ?? preset?.lat ?? 22.0667;
    const lon = inputLon ?? preset?.lon ?? 88.0667;
    const resolvedName = inputLat !== undefined ? locationName : (preset?.name || locationName || 'Haldia, West Bengal');

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,surface_pressure,wind_speed_10m,uv_index&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`OpenMeteo API returned status ${res.status}`);
    }

    const data = await res.json();
    const current = data.current || {};
    const hourlyRaw = data.hourly || {};
    const dailyRaw = data.daily || {};

    // Map weather code to text condition
    const mapCodeToCondition = (code: number): string => {
      if (code === 0) return 'Clear Sky';
      if (code >= 1 && code <= 3) return 'Partly Cloudy';
      if (code >= 45 && code <= 48) return 'Foggy';
      if (code >= 51 && code <= 67) return 'Rain Drizzle';
      if (code >= 80 && code <= 82) return 'Heavy Rain Showers';
      if (code >= 95) return 'Thunderstorm';
      return 'Cloudy';
    };

    // Build 24-hour forecast
    const hourly: HourlyForecastItem[] = [];
    const currentHourIndex = new Date().getHours();
    for (let i = currentHourIndex; i < currentHourIndex + 24; i++) {
      if (hourlyRaw.time && hourlyRaw.time[i]) {
        const timeStr = new Date(hourlyRaw.time[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        hourly.push({
          time: timeStr,
          temp: Math.round(hourlyRaw.temperature_2m?.[i] ?? 28),
          rainProb: hourlyRaw.precipitation_probability?.[i] ?? 30,
          precipitation: Number((hourlyRaw.precipitation?.[i] ?? 0).toFixed(1)),
          windSpeed: Math.round(hourlyRaw.wind_speed_10m?.[i] ?? 12),
          condition: mapCodeToCondition(hourlyRaw.weather_code?.[i] ?? 1)
        });
      }
    }

    // Build 7-day forecast
    const daily: DailyForecastItem[] = [];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (dailyRaw.time) {
      for (let i = 0; i < Math.min(7, dailyRaw.time.length); i++) {
        const dateObj = new Date(dailyRaw.time[i]);
        const dayName = daysOfWeek[dateObj.getDay()];
        const rainProb = dailyRaw.precipitation_probability_max?.[i] ?? 20;
        const precip = Number((dailyRaw.precipitation_sum?.[i] ?? 0).toFixed(1));
        
        let severity: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' = 'LOW';
        if (precip > 40 || rainProb > 80) severity = 'SEVERE';
        else if (precip > 20 || rainProb > 60) severity = 'HIGH';
        else if (precip > 5 || rainProb > 40) severity = 'MODERATE';

        daily.push({
          date: dailyRaw.time[i],
          dayName,
          condition: mapCodeToCondition(dailyRaw.weather_code?.[i] ?? 0),
          minTemp: Math.round(dailyRaw.temperature_2m_min?.[i] ?? 24),
          maxTemp: Math.round(dailyRaw.temperature_2m_max?.[i] ?? 33),
          rainProb,
          precipitation: precip,
          windSpeed: Math.round(dailyRaw.wind_speed_10m_max?.[i] ?? 15),
          severity
        });
      }
    }

    const rainProbCurrent = daily[0]?.rainProb || 70;
    const precipCurrent = daily[0]?.precipitation || 42;

    return {
      location: resolvedName,
      latitude: lat,
      longitude: lon,
      temperatureCelsius: Math.round(current.temperature_2m ?? 29),
      humidityPercent: Math.round(current.relative_humidity_2m ?? 78),
      rainfallProbability: rainProbCurrent,
      expectedRainfallMm: precipCurrent,
      windSpeedKmh: Math.round(current.wind_speed_10m ?? 18),
      condition: mapCodeToCondition(current.weather_code ?? 2),
      feelsLikeCelsius: Math.round(current.apparent_temperature ?? 31),
      pressureHpa: Math.round(current.surface_pressure ?? 1008),
      uvIndex: Number((current.uv_index ?? dailyRaw.uv_index_max?.[0] ?? 0).toFixed(1)),
      visibilityKm: 8.5,
      updatedAt: new Date().toISOString(),
      source: 'LIVE_OPEN_METEO',
      hourly,
      daily
    };
  }
}

export class MockWeatherProvider implements WeatherDataProvider {
  async getWeather(locationName: string, lat: number = 22.0667, lon: number = 88.0667): Promise<WeatherData> {
    const hourly: HourlyForecastItem[] = Array.from({ length: 24 }, (_, i) => {
      const hour = (new Date().getHours() + i) % 24;
      const hourFormatted = `${hour.toString().padStart(2, '0')}:00`;
      const isNight = hour < 6 || hour > 19;
      return {
        time: hourFormatted,
        temp: isNight ? 24 + Math.round(Math.random() * 3) : 30 + Math.round(Math.random() * 5),
        rainProb: i < 8 ? 75 : 30,
        precipitation: i < 8 ? Number((Math.random() * 8 + 2).toFixed(1)) : 0,
        windSpeed: 14 + Math.round(Math.random() * 8),
        condition: i < 8 ? 'Heavy Rain' : 'Partly Cloudy'
      };
    });

    const daily: DailyForecastItem[] = [
      { date: '2026-09-08', dayName: 'MON', condition: 'Partly Cloudy', minTemp: 28, maxTemp: 34, rainProb: 70, precipitation: 18, windSpeed: 18, severity: 'HIGH' },
      { date: '2026-09-09', dayName: 'TUE', condition: 'Heavy Rain', minTemp: 27, maxTemp: 31, rainProb: 85, precipitation: 46, windSpeed: 22, severity: 'SEVERE' },
      { date: '2026-09-10', dayName: 'WED', condition: 'Thunderstorm', minTemp: 26, maxTemp: 30, rainProb: 90, precipitation: 58, windSpeed: 28, severity: 'SEVERE' },
      { date: '2026-09-11', dayName: 'THU', condition: 'Light Rain', minTemp: 27, maxTemp: 32, rainProb: 50, precipitation: 12, windSpeed: 16, severity: 'MODERATE' },
      { date: '2026-09-12', dayName: 'FRI', condition: 'Cloudy', minTemp: 28, maxTemp: 33, rainProb: 30, precipitation: 4, windSpeed: 14, severity: 'LOW' },
      { date: '2026-09-13', dayName: 'SAT', condition: 'Clear Sky', minTemp: 27, maxTemp: 34, rainProb: 15, precipitation: 0, windSpeed: 12, severity: 'LOW' },
      { date: '2026-09-14', dayName: 'SUN', condition: 'Sunny', minTemp: 28, maxTemp: 35, rainProb: 10, precipitation: 0, windSpeed: 10, severity: 'LOW' }
    ];

    return {
      location: locationName || 'Haldia, West Bengal',
      latitude: lat,
      longitude: lon,
      temperatureCelsius: 29,
      humidityPercent: 78,
      rainfallProbability: 70,
      expectedRainfallMm: 42,
      windSpeedKmh: 18,
      condition: 'Partly Cloudy',
      feelsLikeCelsius: 32,
      pressureHpa: 1009,
      uvIndex: 7,
      visibilityKm: 9.0,
      updatedAt: new Date().toISOString(),
      source: 'DEMO_FALLBACK',
      hourly,
      daily
    };
  }
}

export async function fetchWeatherData(locationName: string = 'Haldia, West Bengal', lat?: number, lon?: number): Promise<WeatherData> {
  const liveProvider = new OpenMeteoWeatherProvider();
  try {
    return await liveProvider.getWeather(locationName, lat, lon);
  } catch (error) {
    console.warn('OpenMeteo weather fetch failed, falling back to mock provider:', error);
    const mockProvider = new MockWeatherProvider();
    return await mockProvider.getWeather(locationName, lat, lon);
  }
}
