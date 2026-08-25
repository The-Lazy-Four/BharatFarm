export const formatBotTimestamp = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Text-to-speech playback using browser SpeechSynthesis API with
 * native voice selection for en-IN/hi-IN/bn-IN.
 */
export const speakText = (
  text: string,
  language: string,
  onEnd?: () => void,
  onError?: () => void
): SpeechSynthesisUtterance | null => {
  if (!('speechSynthesis' in window)) return null;
  window.speechSynthesis.cancel();

  const cleanText = text.replace(/[*_#`]/g, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  const voices = window.speechSynthesis.getVoices();

  if (language === 'hi') {
    utterance.lang = 'hi-IN';
    utterance.voice =
      voices.find(v => v.lang === 'hi-IN' || v.lang.startsWith('hi')) || null;
  } else if (language === 'bn') {
    utterance.lang = 'bn-IN';
    // Native Bengali voice priority check: bn-IN -> bn-BD -> any bn
    utterance.voice =
      voices.find(v => v.lang.toLowerCase() === 'bn-in' || v.lang.toLowerCase() === 'bn_in') ||
      voices.find(v => v.lang.toLowerCase() === 'bn-bd' || v.lang.toLowerCase() === 'bn_bd') ||
      voices.find(v => v.lang.toLowerCase().startsWith('bn')) || null;
    utterance.rate = 0.9;
  } else {
    utterance.lang = 'en-IN';
    utterance.voice =
      voices.find(v => v.lang === 'en-IN' || v.lang === 'en_IN') || null;
  }

  if (onEnd) utterance.onend = () => onEnd();
  if (onError) utterance.onerror = () => onError();

  window.speechSynthesis.speak(utterance);
  return utterance;
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
