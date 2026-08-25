import { WeatherForecast } from '../types/weather.types.js';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const MOCK_WEATHER_DATA: WeatherForecast = {
  location: 'Ludhiana, Punjab',
  temperatureCelsius: 32,
  condition: 'Partly Cloudy',
  humidityPercent: 65,
  windSpeedKmh: 14,
  rainfallProbability: 20,
  advisory: 'Optimal time for wheat field irrigation. Low humidity expected in late evening.',
  doList: ['Good window for fertilizer and crop care activities.'],
  dontList: ['No major restrictions. Keep monitoring changing conditions.'],
  daily: DAY_LABELS.map((dayLabel, i) => ({
    date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
    dayLabel,
    condition: i === 3 ? 'Light Rain' : 'Partly Cloudy',
    icon: i === 3 ? '🌦️' : '🌤️',
    tempMaxCelsius: 34 - i,
    tempMinCelsius: 24 - Math.floor(i / 2),
    precipitationSum: i === 3 ? 8.5 : 0,
    windSpeedMaxKmh: 14 + i
  })),
  source: 'MOCK',
  updatedAt: new Date().toISOString()
};
