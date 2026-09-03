import { ApiClient } from '@core/api/apiClient';
import { ChatResponse, ChatMessage, KrishiBotSession } from '../types/krishiBot.types';

export class KrishiBotApi {
  static async getSession(language?: string): Promise<KrishiBotSession | null> {
    const res = await ApiClient.get<KrishiBotSession>(`/krishibot/session${language ? `?language=${language}` : ''}`);
    if (res.success && res.data) {
      return res.data;
    }
    return null;
  }

  static async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    const res = await ApiClient.get<ChatMessage[]>(`/krishibot/session/${sessionId}/messages`);
    if (res.success && res.data) {
      return res.data;
    }
    return [];
  }

  static async clearSession(sessionId: string): Promise<boolean> {
    const res = await ApiClient.delete<{ deleted: boolean }>(`/krishibot/session/${sessionId}`);
    return !!(res.success && res.data?.deleted);
  }

  static async sendMessage(
    message: string,
    language?: string,
    farmerContext?: { location?: string; crop?: string; state?: string; landSize?: number },
    sessionId?: string
  ): Promise<ChatResponse | null> {
    const res = await ApiClient.post<ChatResponse>('/krishibot/chat', {
      sessionId,
      message,
      language,
      farmerContext
    });

    if (res.success && res.data) {
      return res.data;
    }
    throw new Error(res.error?.message || 'Failed to connect to KrishiBot');
  }
}

