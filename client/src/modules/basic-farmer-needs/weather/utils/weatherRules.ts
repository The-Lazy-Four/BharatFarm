import { WeatherForecast } from '../types/weather.types';

export interface FarmActivityStatus {
  activity: string;
  icon: string;
  status: 'FAVORABLE' | 'CAUTION' | 'AVOID' | 'HIGH RISK';
  badgeVariant: 'success' | 'warning' | 'error' | 'primary';
  reason: string;
  recommendedTiming?: string;
}

export const calculateFarmRecommendations = (weather: WeatherForecast): FarmActivityStatus[] => {
  const { rainfallProbability, temperatureCelsius, windSpeedKmh, humidityPercent, daily } = weather;
  const tomorrowRain = daily?.[1]?.precipitationSum || 0;
  const tomorrowRainProb = daily?.[1]?.precipitationSum ? Math.min(100, Math.round(daily[1].precipitationSum * 10)) : 0;

  // 1. IRRIGATION
  let irrigation: FarmActivityStatus;
  if (rainfallProbability >= 70) {
    irrigation = {
      activity: 'Irrigation',
      icon: '💦',
      status: 'AVOID',
      badgeVariant: 'error',
      reason: `Rain probability is ${rainfallProbability}% today. Natural rainfall will meet crop water needs.`,
      recommendedTiming: 'Hold for 48 hours'
    };
  } else if (rainfallProbability >= 40 || tomorrowRain > 5) {
    irrigation = {
      activity: 'Irrigation',
      icon: '💦',
      status: 'CAUTION',
      badgeVariant: 'warning',
      reason: `Light rain expected (${rainfallProbability}% chance). Apply minimal water only if topsoil is dry.`,
      recommendedTiming: 'Early morning only'
    };
  } else if (temperatureCelsius > 35) {
    irrigation = {
      activity: 'Irrigation',
      icon: '💦',
      status: 'FAVORABLE',
      badgeVariant: 'success',
      reason: `High heat (${temperatureCelsius}°C). Water crops early in the morning or late evening to cut evaporation.`,
      recommendedTiming: '5:00 AM - 7:00 AM or after 6:00 PM'
    };
  } else {
    irrigation = {
      activity: 'Irrigation',
      icon: '💦',
      status: 'FAVORABLE',
      badgeVariant: 'success',
      reason: `Stable weather (${temperatureCelsius}°C, ${humidityPercent}% humidity). Standard irrigation schedule applies.`,
      recommendedTiming: 'Late afternoon'
    };
  }

  // 2. FOLIAR SPRAYING (Pesticides / Insecticides)
  let spraying: FarmActivityStatus;
  if (rainfallProbability >= 50 || windSpeedKmh > 20) {
    spraying = {
      activity: 'Foliar Spraying',
      icon: '🧪',
      status: 'AVOID',
      badgeVariant: 'error',
      reason: windSpeedKmh > 20
        ? `Wind speed is ${windSpeedKmh} km/h (high drift risk). Rain chance is ${rainfallProbability}%.`
        : `High rain chance (${rainfallProbability}%). Chemical spray will wash off before leaf absorption.`,
      recommendedTiming: 'Postpone until calm dry window'
    };
  } else if (windSpeedKmh > 12) {
    spraying = {
      activity: 'Foliar Spraying',
      icon: '🧪',
      status: 'CAUTION',
      badgeVariant: 'warning',
      reason: `Moderate breeze (${windSpeedKmh} km/h). Spray during calm early hours with low pressure nozzle.`,
      recommendedTiming: '6:00 AM - 8:00 AM'
    };
  } else {
    spraying = {
      activity: 'Foliar Spraying',
      icon: '🧪',
      status: 'FAVORABLE',
      badgeVariant: 'success',
      reason: `Low wind (${windSpeedKmh} km/h) and clear canopy. Ideal conditions for pesticide & fertilizer spraying.`,
      recommendedTiming: 'Morning before 10:00 AM'
    };
  }

  // 3. FERTILIZER APPLICATION
  let fertilizer: FarmActivityStatus;
  if (rainfallProbability >= 70 || (daily?.[0]?.precipitationSum && daily[0].precipitationSum > 15)) {
    fertilizer = {
      activity: 'Fertilizer Application',
      icon: '🌾',
      status: 'AVOID',
      badgeVariant: 'error',
      reason: `Heavy rain forecast (${rainfallProbability}%). Top-dressed urea or NPK will wash into runoff.`,
      recommendedTiming: 'Apply after rain clears'
    };
  } else if (rainfallProbability >= 30) {
    fertilizer = {
      activity: 'Fertilizer Application',
      icon: '🌾',
      status: 'CAUTION',
      badgeVariant: 'warning',
      reason: `Drizzle likely. Incorporate fertilizer lightly into soil to prevent surface wash.`,
      recommendedTiming: 'Side-dress near roots'
    };
  } else {
    fertilizer = {
      activity: 'Fertilizer Application',
      icon: '🌾',
      status: 'FAVORABLE',
      badgeVariant: 'success',
      reason: `Dry soil conditions. Great window for broadcasting Nitrogen and Micronutrients.`,
      recommendedTiming: 'Follow immediately with light irrigation'
    };
  }

  // 4. HARVESTING & THRESHING
  let harvesting: FarmActivityStatus;
  if (rainfallProbability >= 60 || humidityPercent > 85) {
    harvesting = {
      activity: 'Harvesting & Threshing',
      icon: '🚜',
      status: 'AVOID',
      badgeVariant: 'error',
      reason: `High humidity (${humidityPercent}%) and rain risk (${rainfallProbability}%). Damp grains spoil quickly.`,
      recommendedTiming: 'Keep harvested produce covered'
    };
  } else if (tomorrowRainProb >= 50) {
    harvesting = {
      activity: 'Harvesting & Threshing',
      icon: '🚜',
      status: 'CAUTION',
      badgeVariant: 'warning',
      reason: `Dry today (${rainfallProbability}%), but rain expected tomorrow. Accelerate field harvesting if crops are mature.`,
      recommendedTiming: 'Complete by 4:00 PM today'
    };
  } else {
    harvesting = {
      activity: 'Harvesting & Threshing',
      icon: '🚜',
      status: 'FAVORABLE',
      badgeVariant: 'success',
      reason: `Dry canopy and good sunshine. Excellent window for combine harvester operations.`,
      recommendedTiming: 'Full day suitability'
    };
  }

  // 5. FIELD WORK & SOWING
  let fieldWork: FarmActivityStatus;
  if (temperatureCelsius > 38) {
    fieldWork = {
      activity: 'Field Work & Sowing',
      icon: '👨‍🌾',
      status: 'CAUTION',
      badgeVariant: 'warning',
      reason: `Extreme heat (${temperatureCelsius}°C). Avoid manual labor between 12:00 PM and 3:30 PM.`,
      recommendedTiming: '6:00 AM - 11:00 AM'
    };
  } else if (rainfallProbability >= 80) {
    fieldWork = {
      activity: 'Field Work & Sowing',
      icon: '👨‍🌾',
      status: 'AVOID',
      badgeVariant: 'error',
      reason: `Heavy rain will turn tilled soil muddy and compact freshly sown seeds.`,
      recommendedTiming: 'Wait for soil drainage'
    };
  } else {
    fieldWork = {
      activity: 'Field Work & Sowing',
      icon: '👨‍🌾',
      status: 'FAVORABLE',
      badgeVariant: 'success',
      reason: `Pleasant thermal range (${temperatureCelsius}°C). Great conditions for land preparation and sowing.`,
      recommendedTiming: 'All day'
    };
  }

  return [irrigation, spraying, fertilizer, harvesting, fieldWork];
};

export const generateAgriAdvisoryText = (weather: WeatherForecast): string => {
  const { location, temperatureCelsius, rainfallProbability, humidityPercent, windSpeedKmh } = weather;
  if (rainfallProbability >= 70) {
    return `Heavy rainfall (${rainfallProbability}%) expected in ${location}. Ensure main field drainage channels are clear, delay pesticide spraying, and store harvested produce in covered dry sheds.`;
  }
  if (temperatureCelsius >= 38) {
    return `High heat (${temperatureCelsius}°C) in ${location}. Schedule irrigation during early morning hours to prevent rapid soil evaporation and shield young saplings.`;
  }
  if (humidityPercent >= 80 && temperatureCelsius >= 24) {
    return `Elevated moisture (${humidityPercent}%) and temperature in ${location} increase fungal blight risk. Inspect leaf undersides regularly and maintain proper plant spacing.`;
  }
  if (windSpeedKmh >= 22) {
    return `Gusty winds (${windSpeedKmh} km/h) in ${location}. Stake taller crops like maize or banana and hold off chemical foliar spraying to prevent spray drift.`;
  }
  return `Favorable agricultural weather in ${location} (${temperatureCelsius}°C, ${humidityPercent}% humidity). Excellent timing for routine field maintenance, fertilization, and harvesting.`;
};
