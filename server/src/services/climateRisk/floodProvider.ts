import { WeatherData } from './weatherProvider.js';

export interface FloodRiskFactors {
  rainfallIntensityWeight: number; // 30%
  rainProbabilityWeight: number; // 15%
  waterLevelWeight: number; // 25%
  historicalSusceptibilityWeight: number; // 15%
  terrainElevationWeight: number; // 10%
  soilDrainageWeight: number; // 5%
}

export interface FloodRiskAssessment {
  floodScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  reasons: string[];
  timeline: {
    h24: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
    h48: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
    h72: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
    d7: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  };
  dataSource: 'WEATHER_BASED_ASSESSMENT' | 'DEMONSTRATION_DATA';
  disclaimer: string;
}

export interface FloodDataProvider {
  getFloodRisk(weather: WeatherData, locationName: string): Promise<FloodRiskAssessment>;
}

// Configurable weights as required
export const DEFAULT_FLOOD_WEIGHTS: FloodRiskFactors = {
  rainfallIntensityWeight: 0.30,
  rainProbabilityWeight: 0.15,
  waterLevelWeight: 0.25,
  historicalSusceptibilityWeight: 0.15,
  terrainElevationWeight: 0.10,
  soilDrainageWeight: 0.05
};

// Historical susceptibility lookup per district
const HISTORICAL_FLOOD_SUSCEPTIBILITY: Record<string, number> = {
  'haldia': 85,
  'murshidabad': 80,
  'burdwan': 65,
  'kharagpur': 40,
  'ludhiana': 30,
  'nashik': 35
};

export class LiveFloodDataProvider implements FloodDataProvider {
  async getFloodRisk(weather: WeatherData, locationName: string): Promise<FloodRiskAssessment> {
    const locKey = locationName.toLowerCase().split(',')[0].trim();
    const historicalScore = HISTORICAL_FLOOD_SUSCEPTIBILITY[locKey] ?? 50;

    // 1. Rainfall Intensity Score (0-100 based on expected rain mm over 48h)
    const expected3DayRain = (weather.daily?.slice(0, 3) || []).reduce((acc, d) => acc + (d.precipitation || 0), 0);
    const rainfallIntensityScore = Math.min(100, Math.round((expected3DayRain / 80) * 100));

    // 2. Rain Probability Score
    const rainProbScore = weather.rainfallProbability || 50;

    // 3. Water/River Level Score (estimated/mock river level threshold)
    const riverLevelScore = locKey === 'haldia' || locKey === 'murshidabad' ? 88 : 45;

    // 4. Terrain & Elevation Score (coastal/lowland areas higher)
    const terrainScore = locKey === 'haldia' ? 90 : locKey === 'murshidabad' ? 85 : 40;

    // 5. Soil & Drainage Score
    const soilDrainageScore = expected3DayRain > 40 ? 75 : 30;

    // Calculate total weighted score
    const w = DEFAULT_FLOOD_WEIGHTS;
    const floodScore = Math.min(100, Math.max(0, Math.round(
      (rainfallIntensityScore * w.rainfallIntensityWeight) +
      (rainProbScore * w.rainProbabilityWeight) +
      (riverLevelScore * w.waterLevelWeight) +
      (historicalScore * w.historicalSusceptibilityWeight) +
      (terrainScore * w.terrainElevationWeight) +
      (soilDrainageScore * w.soilDrainageWeight)
    )));

    let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' = 'LOW';
    if (floodScore >= 76) riskLevel = 'SEVERE';
    else if (floodScore >= 51) riskLevel = 'HIGH';
    else if (floodScore >= 26) riskLevel = 'MODERATE';

    const reasons: string[] = [];
    if (expected3DayRain > 30) reasons.push(`Heavy rainfall expected within the next 48-72 hours (${expected3DayRain} mm cumulative).`);
    if (weather.rainfallProbability > 60) reasons.push(`High precipitation probability (${weather.rainfallProbability}%) sustained.`);
    if (historicalScore >= 60) reasons.push(`Area has elevated historical flood susceptibility.`);
    if (riverLevelScore >= 70) reasons.push(`River/estuary water level expected to rise near danger margin.`);
    if (soilDrainageScore >= 60) reasons.push(`Local drainage capacity may be exceeded during heavy downpours.`);

    if (reasons.length === 0) {
      reasons.push('Current rainfall forecast and hydrological factors indicate low flood risk.');
    }

    // Timeline calculations
    const getLevelFromScore = (score: number): 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' => {
      if (score >= 76) return 'SEVERE';
      if (score >= 51) return 'HIGH';
      if (score >= 26) return 'MODERATE';
      return 'LOW';
    };

    return {
      floodScore,
      riskLevel,
      reasons,
      timeline: {
        h24: getLevelFromScore(Math.round(floodScore * 0.7)),
        h48: getLevelFromScore(Math.round(floodScore * 0.9)),
        h72: riskLevel,
        d7: getLevelFromScore(Math.round(floodScore * 0.6))
      },
      dataSource: 'WEATHER_BASED_ASSESSMENT',
      disclaimer: 'Flood risk is an early-warning assessment, not a guaranteed flood prediction.'
    };
  }
}

export class MockFloodDataProvider implements FloodDataProvider {
  async getFloodRisk(weather: WeatherData, locationName: string): Promise<FloodRiskAssessment> {
    return {
      floodScore: 82,
      riskLevel: 'SEVERE',
      reasons: [
        'Heavy rainfall expected within the next 48 hours.',
        'Multiple rainy days forecast with cumulative 100mm+ precipitation.',
        'Area has historical flood susceptibility.',
        'Water level expected to rise in local drainage channels.',
        'Soil saturation is near capacity.'
      ],
      timeline: {
        h24: 'MODERATE',
        h48: 'HIGH',
        h72: 'SEVERE',
        d7: 'MODERATE'
      },
      dataSource: 'DEMONSTRATION_DATA',
      disclaimer: 'Flood risk is an early-warning assessment, not a guaranteed flood prediction.'
    };
  }
}

export async function fetchFloodRisk(weather: WeatherData, locationName: string): Promise<FloodRiskAssessment> {
  const provider = new LiveFloodDataProvider();
  try {
    return await provider.getFloodRisk(weather, locationName);
  } catch (err) {
    console.warn('Live flood provider error, using fallback:', err);
    return await new MockFloodDataProvider().getFloodRisk(weather, locationName);
  }
}
