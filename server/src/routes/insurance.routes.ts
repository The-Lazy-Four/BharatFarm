import { Router } from 'express';
import { InsuranceController } from '../controllers/insurance.controller.js';

const router = Router();
const insuranceController = new InsuranceController();

// Create new insurance claim
router.post('/claims', insuranceController.createClaim);

// List all claims
router.get('/claims', insuranceController.getAllClaims);

// Retrieve specific claim details
router.get('/claims/:claimId', insuranceController.getClaim);

// Execute Gemini Vision AI assessment via OpenRouter
router.post('/claims/:claimId/analyze', insuranceController.analyzeClaim);

// Submit government officer decision
router.post('/claims/:claimId/decision', insuranceController.submitGovernmentDecision);

// Retrieve claim status
router.get('/claims/:claimId/status', insuranceController.getClaimStatus);

// Retrieve full verification report dossier
router.get('/claims/:claimId/report', insuranceController.getClaimReport);

export default router;

