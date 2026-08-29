import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller.js';
import { authenticateToken } from '../../../middleware/auth.middleware.js';

const router = Router();
const controller = new ProfileController();

router.get('/', authenticateToken, controller.getProfile);
router.patch('/', authenticateToken, controller.updateProfile);

export default router;
