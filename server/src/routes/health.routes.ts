import { Router } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import { config } from '../config/env.js';

const router = Router();

router.get('/health', (req, res) => {
  return ApiResponse.success(res, {
    service: 'bharatfarm-server',
    status: 'healthy',
    environment: config.env,
    mockMode: config.useMockData,
    timestamp: new Date().toISOString()
  }, 'BharatFarm Server is healthy and running');
});

export default router;
