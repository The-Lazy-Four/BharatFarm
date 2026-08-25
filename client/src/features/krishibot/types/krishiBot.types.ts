export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  audioUrl?: string;
}

export interface ChatResponse {
  messageId: string;
  reply: string;
  suggestedActions: string[];
  audioUrl?: string;
  confidence: number;
}
