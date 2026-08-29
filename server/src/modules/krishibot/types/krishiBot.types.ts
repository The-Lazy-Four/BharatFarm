// KrishiBot Types
export interface KrishiBotSession {
  id: string;
  userId: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId?: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  audioUrl?: string;
  suggestedActions?: string[];
}

export interface FarmerContext {
  location?: string;
  state?: string;
  crop?: string;
  landSize?: number;
  cropStage?: string;
  weatherSummary?: string;
  scannerResult?: string;
}

export interface ChatRequest {
  sessionId?: string;
  message: string;
  language?: string;
  farmerContext?: FarmerContext;
}

export interface ChatResponse {
  sessionId: string;
  messageId: string;
  reply: string;
  suggestedActions: string[];
  audioUrl?: string;
  confidence: number;
}

