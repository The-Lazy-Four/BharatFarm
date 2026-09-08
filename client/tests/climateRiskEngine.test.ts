import { describe, it, expect } from 'vitest';
import { ClimateEngine } from '../../server/src/services/climateRisk/climateEngine.js';
import { LiveFloodDataProvider } from '../../server/src/services/climateRisk/floodProvider.js';
import { FoodSecurityEngine } from '../../server/src/services/foodSecurity/foodSecurityEngine.js';
import { WeatherData } from '../../server/src/services/climateRisk/weatherProvider.js';

describe('Climate Risk Planner & Food Security Intelligence Engine', () => {
  const mockWeather: WeatherData = {
    location: 'Haldia, West Bengal',
    latitude: 22.0667,
    longitude: 88.0667,
    temperatureCelsius: 29,
    humidityPercent: 82,
    rainfallProbability: 75,
    expectedRainfallMm: 45,
    windSpeedKmh: 22,
    condition: 'Heavy Rain',
    feelsLikeCelsius: 32,
    updatedAt: new Date().toISOString(),
    source: 'LIVE_OPEN_METEO',
    hourly: [],
    daily: [
      { date: '2026-09-08', dayName: 'MON', condition: 'Heavy Rain', minTemp: 27, maxTemp: 31, rainProb: 75, precipitation: 45, windSpeed: 22, severity: 'HIGH' },
      { date: '2026-09-09', dayName: 'TUE', condition: 'Heavy Rain', minTemp: 26, maxTemp: 30, rainProb: 85, precipitation: 50, windSpeed: 24, severity: 'SEVERE' }
    ]
  };

  it('1. Flood Risk Engine calculates correct weighted score & severity', async () => {
    const floodProvider = new LiveFloodDataProvider();
    const flood = await floodProvider.getFloodRisk(mockWeather, 'Haldia, West Bengal');

    expect(flood.floodScore).toBeGreaterThanOrEqual(50);
    expect(['HIGH', 'SEVERE']).toContain(flood.riskLevel);
    expect(flood.disclaimer).toContain('Flood risk is an early-warning assessment');
    expect(flood.reasons.length).toBeGreaterThan(0);
  });

  it('2. Harvest Recommendation Engine recommends early harvest when crop is mature', async () => {
    const floodProvider = new LiveFloodDataProvider();
    const flood = await floodProvider.getFloodRisk(mockWeather, 'Haldia, West Bengal');
    const assessment = ClimateEngine.analyze(mockWeather, flood, 'Paddy', 'Near Maturity');

    expect(assessment.harvestAdvisory.actionCode).toBe('CONSIDER EARLY HARVEST');
    expect(assessment.harvestAdvisory.headline).toContain('CONSIDER EARLY HARVEST');
  });

  it('3. Harvest Recommendation Engine protects field instead of early harvest when crop is immature', async () => {
    const floodProvider = new LiveFloodDataProvider();
    const flood = await floodProvider.getFloodRisk(mockWeather, 'Haldia, West Bengal');
    const assessment = ClimateEngine.analyze(mockWeather, flood, 'Paddy', 'Vegetative');

    expect(assessment.harvestAdvisory.actionCode).toBe('PROTECT FIELD / IMPROVE DRAINAGE');
    expect(assessment.harvestAdvisory.primaryReason).toContain('Crop maturity is insufficient for early harvest');
  });

  it('4. Operational matrix advises stopping irrigation and postponing fertilizer during heavy rain', async () => {
    const floodProvider = new LiveFloodDataProvider();
    const flood = await floodProvider.getFloodRisk(mockWeather, 'Haldia, West Bengal');
    const assessment = ClimateEngine.analyze(mockWeather, flood, 'Paddy', 'Flowering');

    expect(assessment.operationalAdvisories.irrigation.status).toBe('STOP');
    expect(assessment.operationalAdvisories.fertilizer.status).toBe('POSTPONE');
    expect(assessment.operationalAdvisories.spraying.status).toBe('NOT RECOMMENDED');
  });

  it('5. Food Security formula calculates domestic availability correctly', () => {
    // Current Stock (8.4) + Expected Production (11.2) - Estimated Climate Loss (3.1) - Committed Outward Supply (8.0) = 8.5
    const snapshot = FoodSecurityEngine.calculateOverview(
      'West Bengal',
      'Paddy',
      8.4,
      11.2,
      3.1,
      8.0,
      7.2
    );

    expect(snapshot.projectedDomesticAvailabilityLakhTonnes).toBe(8.5);
    expect(snapshot.riskLevel).toBe('NORMAL');
    expect(snapshot.advisoryText).not.toContain('EXPORTS ARE BANNED');
  });

  it('6. Food Security classifies CRITICAL when availability drops below safety threshold', () => {
    // Current Stock (8.4) + Expected Production (11.2) - Estimated Climate Loss (5.0) - Committed Outward Supply (8.0) = 6.6 (below threshold 7.2)
    const snapshot = FoodSecurityEngine.calculateOverview(
      'West Bengal',
      'Paddy',
      8.4,
      11.2,
      5.0,
      8.0,
      7.2
    );

    expect(snapshot.projectedDomesticAvailabilityLakhTonnes).toBe(6.6);
    expect(snapshot.riskLevel).toBe('CRITICAL');
    expect(snapshot.recommendedPolicyActions).toContain('Review outward movement and export commitments under applicable policy frameworks.');
  });

  it('7. What-If Disaster Scenario simulator recalculates loss and safety gap dynamically', () => {
    const scenario = FoodSecurityEngine.simulateScenario({
      state: 'West Bengal',
      crop: 'Paddy',
      cropLossPercentage: 40,
      baseStock: 8.4,
      baseProduction: 11.2,
      baseOutwardSupply: 8.0,
      safetyThreshold: 7.2
    });

    expect(scenario.cropLossPercentage).toBe(40);
    expect(scenario.estimatedClimateLoss).toBe(4.48); // 11.2 * 0.40
    expect(scenario.effectiveProduction).toBe(6.72);
    expect(scenario.projectedDomesticAvailability).toBe(7.12); // 8.4 + 6.72 - 8.0 = 7.12
    expect(scenario.riskLevel).toBe('CRITICAL'); // 7.12 < 7.2
    expect(scenario.safetyGap).toBe(-0.08);
  });
});
