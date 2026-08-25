import { ApiClient } from '../../../services/apiClient.js';
import { ChatResponse } from '../types/krishiBot.types.js';

export class KrishiBotApi {
  static async sendMessage(
    message: string,
    language?: string,
    farmerContext?: { location?: string; crop?: string }
  ): Promise<ChatResponse | null> {
    const res = await ApiClient.post<ChatResponse>('/krishibot/chat', { message, language, farmerContext });
    if (res.success && res.data) {
      return res.data;
    }
    throw new Error(res.error?.message || 'Failed to connect to KrishiBot');
  }
}
