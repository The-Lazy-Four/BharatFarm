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

export interface ScenarioSimulationInput {
  state: string;
  crop: string;
  cropLossPercentage: number; // e.g. 30 for 30%
  baseStock?: number;
  baseProduction?: number;
  baseOutwardSupply?: number;
  safetyThreshold?: number;
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

export class FoodSecurityEngine {
  /**
   * Calculates projected domestic availability and classifies security risk level.
   * Formula: Projected Availability = Current Stock + Expected Production - Climate Loss - Outward Supply
   */
  static calculateOverview(
    state: string = 'West Bengal',
    crop: string = 'Paddy',
    currentStock: number = 8.4,
    expectedProduction: number = 11.2,
    estimatedClimateLoss: number = 3.1,
    committedOutwardSupply: number = 8.0,
    safetyThreshold: number = 7.2
  ): FoodSecuritySnapshot {
    // Round to 2 decimal places
    const projectedAvailability = Number(
      (currentStock + expectedProduction - estimatedClimateLoss - committedOutwardSupply).toFixed(2)
    );

    let riskLevel: 'NORMAL' | 'CAUTION' | 'CRITICAL' = 'NORMAL';
    if (projectedAvailability < safetyThreshold) {
      riskLevel = 'CRITICAL';
    } else if (projectedAvailability < safetyThreshold + 1.2) {
      riskLevel = 'CAUTION';
    }

    let advisoryText = '';
    let recommendedPolicyActions: string[] = [];

    if (riskLevel === 'NORMAL') {
      advisoryText = 'Domestic supply remains comfortably above the configured safety threshold. Continue monitoring climate exposure and outward commitments according to applicable government policy.';
      recommendedPolicyActions = [
        'Maintain routine inter-district grain monitoring.',
        'Honor scheduled outward trade commitments.',
        'Continue periodic climate risk assessments.'
      ];
    } else if (riskLevel === 'CAUTION') {
      advisoryText = 'Projected domestic availability is approaching the configured safety threshold due to estimated climate crop losses.';
      recommendedPolicyActions = [
        'Review projected district-level crop losses and yield estimates.',
        'Monitor district-level grain movement and warehouse stocks.',
        'Review outward movement commitments and assess regional redistribution requirements.',
        'Prepare emergency buffer procurement reserves if required.'
      ];
    } else {
      advisoryText = 'Projected domestic availability may fall below the configured safety threshold because of estimated climate losses and outward commitments.';
      recommendedPolicyActions = [
        'Review outward movement and export commitments under applicable policy frameworks.',
        'Prioritize domestic food-security requirements and public distribution system reserves.',
        'Assess grain redistribution from regional surplus districts.',
        'Increase monitoring frequency of flood/drought affected agricultural zones.',
        'Recalculate supply projections using updated field loss telemetry.'
      ];
    }

    return {
      id: `fs-snap-${Date.now()}`,
      state,
      crop,
      currentStockLakhTonnes: currentStock,
      expectedProductionLakhTonnes: expectedProduction,
      estimatedClimateLossLakhTonnes: estimatedClimateLoss,
      committedOutwardSupplyLakhTonnes: committedOutwardSupply,
      projectedDomesticAvailabilityLakhTonnes: projectedAvailability,
      safetyStockThresholdLakhTonnes: safetyThreshold,
      riskLevel,
      advisoryText,
      recommendedPolicyActions,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Dynamic What-If Climate Disaster Scenario Simulator
   */
  static simulateScenario(input: ScenarioSimulationInput): ScenarioSimulationResult {
    const currentStock = input.baseStock ?? 8.4;
    const baselineProduction = input.baseProduction ?? 11.2;
    const committedOutwardSupply = input.baseOutwardSupply ?? 8.0;
    const safetyStockThreshold = input.safetyThreshold ?? 7.2;

    const lossPct = Math.min(100, Math.max(0, input.cropLossPercentage));
    const estimatedClimateLoss = Number(((baselineProduction * lossPct) / 100).toFixed(2));
    const effectiveProduction = Number((baselineProduction - estimatedClimateLoss).toFixed(2));
    const projectedDomesticAvailability = Number(
      (currentStock + effectiveProduction - committedOutwardSupply).toFixed(2)
    );

    const safetyGap = Number((projectedDomesticAvailability - safetyStockThreshold).toFixed(2));

    let riskLevel: 'NORMAL' | 'CAUTION' | 'CRITICAL' = 'NORMAL';
    let advisoryHeadline = '';
    let tradeAdvisory = '';
    let recommendedActions: string[] = [];

    if (projectedDomesticAvailability < safetyStockThreshold) {
      riskLevel = 'CRITICAL';
      advisoryHeadline = `CRITICAL SUPPLY DEFICIT (-${Math.abs(safetyGap)} LAKH TONNES BELOW SAFETY THRESHOLD)`;
      tradeAdvisory = `Under a ${lossPct}% crop loss scenario, projected domestic availability (${projectedDomesticAvailability} lakh tonnes) falls below safety reserves. High policy risk.`;
      recommendedActions = [
        'Review outward movement/export commitments immediately.',
        'Prioritize domestic food-security and PDS allocation.',
        'Initiate inter-state surplus redistribution requests.',
        'Deploy targeted farmer compensation and recovery packages.'
      ];
    } else if (projectedDomesticAvailability < safetyStockThreshold + 1.2) {
      riskLevel = 'CAUTION';
      advisoryHeadline = `MODERATE RISK: DOMESTIC AVAILABILITY NEAR THRESHOLD (+${safetyGap} LAKH TONNES)`;
      tradeAdvisory = `Under a ${lossPct}% crop loss scenario, domestic availability approaches the safety threshold. Vigilance required.`;
      recommendedActions = [
        'Monitor weekly mandi arrivals and mill processing rates.',
        'Review outward dispatch schedules.',
        'Assess district-level emergency stock allocations.'
      ];
    } else {
      riskLevel = 'NORMAL';
      advisoryHeadline = `SUFFICIENT SUPPLY SURPLUS (+${safetyGap} LAKH TONNES ABOVE SAFETY THRESHOLD)`;
      tradeAdvisory = `A ${lossPct}% crop loss can be safely absorbed by existing reserves without compromising regional domestic availability.`;
      recommendedActions = [
        'Proceed with standard market trade and export dispatches.',
        'Continue regular crop telemetry monitoring.'
      ];
    }

    return {
      cropLossPercentage: lossPct,
      currentStock,
      baselineProduction,
      estimatedClimateLoss,
      effectiveProduction,
      committedOutwardSupply,
      projectedDomesticAvailability,
      safetyStockThreshold,
      safetyGap,
      riskLevel,
      advisoryHeadline,
      tradeAdvisory,
      recommendedActions
    };
  }

  /**
   * Returns District-Level Risk Breakdown Dataset
   */
  static getDistrictRiskBreakdown(state: string = 'West Bengal'): DistrictRiskItem[] {
    return [
      { district: 'Haldia', crop: 'Paddy', cropRiskLevel: 'HIGH', floodRiskLevel: 'SEVERE', estimatedLossPercentage: 35, dataSource: 'Demonstration / simulated data' },
      { district: 'Murshidabad', crop: 'Paddy', cropRiskLevel: 'HIGH', floodRiskLevel: 'HIGH', estimatedLossPercentage: 28, dataSource: 'Demonstration / simulated data' },
      { district: 'Burdwan', crop: 'Paddy', cropRiskLevel: 'MODERATE', floodRiskLevel: 'HIGH', estimatedLossPercentage: 18, dataSource: 'Demonstration / simulated data' },
      { district: 'Kharagpur', crop: 'Paddy', cropRiskLevel: 'LOW', floodRiskLevel: 'MODERATE', estimatedLossPercentage: 10, dataSource: 'Demonstration / simulated data' },
      { district: 'Hooghly', crop: 'Paddy', cropRiskLevel: 'MODERATE', floodRiskLevel: 'MODERATE', estimatedLossPercentage: 15, dataSource: 'Demonstration / simulated data' },
      { district: 'Nadia', crop: 'Paddy', cropRiskLevel: 'LOW', floodRiskLevel: 'LOW', estimatedLossPercentage: 5, dataSource: 'Demonstration / simulated data' }
    ];
  }
}
