export const formatBotTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Text-to-speech playback, adapted from OLD project's `speakResponse()`
 * (js/chatbot.js) which used the browser SpeechSynthesis API with
 * language-specific voice selection for en/hi/bn.
 */
export const speakText = (text: string, language: string): void => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const cleanText = text.replace(/[*_#`]/g, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  const voices = window.speechSynthesis.getVoices();

  if (language === 'hi') {
    utterance.lang = 'hi-IN';
    utterance.voice = voices.find(v => v.lang === 'hi-IN' || v.lang.startsWith('hi')) || null;
  } else if (language === 'bn') {
    utterance.lang = 'bn-IN';
    utterance.voice = voices.find(v => v.lang === 'bn-IN' || v.lang === 'bn-BD' || v.lang.startsWith('bn')) || null;
    utterance.rate = 0.9;
  } else {
    utterance.lang = 'en-IN';
  }

  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = (): void => {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
};

/** Maps the app's 2-letter language code to a BCP-47 speech-recognition locale. */
export const speechRecognitionLocale = (language: string): string => {
  if (language === 'hi') return 'hi-IN';
  if (language === 'bn') return 'bn-IN';
  return 'en-IN';
};
