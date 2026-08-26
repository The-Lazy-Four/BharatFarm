import { Request, Response } from 'express';
import { CropLookupService } from '../services/cropLookup.service.js';
import { ApiResponse } from '../../../utils/apiResponse.js';
import { logger } from '../../../utils/logger.js';

const cropLookupService = new CropLookupService();

// Simple in-memory cache to avoid hitting Wikipedia repeatedly for same queries
const imageCache = new Map<string, { result: any; timestamp: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export class CropLookupController {
  lookup = async (req: Request, res: Response): Promise<void> => {
    const query = (req.query.q as string || '').trim();

    if (!query || query.length < 2) {
      ApiResponse.error(res, 'Query must be at least 2 characters', 'VALIDATION_ERROR', 400);
      return;
    }

    const cacheKey = query.toLowerCase();

    // Check cache
    const cached = imageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      logger.info(`[CropLookup] Cache hit for "${query}"`);
      ApiResponse.success(res, cached.result, 'Crop lookup (cached)');
      return;
    }

    try {
      logger.info(`[CropLookup] Looking up crop: "${query}"`);
      const result = await cropLookupService.lookup(query);

      // Store in cache
      imageCache.set(cacheKey, { result, timestamp: Date.now() });

      // Evict old entries if cache grows too large
      if (imageCache.size > 500) {
        const now = Date.now();
        for (const [key, value] of imageCache.entries()) {
          if (now - value.timestamp > CACHE_TTL_MS) {
            imageCache.delete(key);
          }
        }
      }

      ApiResponse.success(res, result, result.isCrop ? 'Crop found' : 'Not a recognized crop');
    } catch (err: any) {
      logger.error('[CropLookup] Lookup failed', { message: err.message });
      ApiResponse.error(res, 'Crop lookup failed', 'LOOKUP_ERROR', 500);
    }
  };
}
