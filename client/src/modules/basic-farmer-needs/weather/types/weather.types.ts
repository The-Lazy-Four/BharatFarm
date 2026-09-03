export interface DailyForecast {
  date: string;
  dayLabel: string;
  condition: string;
  icon: string;
  tempMaxCelsius: number;
  tempMinCelsius: number;
  precipitationSum: number;
  windSpeedMaxKmh: number;
}

export interface WeatherForecast {
  location: string;
  temperatureCelsius: number;
  condition: string;
  humidityPercent: number;
  windSpeedKmh: number;
  rainfallProbability: number;
  advisory: string;
  doList: string[];
  dontList: string[];
  daily: DailyForecast[];
  source: 'LIVE' | 'CACHED' | 'OFFLINE' | 'MOCK';
  updatedAt: string;
}

export interface GeocodeResult {
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}
