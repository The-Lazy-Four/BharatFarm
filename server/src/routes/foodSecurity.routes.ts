import { Router } from 'express';
import {
  getOverview,
  getDistricts,
  runScenario,
  getAlerts
} from '../controllers/foodSecurity.controller.js';

const router = Router();

router.get('/overview', getOverview);
router.get('/districts', getDistricts);
router.post('/scenario', runScenario);
router.get('/alerts', getAlerts);

export default router;
