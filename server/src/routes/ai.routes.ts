import { Router } from 'express';
import { CentralAiController } from '../controllers/centralAi.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { aiRateLimiter } from '../middleware/aiRateLimit.middleware.js';

const router = Router();
const controller = new CentralAiController();

// Apply AI Rate Limiter to all AI endpoints (15 req/min)
router.use(aiRateLimiter(60000, 15));

// GET /api/ai/farm-advice — Today's context-aware farm advisory for Dashboard
router.get('/farm-advice', asyncHandler(controller.getDashboardAdvice));

// POST /api/ai/marketplace-search — Natural language product search and filtering
router.post('/marketplace-search', asyncHandler(controller.naturalMarketplaceSearch));

// POST /api/ai/marketplace-explain — Product usage, suitability and safety guidelines
router.post('/marketplace-explain', asyncHandler(controller.explainProduct));

// POST /api/ai/groupbuying-assist — Group buying savings analysis & pool advisory
router.post('/groupbuying-assist', asyncHandler(controller.assistGroupBuying));

export default router;
