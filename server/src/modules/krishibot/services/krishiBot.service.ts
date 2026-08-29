import { KrishiBotRepository } from '../repositories/krishiBot.repository.js';
import { ChatRequest, ChatResponse, ChatMessage, KrishiBotSession } from '../types/krishiBot.types.js';

export class KrishiBotService {
  private repository: KrishiBotRepository;

  constructor() {
    this.repository = new KrishiBotRepository();
  }

  async getOrCreateSession(userId: string, language: string): Promise<KrishiBotSession> {
    return await this.repository.getOrCreateSession(userId, language);
  }

  async getSessionMessages(sessionId: string, userId: string): Promise<ChatMessage[]> {
    return await this.repository.getSessionMessages(sessionId, userId);
  }

  async deleteSession(sessionId: string, userId: string): Promise<boolean> {
    return await this.repository.deleteSession(sessionId, userId);
  }

  async getChatResponse(request: ChatRequest, userId: string): Promise<ChatResponse> {
    return await this.repository.processQuery(request, userId);
  }
}

