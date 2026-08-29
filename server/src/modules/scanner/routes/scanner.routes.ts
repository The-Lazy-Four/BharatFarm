import { Router } from 'express';
import { ScannerController } from '../controllers/scanner.controller.js';
import { validateRequest } from '../../../middleware/validation.middleware.js';
import { scannerSchema } from '../schemas/scanner.schema.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticateToken } from '../../../middleware/auth.middleware.js';
import { aiRateLimiter } from '../../../middleware/aiRateLimit.middleware.js';

const router = Router();
const controller = new ScannerController();

router.post(
  '/analyze',
  authenticateToken,
  aiRateLimiter(),
  validateRequest(scannerSchema),
  asyncHandler(controller.analyze)
);

router.get(
  '/history',
  authenticateToken,
  asyncHandler(controller.getHistory)
);

router.delete(
  '/:id',
  authenticateToken,
  asyncHandler(controller.deleteScan)
);

export default router;
