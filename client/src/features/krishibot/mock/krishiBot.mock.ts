import { ChatMessage } from '../types/krishiBot.types.js';

export const INITIAL_MOCK_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    sender: 'bot',
    text: 'Namaste! I am KrishiBot, your AI farming assistant. How can I assist with your crops today?',
    timestamp: new Date().toLocaleTimeString()
  }
];
