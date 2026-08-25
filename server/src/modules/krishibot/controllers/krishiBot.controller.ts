import { Request, Response } from 'express';
import { KrishiBotService } from '../services/krishiBot.service.js';
import { ApiResponse } from '../../../utils/apiResponse.js';

export class KrishiBotController {
  private service: KrishiBotService;

  constructor() {
    this.service = new KrishiBotService();
  }

  handleChat = async (req: Request, res: Response): Promise<void> => {
    const chatResponse = await this.service.getChatResponse(req.body);
    ApiResponse.success(res, chatResponse, 'KrishiBot response generated successfully');
  };
}
