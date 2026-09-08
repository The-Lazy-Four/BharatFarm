// ============================================================
// BharatFarm "Before You Sow" — Shared TypeScript Types
// Price-Decrement Risk Analysis
// ============================================================

export type Season = 'Kharif' | 'Rabi' | 'Zaid' | 'Perennial';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
export type RiskDecision = 'PROCEED' | 'CAUTION' | 'CONSIDER_ALTERNATIVE' | 'AVOID';
export type DataConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT';
export type TrendDirection = 'INCREASING' | 'STABLE' | 'DECREASING' | 'INSUFFICIENT_DATA';
export type DataType = 'ACTUAL' | 'ESTIMATED' | 'PROXY' | 'MOCK';
export type CropRiskStatus = 'SUCCESS' | 'INSUFFICIENT_DATA' | 'ERROR';

export interface CropRiskLocation {
  district: string;
  state: string;
  block?: string;
  latitude?: number;
  longitude?: number;
}

export interface CropRiskRequest {
  location: CropRiskLocation;
  crop: string;
  season: Season;
}

export interface FarmerIntentionData {
  farmerCount: number;
  totalIntendedAreaHectares: number;
  averageAreaHectares: number;
  historicalBaselineHectares: number;
  areaChangePercent: number;
  dataType: DataType;
  source: string;
  asOf: string;
}

export interface SupplyAnalysis {
  currentIntendedAreaHectares: number;
  historicalAverageAreaHectares: number;
  areaChangePercent: number;
  yieldBenchmarkTonnesPerHectare: number;
  estimatedSupplyTonnes: number;
  historicalRequirementTonnes: number;
  supplyPressureRatio: number;
  surplusTonnes: number;
  surplusPercent: number;
  requirementDataType: DataType;
}

export interface HistoricalPattern {
  arrivalTrend: TrendDirection;
  priceTrendDuringHighArrivals: TrendDirection;
  averagePricePerQtl: number;
  priceVolatilityPercent: number;
  priceDecrementFrequencyPercent: number;
  yearsAnalyzed: number;
  historicalData: Array<{
    year: number;
    arrivalsTonnes: number;
    averagePricePerQtl: number;
  }>;
}

export interface NearbyMandi {
  mandiName: string;
  district: string;
  distanceKm: number;
  currentPricePerQtl?: number;
  priceTrend?: TrendDirection;
  dataFreshness: string;
}

export interface AlternativeCrop {
  crop: string;
  riskLevel: RiskLevel;
  riskProbability: number;
  supplyPressure: RiskLevel;
  seasonFit: 'HIGH' | 'MEDIUM' | 'LOW';
  reasoning: string;
}

export interface DataSource {
  name: string;
  dataType: DataType;
  asOf: string;
  description: string;
}

export interface CropRiskAnalysis {
  status: CropRiskStatus;
  crop: string;
  location: {
    district: string;
    state: string;
  };
  season: Season;
  risk: {
    level: RiskLevel;
    probability: number;
    meaning: string;
  };
  farmerIntention: FarmerIntentionData;
  supply: SupplyAnalysis;
  historicalPattern: HistoricalPattern;
  nearbyMandis: NearbyMandi[];
  riskFactors: string[];
  decision: RiskDecision;
  decisionExplanation: string;
  alternativeCrops: AlternativeCrop[];
  llmExplanation: string;
  confidence: number;
  dataConfidence: DataConfidence;
  dataSources: DataSource[];
  analysisTimestamp: string;
  cacheHit?: boolean;
  insufficientDataReason?: string;
}

export interface WhatIfSimulationRequest {
  baseAnalysis: CropRiskAnalysis;
  additionalAreaPercent: number;
}

export interface WhatIfSimulationResult {
  additionalAreaPercent: number;
  newIntendedAreaHectares: number;
  newEstimatedSupplyTonnes: number;
  newSupplyPressureRatio: number;
  newSurplusPercent: number;
  newRiskProbability: number;
  newRiskLevel: RiskLevel;
}

export interface FarmerFieldRegistration {
  userId: string;
  fieldName: string;
  crop: string;
  landSizeAcres: number;
  district: string;
  state: string;
  block?: string;
  latitude?: number;
  longitude?: number;
  registeredAt: string;
}
