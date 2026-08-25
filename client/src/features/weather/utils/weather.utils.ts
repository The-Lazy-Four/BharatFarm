export const getWeatherIcon = (condition: string): string => {
  if (condition.toLowerCase().includes('cloud')) return '🌤️';
  if (condition.toLowerCase().includes('rain')) return '🌧️';
  return '☀️';
};
