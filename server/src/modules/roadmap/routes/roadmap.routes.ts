// ============================================================
// Crop Roadmap — Routes
// ============================================================

import { Router } from 'express';
import { RoadmapController } from '../controllers/roadmap.controller.js';
import { validateRequest } from '../../../middleware/validation.middleware.js';
import { roadmapSchema } from '../schemas/roadmap.schema.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticateToken } from '../../../middleware/auth.middleware.js';
import { aiRateLimiter } from '../../../middleware/aiRateLimit.middleware.js';

const router = Router();
const controller = new RoadmapController();

router.get('/', asyncHandler(controller.handleList));
router.get('/:id', asyncHandler(controller.handleGetById));

router.post('/generate', aiRateLimiter(), validateRequest(roadmapSchema), asyncHandler(controller.handleGenerate));

router.patch('/:id/progress', authenticateToken, asyncHandler(controller.handleUpdateProgress));
router.delete('/:id', authenticateToken, asyncHandler(controller.handleDelete));

router.post('/advisory', aiRateLimiter(), asyncHandler(controller.handleAdvisory));

export default router;
