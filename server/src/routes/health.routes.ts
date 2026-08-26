import { Router } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import { config } from '../config/env.js';
import { getSupabaseClient } from '../config/supabase.js';

const router = Router();

router.get('/health', (req, res) => {
  const supabaseClient = getSupabaseClient();
  return ApiResponse.success(res, {
    service: 'bharatfarm-server',
    status: 'healthy',
    environment: config.env,
    mockMode: config.useMockData,
    database: supabaseClient ? 'configured' : 'not_configured',
    timestamp: new Date().toISOString()
  }, 'BharatFarm Server is healthy and running');
});

export default router;
