import { Router } from 'express';
import { KrishiBotController } from '../controllers/krishiBot.controller.js';
import { validateRequest } from '../../../middleware/validation.middleware.js';
import { krishiBotSchema } from '../schemas/krishiBot.schema.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

const router = Router();
const controller = new KrishiBotController();

router.post('/chat', validateRequest(krishiBotSchema), asyncHandler(controller.handleChat));

export default router;
