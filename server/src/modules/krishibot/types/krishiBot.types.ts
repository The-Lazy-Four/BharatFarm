// KrishiBot Types
export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  audioUrl?: string;
  suggestedActions?: string[];
}

export interface ChatRequest {
  message: string;
  language?: string;
  farmerContext?: {
    location?: string;
    crop?: string;
  };
}

export interface ChatResponse {
  messageId: string;
  reply: string;
  suggestedActions: string[];
  audioUrl?: string;
  confidence: number;
}
