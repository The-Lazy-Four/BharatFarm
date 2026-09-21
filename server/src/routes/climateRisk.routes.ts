import { Router } from 'express';
import {
  getForecast,
  getFloodRisk,
  getAssessment,
  getHarvestAdvisory,
  getHistory,
  geocodeLocation,
  getAiInsight,
  getGeminiDecision,
  getGovtGeminiDecision
} from '../controllers/climateRisk.controller.js';

const router = Router();

router.get('/geocode', geocodeLocation);
router.post('/ai-insight', getAiInsight);
router.post('/decision', getGeminiDecision);
router.post('/govt-decision', getGovtGeminiDecision);
router.get('/forecast', getForecast);
router.get('/flood-risk', getFloodRisk);
router.post('/assessment', getAssessment);
router.post('/harvest-advisory', getHarvestAdvisory);
router.get('/history', getHistory);

export default router;

