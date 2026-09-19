import { Request, Response } from 'express';
import { CallAssistantService } from '../services/callAssistant.service.js';
import { CallSessionService } from '../services/callSession.service.js';
import { ApiResponse } from '../../../utils/apiResponse.js';
import { logger } from '../../../utils/logger.js';
import { CallEventRequest } from '../types/call.types.js';

export class CallController {
  /**
   * POST /api/sahayak/call/incoming
   * Inbound telephony hook (triggered when phone call connects)
   */
  handleIncomingCall = async (req: Request, res: Response): Promise<void> => {
    try {
      const sessionId = req.body.sessionId || `call_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const callerPhone = req.body.callerPhone || req.body.From || '+91 98312 00001';

      logger.info(`[CallController] Inbound call connected (Session: ${sessionId}, Caller: ${callerPhone})`);

      const event: CallEventRequest = {
        sessionId,
        callerPhone,
        digits: req.body.digits,
        speechText: req.body.speechText
      };

      const result = await CallAssistantService.processCallEvent(event);
      ApiResponse.success(res, result, 'Call initiated successfully');
    } catch (err: any) {
      logger.error('[CallController] Error handling incoming call:', err);
      ApiResponse.error(res, 'Failed to handle incoming call', err.message);
    }
  };

  /**
   * POST /api/sahayak/call/dtmf
   * Handles keypad keypress event from telephone caller
   */
  handleDtmf = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId, digits } = req.body;
      if (!sessionId || digits === undefined) {
        ApiResponse.error(res, 'sessionId and digits are required', 'VALIDATION_ERROR', 400);
        return;
      }

      const event: CallEventRequest = {
        sessionId,
        digits: String(digits)
      };

      const result = await CallAssistantService.processCallEvent(event);
      ApiResponse.success(res, result);
    } catch (err: any) {
      logger.error('[CallController] Error handling DTMF:', err);
      ApiResponse.error(res, 'Failed to process DTMF input', err.message);
    }
  };

  /**
   * POST /api/sahayak/call/speech
   * Handles transcribed caller speech input
   */
  handleSpeech = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId, speechText } = req.body;
      if (!sessionId || !speechText) {
        ApiResponse.error(res, 'sessionId and speechText are required', 'VALIDATION_ERROR', 400);
        return;
      }

      const event: CallEventRequest = {
        sessionId,
        speechText
      };

      const result = await CallAssistantService.processCallEvent(event);
      ApiResponse.success(res, result);
    } catch (err: any) {
      logger.error('[CallController] Error handling speech:', err);
      ApiResponse.error(res, 'Failed to process speech input', err.message);
    }
  };

  /**
   * POST /api/sahayak/call/terminate
   * Ends telephony call session
   */
  handleTerminate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.body;
      if (sessionId) {
        CallSessionService.endSession(sessionId);
      }
      ApiResponse.success(res, { ended: true }, 'Call session ended');
    } catch (err: any) {
      ApiResponse.error(res, 'Failed to terminate call', err.message);
    }
  };

  /**
   * GET /api/sahayak/call/status/:sessionId
   * Retrieve active call session transcript and status
   */
  getCallStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const session = CallSessionService.getSession(sessionId);
      if (!session) {
        ApiResponse.error(res, 'Session not found', 'NOT_FOUND', 404);
        return;
      }
      ApiResponse.success(res, session);
    } catch (err: any) {
      ApiResponse.error(res, 'Failed to get session status', err.message);
    }
  };
}
