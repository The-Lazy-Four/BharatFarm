import { Router } from 'express';
import { GroupBuyingController } from '../controllers/groupBuying.controller.js';
import { validateRequest } from '../../../middleware/validation.middleware.js';
import { groupBuyingSchema } from '../schemas/groupBuying.schema.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

const router = Router();
const controller = new GroupBuyingController();

router.get('/', asyncHandler(controller.getPools));
router.get('/:id', asyncHandler(controller.getPoolById));
router.post('/:id/join', validateRequest(groupBuyingSchema), asyncHandler(controller.joinPool));

export default router;
