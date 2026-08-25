import { KrishiBotRepository } from '../repositories/krishiBot.repository.js';
import { ChatRequest, ChatResponse } from '../types/krishiBot.types.js';

export class KrishiBotService {
  private repository: KrishiBotRepository;

  constructor() {
    this.repository = new KrishiBotRepository();
  }

  async getChatResponse(request: ChatRequest): Promise<ChatResponse> {
    // Feature business logic (multilingual context formatting, fallback routing)
    return await this.repository.processQuery(request);
  }
}
