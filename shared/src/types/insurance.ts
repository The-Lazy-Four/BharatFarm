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

export interface AiAssessmentResult {
  damageDetected: boolean;
  damageType: string;
  severity: 'low' | 'moderate' | 'high' | 'severe';
  affectedPercentage: number;
  eventConsistency: 'consistent' | 'potentially_consistent' | 'inconsistent' | 'inconclusive';
  vegetationCondition: string;
  confidence: 'high' | 'moderate' | 'low';
  additionalVerificationRequired: boolean;
  summary: string;
  limitations: string;
}

export interface EconomicLossEstimate {
  crop: string;
  marketPrice: number;
  priceUnit: string;
  estimatedProduction: number;
  estimatedLostProduction: number;
  estimatedEconomicLoss: number;
  estimateType: 'preliminary_estimate';
  disclaimer: string;
}

export interface CreateClaimRequest {
  farmId: string;
  crop: string;
  disasterType: string;
  eventDate: string;
  reportedAffectedArea: number;
  description?: string;
}

export interface GovernmentDecisionRequest {
  decision: 'approved' | 'additional_verification' | 'rejected';
  remarks: string;
  officerId?: string;
}
