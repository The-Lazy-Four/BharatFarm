import React from 'react';
import { WeatherForecast } from '../types/weather.types';
import { Badge } from '@core/ui/Badge';

export const WeatherStatus: React.FC<{ source: WeatherForecast['source'] }> = ({ source }) => {
  const variantMap = {
    LIVE: 'primary',
    CACHED: 'warning',
    OFFLINE: 'secondary',
    MOCK: 'warning'
  } as const;

  return <Badge variant={variantMap[source]}>{source} Weather Data</Badge>;
};

