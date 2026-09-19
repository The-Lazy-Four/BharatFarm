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

  private static async handleResponse(res: Response) {
    try {
      const json = await res.json();
      if (!res.ok || !json.success) {
        const errMsg = json.error?.message || json.message || `HTTP ${res.status}`;
        return { success: false, message: errMsg, error: json.error || { message: errMsg } };
      }
      const data = json.data || {};
      return { success: true, message: json.message || 'Success', ...data };
    } catch (err: any) {
      return { success: false, message: err.message || 'Invalid server response' };
    }
  }

  /**
   * Create a new insurance claim on the backend
   */
  static async createClaim(data: {
    farmId: string;
    crop: string;
    disasterType: string;
    eventDate: string;
    reportedAffectedArea: number;
    description?: string;
  }) {
    const res = await fetch('/api/insurance/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return this.handleResponse(res);
  }

  /**
   * Get insurance claim details from backend
   */
  static async getClaim(claimId: string) {
    const res = await fetch(`/api/insurance/claims/${claimId}`);
    return this.handleResponse(res);
  }

  /**
   * Run Gemini Vision AI verification on satellite image
   */
  static async analyzeClaim(claimId: string) {
    const res = await fetch(`/api/insurance/claims/${claimId}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return this.handleResponse(res);
  }

  /**
   * Get current claim status
   */
  static async getClaimStatus(claimId: string) {
    const res = await fetch(`/api/insurance/claims/${claimId}/status`);
    return this.handleResponse(res);
  }

  /**
   * Submit government verification decision
   */
  static async submitGovernmentDecision(claimId: string, decision: string, remarks: string) {
    const res = await fetch(`/api/insurance/claims/${claimId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, remarks })
    });
    return this.handleResponse(res);
  }

  /**
   * Get full verification report dossier
   */
  static async getClaimReport(claimId: string) {
    const res = await fetch(`/api/insurance/claims/${claimId}/report`);
    return this.handleResponse(res);
  }
}
