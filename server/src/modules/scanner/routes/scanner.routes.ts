import { Router } from 'express';
import { ScannerController } from '../controllers/scanner.controller.js';
import { validateRequest } from '../../../middleware/validation.middleware.js';
import { scannerSchema } from '../schemas/scanner.schema.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

const router = Router();
const controller = new ScannerController();

router.post('/analyze', validateRequest(scannerSchema), asyncHandler(controller.analyze));

export default router;
