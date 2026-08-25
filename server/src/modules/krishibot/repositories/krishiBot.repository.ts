import { ChatRequest, ChatResponse } from '../types/krishiBot.types.js';
import { KRISHIBOT_CONSTANTS } from '../constants/krishiBot.constants.js';
import { AiClient, AiMessage } from '../../../utils/aiClient.js';
import { logger } from '../../../utils/logger.js';
import { config } from '../../../config/env.js';

/**
 * Adapted from the OLD project's `POST /api/chat` route (server.js) and
 * its `callOpenAI` / `getFallbackAIResponse` helpers (js/chatbot.js has
 * the matching client-side flow). The old app's "Smart Fallback AI
 * Engine" — a rule-based, trilingual (en/hi/bn) response generator used
 * whenever no AI key is configured or the AI call fails — is ported here
 * 1:1 rather than dropped, since it's core to how the old app worked
 * offline/without cost.
 */
export class KrishiBotRepository {
  async processQuery(request: ChatRequest): Promise<ChatResponse> {
    const language = request.language || KRISHIBOT_CONSTANTS.DEFAULT_LANGUAGE;

    if (!AiClient.isConfigured()) {
      if (!config.useMockData) {
        logger.error('[KrishiBot] OPENROUTER_API_KEY missing while Mock Mode is false.');
        throw new Error('OPENROUTER_API_KEY is not configured on server');
      }
      return this.buildFallbackResponse(request.message, language);
    }

    try {
      return await this.queryAiProvider(request, language);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('[KrishiBot] AI query failed', { error: message });
      if (!config.useMockData) {
        throw new Error(`KrishiBot AI error: ${message}`);
      }
      return this.buildFallbackResponse(request.message, language);
    }
  }

  private async queryAiProvider(request: ChatRequest, language: string): Promise<ChatResponse> {
    const contextParts: string[] = [];
    if (request.farmerContext?.location) contextParts.push(`The farmer is located in ${request.farmerContext.location}.`);
    if (request.farmerContext?.crop) contextParts.push(`They are currently growing ${request.farmerContext.crop}.`);

    const systemNote = `You are KrishiBot, a friendly AI agricultural assistant for Indian farmers. Respond in ${language}. Keep answers very short (2-3 sentences max) as they will be read aloud on mobile. ${contextParts.join(' ')}`;

    const messages: AiMessage[] = [
      { role: 'system', content: systemNote },
      { role: 'user', content: request.message }
    ];

    const reply = await AiClient.chat(messages);

    return {
      messageId: `msg-${Date.now()}`,
      reply: reply.trim() || KRISHIBOT_CONSTANTS.MOCK_FALLBACK_REPLY,
      suggestedActions: KRISHIBOT_CONSTANTS.SUGGESTED_ACTIONS,
      confidence: 0.9
    };
  }

  /** Ported from OLD server.js `getFallbackAIResponse()` — same trigger keywords and en/hi/bn copy. */
  private buildFallbackResponse(message: string, requestedLanguage: string): ChatResponse {
    const text = message.toLowerCase();
    let lang: 'en' | 'hi' | 'bn' = requestedLanguage === 'hi' ? 'hi' : requestedLanguage === 'bn' ? 'bn' : 'en';
    if (text.includes('hindi') || text.includes('respond in hi') || text.includes(' in hi')) lang = 'hi';
    if (text.includes('bengali') || text.includes('respond in bn') || text.includes(' in bn')) lang = 'bn';

    return {
      messageId: `msg-${Date.now()}`,
      reply: this.getRuleBasedReply(text, lang),
      suggestedActions: KRISHIBOT_CONSTANTS.SUGGESTED_ACTIONS,
      confidence: 0.6
    };
  }

  private getRuleBasedReply(text: string, lang: 'en' | 'hi' | 'bn'): string {
    if (text.includes('hello') || text.includes('hi') || text.includes('namaskar') || text.includes('नमस्कार')) {
      if (lang === 'hi')
        return 'नमस्कार! मैं कृषिबॉट हूँ, आपका एआई स्मार्ट फार्मिंग सलाहकार। आज मैं आपकी फसलों, मौसम या सरकारी योजनाओं में क्या मदद कर सकता हूँ?';
      if (lang === 'bn')
        return 'নমস্কার! আমি কৃষিবট, আপনার এআই স্মার্ট ফার্মিং উপদেষ্টা। আজ আমি আপনার ফসল, আবহাওয়া বা সরকারি স্কিমে কীভাবে সাহায্য করতে পারি?';
      return 'Namaskar! Welcome to BharatFarm. I am KrishiBot, your dedicated AI agricultural advisor. How can I help you today with crops, pest control, weather, or government schemes?';
    }

    if (text.includes('rice') || text.includes('paddy') || text.includes('धान') || text.includes('ধান')) {
      if (lang === 'hi')
        return 'धान (चावल) की खेती के लिए गर्म और आर्द्र जलवायु की आवश्यकता होती है। खेत में पानी का स्तर हमेशा 5 सेमी बनाए रखें। तना छेदक (Stem Borer) या ब्लास्ट रोग से सावधान रहें।';
      if (lang === 'bn')
        return 'ধান চাষের জন্য গরম ও আর্দ্র জলবায়ু প্রয়োজন। জমিতে জলের স্তর ৫ সেমি বজায় রাখুন। মাজরা পোকা বা ব্লাস্ট রোগ সম্পর্কে সতর্ক থাকুন।';
      return 'Rice/Paddy thrives in hot, humid climates with stagnant water. Keep field water levels at approximately 5cm. Periodically inspect leaves for blast lesions and stem borer tunnels.';
    }

    if (text.includes('pest') || text.includes('disease') || text.includes('कीड़ा') || text.includes('পোকা')) {
      if (lang === 'hi')
        return 'फसलों को नुकसान पहुंचाने वाले कीटों के नियंत्रण के लिए जैविक नीम का तेल (5ml/L पानी) स्प्रे करें। गंभीर कीट संक्रमण के समय हमारे लीफ स्कैनर का उपयोग करके तुरंत एआई निदान प्राप्त करें।';
      if (lang === 'bn')
        return 'ক্ষতিকারক পোকা দমনের জন্য নিম তেল (প্রতি লিটার জলে ৫ মিলি) স্প্রে করতে পারেন। পোকা বেশি হলে আমাদের লিফ স্ক্যানার ব্যবহার করে দ্রুত রোগ নির্ণয় করুন।';
      return 'For immediate, natural pest control, spray cold-pressed neem oil mixture (5ml per Liter of water). If the infestation looks severe, snap a photo using our Leaf Scanner to get a prompt diagnosis!';
    }

    if (text.includes('fertilizer') || text.includes('khad') || text.includes('खाद') || text.includes('সার')) {
      if (lang === 'hi')
        return 'मिट्टी परीक्षण रिपोर्ट के आधार पर ही खाद डालें। सामान्यतः अनाज फसलों के लिए NPK (नाइट्रोजन, फास्फोरस, पोटेशियम) का अनुपात 4:2:1 उपयुक्त माना जाता है। जैविक खाद का प्रयोग मिट्टी की सेहत सुधारता है।';
      if (lang === 'bn')
        return 'মাটি পরীক্ষার রিপোর্টের ওপর ভিত্তি করে সার দিন। সাধারণত ফসলের জন্য NPK অনুপাত ৪:২:১ রাখা হয়। জৈব সার (গোবর সার/কেঁচো সার) মাটির উর্বরতা বাড়ায়।';
      return 'Apply chemical fertilizers strictly based on soil test results. Standard ratios for major cereal crops are NPK 4:2:1. Adding organic compost or bio-fertilizers greatly enriches long-term soil structure.';
    }

    if (text.includes('weather') || text.includes('rain') || text.includes('मौसम') || text.includes('আবহাওয়া')) {
      if (lang === 'hi')
        return 'मौसम पर नज़र रखना ज़रूरी है। भारी बारिश की संभावना होने पर कीटनाशकों का छिड़काव या यूरिया डालने से बचें। वास्तविक समय की 7 दिनों की मौसम जानकारी के लिए हमारे वेदर सेक्शन पर जाएँ।';
      if (lang === 'bn')
        return 'আবহাওয়ার দিকে নজর রাখা জরুরি। ভারী বৃষ্টির পূর্বাভাস থাকলে সারের উপরিপ্রয়োগ বা কীটনাশক স্প্রে করা বন্ধ রাখুন। ৭ দিনের লাইভ পূর্বাভাসের জন্য আমাদের ওয়েদার স্ক্রিন দেখুন।';
      return 'Always track atmospheric alerts. Avoid chemical spraying or top-dressing nitrogen right before heavy rainfall. Navigate to our Weather screen for real-time localized forecasts.';
    }

    if (lang === 'hi')
      return 'आपके सवाल के लिए धन्यवाद! फसल की अधिक उपज के लिए समय पर सिंचाई, नियमित निराई-गुड़ाई और उचित खाद प्रबंधन आवश्यक है। किसी भी विशेष फसल या कीट के बारे में विस्तार से पूछें।';
    if (lang === 'bn')
      return 'আপনার প্রশ্নের জন্য ধন্যবাদ! ভালো ফলনের জন্য সঠিক সময়ে জলসেচ, নিয়মিত আগাছা পরিষ্কার এবং সুষম সার প্রয়োগ অত্যন্ত জরুরি। কোনো নির্দিষ্ট ফসল বা রোগ সম্পর্কে বিশদে জিজ্ঞাসা করুন।';
    return 'Thank you for asking! For optimal yield, focus on proper drainage, timely weeding, and organic soil aeration. Let me know if you want detailed steps regarding specific crop cycles or organic pesticides.';
  }
}
