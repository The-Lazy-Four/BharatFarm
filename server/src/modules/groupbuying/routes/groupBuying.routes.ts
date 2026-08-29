import { Router } from 'express';
import { GroupBuyingController } from '../controllers/groupBuying.controller.js';
import { validateRequest } from '../../../middleware/validation.middleware.js';
import { authenticateToken } from '../../../middleware/auth.middleware.js';
import { groupBuyingSchema, createPoolSchema } from '../schemas/groupBuying.schema.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

const router = Router();
const controller = new GroupBuyingController();

router.get('/', asyncHandler(controller.getPools));
router.get('/my-purchases', authenticateToken, asyncHandler(controller.getMyJoinedPools));
router.post('/seed', asyncHandler(controller.seedPools));
router.get('/:id', asyncHandler(controller.getPoolById));
router.get('/:id/members', asyncHandler(controller.getPoolMembers));
router.post('/', authenticateToken, validateRequest(createPoolSchema), asyncHandler(controller.createPool));
router.post('/:id/join', authenticateToken, validateRequest(groupBuyingSchema), asyncHandler(controller.joinPool));

export default router;
