import { Router } from 'express';
import {
  getForecast,
  getFloodRisk,
  getAssessment,
  getHarvestAdvisory,
  getHistory,
  geocodeLocation,
  getAiInsight
} from '../controllers/climateRisk.controller.js';

const router = Router();

router.get('/geocode', geocodeLocation);
router.post('/ai-insight', getAiInsight);
router.get('/forecast', getForecast);
router.get('/flood-risk', getFloodRisk);
router.post('/assessment', getAssessment);
router.post('/harvest-advisory', getHarvestAdvisory);
router.get('/history', getHistory);

export default router;
