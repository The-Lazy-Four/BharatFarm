// ============================================================
// Crop Roadmap — Controller
// ============================================================

import { Request, Response } from 'express';
import { RoadmapService } from '../services/roadmap.service.js';
import { ApiResponse } from '../../../utils/apiResponse.js';
import { RoadmapConfigError, RoadmapApiError } from '../repositories/roadmap.repository.js';
import { logger } from '../../../utils/logger.js';

const ROADMAP_ERROR_MESSAGE = 'Unable to generate crop roadmap.';
const ROADMAP_STATUS_BY_ERROR_CODE: Record<string, number> = {
  INVALID_API_KEY: 502,
  RATE_LIMIT: 429,
  TIMEOUT: 504,
  NETWORK_ERROR: 503,
  INVALID_RESPONSE: 502,
  AI_UNAVAILABLE: 503,
  AI_ERROR: 503
};

export class RoadmapController {
  private service: RoadmapService;

  constructor() {
    this.service = new RoadmapService();
  }

  handleGenerate = async (req: Request, res: Response): Promise<void> => {
    try {
      const roadmap = await this.service.generateRoadmap(req.body);
      ApiResponse.success(res, roadmap, 'Crop roadmap generated successfully');
    } catch (err) {
      const cause = err instanceof Error ? err.message : 'Unknown error';
      logger.error('[Roadmap] Generate request failed', { error: cause });

      if (err instanceof RoadmapConfigError) {
        ApiResponse.error(res, 'Invalid AI API configuration. Please check the OpenRouter API key.', 'AI_NOT_CONFIGURED', 503);
        return;
      }

      if (err instanceof RoadmapApiError) {
        ApiResponse.error(res, err.message, err.code, ROADMAP_STATUS_BY_ERROR_CODE[err.code] || 503);
        return;
      }

      ApiResponse.error(res, ROADMAP_ERROR_MESSAGE, 'INTERNAL_ERROR', 500);
    }
  };
}
