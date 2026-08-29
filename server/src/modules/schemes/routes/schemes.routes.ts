import { Router } from 'express';
import { SchemesController } from '../controllers/schemes.controller.js';
import { validateRequest } from '../../../middleware/validation.middleware.js';
import { schemesSchema } from '../schemas/schemes.schema.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

const router = Router();
const controller = new SchemesController();

router.get('/', asyncHandler(controller.getSchemes));
router.get('/:id', asyncHandler(controller.getSchemeById));
router.post('/check-eligibility', validateRequest(schemesSchema), asyncHandler(controller.checkEligibility));

router.post('/loan-assessment', validateRequest(schemesSchema), asyncHandler(controller.assessLoanEligibility));

export default router;
