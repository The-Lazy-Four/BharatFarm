import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types/krishiBot.types';
import { INITIAL_MOCK_MESSAGES } from '../mock/krishiBot.mock';
import { KrishiBotApi } from '../services/krishiBotApi';
import { speakText } from '../utils/krishiBot.utils';
import { useAuth } from '@core/context/AuthContext';

const IS_DEVELOPMENT = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const useKrishiBot = (language: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MOCK_MESSAGES);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoSpeakRef = useRef(false);

  // Initialize or fetch persistent session and historical messages
  useEffect(() => {
    let isMounted = true;
    const initSession = async () => {
      try {
        const session = await KrishiBotApi.getSession(language);
        if (session && isMounted) {
          setSessionId(session.id);
          const history = await KrishiBotApi.getSessionMessages(session.id);
          if (history && history.length > 0 && isMounted) {
            setMessages(history);
          }
        }
      } catch (err) {
        if (IS_DEVELOPMENT) console.warn('[useKrishiBot] Could not restore session history, using initial state.');
      }
    };

    initSession();
    return () => { isMounted = false; };
  }, [language, user?.id]);

  const sendMessage = async (text: string, viaVoice = false) => {
    if (viaVoice) autoSpeakRef.current = true;

    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}-user`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const farmerContext = {
        location: user?.state ? `${user.state}, India` : 'Ludhiana, Punjab',
        state: user?.state || 'Punjab',
        crop: 'Wheat',
        landSize: 5
      };

      const res = await KrishiBotApi.sendMessage(text, language, farmerContext, sessionId || undefined);
      if (res?.sessionId) {
        setSessionId(res.sessionId);
      }

      const replyText = res?.reply || 'KrishiBot produced an empty response.';

      const botMsg: ChatMessage = {
        id: res?.messageId || `temp-${Date.now()}-bot`,
        sessionId: res?.sessionId,
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: res?.suggestedActions
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

  const clearConversation = async () => {
    if (sessionId) {
      await KrishiBotApi.clearSession(sessionId);
      setSessionId(null);
    }
    setMessages(INITIAL_MOCK_MESSAGES);
  };

  return { messages, sendMessage, clearConversation, isLoading, error, sessionId };
};

