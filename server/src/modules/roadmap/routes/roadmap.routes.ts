// ============================================================
// Crop Roadmap — Routes
// ============================================================

import { Router } from 'express';
import { RoadmapController } from '../controllers/roadmap.controller.js';
import { validateRequest } from '../../../middleware/validation.middleware.js';
import { roadmapSchema } from '../schemas/roadmap.schema.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

const router = Router();
const controller = new RoadmapController();

router.post('/generate', validateRequest(roadmapSchema), asyncHandler(controller.handleGenerate));

export default router;
