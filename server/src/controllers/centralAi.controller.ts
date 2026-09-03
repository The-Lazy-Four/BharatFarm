import { Request, Response } from 'express';
import { AiClient } from '../utils/aiClient.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { AiCache } from '../utils/aiCache.js';

export class CentralAiController {
  /**
   * GET /api/ai/farm-advice
   */
  getDashboardAdvice = async (req: Request, res: Response): Promise<void> => {
    try {
      const { crop, state, location, landSize } = req.query;
      const cacheKey = `farm_advice_${crop || 'all'}_${state || 'all'}_${location || 'all'}`;
      
      const cached = AiCache.get<any>(cacheKey);
      if (cached) {
        ApiResponse.success(res, cached);
        return;
      }

      if (!AiClient.isConfigured()) {
        const fallback = {
          advice: 'Weather conditions are stable. Continue scheduled field irrigation and crop canopy inspections.',
          source: 'FALLBACK',
          isAiGenerated: false
        };
        ApiResponse.success(res, fallback);
        return;
      }

      const prompt = `You are an expert Indian agricultural advisor. Provide 2 concise sentences of actionable daily advice for a farmer growing ${crop || 'general crops'} in ${location || state || 'India'}. Plain text only.`;
      const response = await AiClient.chat([{ role: 'user', content: prompt }]);
      
      const result = {
        advice: response.trim() || 'Weather conditions are stable. Maintain standard irrigation schedules.',
        source: 'LIVE_AI',
        isAiGenerated: true
      };

      AiCache.set(cacheKey, result, 30 * 60 * 1000); // 30 mins
      ApiResponse.success(res, result);
    } catch (error: any) {
      logger.error('Error generating farm advice:', error);
      ApiResponse.success(res, {
        advice: 'Weather conditions are stable. Continue scheduled field irrigation.',
        source: 'FALLBACK',
        isAiGenerated: false
      });
    }
  };

  /**
   * POST /api/ai/marketplace-search
   */
  naturalMarketplaceSearch = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query } = req.body;
      ApiResponse.success(res, {
        matchedProducts: [],
        explanation: `Searched for "${query}". Check out available options in the marketplace catalog.`,
        isAiGenerated: false
      });
    } catch (error: any) {
      ApiResponse.error(res, 'Failed to process natural search', error.message);
    }
  };

  /**
   * POST /api/ai/marketplace-explain
   */
  explainProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId, farmerCrop } = req.body;
      ApiResponse.success(res, {
        explanation: `This product is suitable for ${farmerCrop || 'general agricultural use'}. Follow recommended label instructions.`,
        dosageTip: 'Apply during early morning or late afternoon for best results.',
        isAiGenerated: false
      });
    } catch (error: any) {
      ApiResponse.error(res, 'Failed to explain product', error.message);
    }
  };

  /**
   * POST /api/ai/groupbuying-assist
   */
  assistGroupBuying = async (req: Request, res: Response): Promise<void> => {
    try {
      ApiResponse.success(res, {
        advice: 'Group buying pools allow regional farmers to pool bulk orders for discounted pricing.',
        isAiGenerated: false
      });
    } catch (error: any) {
      ApiResponse.error(res, 'Failed to analyze group buy pool', error.message);
    }
  };
}
