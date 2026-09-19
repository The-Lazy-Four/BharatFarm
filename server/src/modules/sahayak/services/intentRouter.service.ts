import { SahayakIntent } from '../types/whatsapp.types.js';
import { AiClient } from '../../../utils/aiClient.js';
import { logger } from '../../../utils/logger.js';

export interface IntentDetectionResult {
  intent: SahayakIntent;
  confidence: number;
  extractedEntity?: {
    crop?: string;
    location?: string;
    dateOrTime?: string;
    quantity?: number;
  };
  detectedLanguage: 'en' | 'hi' | 'bn';
  source: 'DETERMINISTIC' | 'LLM';
}

export class IntentRouterService {
  /**
   * Detect language from text (Hindi / Bengali / English)
   */
  static detectLanguage(text: string): 'en' | 'hi' | 'bn' {
    if (!text) return 'en';

    // 1. Devanagari script (Hindi/Marathi)
    if (/[\u0900-\u097F]/.test(text)) return 'hi';

    // 2. Bengali script
    if (/[\u0980-\u09FF]/.test(text)) return 'bn';

    const lower = text.toLowerCase();

    // 3. Transliterated Hindi / Hinglish
    const hiMarkers = ['kya', 'kaise', 'batao', 'hogi', 'aaj', 'kal', 'baarish', 'paas', 'bhav', 'rate', 'daag', 'bimari', 'kisan', 'fasal', 'khad', 'pani', 'hai', 'mein'];
    if (hiMarkers.some(m => new RegExp(`\\b${m}\\b`, 'i').test(lower))) {
      return 'hi';
    }

    // 4. Transliterated Bengali
    const bnMarkers = ['kemon', 'kholo', 'aamader', 'bristi', 'dhan', 'bhaav', 'koto', 'khobor', 'dhoro', 'pata', 'roga', 'sar'];
    if (bnMarkers.some(m => new RegExp(`\\b${m}\\b`, 'i').test(lower))) {
      return 'bn';
    }

    return 'en';
  }

  /**
   * Fast Deterministic Keyword-based intent classification
   */
  static matchDeterministic(text: string): IntentDetectionResult | null {
    const lower = text.toLowerCase().trim();
    const language = this.detectLanguage(text);

    // 1. HELP / GREETING
    if (/^(hi|hello|namaste|pranam|namaskar|help|menu|madad|shuru|start)\b/i.test(lower) || lower === '?' || lower === 'help') {
      return { intent: 'HELP', confidence: 0.98, detectedLanguage: language, source: 'DETERMINISTIC' };
    }

    // 2. CLIMATE / WEATHER / FLOOD
    if (
      /baarish|barish|rain|weather|mausam|mosam|tufan|badal|flood|forecast|temperature|garmi|sardi|hawamahal|storm|bristi|banya|jhor|brishti/i.test(lower) ||
      /बारिश|मौसम|वर्षा|तूफान|बाढ़|বৃষ্টি|আবহাওয়া|তুফান|বন্যা|ঝড়/i.test(text) ||
      /kal.*baarish/i.test(lower) ||
      /aaj.*mausam/i.test(lower)
    ) {
      const locMatch = lower.match(/(?:in|at|near|mein|me|te)\s+([a-zA-Z\u0900-\u097F\u0980-\u09FF]+)/i);
      return {
        intent: 'CLIMATE_RISK',
        confidence: 0.95,
        extractedEntity: {
          location: locMatch?.[1]
        },
        detectedLanguage: language,
        source: 'DETERMINISTIC'
      };
    }

    // 3. SMART MANDI / CROP PRICES
    if (
      /mandi|price|rate|bhav|daam|market|bazaar|bazar|bechna|kharid|buyer|khareeddar|selling.*pool/i.test(lower) ||
      /dhan.*rate/i.test(lower) ||
      /paddy.*price/i.test(lower) ||
      /potato.*rate/i.test(lower) ||
      /wheat.*rate/i.test(lower)
    ) {
      let crop: string | undefined;
      if (/dhan|paddy|chawal|rice/i.test(lower)) crop = 'Paddy';
      else if (/potato|aaloo|alu/i.test(lower)) crop = 'Potato';
      else if (/wheat|gehun|gom/i.test(lower)) crop = 'Wheat';
      else if (/tomato|tamatar/i.test(lower)) crop = 'Tomato';
      else if (/mustard|sarson/i.test(lower)) crop = 'Mustard';

      return {
        intent: 'SMART_MANDI',
        confidence: 0.92,
        extractedEntity: { crop },
        detectedLanguage: language,
        source: 'DETERMINISTIC'
      };
    }

    // 4. CROP DISEASE / LEAF SCANNER
    if (
      /bimari|roga|disease|keeda|pests|daag|spots|fungus|yellowing|leaf|patta|pata|sukha|spray|keedanashak|pesticide/i.test(lower) ||
      /fasal.*kharab/i.test(lower) ||
      /patte.*daag/i.test(lower)
    ) {
      return {
        intent: 'CROP_DISEASE',
        confidence: 0.9,
        detectedLanguage: language,
        source: 'DETERMINISTIC'
      };
    }

    // 5. GOVERNMENT SCHEME / SUBSIDY
    if (
      /pm\s*kisan|samman|yojana|scheme|subsidy|subsidi|anudan|bima|kcc|credit\s*card|pmfby|sarkar/i.test(lower)
    ) {
      return {
        intent: 'GOVERNMENT_SCHEME',
        confidence: 0.94,
        detectedLanguage: language,
        source: 'DETERMINISTIC'
      };
    }

    // 6. LINK ACCOUNT / PROFILE
    if (
      /link\s*(account|phone|number)|connect|register|mera\s*profile|khata\s*jodo/i.test(lower)
    ) {
      return {
        intent: 'LINK_ACCOUNT',
        confidence: 0.95,
        detectedLanguage: language,
        source: 'DETERMINISTIC'
      };
    }

    return null;
  }

  /**
   * Classify intent with deterministic routing first, falling back to AiClient
   */
  static async classify(text: string): Promise<IntentDetectionResult> {
    const cleanText = (text || '').trim();
    const language = this.detectLanguage(cleanText);

    // Fast deterministic pass
    const deterministic = this.matchDeterministic(cleanText);
    if (deterministic) {
      return deterministic;
    }

    // Fallback: If AI is not configured or text is very brief, return UNKNOWN
    if (!AiClient.isConfigured() || cleanText.length < 3) {
      return {
        intent: 'UNKNOWN',
        confidence: 0.5,
        detectedLanguage: language,
        source: 'DETERMINISTIC'
      };
    }

    // LLM-based Intent Routing
    try {
      const prompt = `You are the Intent Classification engine for BharatFarm Sahayak WhatsApp Assistant.
Farmer Query: "${cleanText}"

Determine the best matching intent from this list:
- CLIMATE_RISK: weather, rain, forecast, flood, storm, temperature
- SMART_MANDI: crop market rates, buyer requirements, selling produce, nearby mandi
- CROP_DISEASE: leaf diseases, symptoms, spots, pest infestation, chemical or organic treatments
- GOVERNMENT_SCHEME: PM Kisan, subsidies, crop insurance, government grants
- LINK_ACCOUNT: linking WhatsApp number to BharatFarm web account
- HELP: general greetings or asking what Sahayak can do
- UNKNOWN: not agricultural or unclear

Return pure JSON only:
{
  "intent": "CLIMATE_RISK" | "SMART_MANDI" | "CROP_DISEASE" | "GOVERNMENT_SCHEME" | "LINK_ACCOUNT" | "HELP" | "UNKNOWN",
  "crop": "Paddy" | "Potato" | "Wheat" | "Tomato" | null,
  "location": string | null,
  "confidence": number
}`;

      const aiRes = await AiClient.chat([
        { role: 'system', content: 'You are a strict agricultural intent classifier. Respond only in JSON.' },
        { role: 'user', content: prompt }
      ], {
        maxTokens: 150,
        responseFormat: 'json_object',
        timeoutMs: 6000
      });

      const parsed: any = JSON.parse(aiRes);
      const validIntents: SahayakIntent[] = ['CLIMATE_RISK', 'SMART_MANDI', 'CROP_DISEASE', 'GOVERNMENT_SCHEME', 'LINK_ACCOUNT', 'HELP', 'UNKNOWN'];
      const chosenIntent = validIntents.includes(parsed.intent) ? parsed.intent : 'UNKNOWN';

      return {
        intent: chosenIntent,
        confidence: Number(parsed.confidence) || 0.8,
        extractedEntity: {
          crop: parsed.crop || undefined,
          location: parsed.location || undefined
        },
        detectedLanguage: language,
        source: 'LLM'
      };
    } catch (err: any) {
      logger.warn(`[IntentRouter] LLM classification error, falling back to UNKNOWN: ${err.message}`);
      return {
        intent: 'UNKNOWN',
        confidence: 0.4,
        detectedLanguage: language,
        source: 'DETERMINISTIC'
      };
    }
  }
}
