import {
  WeatherData,
  FloodRiskAssessment,
  ClimateAssessmentResult,
  AssessmentHistoryItem,
  FoodSecuritySnapshot,
  DistrictRiskItem,
  ScenarioSimulationResult,
  GeocodeResult,
  AiInsightResult
} from './types';

export class ClimateRiskService {
  /**
   * Geocodes query into coordinates via Open-Meteo backend endpoint
   */
  static async geocodeLocation(query: string): Promise<GeocodeResult[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const res = await fetch(`/api/climate-risk/geocode?q=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Geocoding endpoint unreachable:', err);
    }
    return [];
  }

  /**
   * Fetches AI decision insight via backend OpenRouter AiClient
   */
  static async fetchAiInsight(payload: {
    location: string;
    crop: string;
    cropStage: string;
    overallRiskScore: number;
    floodScore: number;
    cropRiskScore: number;
    harvestCode: string;
    rainfallMm: number;
    mainThreat?: string;
  }): Promise<AiInsightResult> {
    try {
      const res = await fetch('/api/climate-risk/ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('AI insight endpoint unreachable:', err);
    }
    return {
      headline: payload.overallRiskScore >= 70
        ? `${payload.mainThreat || 'Heavy rainfall'} is the dominant near-term agricultural risk.`
        : `Weather conditions remain manageable for ${payload.crop} at ${payload.cropStage} stage.`,
      severity: payload.overallRiskScore >= 70 ? 'SEVERE' : payload.overallRiskScore >= 45 ? 'MODERATE' : 'LOW',
      actions: payload.overallRiskScore >= 70
        ? ['Protect field drainage channels immediately', 'Avoid spray/fertilizer applications before rain', 'Inspect low-lying plots & prepare harvest logistics']
        : ['Continue regular crop monitoring', 'Maintain optimal irrigation schedule', 'Ensure field drainage exits are cleared'],
      timing: 'Next 24–48 hours',
      source: 'RULE_BASED'
    };
  }

  /**
   * Fetches complete weather, flood risk, and climate assessment telemetry
   */
  static async fetchFullAssessment(
    location: string = 'Haldia, West Bengal',
    crop: string = 'Paddy',
    cropStage: string = 'Flowering',
    lat?: number,
    lon?: number
  ): Promise<{ weather: WeatherData; flood: FloodRiskAssessment; assessment: ClimateAssessmentResult }> {
    try {
      const res = await fetch('/api/climate-risk/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, crop, cropStage, lat, lon })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Backend API unreachable, using client-side fallback engine:', err);
    }

    // Client-side Fallback Generator if Server API is offline
    return this.generateFallbackAssessment(location, crop, cropStage);
  }

  /**
   * Fetches Food Security Snapshot overview
   */
  static async fetchFoodSecurityOverview(
    state: string = 'West Bengal',
    crop: string = 'Paddy'
  ): Promise<FoodSecuritySnapshot> {
    try {
      const res = await fetch(`/api/food-security/overview?state=${encodeURIComponent(state)}&crop=${encodeURIComponent(crop)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Backend Food Security API unreachable, using fallback:', err);
    }

    const currentStock = 8.4;
    const expectedProduction = 11.2;
    const estimatedClimateLoss = 3.1;
    const committedOutwardSupply = 8.0;
    const safetyThreshold = 7.2;
    const projectedDomesticAvailability = Number((currentStock + expectedProduction - estimatedClimateLoss - committedOutwardSupply).toFixed(2));

    return {
      id: 'fs-fallback',
      state,
      crop,
      currentStockLakhTonnes: currentStock,
      expectedProductionLakhTonnes: expectedProduction,
      estimatedClimateLossLakhTonnes: estimatedClimateLoss,
      committedOutwardSupplyLakhTonnes: committedOutwardSupply,
      projectedDomesticAvailabilityLakhTonnes: projectedDomesticAvailability,
      safetyStockThresholdLakhTonnes: safetyThreshold,
      riskLevel: projectedDomesticAvailability >= safetyThreshold ? 'NORMAL' : 'CRITICAL',
      advisoryText: 'Domestic supply remains above configured safety threshold. Continue monitoring commitments.',
      recommendedPolicyActions: [
        'Review projected crop losses',
        'Monitor district-level supply',
        'Review outward movement commitments'
      ],
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Runs dynamic What-If Disaster Scenario simulation
   */
  static async runScenarioSimulation(
    cropLossPercentage: number,
    state: string = 'West Bengal',
    crop: string = 'Paddy'
  ): Promise<ScenarioSimulationResult> {
    try {
      const res = await fetch('/api/food-security/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cropLossPercentage, state, crop })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Scenario API unreachable, calculating locally:', err);
    }

    const currentStock = 8.4;
    const baselineProduction = 11.2;
    const committedOutwardSupply = 8.0;
    const safetyStockThreshold = 7.2;

    const estimatedClimateLoss = Number(((baselineProduction * cropLossPercentage) / 100).toFixed(2));
    const effectiveProduction = Number((baselineProduction - estimatedClimateLoss).toFixed(2));
    const projectedDomesticAvailability = Number(
      (currentStock + effectiveProduction - committedOutwardSupply).toFixed(2)
    );
    const safetyGap = Number((projectedDomesticAvailability - safetyStockThreshold).toFixed(2));

    let riskLevel: 'NORMAL' | 'CAUTION' | 'CRITICAL' = 'NORMAL';
    if (projectedDomesticAvailability < safetyStockThreshold) riskLevel = 'CRITICAL';
    else if (projectedDomesticAvailability < safetyStockThreshold + 1.2) riskLevel = 'CAUTION';

    return {
      cropLossPercentage,
      currentStock,
      baselineProduction,
      estimatedClimateLoss,
      effectiveProduction,
      committedOutwardSupply,
      projectedDomesticAvailability,
      safetyStockThreshold,
      safetyGap,
      riskLevel,
      advisoryHeadline: riskLevel === 'CRITICAL' ? 'CRITICAL SUPPLY DEFICIT' : 'SURPLUS AVAILABILITY',
      tradeAdvisory: riskLevel === 'CRITICAL'
        ? 'Review outward movement and prioritize domestic supply requirements.'
        : 'Domestic supply remains above configured safety threshold.',
      recommendedActions: [
        'Review outward movement/export commitments',
        'Prioritize domestic food-security requirements',
        'Assess regional redistribution requirements'
      ]
    };
  }

  /**
   * Fetches district-wise risk breakdown
   */
  static async fetchDistrictRisks(state: string = 'West Bengal'): Promise<DistrictRiskItem[]> {
    try {
      const res = await fetch(`/api/food-security/districts?state=${encodeURIComponent(state)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn('Districts API unreachable, returning demo data:', err);
    }

    return [
      { district: 'Haldia', crop: 'Paddy', cropRiskLevel: 'HIGH', floodRiskLevel: 'SEVERE', estimatedLossPercentage: 35, dataSource: 'Demonstration / simulated data' },
      { district: 'Murshidabad', crop: 'Paddy', cropRiskLevel: 'HIGH', floodRiskLevel: 'HIGH', estimatedLossPercentage: 28, dataSource: 'Demonstration / simulated data' },
      { district: 'Burdwan', crop: 'Paddy', cropRiskLevel: 'MODERATE', floodRiskLevel: 'HIGH', estimatedLossPercentage: 18, dataSource: 'Demonstration / simulated data' },
      { district: 'Kharagpur', crop: 'Paddy', cropRiskLevel: 'LOW', floodRiskLevel: 'MODERATE', estimatedLossPercentage: 10, dataSource: 'Demonstration / simulated data' }
    ];
  }

  /**
   * Fetches historical risk logs
   */
  static async fetchHistory(): Promise<AssessmentHistoryItem[]> {
    return [
      { id: 'h-1', date: '08 Sep 2026', location: 'Haldia, West Bengal', crop: 'Paddy', climateRisk: 'HIGH (72)', floodRisk: 'SEVERE (82)', recommendation: 'Consider early harvest of mature crop' },
      { id: 'h-2', date: '05 Sep 2026', location: 'Haldia, West Bengal', crop: 'Paddy', climateRisk: 'LOW (24)', floodRisk: 'LOW (18)', recommendation: 'Normal harvest operations permitted' },
      { id: 'h-3', date: '01 Sep 2026', location: 'Ludhiana, Punjab', crop: 'Wheat', climateRisk: 'LOW (15)', floodRisk: 'LOW (10)', recommendation: 'Standard field management' }
    ];
  }

  /**
   * Fallback Generator for offline client-side rendering
   */
  private static generateFallbackAssessment(
    location: string,
    crop: string,
    cropStage: string
  ): { weather: WeatherData; flood: FloodRiskAssessment; assessment: ClimateAssessmentResult } {
    const isHaldia = location.toLowerCase().includes('haldia');

    const weather: WeatherData = {
      location: location || 'Haldia, West Bengal',
      latitude: 22.0667,
      longitude: 88.0667,
      temperatureCelsius: 29,
      humidityPercent: 78,
      rainfallProbability: 70,
      expectedRainfallMm: 42,
      windSpeedKmh: 18,
      condition: 'Partly Cloudy',
      feelsLikeCelsius: 32,
      pressureHpa: 1008,
      uvIndex: 6,
      visibilityKm: 8.5,
      updatedAt: new Date().toISOString(),
      source: 'DEMO_FALLBACK',
      hourly: [
        { time: '08:00', temp: 28, rainProb: 75, precipitation: 4.2, windSpeed: 16, condition: 'Heavy Rain' },
        { time: '11:00', temp: 30, rainProb: 80, precipitation: 8.5, windSpeed: 20, condition: 'Thunderstorm' },
        { time: '14:00', temp: 31, rainProb: 65, precipitation: 5.0, windSpeed: 18, condition: 'Rain Showers' },
        { time: '17:00', temp: 29, rainProb: 40, precipitation: 1.2, windSpeed: 14, condition: 'Cloudy' },
        { time: '20:00', temp: 27, rainProb: 20, precipitation: 0.0, windSpeed: 12, condition: 'Partly Cloudy' },
        { time: '23:00', temp: 26, rainProb: 15, precipitation: 0.0, windSpeed: 10, condition: 'Clear' }
      ],
      daily: [
        { date: '2026-09-08', dayName: 'MON', condition: 'Partly Cloudy', minTemp: 28, maxTemp: 34, rainProb: 70, precipitation: 18, windSpeed: 18, severity: 'HIGH' },
        { date: '2026-09-09', dayName: 'TUE', condition: 'Heavy Rain', minTemp: 27, maxTemp: 31, rainProb: 85, precipitation: 46, windSpeed: 22, severity: 'SEVERE' },
        { date: '2026-09-10', dayName: 'WED', condition: 'Thunderstorm', minTemp: 26, maxTemp: 30, rainProb: 90, precipitation: 58, windSpeed: 28, severity: 'SEVERE' },
        { date: '2026-09-11', dayName: 'THU', condition: 'Light Rain', minTemp: 27, maxTemp: 32, rainProb: 50, precipitation: 12, windSpeed: 16, severity: 'MODERATE' },
        { date: '2026-09-12', dayName: 'FRI', condition: 'Cloudy', minTemp: 28, maxTemp: 33, rainProb: 30, precipitation: 4, windSpeed: 14, severity: 'LOW' },
        { date: '2026-09-13', dayName: 'SAT', condition: 'Clear Sky', minTemp: 27, maxTemp: 34, rainProb: 15, precipitation: 0, windSpeed: 12, severity: 'LOW' },
        { date: '2026-09-14', dayName: 'SUN', condition: 'Sunny', minTemp: 28, maxTemp: 35, rainProb: 10, precipitation: 0, windSpeed: 10, severity: 'LOW' }
      ]
    };

    const flood: FloodRiskAssessment = {
      floodScore: isHaldia ? 82 : 45,
      riskLevel: isHaldia ? 'SEVERE' : 'MODERATE',
      reasons: [
        'Heavy rainfall expected within the next 48 hours.',
        'Multiple rainy days forecast.',
        'Area has historical flood susceptibility.',
        'Water level expected to rise in local drainage channels.'
      ],
      timeline: {
        h24: 'MODERATE',
        h48: 'HIGH',
        h72: isHaldia ? 'SEVERE' : 'MODERATE',
        d7: 'LOW'
      },
      dataSource: 'DEMONSTRATION_DATA',
      disclaimer: 'Flood risk is an early-warning assessment, not a guaranteed flood prediction.'
    };

    const assessment: ClimateAssessmentResult = {
      overallRiskScore: 72,
      overallRiskLevel: 'HIGH',
      floodRisk: flood,
      cropRisk: {
        cropName: crop,
        cropStage: cropStage,
        cropRiskScore: 68,
        cropRiskLevel: 'HIGH',
        factors: [
          'Heavy rainfall threat during active crop stage',
          'High exposure to flood conditions and water accumulation',
          'High humidity fungal conducive environment'
        ],
        potentialExposure: 'High potential exposure to excess moisture stress'
      },
      harvestAdvisory: {
        actionCode: 'CONSIDER EARLY HARVEST',
        headline: '⚠️ CONSIDER EARLY HARVEST',
        primaryReason: 'Heavy rainfall is expected within the next 48 hours and the crop is estimated to be near maturity.',
        actionSteps: [
          'Prepare harvesting equipment immediately.',
          'Inspect crop maturity across field sections.',
          'Harvest mature portion before severe rainfall begins.',
          'Move harvested grain to covered, elevated storage.'
        ]
      },
      farmerActionPlan: {
        today: [
          'Inspect field drainage outlets and bunds.',
          'Monitor rain forecast updates.',
          'Avoid applying liquid pesticides or fertilizers before rain.'
        ],
        next24h: [
          'Prepare harvesting equipment and tarpaulins.',
          'Secure dry covered storage space.',
          'Check grain moisture level if crop is mature.'
        ],
        next48h: [
          'Harvest mature crop sections if weather permits.',
          'Transport harvested yield to protected storage.',
          'Do NOT leave harvested produce exposed in open fields.'
        ],
        postEvent: [
          'Inspect field for standing water accumulation.',
          'Drain trapped water from crop roots.',
          'Record crop damage for insurance verification if required.'
        ]
      },
      operationalAdvisories: {
        spraying: { status: 'NOT RECOMMENDED', guidance: 'Not recommended — rain probability is high.' },
        irrigation: { status: 'STOP', guidance: 'Reduce irrigation — sufficient rainfall expected.' },
        fertilizer: { status: 'POSTPONE', guidance: 'Consider postponing application due to heavy rainfall.' },
        fieldWork: { status: 'AVOID', guidance: 'Avoid machinery operation during saturated soil conditions.' },
        drying: { status: 'NOT RECOMMENDED', guidance: 'Outdoor drying is not recommended for the next 24 hours.' }
      },
      procurementAdvisory: {
        riskLevel: 'CAUTION',
        recommendedWindow: 'Delay procurement dispatch by 48 Hours',
        guidance: 'Heavy rainfall may disrupt transportation and increase post-harvest spoilage risk. Prioritize procurement from lower-risk areas.'
      },
      storageAdvisory: {
        riskLevel: 'ELEVATED',
        guidance: 'Move harvested produce to covered storage. High humidity may increase spoilage risk.'
      },
      alerts: [
        {
          id: 'alt-1',
          title: '🌧️ Heavy Rain Alert',
          severity: 'CRITICAL',
          reason: 'Cumulative rainfall of 128 mm expected over next 7 days.',
          recommendedAction: 'Inspect field drainage channels immediately.',
          expectedTimeWindow: 'Next 48 Hours'
        },
        {
          id: 'alt-2',
          title: '🌊 Flood Risk Alert',
          severity: 'CRITICAL',
          reason: 'Flood risk score is 82/100 (SEVERE).',
          recommendedAction: 'Move harvested grain to safe elevated storage.',
          expectedTimeWindow: 'Next 72 Hours'
        }
      ],
      rainfallAnalysis: {
        todayMm: 18,
        tomorrowMm: 46,
        next3DaysMm: 122,
        next7DaysMm: 138,
        total7DayMm: 138,
        maxExpectedMm: 58,
        highestRainfallDay: 'Thursday — 58 mm',
        rainfallRiskLevel: 'HIGH',
        consecutiveRainyDays: 4,
        explanation: 'Heavy rainfall is expected within the next 48 hours.'
      }
    };

    return { weather, flood, assessment };
  }
}
