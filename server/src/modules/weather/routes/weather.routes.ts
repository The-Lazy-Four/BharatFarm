import { Router } from 'express';
import { WeatherController } from '../controllers/weather.controller.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

const router = Router();
const controller = new WeatherController();

router.get('/', asyncHandler(controller.getWeather));
router.get('/geocode', asyncHandler(controller.geocode));

export default router;
