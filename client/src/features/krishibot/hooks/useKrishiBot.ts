import { useState, useRef } from 'react';
import { ChatMessage } from '../types/krishiBot.types.js';
import { INITIAL_MOCK_MESSAGES } from '../mock/krishiBot.mock.js';
import { KrishiBotApi } from '../services/krishiBotApi.js';
import { speakText } from '../utils/krishiBot.utils.js';

const IS_DEVELOPMENT = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const useKrishiBot = (language: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MOCK_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Mirrors OLD app's `autoSpeakActive` — turns on read-aloud once the farmer has used voice input.
  const autoSpeakRef = useRef(false);

  const sendMessage = async (text: string, viaVoice = false) => {
    if (viaVoice) autoSpeakRef.current = true;

    const userMsg: ChatMessage = {
      id: `${Date.now()}-user`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const res = await KrishiBotApi.sendMessage(text, language);
      const replyText = res?.reply || 'KrishiBot produced an empty response.';

      const botMsg: ChatMessage = {
        id: `${Date.now()}-bot`,
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, botMsg]);

      if (autoSpeakRef.current) speakText(replyText, language);
    } catch (err: any) {
      if (IS_DEVELOPMENT) console.error('[KrishiBot] Message request failed', err);
      setError('KrishiBot could not respond right now. Please try again in a moment.');
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading, error };
};
