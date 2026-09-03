import { classifyLocalIntent, detectSpokenLanguage, LanguageCode } from '../voiceKnowledge/intentClassifier';
import { KrishiBotApi } from './krishiBotApi';

export interface VoiceAssistantResponse {
  responseMessage: string;
  detectedLanguage: LanguageCode;
  isNavigation: boolean;
  navPath?: string;
  matchedIntentId?: string;
  source: 'LOCAL_INTENT' | 'AI_ENGINE' | 'FALLBACK';
}

export class SpeakToAiService {
  /**
   * Process incoming voice query through two-layer architecture with conversational memory
   */
  public static async processQuery(
    queryText: string,
    previousContextIntent?: string
  ): Promise<VoiceAssistantResponse> {
    const lang = detectSpokenLanguage(queryText);

    // Layer 1: Fast Local Intent Classification (0ms Navigation)
    const localResult = classifyLocalIntent(queryText, previousContextIntent);

    if (localResult.matched && localResult.isNavigation) {
      return {
        responseMessage: localResult.responseMessage || 'Opening feature...',
        detectedLanguage: localResult.detectedLanguage,
        isNavigation: true,
        navPath: localResult.navPath,
        matchedIntentId: localResult.intentId,
        source: 'LOCAL_INTENT'
      };
    }

    if (!localResult.matched && localResult.isNoise) {
      return {
        responseMessage: localResult.responseMessage || 'Could you please clarify your request?',
        detectedLanguage: localResult.detectedLanguage,
        isNavigation: false,
        source: 'LOCAL_INTENT'
      };
    }

    // Layer 2: Open-ended AI Query Processing for farming questions
    try {
      const chatRes = await KrishiBotApi.sendMessage(queryText, lang);
      const replyText = chatRes?.reply || 'I am ready to help you with your crop and farm questions.';

      return {
        responseMessage: replyText,
        detectedLanguage: lang,
        isNavigation: false,
        source: 'AI_ENGINE'
      };
    } catch {
      let fallback = 'I am having trouble reaching the farming advisor right now. You can still use all BharatFarm features normally.';
      if (lang === 'hi') {
        fallback = 'कृषि सलाहकार से जुड़ने में समस्या हो रही है। आप अभी भी BharatFarm की सभी सुविधाओं का सामान्य रूप से उपयोग कर सकते हैं।';
      } else if (lang === 'bn') {
        fallback = 'কৃষি পরামর্শকের সাথে সংযোগ করতে সমস্যা হচ্ছে। আপনি এখনও BharatFarm-এর সমস্ত সুবিধা ব্যবহার করতে পারেন।';
      }

      return {
        responseMessage: fallback,
        detectedLanguage: lang,
        isNavigation: false,
        source: 'FALLBACK'
      };
    }
  }
}
