export interface SatelliteTelemetry {
  satelliteId: string;
  lastPassTimestamp: string;
  ndviIndex: number; // 0.0 to 1.0
  vegetationStress: 'HEALTHY' | 'MODERATE STRESS' | 'SEVERE DAMAGE';
  moistureDeficitPercent: number;
  floodInundationAreaAcres: number;
  insuranceClaimStatus: 'ELIGIBLE FOR DIRECT PAYOUT' | 'SURVEY PENDING' | 'NO DAMAGE DETECTED';
  recommendedPayoutPerAcre: number;
}

export class CropRiskService {
  /**
   * Demo Data Service — Clearly separated satellite telemetry provider
   */
  static getSatelliteTelemetry(policyId: string): SatelliteTelemetry {
    // Deterministic simulation based on Policy ID string hash
    const isDamaged = policyId.includes('DAM') || policyId.endsWith('9') || policyId.endsWith('8');

    if (isDamaged) {
      return {
        satelliteId: 'SENTINEL-2B / ISRO-EOS-04',
        lastPassTimestamp: new Date().toISOString().split('T')[0] + ' 10:42 AM IST',
        ndviIndex: 0.28,
        vegetationStress: 'SEVERE DAMAGE',
        moistureDeficitPercent: 64,
        floodInundationAreaAcres: 3.5,
        insuranceClaimStatus: 'ELIGIBLE FOR DIRECT PAYOUT',
        recommendedPayoutPerAcre: 14500
      };
    }

    return {
      satelliteId: 'SENTINEL-2B / ISRO-EOS-04',
      lastPassTimestamp: new Date().toISOString().split('T')[0] + ' 10:42 AM IST',
      ndviIndex: 0.74,
      vegetationStress: 'HEALTHY',
      moistureDeficitPercent: 12,
      floodInundationAreaAcres: 0.0,
      insuranceClaimStatus: 'NO DAMAGE DETECTED',
      recommendedPayoutPerAcre: 0
    };
  }
}
