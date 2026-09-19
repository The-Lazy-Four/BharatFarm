import {
  CallModuleOption,
  SupportedCallLanguage
} from '../types/call.types.js';

export interface SpokenIntentResult {
  module?: CallModuleOption;
  intentCode?: string;
  isSpecialCommand?: 'MAIN_MENU' | 'BACK' | 'REPEAT' | 'HELP' | 'EXIT';
  detectedLanguage?: SupportedCallLanguage;
  extractedEntities?: {
    crop?: string;
    landSizeAcres?: number;
    district?: string;
  };
}

export class VoiceIntentService {
  /**
   * Identifies special telephony navigation keywords:
   * "main menu", "back", "repeat", "help", "exit" / Hindi equivalents
   */
  static checkSpecialCommands(text: string): 'MAIN_MENU' | 'BACK' | 'REPEAT' | 'HELP' | 'EXIT' | null {
    const lower = text.toLowerCase().trim();

    if (/main\s*menu|main\s*page|shuru|mukhya\s*menu|shuruat|home|homepage|প্রারম্ভিক|মেনু/i.test(lower)) {
      return 'MAIN_MENU';
    }
    if (/wapas|peeche|back|previous|go\s*back|আগের/i.test(lower)) {
      return 'BACK';
    }
    if (/repeat|dobara|phir\s*se|phir\s*batao|ek\s*baar\s*aur|আবার/i.test(lower)) {
      return 'REPEAT';
    }
    if (/help|madad|sahayata|guidance|kya\s*karein|সাহায্য/i.test(lower)) {
      return 'HELP';
    }
    if (/exit|band|khatam|stop|bye|alvida|phone\s*rakho|বন্ধ/i.test(lower)) {
      return 'EXIT';
    }

    return null;
  }

  /**
   * Natural language intent classifier for caller speech.
   * Maps directly to the 6 BharatFarm modules without forcing DTMF.
   */
  static classifyCallSpeech(text: string): SpokenIntentResult {
    const special = this.checkSpecialCommands(text);
    if (special) {
      return { isSpecialCommand: special };
    }

    const lower = text.toLowerCase().trim();

    // 1. Language Detection from Speech
    let detectedLanguage: SupportedCallLanguage | undefined;
    if (/[\u0900-\u097F]/.test(text) || /kya|kaise|batao|hogi|aaj|kal|chahiye|fasal|pani/i.test(lower)) {
      detectedLanguage = 'hi';
    } else if (/[\u0980-\u09FF]/.test(text) || /kemon|bristi|dhan|koto|khobor|hobe/i.test(lower)) {
      detectedLanguage = 'bn';
    } else {
      detectedLanguage = 'en';
    }

    // Extract Crop Entity
    let crop: string | undefined;
    if (/dhan|paddy|chawal|rice|ধান/i.test(lower)) crop = 'Paddy';
    else if (/potato|aaloo|alu|আলু/i.test(lower)) crop = 'Potato';
    else if (/wheat|gehun|gom|গম/i.test(lower)) crop = 'Wheat';
    else if (/tomato|tamatar|টমেটো/i.test(lower)) crop = 'Tomato';
    else if (/mustard|sarson|সরিষা/i.test(lower)) crop = 'Mustard';

    // Extract Land Area
    let landSizeAcres: number | undefined;
    const acreMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:acre|ekad|bigha|একড়)/i);
    if (acreMatch) {
      landSizeAcres = parseFloat(acreMatch[1]);
    }

    // Module 1: BEFORE YOU SOW (Price risk, sowing decision)
    if (
      /before\s*you\s*sow|kya\s*bona|kaunsi\s*fasal|sowing|risk|loss|bavishyavani|kya\s*lagana\s*sahi\s*rahega|কী\s*বপন/i.test(lower) ||
      /is\s*baar\s*kaunsa\s*crop/i.test(lower)
    ) {
      return {
        module: 'BEFORE_YOU_SOW',
        detectedLanguage,
        extractedEntities: { crop, landSizeAcres }
      };
    }

    // Module 2: CLIMATE RISK (Weather, rain, flood, procurement planning)
    if (
      /baarish|rain|weather|mausam|flood|tufan|badal|forecast|temperature|garmi|sardi|বৃষ্টি|বন্যা/i.test(lower) ||
      /kal\s*baarish\s*hogi/i.test(lower) ||
      /aaj\s*mausam/i.test(lower)
    ) {
      return {
        module: 'CLIMATE_RISK',
        detectedLanguage,
        extractedEntities: { crop }
      };
    }

    // Module 3: AGGREGATION (Group buying, collective selling)
    if (
      /aggregation|group\s*buying|collective\s*selling|group\s*selling|milkar\s*bechna|samuh|ek\s*saath\s*bechna|দলবদ্ধ/i.test(lower) ||
      /group\s*mein/i.test(lower) ||
      /collective/i.test(lower)
    ) {
      return {
        module: 'AGGREGATION',
        detectedLanguage,
        extractedEntities: { crop }
      };
    }

    // Module 4: CROP INSURANCE (PMFBY, satellite verification, claim check)
    if (
      /insurance|bima|claim|daawa|verify|satellite|loss\s*verification|fasal\s*bima|বীমা|দাবি/i.test(lower) ||
      /fasal\s*ka\s*daawa/i.test(lower)
    ) {
      return {
        module: 'CROP_INSURANCE',
        detectedLanguage,
        extractedEntities: { crop }
      };
    }

    // Module 5: SMART MANDI (Mandi price, rates, nearest market, buyer demand)
    if (
      /mandi|price|rate|bhav|daam|market|bazaar|bechna\s*hai|mandi\s*mein\s*dhan|মান্ডি|দর/i.test(lower) ||
      /kal\s*dhan\s*bechna\s*hai/i.test(lower) ||
      /sabse\s*achhi\s*mandi/i.test(lower) ||
      /paas\s*wali\s*mandi/i.test(lower)
    ) {
      return {
        module: 'SMART_MANDI',
        detectedLanguage,
        extractedEntities: { crop }
      };
    }

    // Module 6: BASIC FARMER NEEDS (Scanner, Marketplace, Schemes, Calculator, KrishiBot)
    if (
      /scanner|leaf|patta|roadmap|marketplace|fertilizer|khad|calculator|krishibot|scheme|yojana|basic/i.test(lower) ||
      /leaf\s*scanner\s*kahan\s*hai/i.test(lower) ||
      /dawai\s*kab\s*spray\s*karni\s*hai/i.test(lower)
    ) {
      return {
        module: 'BASIC_FARMER_NEEDS',
        detectedLanguage,
        extractedEntities: { crop }
      };
    }

    return { detectedLanguage };
  }
}
