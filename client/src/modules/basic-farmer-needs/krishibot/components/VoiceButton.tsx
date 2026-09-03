import React, { useRef, useState } from 'react';
import { Button } from '@core/ui/Button';
import { speechRecognitionLocale } from '../utils/krishiBot.utils';

/**
 * Adapted from OLD project's `chatbotToggleVoice()` (js/chatbot.js),
 * which used the browser's SpeechRecognition API. Ported to a React
 * component using refs instead of global mutable state.
 */
export const VoiceButton: React.FC<{ language: string; onSpeechRecognized: (text: string) => void }> = ({
  language,
  onSpeechRecognized
}) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleVoice = () => {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      alert('Voice recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = speechRecognitionLocale(language);

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript?.trim()) onSpeechRecognized(transcript.trim());
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <Button type="button" variant={isListening ? 'danger' : 'outline'} size="sm" onClick={toggleVoice}>
      {isListening ? '🔴 Listening…' : '🎙️ Voice'}
    </Button>
  );
};

