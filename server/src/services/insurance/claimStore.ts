import { AiAssessmentResult } from './aiVerificationService.js';
import { EconomicLossEstimate } from './marketService.js';
import { FarmRecord, SatelliteEvidence } from './farmService.js';
import { logger } from '../../utils/logger.js';

export type ClaimStatus =
  | 'submitted'
  | 'satellite_analysis_pending'
  | 'ai_analysis_completed'
  | 'under_government_verification'
  | 'approved'
  | 'additional_verification_required'
  | 'rejected'
  | 'insurance_processing'
  | 'completed';

export type GovernmentDecisionStatus = 'pending' | 'approved' | 'additional_verification' | 'rejected';

export interface AuditLogEntry {
  timestamp: string;
  claimId: string;
  action: string;
  actor: 'FARMER' | 'SYSTEM' | 'GOVERNMENT_OFFICER';
  details: string;
}

export interface GovernmentDecision {
  status: GovernmentDecisionStatus;
  decisionDate?: string;
  remarks?: string;
  officerId?: string;
}

export interface InsuranceClaim {
  claimId: string;
  farmId: string;
  status: ClaimStatus;
  claimInfo: {
    crop: string;
    disasterType: string;
    eventDate: string;
    reportedAffectedArea: number;
    description: string;
    createdAt: string;
  };
  farmInfo: FarmRecord;
  satelliteEvidence: SatelliteEvidence;
  aiAssessment: AiAssessmentResult | null;
  economicLoss: EconomicLossEstimate;
  governmentDecision: GovernmentDecision;
  auditLog: AuditLogEntry[];
  updatedAt: string;
}

// Valid status state machine map
const VALID_TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
  submitted: ['satellite_analysis_pending', 'ai_analysis_completed', 'under_government_verification'],
  satellite_analysis_pending: ['ai_analysis_completed', 'under_government_verification'],
  ai_analysis_completed: ['under_government_verification', 'approved', 'rejected'],
  under_government_verification: ['approved', 'additional_verification_required', 'rejected'],
  approved: ['insurance_processing', 'completed'],
  additional_verification_required: ['under_government_verification', 'rejected', 'approved'],
  rejected: [],
  insurance_processing: ['completed'],
  completed: []
};

// In-memory store for claims
const claimsStore = new Map<string, InsuranceClaim>();

// Pre-seed default demo claim BF-INS-2026-00402 for FARM-402 on server initialization
function seedDemoClaim() {
  const farmInfo: FarmRecord = {
    farmId: 'FARM-402',
    fieldName: 'Field ID #402 - Sector B (North Paddy Field)',
    crop: 'Paddy',
    farmAreaAcres: 5.2,
    farmAreaHectares: 2.10,
    location: { district: 'Purba Medinipur', state: 'West Bengal', block: 'Haldia', latitude: 22.0667, longitude: 88.0667 },
    boundaryCoordinates: [
      { lat: 22.0667, lng: 88.0667 },
      { lat: 22.0675, lng: 88.0678 },
      { lat: 22.0682, lng: 88.0669 },
      { lat: 22.0672, lng: 88.0658 }
    ],
    satelliteImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    ndviScore: 0.72,
    registeredAt: '2026-01-15T08:30:00.000Z'
  };

  const satelliteEvidence: SatelliteEvidence = {
    satelliteId: 'SENTINEL-2B / ISRO-EOS-04',
    lastPassTimestamp: '2026-09-14 10:42 AM IST',
    satelliteImage: farmInfo.satelliteImage,
    ndviScore: 0.72,
    vegetationCondition: 'SIGNIFICANT_DECLINE_WATERLOGGING',
    cloudCoverPercent: 2.1,
    resolutionMeters: 10,
    beforePass: {
      date: '2026-09-05',
      ndvi: 0.74,
      condition: 'Healthy Dense Crop Canopy',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      notes: 'Pre-event Sentinel-2 scan shows vibrant vegetation'
    },
    afterPass: {
      date: '2026-09-14',
      ndvi: 0.28,
      condition: 'Visible Waterlogging & Canopy Loss',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      notes: 'Post-event Sentinel-2 scan detects inundation across 68% of plot boundary'
    }
  };

  const demoClaim: InsuranceClaim = {
    claimId: 'BF-INS-2026-00402',
    farmId: 'FARM-402',
    status: 'under_government_verification',
    claimInfo: {
      crop: 'Paddy',
      disasterType: 'Flood / Inundation',
      eventDate: '2026-09-12',
      reportedAffectedArea: 3.7,
      description: 'Submerged paddy crop following flash flood in Haldia sector.',
      createdAt: '2026-09-18T10:30:00.000Z'
    },
    farmInfo,
    satelliteEvidence,
    aiAssessment: {
      damageDetected: true,
      damageType: 'flood_waterlogging',
      severity: 'high',
      affectedPercentage: 68,
      eventConsistency: 'potentially_consistent',
      vegetationCondition: 'significant_decline',
      confidence: 'moderate',
      additionalVerificationRequired: true,
      summary: 'Satellite evidence indicates visible waterlogging and crop vegetation decline within portions of registered farm consistent with reported flood event.',
      limitations: 'Satellite imagery alone cannot establish complete cause or final insurance eligibility.'
    },
    economicLoss: {
      crop: 'Paddy',
      marketPrice: 2400,
      priceUnit: 'per quintal',
      estimatedProduction: 30,
      estimatedLostProduction: 20.4,
      estimatedEconomicLoss: 48960,
      estimateType: 'preliminary_estimate',
      disclaimer: 'This figure is a preliminary estimate based on current mandi prices and estimated affected area. It does NOT constitute a legally guaranteed insurance payout.'
    },
    governmentDecision: {
      status: 'pending'
    },
    auditLog: [
      { timestamp: '2026-09-18T10:30:00.000Z', claimId: 'BF-INS-2026-00402', action: 'Claim created', actor: 'FARMER', details: 'Insurance claim submitted for crop Paddy (Flood / Inundation)' },
      { timestamp: '2026-09-18T10:31:00.000Z', claimId: 'BF-INS-2026-00402', action: 'Satellite data retrieved', actor: 'SYSTEM', details: 'Retrieved satellite telemetry for farm FARM-402 (NDVI: 0.72)' },
      { timestamp: '2026-09-18T10:32:00.000Z', claimId: 'BF-INS-2026-00402', action: 'AI analysis started', actor: 'SYSTEM', details: 'Dispatched satellite image to OpenRouter Gemini Vision model' },
      { timestamp: '2026-09-18T10:33:00.000Z', claimId: 'BF-INS-2026-00402', action: 'AI analysis completed', actor: 'SYSTEM', details: 'Gemini Vision completed damage analysis: 68% affected (high severity)' },
      { timestamp: '2026-09-18T10:33:00.000Z', claimId: 'BF-INS-2026-00402', action: 'Status changed', actor: 'SYSTEM', details: 'Claim submitted for government officer verification' }
    ],
    updatedAt: new Date().toISOString()
  };

  claimsStore.set('BF-INS-2026-00402', demoClaim);
}
seedDemoClaim();

export class ClaimStore {
  /**
   * Create new claim record.
   */
  static createClaim(data: {
    farmId: string;
    crop: string;
    disasterType: string;
    eventDate: string;
    reportedAffectedArea: number;
    description: string;
    farmInfo: FarmRecord;
    satelliteEvidence: SatelliteEvidence;
    economicLoss: EconomicLossEstimate;
  }): InsuranceClaim {
    const timestamp = new Date().toISOString();
    const count = claimsStore.size + 1;
    const claimId = `BF-INS-${new Date().getFullYear()}-${count.toString().padStart(4, '0')}`;

    const claim: InsuranceClaim = {
      claimId,
      farmId: data.farmId,
      status: 'submitted',
      claimInfo: {
        crop: data.crop,
        disasterType: data.disasterType,
        eventDate: data.eventDate,
        reportedAffectedArea: data.reportedAffectedArea,
        description: data.description,
        createdAt: timestamp
      },
      farmInfo: data.farmInfo,
      satelliteEvidence: data.satelliteEvidence,
      aiAssessment: null,
      economicLoss: data.economicLoss,
      governmentDecision: {
        status: 'pending'
      },
      auditLog: [],
      updatedAt: timestamp
    };

    // Add audit logs
    this.addAuditLog(claim, 'Claim created', 'FARMER', `Insurance claim submitted for crop ${data.crop} (${data.disasterType})`);
    this.addAuditLog(claim, 'Satellite data retrieved', 'SYSTEM', `Retrieved satellite telemetry for farm ${data.farmId} (NDVI: ${data.satelliteEvidence.ndviScore})`);

    // Transition status to satellite_analysis_pending
    claim.status = 'satellite_analysis_pending';
    this.addAuditLog(claim, 'Status changed', 'SYSTEM', 'Claim status updated to satellite_analysis_pending');

    claimsStore.set(claimId, claim);
    logger.info(`[ClaimStore] Created claim ${claimId} for farm ${data.farmId}`);
    return claim;
  }

  /**
   * Retrieve claim by Claim ID.
   */
  static getClaim(claimId: string): InsuranceClaim | null {
    if (!claimId) return null;
    return claimsStore.get(claimId) || claimsStore.get(claimId.toUpperCase()) || null;
  }

  /**
   * Get all claims.
   */
  static getAllClaims(): InsuranceClaim[] {
    return Array.from(claimsStore.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * Transition claim status with strict state machine validation.
   */
  static updateStatus(claimId: string, newStatus: ClaimStatus, actor: 'FARMER' | 'SYSTEM' | 'GOVERNMENT_OFFICER', details?: string): InsuranceClaim {
    const claim = this.getClaim(claimId);
    if (!claim) throw new Error('Invalid insurance claim');

    if (claim.status !== newStatus) {
      const allowed = VALID_TRANSITIONS[claim.status] || [];
      if (!allowed.includes(newStatus)) {
        throw new Error(`Invalid status transition from '${claim.status}' to '${newStatus}'`);
      }

      const prevStatus = claim.status;
      claim.status = newStatus;
      claim.updatedAt = new Date().toISOString();
      this.addAuditLog(claim, 'Status changed', actor, details || `Status changed from ${prevStatus} to ${newStatus}`);
    }

    return claim;
  }

  /**
   * Store AI damage assessment result on claim.
   */
  static storeAiAssessment(
    claimId: string,
    assessment: AiAssessmentResult,
    recalculatedLoss: EconomicLossEstimate
  ): InsuranceClaim {
    const claim = this.getClaim(claimId);
    if (!claim) throw new Error('Invalid insurance claim');

    claim.aiAssessment = assessment;
    claim.economicLoss = recalculatedLoss;
    claim.updatedAt = new Date().toISOString();

    this.addAuditLog(
      claim,
      'AI analysis completed',
      'SYSTEM',
      `Gemini Vision completed damage analysis: ${assessment.affectedPercentage}% affected (${assessment.severity} severity)`
    );

    if (claim.status === 'submitted' || claim.status === 'satellite_analysis_pending') {
      claim.status = 'ai_analysis_completed';
      this.addAuditLog(claim, 'Status changed', 'SYSTEM', 'Claim status updated to ai_analysis_completed');
    }

    claim.status = 'under_government_verification';
    this.addAuditLog(claim, 'Status changed', 'SYSTEM', 'Claim submitted for government officer verification');

    return claim;
  }

  /**
   * Log AI analysis failure audit.
   */
  static logAiFailure(claimId: string, errorMessage: string): void {
    const claim = this.getClaim(claimId);
    if (claim) {
      this.addAuditLog(claim, 'AI analysis failed', 'SYSTEM', `AI vision analysis failed: ${errorMessage}`);
    }
  }

  /**
   * Submit government verification decision.
   */
  static submitGovernmentDecision(
    claimId: string,
    decision: 'approved' | 'additional_verification' | 'rejected',
    remarks: string,
    officerId: string = 'OFFICER_GOVT_01'
  ): InsuranceClaim {
    const claim = this.getClaim(claimId);
    if (!claim) throw new Error('Invalid insurance claim');

    // Validation rules
    if (decision === 'rejected' && (!remarks || !remarks.trim())) {
      throw new Error('Reason (remarks) is required for rejection');
    }
    if (decision === 'additional_verification' && (!remarks || !remarks.trim())) {
      throw new Error('Remarks explaining what needs to be verified are required');
    }

    // Must be under verification or pending AI analysis
    if (
      claim.status !== 'under_government_verification' &&
      claim.status !== 'ai_analysis_completed' &&
      claim.status !== 'satellite_analysis_pending' &&
      claim.status !== 'submitted' &&
      claim.status !== 'additional_verification_required'
    ) {
      throw new Error(`Cannot submit government decision for claim in status '${claim.status}'`);
    }

    const timestamp = new Date().toISOString();
    claim.governmentDecision = {
      status: decision,
      decisionDate: timestamp,
      remarks: remarks?.trim() || 'Reviewed by government officer',
      officerId
    };

    this.addAuditLog(claim, 'Government officer opened/reviewed claim', 'GOVERNMENT_OFFICER', `Officer ${officerId} reviewed satellite evidence and AI assessment`);
    this.addAuditLog(claim, 'Decision submitted', 'GOVERNMENT_OFFICER', `Government decision submitted: ${decision.toUpperCase()}`);

    // Update status based on decision
    let targetStatus: ClaimStatus;
    if (decision === 'approved') {
      targetStatus = 'approved';
    } else if (decision === 'additional_verification') {
      targetStatus = 'additional_verification_required';
    } else {
      targetStatus = 'rejected';
    }

    claim.status = targetStatus;
    claim.updatedAt = timestamp;
    this.addAuditLog(claim, 'Status changed', 'GOVERNMENT_OFFICER', `Claim final verification status updated to '${targetStatus}'`);

    return claim;
  }

  /**
   * Helper to append audit log.
   */
  static addAuditLog(
    claim: InsuranceClaim,
    action: string,
    actor: 'FARMER' | 'SYSTEM' | 'GOVERNMENT_OFFICER',
    details: string
  ): void {
    claim.auditLog.push({
      timestamp: new Date().toISOString(),
      claimId: claim.claimId,
      action,
      actor,
      details
    });
  }
}
