import { Request, Response } from 'express';
import { AiClient } from '../utils/aiClient.js';
import { AiCache } from '../utils/aiCache.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import {
  CropRiskRequest,
  CropRiskAnalysis,
  CropRiskStatus,
  RiskLevel,
  Season,
  DataConfidence,
  FarmerIntentionData,
  SupplyAnalysis,
  HistoricalPattern,
  NearbyMandi,
  AlternativeCrop,
  WhatIfSimulationRequest,
  WhatIfSimulationResult
} from '@bharatfarm/shared';

// ============================================================
// RISK THRESHOLDS — configurable
// ============================================================
const RISK_THRESHOLDS = {
  LOW: { maxProbability: 35, maxSurplusPercent: 5 },
  MODERATE: { maxProbability: 55, maxSurplusPercent: 15 },
  HIGH: { maxProbability: 75, maxSurplusPercent: 30 },
  VERY_HIGH: { maxProbability: 100, maxSurplusPercent: Infinity }
};

// Price decrement = observed harvest-period price falls >15% below historical average
const PRICE_DECREMENT_THRESHOLD_PERCENT = 15;

// ============================================================
// MOCK DATA ENGINE
// Keyed by normalised location+crop+season
// NOTE: Replace with real DB queries in Phase 2
// ============================================================

interface MockIntentionRecord {
  farmerCount: number;
  totalIntendedAreaHectares: number;
  historicalBaselineHectares: number;
  yieldBenchmarkTonnesPerHectare: number;
  historicalRequirementTonnes: number;
  historicalPricePerQtl: number;
  historicalVolatilityPercent: number;
  historicalDecrementFrequencyPercent: number;
  historicalData: Array<{ year: number; arrivalsTonnes: number; averagePricePerQtl: number }>;
  nearbyMandis: NearbyMandi[];
}

const MOCK_INTENTION_DB: Record<string, MockIntentionRecord> = {
  'purba_medinipur|tomato|kharif': {
    farmerCount: 1245,
    totalIntendedAreaHectares: 1250,
    historicalBaselineHectares: 920,
    yieldBenchmarkTonnesPerHectare: 10,
    historicalRequirementTonnes: 10000,
    historicalPricePerQtl: 2400,
    historicalVolatilityPercent: 28,
    historicalDecrementFrequencyPercent: 62,
    historicalData: [
      { year: 2023, arrivalsTonnes: 8000, averagePricePerQtl: 2400 },
      { year: 2024, arrivalsTonnes: 9500, averagePricePerQtl: 2150 },
      { year: 2025, arrivalsTonnes: 11000, averagePricePerQtl: 1850 }
    ],
    nearbyMandis: [
      { mandiName: 'Haldia APMC', district: 'Purba Medinipur', distanceKm: 12, currentPricePerQtl: 2650, priceTrend: 'STABLE', dataFreshness: '2026-09-08' },
      { mandiName: 'Contai Mandi', district: 'Purba Medinipur', distanceKm: 28, currentPricePerQtl: 2520, priceTrend: 'DECREASING', dataFreshness: '2026-09-07' },
      { mandiName: 'Kolkata Koley Market', district: 'Kolkata', distanceKm: 90, currentPricePerQtl: 2800, priceTrend: 'INCREASING', dataFreshness: '2026-09-08' }
    ]
  },
  'nashik|tomato|kharif': {
    farmerCount: 3200,
    totalIntendedAreaHectares: 2800,
    historicalBaselineHectares: 2100,
    yieldBenchmarkTonnesPerHectare: 12,
    historicalRequirementTonnes: 28000,
    historicalPricePerQtl: 1800,
    historicalVolatilityPercent: 35,
    historicalDecrementFrequencyPercent: 70,
    historicalData: [
      { year: 2023, arrivalsTonnes: 22000, averagePricePerQtl: 2100 },
      { year: 2024, arrivalsTonnes: 26000, averagePricePerQtl: 1700 },
      { year: 2025, arrivalsTonnes: 30000, averagePricePerQtl: 1200 }
    ],
    nearbyMandis: [
      { mandiName: 'Lasalgaon APMC', district: 'Nashik', distanceKm: 42, currentPricePerQtl: 2650, priceTrend: 'STABLE', dataFreshness: '2026-09-08' },
      { mandiName: 'Pimpalgaon Mandi', district: 'Nashik', distanceKm: 55, currentPricePerQtl: 2520, priceTrend: 'DECREASING', dataFreshness: '2026-09-08' },
      { mandiName: 'Nashik APMC', district: 'Nashik', distanceKm: 61, currentPricePerQtl: 2410, priceTrend: 'STABLE', dataFreshness: '2026-09-07' }
    ]
  },
  'ludhiana|wheat|rabi': {
    farmerCount: 8500,
    totalIntendedAreaHectares: 12000,
    historicalBaselineHectares: 11500,
    yieldBenchmarkTonnesPerHectare: 5,
    historicalRequirementTonnes: 65000,
    historicalPricePerQtl: 2300,
    historicalVolatilityPercent: 8,
    historicalDecrementFrequencyPercent: 12,
    historicalData: [
      { year: 2023, arrivalsTonnes: 58000, averagePricePerQtl: 2275 },
      { year: 2024, arrivalsTonnes: 60000, averagePricePerQtl: 2310 },
      { year: 2025, arrivalsTonnes: 61000, averagePricePerQtl: 2350 }
    ],
    nearbyMandis: [
      { mandiName: 'Khanna Asia Largest APMC', district: 'Ludhiana', distanceKm: 14, currentPricePerQtl: 2380, priceTrend: 'INCREASING', dataFreshness: '2026-09-08' },
      { mandiName: 'Ludhiana Central APMC', district: 'Ludhiana', distanceKm: 8, currentPricePerQtl: 2300, priceTrend: 'STABLE', dataFreshness: '2026-09-08' }
    ]
  }
};

// Fallback generic mock for any district+crop+season not in the DB
function buildFallbackMock(crop: string, season: string): MockIntentionRecord {
  const seedRng = (str: string) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    return Math.abs(h) / 2147483647;
  };
  const r = seedRng(`${crop}${season}`);
  const base = 500 + Math.floor(r * 600);
  const intended = Math.floor(base * (1 + r * 0.5));
  return {
    farmerCount: 80 + Math.floor(r * 200),
    totalIntendedAreaHectares: intended,
    historicalBaselineHectares: base,
    yieldBenchmarkTonnesPerHectare: 8 + Math.floor(r * 6),
    historicalRequirementTonnes: base * 8,
    historicalPricePerQtl: 1500 + Math.floor(r * 2000),
    historicalVolatilityPercent: 10 + Math.floor(r * 25),
    historicalDecrementFrequencyPercent: 20 + Math.floor(r * 50),
    historicalData: [
      { year: 2023, arrivalsTonnes: base * 7, averagePricePerQtl: 1800 + Math.floor(r * 800) },
      { year: 2024, arrivalsTonnes: base * 8, averagePricePerQtl: 1700 + Math.floor(r * 600) },
      { year: 2025, arrivalsTonnes: intended * 9, averagePricePerQtl: 1600 + Math.floor(r * 400) }
    ],
    nearbyMandis: []
  };
}

// ============================================================
// DETERMINISTIC CALCULATION ENGINE
// ============================================================

function buildFarmerIntention(record: MockIntentionRecord): FarmerIntentionData {
  const areaChangePercent = parseFloat(
    (((record.totalIntendedAreaHectares - record.historicalBaselineHectares) / record.historicalBaselineHectares) * 100).toFixed(1)
  );
  return {
    farmerCount: record.farmerCount,
    totalIntendedAreaHectares: record.totalIntendedAreaHectares,
    averageAreaHectares: parseFloat((record.totalIntendedAreaHectares / record.farmerCount).toFixed(2)),
    historicalBaselineHectares: record.historicalBaselineHectares,
    areaChangePercent,
    dataType: 'MOCK',
    source: 'BharatFarm Farmer Intention Registry',
    asOf: new Date().toISOString().split('T')[0]
  };
}

function buildSupplyAnalysis(record: MockIntentionRecord): SupplyAnalysis {
  const areaChangePercent = parseFloat(
    (((record.totalIntendedAreaHectares - record.historicalBaselineHectares) / record.historicalBaselineHectares) * 100).toFixed(1)
  );
  const estimatedSupplyTonnes = Math.round(record.totalIntendedAreaHectares * record.yieldBenchmarkTonnesPerHectare);
  const surplusTonnes = Math.max(0, estimatedSupplyTonnes - record.historicalRequirementTonnes);
  const surplusPercent = parseFloat(((surplusTonnes / record.historicalRequirementTonnes) * 100).toFixed(1));
  const supplyPressureRatio = parseFloat((estimatedSupplyTonnes / record.historicalRequirementTonnes).toFixed(2));

  return {
    currentIntendedAreaHectares: record.totalIntendedAreaHectares,
    historicalAverageAreaHectares: record.historicalBaselineHectares,
    areaChangePercent,
    yieldBenchmarkTonnesPerHectare: record.yieldBenchmarkTonnesPerHectare,
    estimatedSupplyTonnes,
    historicalRequirementTonnes: record.historicalRequirementTonnes,
    supplyPressureRatio,
    surplusTonnes,
    surplusPercent,
    requirementDataType: 'PROXY'
  };
}

function buildHistoricalPattern(record: MockIntentionRecord): HistoricalPattern {
  const data = record.historicalData;
  // Deterministic trend detection
  const arrivalIncreasing = data.length >= 2 && data[data.length - 1].arrivalsTonnes > data[0].arrivalsTonnes;
  const priceDecreasing = data.length >= 2 && data[data.length - 1].averagePricePerQtl < data[0].averagePricePerQtl;

  return {
    arrivalTrend: arrivalIncreasing ? 'INCREASING' : 'STABLE',
    priceTrendDuringHighArrivals: priceDecreasing ? 'DECREASING' : 'STABLE',
    averagePricePerQtl: record.historicalPricePerQtl,
    priceVolatilityPercent: record.historicalVolatilityPercent,
    priceDecrementFrequencyPercent: record.historicalDecrementFrequencyPercent,
    yearsAnalyzed: data.length,
    historicalData: data
  };
}

/**
 * Deterministic risk probability calculation.
 * DOES NOT use LLM for arithmetic.
 */
function calculateRiskProbability(supply: SupplyAnalysis, history: HistoricalPattern, farmerCount: number): number {
  let score = 0;

  // Signal 1: Area growth vs baseline (weight: 35%)
  const areaScore = Math.min(100, Math.max(0, supply.areaChangePercent * 1.5));
  score += areaScore * 0.35;

  // Signal 2: Supply pressure ratio (weight: 30%)
  const pressureScore = Math.min(100, Math.max(0, (supply.supplyPressureRatio - 1) * 200));
  score += pressureScore * 0.30;

  // Signal 3: Historical decrement frequency (weight: 20%)
  score += history.priceDecrementFrequencyPercent * 0.20;

  // Signal 4: Historical arrival trend (weight: 10%)
  if (history.arrivalTrend === 'INCREASING') score += 10 * 0.10;

  // Signal 5: Volatility (weight: 5%)
  const volatilityScore = Math.min(100, history.priceVolatilityPercent * 2);
  score += volatilityScore * 0.05;

  return Math.min(99, Math.max(1, Math.round(score)));
}

function probabilityToRiskLevel(probability: number): RiskLevel {
  if (probability <= 35) return 'LOW';
  if (probability <= 55) return 'MODERATE';
  if (probability <= 75) return 'HIGH';
  return 'VERY_HIGH';
}

function riskToDecision(level: RiskLevel): string {
  switch (level) {
    case 'LOW': return 'PROCEED';
    case 'MODERATE': return 'CAUTION';
    case 'HIGH': return 'CONSIDER_ALTERNATIVE';
    case 'VERY_HIGH': return 'AVOID';
  }
}

function calculateDataConfidence(record: MockIntentionRecord, farmerCount: number): DataConfidence {
  // In Phase 1 all data is MOCK — confidence is MEDIUM by default
  if (farmerCount < 50) return 'LOW';
  if (record.historicalData.length < 2) return 'LOW';
  return 'MEDIUM';
}

// Alternative crops per season with basic metadata
const SEASON_ALTERNATIVES: Record<string, Array<{ crop: string; seasonFit: 'HIGH' | 'MEDIUM' | 'LOW' }>> = {
  Kharif: [
    { crop: 'Cucumber', seasonFit: 'HIGH' },
    { crop: 'Chilli', seasonFit: 'HIGH' },
    { crop: 'Brinjal', seasonFit: 'HIGH' },
    { crop: 'Bitter Gourd', seasonFit: 'HIGH' },
    { crop: 'Ridge Gourd', seasonFit: 'MEDIUM' }
  ],
  Rabi: [
    { crop: 'Mustard', seasonFit: 'HIGH' },
    { crop: 'Peas', seasonFit: 'HIGH' },
    { crop: 'Garlic', seasonFit: 'HIGH' },
    { crop: 'Coriander', seasonFit: 'MEDIUM' }
  ],
  Zaid: [
    { crop: 'Watermelon', seasonFit: 'HIGH' },
    { crop: 'Muskmelon', seasonFit: 'HIGH' },
    { crop: 'Bottle Gourd', seasonFit: 'HIGH' }
  ],
  Perennial: [
    { crop: 'Banana', seasonFit: 'HIGH' },
    { crop: 'Papaya', seasonFit: 'HIGH' }
  ]
};

function buildAlternatives(
  crop: string,
  season: Season,
  district: string,
  state: string
): AlternativeCrop[] {
  const candidates = SEASON_ALTERNATIVES[season] || SEASON_ALTERNATIVES['Kharif'];
  return candidates
    .filter(c => c.crop.toLowerCase() !== crop.toLowerCase())
    .slice(0, 4)
    .map((candidate) => {
      const key = `${district.toLowerCase().replace(/\s+/g, '_')}|${candidate.crop.toLowerCase()}|${season.toLowerCase()}`;
      const altRecord = MOCK_INTENTION_DB[key] || buildFallbackMock(candidate.crop, season);
      const altSupply = buildSupplyAnalysis(altRecord);
      const altHistory = buildHistoricalPattern(altRecord);
      const altProb = calculateRiskProbability(altSupply, altHistory, altRecord.farmerCount);
      const altRisk = probabilityToRiskLevel(altProb);
      return {
        crop: candidate.crop,
        riskLevel: altRisk,
        riskProbability: altProb,
        supplyPressure: altRisk,
        seasonFit: candidate.seasonFit,
        reasoning: ''
      };
    })
    .sort((a, b) => a.riskProbability - b.riskProbability);
}

// ============================================================
// LLM PROMPT BUILDER — structured evidence only
// ============================================================

function buildLlmContext(
  crop: string,
  location: { district: string; state: string },
  season: Season,
  farmer: FarmerIntentionData,
  supply: SupplyAnalysis,
  history: HistoricalPattern,
  riskProbability: number,
  riskLevel: RiskLevel,
  alternatives: AlternativeCrop[]
): string {
  return `You are an expert agricultural market analyst for India.

You have been given VERIFIED STRUCTURED DATA about a crop's supply-pressure risk situation. Your task is to interpret this evidence and produce a clear, farmer-friendly risk explanation in STRICT JSON format.

IMPORTANT RULES:
1. Use ONLY the data provided below. Do NOT invent any numbers.
2. Never state that prices WILL fall. Use probabilistic language.
3. Never guarantee profit or loss.
4. Return ONLY valid JSON, no markdown fences.

== EVIDENCE ==

Location: ${location.district}, ${location.state}
Crop: ${crop}
Season: ${season}

Farmer Intention Data (aggregated, anonymised):
- Active farmers intending to cultivate: ${farmer.farmerCount}
- Total intended cultivation area: ${farmer.totalIntendedAreaHectares} hectares
- Historical seasonal baseline: ${farmer.historicalBaselineHectares} hectares
- Area change from baseline: ${farmer.areaChangePercent > 0 ? '+' : ''}${farmer.areaChangePercent}%

Supply Estimates:
- Yield benchmark: ${supply.yieldBenchmarkTonnesPerHectare} tonnes/hectare (industry benchmark)
- Estimated expected production: ${supply.estimatedSupplyTonnes} tonnes (labelled ESTIMATED)
- Historical market absorption proxy: ${supply.historicalRequirementTonnes} tonnes (labelled PROXY)
- Supply pressure ratio: ${supply.supplyPressureRatio}x
- Potential surplus: ${supply.surplusTonnes} tonnes (${supply.surplusPercent}%)

Historical Pattern (${history.yearsAnalyzed} years):
${history.historicalData.map(d => `  ${d.year}: ${d.arrivalsTonnes} tonnes arrived, avg price ₹${d.averagePricePerQtl}/qtl`).join('\n')}
- Arrival trend: ${history.arrivalTrend}
- Price trend during high arrivals: ${history.priceTrendDuringHighArrivals}
- Historical price volatility: ${history.priceVolatilityPercent}%
- Historical price-decrement frequency: ${history.priceDecrementFrequencyPercent}%

Calculated Risk:
- Risk probability: ${riskProbability}% (estimated price-pressure risk)
- Risk level: ${riskLevel}

Alternative crops with lower risk (pre-calculated):
${alternatives.map(a => `- ${a.crop}: ${a.riskLevel} risk (${a.riskProbability}%), Season fit: ${a.seasonFit}`).join('\n')}

== REQUIRED JSON OUTPUT FORMAT ==

Return EXACTLY this JSON structure (fill in your reasoning, do not change field names or add extra fields):

{
  "riskFactors": ["string1", "string2", "string3"],
  "decisionExplanation": "1-2 farmer-friendly sentences explaining the decision",
  "llmExplanation": "2-3 sentences explaining the evidence and uncertainty in simple farmer language",
  "alternativeCropReasoning": {"CropName": "Why this alternative may be safer (1 sentence each)"}
}`;
}

// ============================================================
// WHAT-IF SIMULATION (pure deterministic, no LLM)
// ============================================================

function computeWhatIf(base: CropRiskAnalysis, additionalAreaPercent: number): WhatIfSimulationResult {
  const additionalArea = base.supply.currentIntendedAreaHectares * (additionalAreaPercent / 100);
  const newIntendedArea = base.supply.currentIntendedAreaHectares + additionalArea;
  const newSupply = Math.round(newIntendedArea * base.supply.yieldBenchmarkTonnesPerHectare);
  const newRatio = parseFloat((newSupply / base.supply.historicalRequirementTonnes).toFixed(2));
  const newSurplusTonnes = Math.max(0, newSupply - base.supply.historicalRequirementTonnes);
  const newSurplusPercent = parseFloat(((newSurplusTonnes / base.supply.historicalRequirementTonnes) * 100).toFixed(1));

  // Re-run risk score with new area growth
  const newAreaChangePercent = ((newIntendedArea - base.supply.historicalAverageAreaHectares) / base.supply.historicalAverageAreaHectares) * 100;
  const areaScore = Math.min(100, Math.max(0, newAreaChangePercent * 1.5));
  const pressureScore = Math.min(100, Math.max(0, (newRatio - 1) * 200));
  let newProb = areaScore * 0.35 + pressureScore * 0.30 +
    base.historicalPattern.priceDecrementFrequencyPercent * 0.20 +
    (base.historicalPattern.arrivalTrend === 'INCREASING' ? 10 * 0.10 : 0) +
    Math.min(100, base.historicalPattern.priceVolatilityPercent * 2) * 0.05;
  newProb = Math.min(99, Math.max(1, Math.round(newProb)));

  return {
    additionalAreaPercent,
    newIntendedAreaHectares: Math.round(newIntendedArea),
    newEstimatedSupplyTonnes: newSupply,
    newSupplyPressureRatio: newRatio,
    newSurplusPercent,
    newRiskProbability: newProb,
    newRiskLevel: probabilityToRiskLevel(newProb)
  };
}

// ============================================================
// CONTROLLER
// ============================================================

export class CropRiskController {

  /**
   * POST /api/crop-risk/analyze
   * Main analysis endpoint.
   */
  analyzeCropRisk = async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body as CropRiskRequest;

      // -- Validate inputs
      if (!body?.location?.district || !body?.location?.state || !body?.crop || !body?.season) {
        ApiResponse.error(res, 'Missing required fields: location.district, location.state, crop, season', 'VALIDATION_ERROR');
        return;
      }

      const district = body.location.district.trim();
      const state = body.location.state.trim();
      const crop = body.location ? body.crop.trim() : '';
      const season = body.season as Season;

      if (!['Kharif', 'Rabi', 'Zaid', 'Perennial'].includes(season)) {
        ApiResponse.error(res, 'Invalid season. Must be: Kharif, Rabi, Zaid, or Perennial', 'VALIDATION_ERROR');
        return;
      }

      // -- Cache check
      const cacheKey = AiCache.createFingerprint('crop_risk_v1', {
        district: district.toLowerCase(),
        state: state.toLowerCase(),
        crop: crop.toLowerCase(),
        season: season.toLowerCase()
      });

      const cached = AiCache.get<CropRiskAnalysis>(cacheKey);
      if (cached) {
        ApiResponse.success(res, { ...cached, cacheHit: true });
        return;
      }

      // -- Look up mock intention data
      const dbKey = `${district.toLowerCase().replace(/\s+/g, '_')}|${crop.toLowerCase()}|${season.toLowerCase()}`;
      const record = MOCK_INTENTION_DB[dbKey] || buildFallbackMock(crop, season);

      // -- DETERMINISTIC CALCULATIONS (no LLM involvement)
      const farmerIntention = buildFarmerIntention(record);
      const supply = buildSupplyAnalysis(record);
      const historicalPattern = buildHistoricalPattern(record);
      const riskProbability = calculateRiskProbability(supply, historicalPattern, farmerIntention.farmerCount);
      const riskLevel = probabilityToRiskLevel(riskProbability);
      const decision = riskToDecision(riskLevel);
      const dataConfidence = calculateDataConfidence(record, farmerIntention.farmerCount);
      const alternatives = buildAlternatives(crop, season, district, state);

      // -- LLM CALL — interpretation only, no arithmetic
      let llmExplanation = 'Based on current BharatFarm farmer activity and historical patterns, this risk assessment was generated.';
      let riskFactors = [
        `Current intended cultivation area is ${Math.abs(farmerIntention.areaChangePercent)}% ${farmerIntention.areaChangePercent > 0 ? 'above' : 'below'} the historical seasonal baseline`,
        `Estimated supply may ${supply.supplyPressureRatio > 1 ? 'exceed' : 'meet'} historical market absorption`,
        `Historical data shows ${historicalPattern.priceDecrementFrequencyPercent}% price-decrement frequency in high-arrival seasons`
      ];
      let decisionExplanation = 'Monitor cultivation activity closely as conditions evolve.';
      const altReasoningMap: Record<string, string> = {};

      if (AiClient.isConfigured()) {
        try {
          const prompt = buildLlmContext(crop, { district, state }, season, farmerIntention, supply, historicalPattern, riskProbability, riskLevel, alternatives);

          const llmRaw = await AiClient.chat(
            [{ role: 'user', content: prompt }],
            { model: 'google/gemini-2.5-flash', maxTokens: 800, responseFormat: 'json_object' }
          );

          const parsed = AiClient.parseJsonResponse<{
            riskFactors: string[];
            decisionExplanation: string;
            llmExplanation: string;
            alternativeCropReasoning: Record<string, string>;
          }>(llmRaw);

          if (parsed.riskFactors?.length) riskFactors = parsed.riskFactors;
          if (parsed.decisionExplanation) decisionExplanation = parsed.decisionExplanation;
          if (parsed.llmExplanation) llmExplanation = parsed.llmExplanation;
          if (parsed.alternativeCropReasoning) Object.assign(altReasoningMap, parsed.alternativeCropReasoning);
        } catch (err: any) {
          logger.warn('[CropRisk] LLM call failed, using deterministic fallback explanation', err.message);
          // Fallback remains the deterministic text above — do NOT abort the request
        }
      }

      // Attach LLM alt-crop reasoning to alternatives list
      const enrichedAlternatives = alternatives.map(a => ({
        ...a,
        reasoning: altReasoningMap[a.crop] || `${a.crop} currently shows ${a.riskLevel} supply-pressure risk with ${a.seasonFit} seasonal suitability.`
      }));

      const riskMeaning: Record<string, string> = {
        LOW: 'Low estimated price-pressure risk. Cultivation conditions appear favourable.',
        MODERATE: 'Moderate price-pressure risk. Monitor market developments before committing.',
        HIGH: 'High estimated price-pressure risk. Excess local supply may put downward pressure on prices.',
        VERY_HIGH: 'Very high price-pressure risk. Significantly elevated supply relative to historical market capacity.'
      };

      const result: CropRiskAnalysis = {
        status: 'SUCCESS' as CropRiskStatus,
        crop,
        location: { district, state },
        season,
        risk: {
          level: riskLevel,
          probability: riskProbability,
          meaning: riskMeaning[riskLevel]
        },
        farmerIntention,
        supply,
        historicalPattern,
        nearbyMandis: record.nearbyMandis,
        riskFactors,
        decision: decision as any,
        decisionExplanation,
        alternativeCrops: enrichedAlternatives,
        llmExplanation,
        confidence: riskProbability,
        dataConfidence,
        dataSources: [
          { name: 'BharatFarm Farmer Intention Registry', dataType: 'MOCK', asOf: new Date().toISOString().split('T')[0], description: 'Aggregated farmer cultivation intentions (Phase 1 simulation)' },
          { name: 'Historical Mandi Arrivals', dataType: 'PROXY', asOf: '2025-12-31', description: 'Historical arrival data proxy from agricultural statistics' },
          { name: 'Yield Benchmark Database', dataType: 'ESTIMATED', asOf: '2025-12-31', description: 'Industry-standard crop yield benchmarks by region' }
        ],
        analysisTimestamp: new Date().toISOString(),
        cacheHit: false
      };

      // Cache for 2 hours
      AiCache.set(cacheKey, result, 2 * 60 * 60 * 1000);
      ApiResponse.success(res, result);
    } catch (error: any) {
      logger.error('[CropRisk] analyzeCropRisk error:', error);
      ApiResponse.error(res, 'Failed to complete crop risk analysis', error.message);
    }
  };

  /**
   * POST /api/crop-risk/simulate
   * What-if simulation — purely deterministic, no LLM call.
   */
  simulateWhatIf = async (req: Request, res: Response): Promise<void> => {
    try {
      const { baseAnalysis, additionalAreaPercent } = req.body as WhatIfSimulationRequest;
      if (!baseAnalysis || typeof additionalAreaPercent !== 'number') {
        ApiResponse.error(res, 'Missing required fields: baseAnalysis, additionalAreaPercent', 'VALIDATION_ERROR');
        return;
      }
      if (additionalAreaPercent < 0 || additionalAreaPercent > 200) {
        ApiResponse.error(res, 'additionalAreaPercent must be between 0 and 200', 'VALIDATION_ERROR');
        return;
      }
      const result = computeWhatIf(baseAnalysis, additionalAreaPercent);
      ApiResponse.success(res, result);
    } catch (error: any) {
      logger.error('[CropRisk] simulateWhatIf error:', error);
      ApiResponse.error(res, 'What-if simulation failed', error.message);
    }
  };
}
