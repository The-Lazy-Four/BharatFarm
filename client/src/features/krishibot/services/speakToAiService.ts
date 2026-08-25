import { classifyLocalIntent, detectSpokenLanguage, IntentMatchResult } from '../voiceKnowledge/intentClassifier.js';
import { KrishiBotApi } from './krishiBotApi.js';

export interface VoiceAssistantResponse {
  detectedLanguage: 'en' | 'hi' | 'bn';
  isNavigation: boolean;
  navPath?: string;
  responseMessage: string;
  source: 'LOCAL_FAST' | 'AI_ENGINE';
  isSensitive?: boolean;
}

/**
 * Modern Multilingual Two-Layer Voice Processing Pipeline.
 * LAYER 1: Immediate local intent matching (0ms latency, zero API calls for app commands).
 * LAYER 2: Server-side OpenRouter / Gemini AI pipeline for open-ended agricultural queries.
 */
export class SpeakToAiService {
  static async processQuery(
    rawQuery: string,
    currentPageRoute?: string
  ): Promise<VoiceAssistantResponse> {
    const lang = detectSpokenLanguage(rawQuery);

    // LAYER 1: Fast Intent Matching
    const localMatch: IntentMatchResult = classifyLocalIntent(rawQuery, currentPageRoute);

    if (localMatch.matched) {
      return {
        detectedLanguage: localMatch.detectedLanguage,
        isNavigation: localMatch.isNavigation,
        navPath: localMatch.navPath,
        responseMessage: localMatch.responseMessage,
        source: 'LOCAL_FAST',
        isSensitive: localMatch.isSensitive
      };
    }

    // LAYER 2: AI Farming Query Engine via existing KrishiBot backend pipeline
    try {
      const res = await KrishiBotApi.sendMessage(rawQuery, lang);
      const replyText = res?.reply || 'BharatFarm AI could not process this request right now.';

      return {
        detectedLanguage: lang,
        isNavigation: false,
        responseMessage: replyText,
        source: 'AI_ENGINE'
      };
    } catch {
      let fallback = 'I am having trouble reaching the farming advisor right now. You can still use all BharatFarm features normally.';
      if (lang === 'hi') {
        fallback = 'कृषि सलाहकार से जुड़ने में समस्या हो रही है। आप अभी भी BharatFarm की सभी सुविधाओं का सामान्य रूप से उपयोग कर सकते हैं।';
      } else if (lang === 'bn') {
        fallback = 'কৃষি উপদেষ্টার সাথে সংযোগ করতে সমস্যা হচ্ছে। আপনি এখনও BharatFarm-এর সমস্ত ফিচার ব্যবহার করতে পারেন।';
      }

      return {
        detectedLanguage: lang,
        isNavigation: false,
        responseMessage: fallback,
        source: 'LOCAL_FAST'
      };
    }
  }
}
