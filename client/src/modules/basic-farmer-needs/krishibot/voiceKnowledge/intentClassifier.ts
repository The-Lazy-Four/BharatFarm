import { VOICE_INTENTS, VoiceIntent, SENSITIVE_KEYWORDS, CLARIFICATION_PROMPTS } from './voiceRegistry';

export type LanguageCode = 'en' | 'hi' | 'bn' | 'mr' | 'te' | 'ta' | 'kn' | 'gu' | 'pa' | 'or' | 'as';

/** Noise / Meaningless Single-Syllable Fillers filter */
const NOISE_WORDS = new Set([
  'a', 'uh', 'hmm', 'um', 'ee', 'oh', 'ah', 'ha', 'eh',
  'ओ', 'आ', 'हूम', 'हम्म', 'উম', 'হুম', 'আ', 'হ্যা'
]);

/** Affirmative context tokens for conversational follow-ups */
const AFFIRMATIVE_WORDS = new Set([
  'yes', 'yeah', 'yep', 'haan', 'han', 'ha', 'ok', 'okay', 'sure', 'theek hai', 'accha',
  'हाँ', 'हां', 'ठीक है', 'अच्छा', 'सही है', 'হ্যাঁ', 'হাঁ', 'ঠিক আছে', 'আচ্ছা', 'হয়'
]);

/** Phonetic / Speech-to-text fuzzy mappings for common farmer typos */
const PHONETIC_MAPPINGS: Record<string, string> = {
  'scannar': 'scanner',
  'scaner': 'scanner',
  'skaner': 'scanner',
  'skannar': 'scanner',
  'patta': 'leaf',
  'patte': 'leaf',
  'mosam': 'weather',
  'mousam': 'weather',
  'mausum': 'weather',
  'mandee': 'mandi',
  'mundi': 'mandi',
  'bazar': 'bazaar',
  'seme': 'scheme',
  'sceme': 'scheme',
  'lon': 'loan',
  'krishi': 'krishibot'
};

/** Normalize text for fuzzy matching */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?।]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/** Multilingual Script & Keyword Language Resolver for 11 regional languages */
export const detectSpokenLanguage = (text: string): LanguageCode => {
  if (!text) return 'en';

  // 1. Script Unicode Range Inspection
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Devanagari (Hindi / Marathi)
  if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bengali / Assamese
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn'; // Kannada
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu'; // Gujarati
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa'; // Punjabi
  if (/[\u0B00-\u0B7F]/.test(text)) return 'or'; // Odia

  const normalized = normalizeText(text);

  // 2. Transliterated Banglish / Bengali vocabulary markers
  const bnMarkers = ['ta', 'dekhao', 'kholo', 'aamader', 'kamon', 'amhar', 'pata', 'sar', 'bazaar', 'dhekho', 'koron', 'kintu', 'jante', 'khulbo'];
  if (bnMarkers.some(m => new RegExp(`\\b${m}\\b`, 'i').test(normalized))) return 'bn';

  // 3. Transliterated Hinglish / Hindi vocabulary markers
  const hiMarkers = ['karo', 'khol', 'kholo', 'dikhao', 'kya', 'kaise', 'hai', 'bhai', 'pata', 'chahiye', 'batao', 'mandi', 'mausam', 'wala', 'kisi'];
  if (hiMarkers.some(m => new RegExp(`\\b${m}\\b`, 'i').test(normalized))) return 'hi';

  return 'en';
};

export interface LocalIntentResult {
  matched: boolean;
  intentId?: string;
  isNavigation?: boolean;
  navPath?: string;
  responseMessage?: string;
  detectedLanguage: LanguageCode;
  isSensitive?: boolean;
  isNoise?: boolean;
}

/** Layer 1 Fast Local Intent Classification Engine with Phonetic & Context Fallbacks */
export const classifyLocalIntent = (text: string, previousContextIntent?: string): LocalIntentResult => {
  const detectedLanguage = detectSpokenLanguage(text);
  const rawNormalized = normalizeText(text);

  // 1. Noise / Filler Detection (Short meaningless audio)
  if (rawNormalized.length <= 2 || NOISE_WORDS.has(rawNormalized)) {
    return {
      matched: false,
      detectedLanguage,
      isNoise: true,
      responseMessage: CLARIFICATION_PROMPTS[detectedLanguage] || CLARIFICATION_PROMPTS['en']
    };
  }

  // Apply Phonetic Substitution for Common STT Typo Errors
  let normalized = rawNormalized;
  const words = normalized.split(' ').map(w => PHONETIC_MAPPINGS[w] || w);
  normalized = words.join(' ');

  // 2. Conversational Context / Affirmative Follow-up Handling ("haan", "yes", "theek hai")
  if (AFFIRMATIVE_WORDS.has(normalized) && previousContextIntent) {
    const matchedContextIntent = VOICE_INTENTS.find(i => i.id === previousContextIntent);
    if (matchedContextIntent) {
      return {
        matched: true,
        intentId: matchedContextIntent.id,
        isNavigation: !!matchedContextIntent.route,
        navPath: matchedContextIntent.route,
        responseMessage: matchedContextIntent.guidance[detectedLanguage] || matchedContextIntent.guidance['en'],
        detectedLanguage
      };
    }
  }

  // 3. Sensitive financial transaction safeguard
  const isSensitive = SENSITIVE_KEYWORDS.some(kw => normalized.includes(kw));
  if (isSensitive) {
    let warning = 'Sensitive transaction requested. Please confirm manually on screen.';
    if (detectedLanguage === 'hi') warning = 'संवेदनशील लेन-देन। कृपया स्क्रीन पर मैन्युअल रूप से पुष्टि करें।';
    if (detectedLanguage === 'bn') warning = 'সংবেদনশীল লেনদেন। অনুগ্রহ করে স্ক্রিনে ম্যানুয়ালি নিশ্চিত করুন।';

    return {
      matched: true,
      intentId: 'SENSITIVE_ACTION',
      isNavigation: false,
      responseMessage: warning,
      detectedLanguage,
      isSensitive: true
    };
  }

  // 4. Exact & Fuzzy Keyword Matching against Voice Registry
  let bestIntent: VoiceIntent | null = null;
  let highestScore = 0;

  for (const intent of VOICE_INTENTS) {
    for (const kw of intent.keywords) {
      const normKw = normalizeText(kw);
      if (normalized === normKw) {
        bestIntent = intent;
        highestScore = 100;
        break;
      }
      if (normalized.includes(normKw)) {
        const score = normKw.length;
        if (score > highestScore) {
          highestScore = score;
          bestIntent = intent;
        }
      }
    }
    if (highestScore === 100) break;
  }

  if (bestIntent && highestScore >= 3) {
    const responseMsg = bestIntent.guidance[detectedLanguage] || bestIntent.guidance['en'];
    return {
      matched: true,
      intentId: bestIntent.id,
      isNavigation: !!bestIntent.route,
      navPath: bestIntent.route,
      responseMessage: responseMsg,
      detectedLanguage
    };
  }

  // Unclear / Ambiguous Speech handling
  return {
    matched: false,
    detectedLanguage,
    responseMessage: CLARIFICATION_PROMPTS[detectedLanguage] || CLARIFICATION_PROMPTS['en']
  };
};
