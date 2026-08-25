import { ChatResponse } from '../types/krishiBot.types.js';
import { KRISHIBOT_CONSTANTS } from '../constants/krishiBot.constants.js';

export const MOCK_KRISHIBOT_RESPONSES: Record<string, ChatResponse> = {
  default: {
    messageId: 'msg-mock-1',
    reply: KRISHIBOT_CONSTANTS.MOCK_FALLBACK_REPLY,
    suggestedActions: KRISHIBOT_CONSTANTS.SUGGESTED_ACTIONS,
    confidence: 0.95
  }
};
