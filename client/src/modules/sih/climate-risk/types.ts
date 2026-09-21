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

export interface GeminiActionItem {
  id: string;
  priority: 'HIGH' | 'IMPORTANT' | 'NORMAL';
  title: string;
  description: string;
  timing: string;
  icon: 'drainage' | 'harvest' | 'protect' | 'cart' | 'spray' | 'monitor' | 'seed' | 'tools' | 'fertilizer' | string;
}

export interface GeminiBuyItem {
  name: string;
  reason: string;
  urgency: 'HIGH' | 'NORMAL';
  category: 'fertilizer' | 'seeds' | 'pesticides' | 'tools' | 'storage' | string;
}

export interface GeminiWarning {
  show: boolean;
  title: string;
  headline: string;
  subtext: string;
}

export interface GeminiDecisionPlan {
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  riskTitle: string;
  riskTimeline: string;
  riskSummary: string;
  aiExplanation: string;
  whyReasoningSummary: string;
  decisionFactors: string[];
  actions: GeminiActionItem[];
  buyItems: GeminiBuyItem[];
  whyBuyNow?: string;
  warning?: GeminiWarning;
  weatherSummary?: {
    temperature: number;
    condition: string;
    rainfallProbability: number;
    expectedRainfallMm: number;
  };
  updatedAt: string;
  source?: 'GEMINI_AI' | 'RULE_BASED' | 'DEMO';
}

export interface WhatChangedDiff {
  changed: boolean;
  rainDiff?: { from: number; to: number };
  riskDiff?: { from: string; to: string };
  cropDiff?: { crop: string; stage: string };
  completedDiff?: { actionTitle: string };
}

export interface GovtProcurementNeed {
  item: string;
  need: string;
  urgency: 'HIGH' | 'IMPORTANT' | 'NORMAL';
}

export interface GovtTransportAlert {
  show: boolean;
  title?: string;
  text: string;
}

export interface GovtStorageAlert {
  show: boolean;
  title?: string;
  text: string;
}

export interface GovtGeminiDecisionPlan {
  planTitle: string;
  subtitle?: string;
  riskSummary: string;
  hasUrgentAction?: boolean;
  actions: GeminiActionItem[];
  procurementNeeds: GovtProcurementNeed[];
  transportAlert?: GovtTransportAlert;
  storageAlert?: GovtStorageAlert;
  warning?: GeminiWarning;
  updatedAt?: string;
  source?: 'GEMINI_AI' | 'RULE_BASED' | 'DEMO';
}


