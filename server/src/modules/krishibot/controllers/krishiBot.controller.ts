import { Request, Response } from 'express';
import { KrishiBotService } from '../services/krishiBot.service.js';
import { ApiResponse } from '../../../utils/apiResponse.js';
import { logger } from '../../../utils/logger.js';

export class KrishiBotController {
  private service: KrishiBotService;

  constructor() {
    this.service = new KrishiBotService();
  }

  handleChat = async (req: Request, res: Response): Promise<void> => {
    try {
      const chatResponse = await this.service.getChatResponse(req.body);
      ApiResponse.success(res, chatResponse, 'KrishiBot response generated successfully');
    } catch (err) {
      const cause = err instanceof Error ? err.message : 'Unknown error';
      logger.error('[KrishiBot] Chat request failed', { error: cause });
      ApiResponse.error(res, 'KrishiBot could not respond right now.', 'KRISHIBOT_UNAVAILABLE', 503);
    }
  };
}
