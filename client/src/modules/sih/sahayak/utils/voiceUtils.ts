/**
 * voiceUtils.ts
 * Smart Speech Synthesis Voice Picker and Audio Configurator for BharatFarm Sahayak.
 *
 * Implements:
 * 1. Dynamic voice enumeration via speechSynthesis.getVoices()
 * 2. Strict preference order:
 *    - exact locale match (e.g., 'hi-IN', 'en-IN', 'bn-IN')
 *    - language + Indian voice name (e.g., 'Google हिन्दी', 'Microsoft Heera', 'Ravi', 'Kavya')
 *    - matching language code
 *    - browser fallback
 * 3. Never hardcodes a single voice name.
 * 4. Configurable farmer-friendly speech parameters (rate: 0.92, pitch: 1.0, volume: 1.0).
 */

export type IndianLanguageLocale = 'hi-IN' | 'en-IN' | 'bn-IN';
export type SupportedLangShort = 'hi' | 'en' | 'bn';

export interface VoiceSelectionResult {
  voice: SpeechSynthesisVoice | null;
  locale: IndianLanguageLocale;
  isIndianVoice: boolean;
  voiceName: string;
}

const INDIAN_VOICE_NAMES = [
  'heera', 'kalpana', 'hemant', 'swara', 'madhur', 'neerja', 'prabhat',
  'ravi', 'kavya', 'veena', 'ananya', 'geeta', 'rahul', 'google हिन्दी',
  'google বাংলা', 'google indian english', 'india', 'in'
];

/**
 * Normalizes short language code to full Indian locale
 */
export function getIndianLocale(lang: SupportedLangShort | string): IndianLanguageLocale {
  if (lang.startsWith('hi')) return 'hi-IN';
  if (lang.startsWith('bn')) return 'bn-IN';
  return 'en-IN';
}

/**
 * Returns all currently available synthesis voices in the browser.
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return [];
  }
  return window.speechSynthesis.getVoices() || [];
}

/**
 * Dynamically selects the best available voice for a farmer helpline call.
 * 
 * Priority:
 * 1. Exact locale ('hi-IN', 'en-IN', 'bn-IN') with Indian voice name
 * 2. Exact locale match ('hi-IN', 'en-IN', 'bn-IN')
 * 3. Language code prefix match ('hi', 'bn', 'en') + Indian indicator
 * 4. Language code prefix match
 * 5. Best available browser default
 */
export function selectVoice(lang: SupportedLangShort | string): VoiceSelectionResult {
  const targetLocale = getIndianLocale(lang);
  const langPrefix = targetLocale.split('-')[0].toLowerCase();
  const voices = getAvailableVoices();

  if (voices.length === 0) {
    return {
      voice: null,
      locale: targetLocale,
      isIndianVoice: false,
      voiceName: 'Default System Voice'
    };
  }

  // 1. Exact locale + recognized Indian voice name
  const exactIndian = voices.find(v => {
    const locMatch = v.lang.toLowerCase() === targetLocale.toLowerCase() || v.lang.replace('_', '-').toLowerCase() === targetLocale.toLowerCase();
    const nameMatch = INDIAN_VOICE_NAMES.some(name => v.name.toLowerCase().includes(name));
    return locMatch && nameMatch;
  });
  if (exactIndian) {
    return { voice: exactIndian, locale: targetLocale, isIndianVoice: true, voiceName: exactIndian.name };
  }

  // 2. Exact locale match
  const exactLocale = voices.find(v => {
    return v.lang.toLowerCase() === targetLocale.toLowerCase() || v.lang.replace('_', '-').toLowerCase() === targetLocale.toLowerCase();
  });
  if (exactLocale) {
    return { voice: exactLocale, locale: targetLocale, isIndianVoice: true, voiceName: exactLocale.name };
  }

  // 3. Language prefix match + Indian identifier in name/lang
  const prefixIndian = voices.find(v => {
    const vPrefix = v.lang.split(/[-_]/)[0].toLowerCase();
    const hasIndian = INDIAN_VOICE_NAMES.some(name => v.name.toLowerCase().includes(name)) || v.lang.toLowerCase().includes('in');
    return vPrefix === langPrefix && hasIndian;
  });
  if (prefixIndian) {
    return { voice: prefixIndian, locale: targetLocale, isIndianVoice: true, voiceName: prefixIndian.name };
  }

  // 4. Any voice matching the language prefix
  const prefixMatch = voices.find(v => {
    const vPrefix = v.lang.split(/[-_]/)[0].toLowerCase();
    return vPrefix === langPrefix;
  });
  if (prefixMatch) {
    return { voice: prefixMatch, locale: targetLocale, isIndianVoice: false, voiceName: prefixMatch.name };
  }

  // 5. If English requested, check for Indian English voice even if language tag is generic
  if (langPrefix === 'en') {
    const indianEnglish = voices.find(v => 
      v.name.toLowerCase().includes('india') || 
      v.name.toLowerCase().includes('ravi') || 
      v.name.toLowerCase().includes('heera')
    );
    if (indianEnglish) {
      return { voice: indianEnglish, locale: targetLocale, isIndianVoice: true, voiceName: indianEnglish.name };
    }
  }

  // 6. Graceful fallback to default/first voice without crashing or switching language away
  const fallback = voices.find(v => v.default) || voices[0];
  return {
    voice: fallback || null,
    locale: targetLocale,
    isIndianVoice: false,
    voiceName: fallback?.name || 'Browser Generic Voice'
  };
}

/**
 * Configure and speak text with farmer-tailored cadence and clear pacing.
 */
export function speakFarmerSpeech(
  text: string,
  lang: SupportedLangShort | string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return null;
  }

  // Cancel any ongoing speech immediately before starting new utterance
  window.speechSynthesis.cancel();

  // Clean formatting characters like markdown bullets, asterisks, etc.
  const cleanText = text
    .replace(/[*#_`~]/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/•/g, '')
    .trim();

  if (!cleanText) return null;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const selection = selectVoice(lang);

  utterance.lang = selection.locale;
  if (selection.voice) {
    utterance.voice = selection.voice;
  }

  // Pacing: slightly slower (0.92) for simulated telephone clarity
  utterance.rate = 0.92;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  if (callbacks?.onStart) utterance.onstart = callbacks.onStart;
  if (callbacks?.onEnd) utterance.onend = callbacks.onEnd;
  if (callbacks?.onError) utterance.onerror = callbacks.onError;

  // Small delay to ensure clean audio buffer in Chromium
  setTimeout(() => {
    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      if (callbacks?.onError) callbacks.onError(e);
    }
  }, 60);

  return utterance;
}
