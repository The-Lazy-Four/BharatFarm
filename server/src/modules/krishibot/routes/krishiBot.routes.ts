import { Router } from 'express';
import { KrishiBotController } from '../controllers/krishiBot.controller.js';
import { validateRequest } from '../../../middleware/validation.middleware.js';
import { krishiBotSchema } from '../schemas/krishiBot.schema.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { authenticateToken } from '../../../middleware/auth.middleware.js';
import { aiRateLimiter } from '../../../middleware/aiRateLimit.middleware.js';

const router = Router();
const controller = new KrishiBotController();

router.use(authenticateToken);

router.get('/session', asyncHandler(controller.getSession));
router.get('/session/:sessionId/messages', asyncHandler(controller.getMessages));
router.delete('/session/:sessionId', asyncHandler(controller.deleteSession));
router.post('/chat', aiRateLimiter(60000, 15), validateRequest(krishiBotSchema), asyncHandler(controller.handleChat));

export default router;

