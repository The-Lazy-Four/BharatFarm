import { Router } from 'express';
import { CropRiskController } from '../controllers/cropRisk.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { aiRateLimiter } from '../middleware/aiRateLimit.middleware.js';

const router = Router();
const controller = new CropRiskController();

// Apply AI Rate Limiter (15 req/min)
router.use(aiRateLimiter(60000, 15));

// POST /api/crop-risk/analyze
// Runs deterministic supply-pressure calculations, then LLM interpretation
router.post('/analyze', asyncHandler(controller.analyzeCropRisk));

// POST /api/crop-risk/simulate
// What-if scenario simulation — no LLM, pure arithmetic
router.post('/simulate', asyncHandler(controller.simulateWhatIf));

export default router;
