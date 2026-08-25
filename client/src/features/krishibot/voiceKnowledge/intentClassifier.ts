import { VOICE_INTENTS, SENSITIVE_KEYWORDS, CLARIFICATION_PROMPTS, VoiceIntent } from './voiceRegistry.js';

export interface IntentMatchResult {
  matched: boolean;
  intent?: VoiceIntent;
  confidence: number;
  detectedLanguage: 'en' | 'hi' | 'bn';
  isNavigation: boolean;
  navPath?: string;
  responseMessage: string;
  isSensitive?: boolean;
}

/**
 * Normalizes input text by removing punctuation, converting to lowercase,
 * and normalizing whitespace for robust natural language matching.
 */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?'"॥।]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Detect language based on script (Bengali vs Devanagari vs Latin)
 * and regional vocabulary markers.
 */
export const detectSpokenLanguage = (rawText: string): 'en' | 'hi' | 'bn' => {
  // 1. Script checks
  if (/[\u0980-\u09FF]/.test(rawText)) return 'bn'; // Bengali Unicode
  if (/[\u0900-\u097F]/.test(rawText)) return 'hi'; // Devanagari Unicode

  // 2. Transliterated / Hinglish / Banglish vocabulary markers
  const text = normalizeText(rawText);
  const words = text.split(' ');

  const bnMarkers = ['ta', 'dekhao', 'kine', 'kholo', 'amar', 'kemon', 'koto', 'naki', 'ache', 'hocche'];
  const hiMarkers = ['kholo', 'karo', 'dikhao', 'hai', 'kaise', 'batao', 'kya', 'chahiye', 'karni', 'mera', 'apna'];

  let bnScore = 0;
  let hiScore = 0;

  for (const w of words) {
    if (bnMarkers.includes(w)) bnScore++;
    if (hiMarkers.includes(w)) hiScore++;
  }

  if (bnScore > hiScore && bnScore > 0) return 'bn';
  if (hiScore > bnScore && hiScore > 0) return 'hi';

  return 'en';
};

/**
 * Layer 1 — Local Fast Intent Classifier Engine
 * Evaluates queries against the central VOICE_INTENTS registry without any AI network overhead.
 */
export const classifyLocalIntent = (rawQuery: string, currentPageRoute?: string): IntentMatchResult => {
  const lang = detectSpokenLanguage(rawQuery);
  const normQuery = normalizeText(rawQuery);

  // Check 1: Sensitive Gated Actions
  const isSensitive = SENSITIVE_KEYWORDS.some(kw => normQuery.includes(normalizeText(kw)));
  if (isSensitive) {
    let msg = 'For your security, financial transactions, purchasing, or official applications require your manual tap and confirmation.';
    if (lang === 'hi') {
      msg = 'आपकी सुरक्षा के लिए, वित्तीय लेनदेन, खरीदारी या आवेदन जमा करने के लिए आपको स्वयं बटन दबाकर पुष्टि करनी होगी।';
    } else if (lang === 'bn') {
      msg = 'আপনার নিরাপত্তার জন্য, আর্থিক লেনদেন, কেনাকাটা বা আবেদন জমা দেওয়ার জন্য আপনাকে নিজে ম্যানুয়ালি নিশ্চিত করতে হবে।';
    }
    return {
      matched: true,
      confidence: 1.0,
      detectedLanguage: lang,
      isNavigation: false,
      responseMessage: msg,
      isSensitive: true
    };
  }

  // Check 2: Relative Contextual Commands ("how do I use this?", "go back", "go home")
  if (normQuery.includes('go back') || normQuery.includes('पीछे जाओ') || normQuery.includes('पीछे') || normQuery.includes('পিছনে')) {
    let msg = 'Going back to the previous screen.';
    if (lang === 'hi') msg = 'पिछली स्क्रीन पर वापस जा रहे हैं।';
    if (lang === 'bn') msg = 'আগের স্ক্রিনে ফিরে যাওয়া হচ্ছে।';
    return {
      matched: true,
      confidence: 0.95,
      detectedLanguage: lang,
      isNavigation: true,
      navPath: '-1', // Special signal for navigate(-1)
      responseMessage: msg
    };
  }

  // Check 3: Match intent against central registry using multi-word keyphrase fuzzy scoring
  let bestMatch: VoiceIntent | null = null;
  let maxScore = 0;

  for (const intent of VOICE_INTENTS) {
    let currentScore = 0;

    for (const kw of intent.keywords) {
      const normKw = normalizeText(kw);

      // Exact substring match
      if (normQuery.includes(normKw)) {
        // Longer keyword matches earn higher weight
        const score = normKw.length * 2;
        if (score > currentScore) currentScore = score;
      } else {
        // Multi-word token overlap match (e.g. "leaf scanner open karo" matching "leaf scanner")
        const queryWords = normQuery.split(' ');
        const kwWords = normKw.split(' ');
        const overlap = kwWords.filter(w => queryWords.includes(w)).length;
        if (overlap > 0 && overlap === kwWords.length) {
          const score = overlap * 3;
          if (score > currentScore) currentScore = score;
        }
      }
    }

    if (currentScore > maxScore) {
      maxScore = currentScore;
      bestMatch = intent;
    }
  }

  // Threshold check for local fast classification confidence
  if (bestMatch && maxScore >= 3) {
    return {
      matched: true,
      intent: bestMatch,
      confidence: Math.min(1.0, maxScore / 10),
      detectedLanguage: lang,
      isNavigation: true,
      navPath: bestMatch.route,
      responseMessage: bestMatch.guidance[lang]
    };
  }

  // Check 4: Contextual "How to use this page" if no explicit intent matched
  if (currentPageRoute && (normQuery.includes('how to use') || normQuery.includes('ise kaise') || normQuery.includes('kivabe') || normQuery.includes('help'))) {
    const pageIntent = VOICE_INTENTS.find(i => i.route === currentPageRoute);
    if (pageIntent) {
      return {
        matched: true,
        intent: pageIntent,
        confidence: 0.9,
        detectedLanguage: lang,
        isNavigation: false,
        responseMessage: pageIntent.guidance[lang]
      };
    }
  }

  // Unmatched query -> Requires Layer 2 (AI Processing or Ambiguity Clarification)
  return {
    matched: false,
    confidence: 0,
    detectedLanguage: lang,
    isNavigation: false,
    responseMessage: CLARIFICATION_PROMPTS[lang]
  };
};
