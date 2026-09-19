import React from 'react';
import { WeatherForecast } from '../types/weather.types';
import { Badge } from '@core/ui/Badge';
import { useLanguage } from '../../../../context/LanguageContext';

export const WeatherStatus: React.FC<{ source: WeatherForecast['source'] }> = ({ source }) => {
  const { t } = useLanguage();
  const variantMap = {
    LIVE: 'primary',
    CACHED: 'warning',
    OFFLINE: 'secondary',
    MOCK: 'warning'
  } as const;

  return <Badge variant={variantMap[source]}>{t('weatherPage.weatherDataBadge', { source })}</Badge>;
};

