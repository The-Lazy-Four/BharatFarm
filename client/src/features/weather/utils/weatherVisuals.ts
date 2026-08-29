export interface WeatherVisualConfig {
  code: number;
  label: string;
  category: 'CLEAR' | 'PARTLY_CLOUDY' | 'CLOUDY' | 'RAIN' | 'HEAVY_RAIN' | 'THUNDERSTORM' | 'SNOW' | 'FOG' | 'EXTREME';
  icon: string;
  url: string;
  overlayGradient: string;
  accentColor: string;
  bgBadgeStyle: { background: string; color: string };
  farmerDescription: string;
}

export const WEATHER_VISUAL_MAP: Record<string, WeatherVisualConfig> = {
  CLEAR: {
    code: 0,
    label: 'Sunny & Clear Sky',
    category: 'CLEAR',
    icon: '☀️',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    overlayGradient: 'linear-gradient(180deg, rgba(6, 28, 14, 0.25) 0%, rgba(6, 28, 14, 0.7) 60%, rgba(4, 20, 10, 0.92) 100%)',
    accentColor: '#F59E0B',
    bgBadgeStyle: { background: '#FEF3C7', color: '#B45309' },
    farmerDescription: 'Bright sunshine with clear skies. Excellent sunlight for crop photosynthesis.'
  },
  PARTLY_CLOUDY: {
    code: 2,
    label: 'Partly Cloudy',
    category: 'PARTLY_CLOUDY',
    icon: '⛅',
    url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1200&q=80',
    overlayGradient: 'linear-gradient(180deg, rgba(12, 35, 20, 0.2) 0%, rgba(12, 35, 20, 0.65) 60%, rgba(6, 22, 12, 0.9) 100%)',
    accentColor: '#3B82F6',
    bgBadgeStyle: { background: '#E0F2FE', color: '#0369A1' },
    farmerDescription: 'Mild sunshine with scattered clouds. Moderate evaporation and comfortable field weather.'
  },
  CLOUDY: {
    code: 3,
    label: 'Overcast & Cloudy',
    category: 'CLOUDY',
    icon: '☁️',
    url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=80',
    overlayGradient: 'linear-gradient(180deg, rgba(15, 25, 35, 0.25) 0%, rgba(15, 25, 35, 0.7) 60%, rgba(8, 15, 22, 0.92) 100%)',
    accentColor: '#6B7280',
    bgBadgeStyle: { background: '#F3F4F6', color: '#374151' },
    farmerDescription: 'Dense cloud cover. Reduced solar radiation; monitor humidity and disease buildup.'
  },
  RAIN: {
    code: 61,
    label: 'Light to Moderate Rain',
    category: 'RAIN',
    icon: '🌧️',
    url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1200&q=80',
    overlayGradient: 'linear-gradient(180deg, rgba(10, 30, 45, 0.3) 0%, rgba(10, 30, 45, 0.75) 60%, rgba(5, 18, 28, 0.94) 100%)',
    accentColor: '#0EA5E9',
    bgBadgeStyle: { background: '#E0F2FE', color: '#0284C7' },
    farmerDescription: 'Rain showers present. Pause chemical spraying and hold manual irrigation.'
  },
  HEAVY_RAIN: {
    code: 65,
    label: 'Heavy Downpour',
    category: 'HEAVY_RAIN',
    icon: '🌧️',
    url: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=1200&q=80',
    overlayGradient: 'linear-gradient(180deg, rgba(5, 20, 35, 0.4) 0%, rgba(5, 20, 35, 0.8) 60%, rgba(2, 10, 20, 0.95) 100%)',
    accentColor: '#2563EB',
    bgBadgeStyle: { background: '#DBEAFE', color: '#1E40AF' },
    farmerDescription: 'Heavy rainfall occurring. Ensure drainage trenches are clear to prevent crop waterlogging.'
  },
  THUNDERSTORM: {
    code: 95,
    label: 'Severe Thunderstorm',
    category: 'THUNDERSTORM',
    icon: '⛈️',
    url: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=1200&q=80',
    overlayGradient: 'linear-gradient(180deg, rgba(20, 10, 30, 0.45) 0%, rgba(18, 8, 25, 0.82) 60%, rgba(10, 4, 15, 0.96) 100%)',
    accentColor: '#EF4444',
    bgBadgeStyle: { background: '#FEE2E2', color: '#991B1B' },
    farmerDescription: 'Dangerous lightning and high winds expected. Seek shelter and avoid open fields.'
  },
  FOG: {
    code: 45,
    label: 'Fog & Dense Haze',
    category: 'FOG',
    icon: '🌫️',
    url: 'https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?auto=format&fit=crop&w=1200&q=80',
    overlayGradient: 'linear-gradient(180deg, rgba(30, 40, 45, 0.3) 0%, rgba(25, 35, 40, 0.72) 60%, rgba(15, 22, 28, 0.92) 100%)',
    accentColor: '#9CA3AF',
    bgBadgeStyle: { background: '#F3F4F6', color: '#4B5563' },
    farmerDescription: 'Low visibility and high moisture condensation. High risk for late blight fungal growth.'
  },
  SNOW: {
    code: 71,
    label: 'Snowfall & Frost',
    category: 'SNOW',
    icon: '❄️',
    url: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=1200&q=80',
    overlayGradient: 'linear-gradient(180deg, rgba(15, 30, 45, 0.25) 0%, rgba(15, 30, 45, 0.7) 60%, rgba(8, 18, 28, 0.92) 100%)',
    accentColor: '#38BDF8',
    bgBadgeStyle: { background: '#E0F2FE', color: '#0369A1' },
    farmerDescription: 'Freezing temperature conditions. Protect seedlings with straw covers or smoke fires.'
  },
  EXTREME: {
    code: 99,
    label: 'Extreme Weather Alert',
    category: 'EXTREME',
    icon: '⚠️',
    url: 'https://images.unsplash.com/photo-1504386106331-3e4e71712b38?auto=format&fit=crop&w=1200&q=80',
    overlayGradient: 'linear-gradient(180deg, rgba(40, 10, 10, 0.45) 0%, rgba(35, 8, 8, 0.82) 60%, rgba(20, 4, 4, 0.96) 100%)',
    accentColor: '#DC2626',
    bgBadgeStyle: { background: '#FEE2E2', color: '#B91C1C' },
    farmerDescription: 'Extreme weather warning. Take immediate protective measures for livestock and crops.'
  }
};

export const getWeatherVisual = (conditionStr?: string): WeatherVisualConfig => {
  if (!conditionStr) return WEATHER_VISUAL_MAP.CLEAR;
  const c = conditionStr.toLowerCase();
  if (c.includes('thunderstorm') || c.includes('hail') || c.includes('squall')) return WEATHER_VISUAL_MAP.THUNDERSTORM;
  if (c.includes('heavy rain') || c.includes('violent showers') || c.includes('downpour')) return WEATHER_VISUAL_MAP.HEAVY_RAIN;
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return WEATHER_VISUAL_MAP.RAIN;
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) return WEATHER_VISUAL_MAP.FOG;
  if (c.includes('snow') || c.includes('ice') || c.includes('frost')) return WEATHER_VISUAL_MAP.SNOW;
  if (c.includes('overcast') || c.includes('cloudy')) return WEATHER_VISUAL_MAP.CLOUDY;
  if (c.includes('partly') || c.includes('mainly clear')) return WEATHER_VISUAL_MAP.PARTLY_CLOUDY;
  if (c.includes('clear') || c.includes('sunny')) return WEATHER_VISUAL_MAP.CLEAR;
  return WEATHER_VISUAL_MAP.CLEAR;
};
