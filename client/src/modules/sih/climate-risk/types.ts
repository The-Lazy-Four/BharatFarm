export interface HourlyForecastItem {
  time: string;
  temp: number;
  rainProb: number;
  precipitation: number;
  windSpeed: number;
  condition: string;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  condition: string;
  minTemp: number;
  maxTemp: number;
  rainProb: number;
  precipitation: number;
  windSpeed: number;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
}

export interface WeatherData {
  location: string;
  latitude: number;
  longitude: number;
  temperatureCelsius: number;
  humidityPercent: number;
  rainfallProbability: number;
  expectedRainfallMm: number;
  windSpeedKmh: number;
  condition: string;
  feelsLikeCelsius: number;
  pressureHpa?: number;
  uvIndex?: number;
  visibilityKm?: number;
  updatedAt: string;
  source: 'LIVE_OPEN_METEO' | 'DEMO_FALLBACK';
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
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

export interface GeocodeResult {
  name: string;
  admin1: string;
  country: string;
  displayName: string;
  latitude: number;
  longitude: number;
}

export interface AiInsightResult {
  headline: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  actions: string[];
  timing: string;
  source: 'OPENROUTER_AI' | 'RULE_BASED';
}

export interface BestWorkWindow {
  window: string;
  condition: string;
  tempRange: string;
  suitability: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  safeActivities: string[];
  avoidWindow?: string;
  avoidReason?: string;
}

export type HarvestRecommendationCode =
  | 'NORMAL HARVEST'
  | 'MONITOR CONDITIONS'
  | 'PREPARE FOR HARVEST'
  | 'CONSIDER EARLY HARVEST'
  | 'DELAY HARVEST'
  | 'PROTECT FIELD / IMPROVE DRAINAGE';

export interface ClimateAlert {
  id: string;
  title: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  reason: string;
  recommendedAction: string;
  expectedTimeWindow: string;
}

export interface ClimateAssessmentResult {
  overallRiskScore: number;
  overallRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  floodRisk: FloodRiskAssessment;
  cropRisk: {
    cropName: string;
    cropStage: string;
    cropRiskScore: number;
    cropRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
    factors: string[];
    potentialExposure: string;
  };
  harvestAdvisory: {
    actionCode: HarvestRecommendationCode;
    recommendationCode?: string;
    headline: string;
    primaryReason: string;
    actionSteps: string[];
  };
  farmerActionPlan: {
    today: string[];
    next24h: string[];
    next48h: string[];
    postEvent: string[];
  };
  operationalAdvisories: {
    spraying: { status: 'SAFE' | 'CAUTION' | 'NOT RECOMMENDED'; guidance: string };
    irrigation: { status: 'NORMAL' | 'REDUCE' | 'STOP'; guidance: string };
    fertilizer: { status: 'PROCEED' | 'POSTPONE'; guidance: string };
    fieldWork: { status: 'PERMITTED' | 'AVOID'; guidance: string };
    drying: { status: 'RECOMMENDED' | 'NOT RECOMMENDED'; guidance: string };
  };
  procurementAdvisory: {
    riskLevel: 'LOW' | 'CAUTION' | 'HIGH RISK';
    recommendedWindow: string;
    guidance: string;
  };
  storageAdvisory: {
    riskLevel: 'MINIMAL' | 'ELEVATED' | 'HIGH RISK';
    guidance: string;
  };
  alerts: ClimateAlert[];
  rainfallAnalysis: {
    todayMm: number;
    tomorrowMm: number;
    next3DaysMm: number;
    next7DaysMm: number;
    total7DayMm: number;
    maxExpectedMm: number;
    highestRainfallDay: string;
    rainfallRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
    consecutiveRainyDays: number;
    explanation: string;
  };
}

export interface AssessmentHistoryItem {
  id: string;
  date: string;
  location: string;
  crop: string;
  climateRisk: string;
  floodRisk: string;
  recommendation: string;
}

export interface FoodSecuritySnapshot {
  id: string;
  state: string;
  district?: string;
  crop: string;
  currentStockLakhTonnes: number;
  expectedProductionLakhTonnes: number;
  estimatedClimateLossLakhTonnes: number;
  committedOutwardSupplyLakhTonnes: number;
  projectedDomesticAvailabilityLakhTonnes: number;
  safetyStockThresholdLakhTonnes: number;
  riskLevel: 'NORMAL' | 'CAUTION' | 'CRITICAL';
  advisoryText: string;
  recommendedPolicyActions: string[];
  updatedAt: string;
}

export interface DistrictRiskItem {
  district: string;
  crop: string;
  cropRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  floodRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  estimatedLossPercentage: number;
  dataSource: string;
}

export interface ScenarioSimulationResult {
  cropLossPercentage: number;
  currentStock: number;
  baselineProduction: number;
  estimatedClimateLoss: number;
  effectiveProduction: number;
  committedOutwardSupply: number;
  projectedDomesticAvailability: number;
  safetyStockThreshold: number;
  safetyGap: number;
  riskLevel: 'NORMAL' | 'CAUTION' | 'CRITICAL';
  advisoryHeadline: string;
  tradeAdvisory: string;
  recommendedActions: string[];
}
