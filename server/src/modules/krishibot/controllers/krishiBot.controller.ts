import { Request, Response } from 'express';
import { KrishiBotService } from '../services/krishiBot.service.js';
import { ApiResponse } from '../../../utils/apiResponse.js';
import { logger } from '../../../utils/logger.js';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware.js';

export class KrishiBotController {
  private service: KrishiBotService;

  constructor() {
    this.service = new KrishiBotService();
  }

  handleChat = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id || 'mock-user-123';
      const chatResponse = await this.service.getChatResponse(req.body, userId);
      ApiResponse.success(res, chatResponse, 'KrishiBot response generated successfully');
    } catch (err: any) {
      const cause = err instanceof Error ? err.message : 'Unknown error';
      logger.error('[KrishiBot] Chat request failed', { error: cause });
      ApiResponse.error(res, 'KrishiBot could not respond right now.', 'KRISHIBOT_UNAVAILABLE', 503);
    }
  };

  getSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id || 'mock-user-123';
      const language = (req.query.language as string) || 'en';
      const session = await this.service.getOrCreateSession(userId, language);
      ApiResponse.success(res, session, 'KrishiBot session retrieved');
    } catch (err: any) {
      ApiResponse.error(res, 'Failed to fetch session', 'SESSION_ERROR', 500);
    }
  };

  getMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id || 'mock-user-123';
      const sessionId = req.params.sessionId;
      const messages = await this.service.getSessionMessages(sessionId, userId);
      ApiResponse.success(res, messages, 'KrishiBot messages retrieved');
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED_SESSION_ACCESS') {
        ApiResponse.error(res, 'Access denied to session history', 'FORBIDDEN', 403);
        return;
      }
      ApiResponse.error(res, 'Failed to fetch messages', 'MESSAGES_ERROR', 500);
    }
  };

  deleteSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id || 'mock-user-123';
      const sessionId = req.params.sessionId;
      await this.service.deleteSession(sessionId, userId);
      ApiResponse.success(res, { deleted: true }, 'KrishiBot session cleared');
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED_SESSION_ACCESS') {
        ApiResponse.error(res, 'Access denied to delete session', 'FORBIDDEN', 403);
        return;
      }
      ApiResponse.error(res, 'Failed to delete session', 'SESSION_DELETE_ERROR', 500);
    }
  };
}

