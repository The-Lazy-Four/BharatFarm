import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { FarmService } from '../services/insurance/farmService.js';
import { MarketService } from '../services/insurance/marketService.js';
import { AiVerificationService } from '../services/insurance/aiVerificationService.js';
import { ClaimStore, ClaimStatus } from '../services/insurance/claimStore.js';
import { AiClient } from '../utils/aiClient.js';

export class InsuranceController {

  /**
   * POST /api/insurance/claims
   * Create a new insurance claim.
   */
  createClaim = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        farmId,
        crop,
        disasterType,
        eventDate,
        reportedAffectedArea,
        description = ''
      } = req.body;

      if (!farmId || !crop || !disasterType || !eventDate || reportedAffectedArea === undefined) {
        ApiResponse.error(
          res,
          'Missing required claim fields: farmId, crop, disasterType, eventDate, reportedAffectedArea',
          'VALIDATION_ERROR',
          400
        );
        return;
      }

      const numAffectedArea = Number(reportedAffectedArea);
      if (isNaN(numAffectedArea) || numAffectedArea <= 0) {
        ApiResponse.error(res, 'reportedAffectedArea must be a positive number', 'VALIDATION_ERROR', 400);
        return;
      }

      // 1. Retrieve Farm Information using existing Farm ID
      const farmInfo = await FarmService.getFarm(farmId);
      if (!farmInfo) {
        ApiResponse.error(res, 'Farm not found', 'FARM_NOT_FOUND', 404);
        return;
      }

      // 2. Retrieve Existing Satellite Evidence
      const satelliteEvidence = await FarmService.getSatelliteEvidence(farmId);
      if (!satelliteEvidence) {
        ApiResponse.error(res, 'Satellite evidence unavailable', 'SATELLITE_DATA_UNAVAILABLE', 404);
        return;
      }

      // 3. Calculate Preliminary Economic Loss
      const estimatedAffectedPercentage = Math.min(100, Math.round((numAffectedArea / farmInfo.farmAreaAcres) * 100));
      const economicLoss = MarketService.calculateEconomicLoss(crop, farmInfo.farmAreaAcres, estimatedAffectedPercentage);

      // 4. Store Claim
      const claim = ClaimStore.createClaim({
        farmId: farmInfo.farmId,
        crop: crop.trim(),
        disasterType: disasterType.trim(),
        eventDate: eventDate.trim(),
        reportedAffectedArea: numAffectedArea,
        description: String(description).trim(),
        farmInfo,
        satelliteEvidence,
        economicLoss
      });

      ApiResponse.success(
        res,
        {
          success: true,
          claimId: claim.claimId,
          status: claim.status,
          claim
        },
        'Insurance claim created successfully',
        201
      );
    } catch (err: any) {
      logger.error('[InsuranceController] createClaim error:', err);
      ApiResponse.error(res, 'Failed to create insurance claim', err.message);
    }
  };

  /**
   * GET /api/insurance/claims/:claimId
   * Retrieve full claim details.
   */
  getClaim = async (req: Request, res: Response): Promise<void> => {
    try {
      const { claimId } = req.params;
      const claim = ClaimStore.getClaim(claimId);

      if (!claim) {
        ApiResponse.error(res, 'Invalid insurance claim', 'INVALID_CLAIM', 404);
        return;
      }

      ApiResponse.success(res, {
        success: true,
        claim
      });
    } catch (err: any) {
      logger.error('[InsuranceController] getClaim error:', err);
      ApiResponse.error(res, 'Failed to retrieve insurance claim', err.message);
    }
  };

  /**
   * POST /api/insurance/claims/:claimId/analyze
   * Execute Gemini Vision AI assessment via OpenRouter.
   */
  analyzeClaim = async (req: Request, res: Response): Promise<void> => {
    try {
      const { claimId } = req.params;
      const claim = ClaimStore.getClaim(claimId);

      if (!claim) {
        ApiResponse.error(res, 'Invalid insurance claim', 'INVALID_CLAIM', 404);
        return;
      }

      // Check API Key
      if (!AiClient.isConfigured()) {
        ApiResponse.error(res, 'OpenRouter configuration unavailable', 'MISSING_API_KEY', 500);
        return;
      }

      ClaimStore.addAuditLog(claim, 'AI analysis started', 'SYSTEM', 'Dispatched satellite image to OpenRouter Gemini Vision model');

      let assessment;
      try {
        assessment = await AiVerificationService.analyzeClaim({
          farmId: claim.farmId,
          crop: claim.claimInfo.crop,
          farmArea: claim.farmInfo.farmAreaAcres,
          disasterType: claim.claimInfo.disasterType,
          eventDate: claim.claimInfo.eventDate,
          reportedAffectedArea: claim.claimInfo.reportedAffectedArea,
          satelliteImage: claim.satelliteEvidence.satelliteImage
        });
      } catch (aiErr: any) {
        logger.error(`[InsuranceController] AI Vision Analysis failed for claim ${claimId}:`, aiErr.message);
        ClaimStore.logAiFailure(claimId, aiErr.message);
        ApiResponse.error(res, 'AI analysis failed', 'AI_ANALYSIS_FAILED', 500);
        return;
      }

      // Recalculate economic loss using AI's estimated damage percentage
      const recalculatedLoss = MarketService.calculateEconomicLoss(
        claim.claimInfo.crop,
        claim.farmInfo.farmAreaAcres,
        assessment.affectedPercentage
      );

      // Update Claim Store
      const updatedClaim = ClaimStore.storeAiAssessment(claimId, assessment, recalculatedLoss);

      ApiResponse.success(res, {
        success: true,
        claimId: updatedClaim.claimId,
        assessment: {
          damageDetected: assessment.damageDetected,
          damageType: assessment.damageType,
          severity: assessment.severity,
          affectedPercentage: assessment.affectedPercentage,
          eventConsistency: assessment.eventConsistency,
          vegetationCondition: assessment.vegetationCondition,
          confidence: assessment.confidence,
          additionalVerificationRequired: assessment.additionalVerificationRequired,
          summary: assessment.summary,
          limitations: assessment.limitations
        },
        economicLoss: updatedClaim.economicLoss,
        status: updatedClaim.status
      });
    } catch (err: any) {
      logger.error('[InsuranceController] analyzeClaim error:', err);
      ApiResponse.error(res, 'AI analysis failed', 'AI_ANALYSIS_FAILED', 500);
    }
  };

  /**
   * POST /api/insurance/claims/:claimId/decision
   * Submit government verification decision.
   */
  submitGovernmentDecision = async (req: Request, res: Response): Promise<void> => {
    try {
      const { claimId } = req.params;
      const { decision, remarks, officerId = 'GOVT_OFFICER_01' } = req.body;

      if (!decision || !['approved', 'additional_verification', 'rejected'].includes(decision)) {
        ApiResponse.error(
          res,
          'Invalid decision. Decision must be: approved, additional_verification, or rejected',
          'VALIDATION_ERROR',
          400
        );
        return;
      }

      if (decision === 'rejected' && (!remarks || !String(remarks).trim())) {
        ApiResponse.error(res, 'Remarks (reason) are required for rejection', 'VALIDATION_ERROR', 400);
        return;
      }

      if (decision === 'additional_verification' && (!remarks || !String(remarks).trim())) {
        ApiResponse.error(
          res,
          'Remarks explaining what needs to be verified are required',
          'VALIDATION_ERROR',
          400
        );
        return;
      }

      const claim = ClaimStore.getClaim(claimId);
      if (!claim) {
        ApiResponse.error(res, 'Invalid insurance claim', 'INVALID_CLAIM', 404);
        return;
      }

      const updatedClaim = ClaimStore.submitGovernmentDecision(claimId, decision, remarks, officerId);

      ApiResponse.success(res, {
        success: true,
        claimId: updatedClaim.claimId,
        status: updatedClaim.status,
        governmentDecision: updatedClaim.governmentDecision
      });
    } catch (err: any) {
      logger.error('[InsuranceController] submitGovernmentDecision error:', err);
      ApiResponse.error(res, err.message || 'Failed to submit government decision', 'DECISION_ERROR', 400);
    }
  };

  /**
   * GET /api/insurance/claims/:claimId/status
   * Get current claim status.
   */
  getClaimStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { claimId } = req.params;
      const claim = ClaimStore.getClaim(claimId);

      if (!claim) {
        ApiResponse.error(res, 'Invalid insurance claim', 'INVALID_CLAIM', 404);
        return;
      }

      ApiResponse.success(res, {
        success: true,
        claimId: claim.claimId,
        status: claim.status
      });
    } catch (err: any) {
      logger.error('[InsuranceController] getClaimStatus error:', err);
      ApiResponse.error(res, 'Failed to retrieve claim status', err.message);
    }
  };

  /**
   * GET /api/insurance/claims/:claimId/report
   * Get full verification report dossier.
   */
  getClaimReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { claimId } = req.params;
      const claim = ClaimStore.getClaim(claimId);

      if (!claim) {
        ApiResponse.error(res, 'Invalid insurance claim', 'INVALID_CLAIM', 404);
        return;
      }

      ApiResponse.success(res, {
        success: true,
        report: {
          claimId: claim.claimId,
          farmId: claim.farmId,
          status: claim.status,
          crop: claim.claimInfo.crop,
          farmAreaAcres: claim.farmInfo.farmAreaAcres,
          disasterType: claim.claimInfo.disasterType,
          eventDate: claim.claimInfo.eventDate,
          reportedAffectedArea: claim.claimInfo.reportedAffectedArea,
          farmerDescription: claim.claimInfo.description,
          farmLocation: claim.farmInfo.location,
          satelliteEvidence: claim.satelliteEvidence,
          ndviScore: claim.satelliteEvidence.ndviScore,
          aiAssessment: claim.aiAssessment,
          economicLoss: claim.economicLoss,
          governmentDecision: claim.governmentDecision,
          auditLog: claim.auditLog,
          generatedAt: new Date().toISOString()
        }
      });
    } catch (err: any) {
      logger.error('[InsuranceController] getClaimReport error:', err);
      ApiResponse.error(res, 'Failed to generate verification report', err.message);
    }
  };

  /**
   * GET /api/insurance/claims
   * List all claims.
   */
  getAllClaims = async (_req: Request, res: Response): Promise<void> => {
    try {
      const claims = ClaimStore.getAllClaims();
      ApiResponse.success(res, {
        success: true,
        count: claims.length,
        claims
      });
    } catch (err: any) {
      logger.error('[InsuranceController] getAllClaims error:', err);
      ApiResponse.error(res, 'Failed to retrieve claims', err.message);
    }
  };
}

