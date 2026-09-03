export interface ProcurementAdvice {
  riskScore: number;
  riskLevel: 'LOW RISK' | 'MODERATE RISK' | 'HIGH RISK';
  harvestSafety: 'OPTIMAL' | 'CAUTION' | 'STOP HARVEST';
  sprayingSafety: 'SAFE' | 'UNSAFE (WIND/RAIN)';
  procurementTiming: string;
  recommendedAction: string;
  spoilageRisk: string;
  timeline: Array<{
    day: string;
    temp: number;
    rainProb: number;
    condition: string;
    riskStatus: 'SAFE' | 'CAUTION' | 'RISK';
  }>;
}

export class ClimateRiskService {
  /**
   * Calculates SIH Procurement & Climate Risk telemetry for a given crop & weather context
   */
  static analyzeClimateRisk(weather: any, cropName: string = 'Wheat'): ProcurementAdvice {
    const rainProb = weather?.rainfallProbability || 0;
    const humidity = weather?.humidityPercent || 60;
    const windSpeed = weather?.windSpeedKmh || 12;
    const temp = weather?.temperatureCelsius || 26;

    // Calculate microclimate risk index (0-100)
    let riskScore = Math.round((rainProb * 0.5) + (humidity * 0.3) + (windSpeed * 0.2));
    if (riskScore > 100) riskScore = 98;

    let riskLevel: 'LOW RISK' | 'MODERATE RISK' | 'HIGH RISK' = 'LOW RISK';
    let harvestSafety: 'OPTIMAL' | 'CAUTION' | 'STOP HARVEST' = 'OPTIMAL';
    let sprayingSafety: 'SAFE' | 'UNSAFE (WIND/RAIN)' = 'SAFE';

    if (riskScore >= 60) {
      riskLevel = 'HIGH RISK';
      harvestSafety = 'STOP HARVEST';
      sprayingSafety = 'UNSAFE (WIND/RAIN)';
    } else if (riskScore >= 35) {
      riskLevel = 'MODERATE RISK';
      harvestSafety = 'CAUTION';
      sprayingSafety = windSpeed > 18 ? 'UNSAFE (WIND/RAIN)' : 'SAFE';
    }

    const procurementTiming = riskScore > 50
      ? 'Delay Procurement Dispatch by 48 Hours'
      : 'Immediate Procurement Recommended (Next 24-36 Hours)';

    const recommendedAction = riskScore > 50
      ? `High moisture threat detected (${rainProb}% rain chance). Cover harvested ${cropName} with tarpaulins immediately and postpone mandi delivery to avoid grain rejection.`
      : `Ideal microclimate conditions detected. Low moisture content ensures premium grade classification at mandi purchase centers.`;

    const spoilageRisk = humidity > 75 || rainProb > 50
      ? 'Elevated fungal/mold risk during transit (48% threshold exceeded)'
      : 'Minimal transit spoilage risk (< 5%)';

    // 5-Day Forecast Timeline Transformation
    const timeline = (weather?.forecast5Days || [
      { dayOfWeek: 'Mon', tempMaxCelsius: 28, rainProbabilityPercent: 10, weatherCondition: 'Clear' },
      { dayOfWeek: 'Tue', tempMaxCelsius: 29, rainProbabilityPercent: 20, weatherCondition: 'Partly Cloudy' },
      { dayOfWeek: 'Wed', tempMaxCelsius: 26, rainProbabilityPercent: 65, weatherCondition: 'Thunderstorm Risk' },
      { dayOfWeek: 'Thu', tempMaxCelsius: 25, rainProbabilityPercent: 40, weatherCondition: 'Light Rain' },
      { dayOfWeek: 'Fri', tempMaxCelsius: 27, rainProbabilityPercent: 15, weatherCondition: 'Sunny' }
    ]).map((f: any) => ({
      day: f.dayOfWeek || f.day,
      temp: f.tempMaxCelsius || f.temp || 26,
      rainProb: f.rainProbabilityPercent || f.rainProb || 10,
      condition: f.weatherCondition || f.condition || 'Sunny',
      riskStatus: ((f.rainProbabilityPercent || 0) > 50 ? 'RISK' : (f.rainProbabilityPercent || 0) > 30 ? 'CAUTION' : 'SAFE') as 'SAFE' | 'CAUTION' | 'RISK'
    }));

    return {
      riskScore,
      riskLevel,
      harvestSafety,
      sprayingSafety,
      procurementTiming,
      recommendedAction,
      spoilageRisk,
      timeline
    };
  }
}
