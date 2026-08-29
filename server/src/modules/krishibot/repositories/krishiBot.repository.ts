import { ChatRequest, ChatResponse, ChatMessage, KrishiBotSession } from '../types/krishiBot.types.js';
import { KRISHIBOT_CONSTANTS } from '../constants/krishiBot.constants.js';
import { AiClient, AiMessage } from '../../../utils/aiClient.js';
import { AiCache } from '../../../utils/aiCache.js';
import { logger } from '../../../utils/logger.js';
import { config } from '../../../config/env.js';
import { getSupabaseAdminClient } from '../../../config/supabase.js';
import { MarketplaceRepository } from '../../marketplace/repositories/marketplace.repository.js';
import { SchemesRepository } from '../../schemes/repositories/schemes.repository.js';
import { GroupBuyingRepository } from '../../groupbuying/repositories/groupBuying.repository.js';
import { WeatherRepository } from '../../weather/repositories/weather.repository.js';

// In-memory fallback persistence for Mock Mode or when DB is unreachable
const memorySessions = new Map<string, KrishiBotSession>();
const memoryMessages = new Map<string, ChatMessage[]>();

export class KrishiBotRepository {
  private marketplaceRepo: MarketplaceRepository;
  private schemesRepo: SchemesRepository;
  private groupBuyingRepo: GroupBuyingRepository;
  private weatherRepo: WeatherRepository;

  constructor() {
    this.marketplaceRepo = new MarketplaceRepository();
    this.schemesRepo = new SchemesRepository();
    this.groupBuyingRepo = new GroupBuyingRepository();
    this.weatherRepo = new WeatherRepository();
  }

  /**
   * Get active session or create a new session for the authenticated user.
   */
  async getOrCreateSession(userId: string, language: string = 'en'): Promise<KrishiBotSession> {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      try {
        const { data: existing } = await supabase
          .from('krishibot_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (existing) {
          return {
            id: existing.id,
            userId: existing.user_id,
            language: existing.language || language,
            createdAt: existing.created_at,
            updatedAt: existing.updated_at
          };
        }

        const { data: created, error } = await supabase
          .from('krishibot_sessions')
          .insert({ user_id: userId, language })
          .select()
          .single();

        if (!error && created) {
          return {
            id: created.id,
            userId: created.user_id,
            language: created.language,
            createdAt: created.created_at,
            updatedAt: created.updated_at
          };
        }
      } catch (err: any) {
        logger.warn(`[KrishiBot] Supabase session fetch/create warning: ${err.message}`);
      }
    }

    // In-memory fallback
    for (const session of memorySessions.values()) {
      if (session.userId === userId) {
        return session;
      }
    }

    const newSession: KrishiBotSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId,
      language,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    memorySessions.set(newSession.id, newSession);
    memoryMessages.set(newSession.id, []);
    return newSession;
  }

  /**
   * Fetch chat history for a session.
   */
  async getSessionMessages(sessionId: string, userId: string): Promise<ChatMessage[]> {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      try {
        // Verify session ownership
        const { data: session } = await supabase
          .from('krishibot_sessions')
          .select('user_id')
          .eq('id', sessionId)
          .single();

        if (session && session.user_id !== userId) {
          throw new Error('UNAUTHORIZED_SESSION_ACCESS');
        }

        const { data: msgs } = await supabase
          .from('krishibot_messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true })
          .limit(50);

        if (msgs) {
          return msgs.map(m => ({
            id: m.id,
            sessionId: m.session_id,
            sender: m.sender as 'user' | 'bot',
            text: m.content,
            timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            audioUrl: m.audio_url || undefined,
            suggestedActions: m.suggested_actions || undefined
          }));
        }
      } catch (err: any) {
        if (err.message === 'UNAUTHORIZED_SESSION_ACCESS') throw err;
        logger.warn(`[KrishiBot] Supabase messages fetch warning: ${err.message}`);
      }
    }

    // Memory fallback
    const memSession = memorySessions.get(sessionId);
    if (memSession && memSession.userId !== userId) {
      throw new Error('UNAUTHORIZED_SESSION_ACCESS');
    }
    return memoryMessages.get(sessionId) || [];
  }

  /**
   * Delete session and its messages.
   */
  async deleteSession(sessionId: string, userId: string): Promise<boolean> {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      try {
        const { data: session } = await supabase
          .from('krishibot_sessions')
          .select('user_id')
          .eq('id', sessionId)
          .single();

        if (session && session.user_id !== userId) {
          throw new Error('UNAUTHORIZED_SESSION_ACCESS');
        }

        await supabase.from('krishibot_sessions').delete().eq('id', sessionId);
      } catch (err: any) {
        if (err.message === 'UNAUTHORIZED_SESSION_ACCESS') throw err;
        logger.warn(`[KrishiBot] Supabase session delete warning: ${err.message}`);
      }
    }

    memorySessions.delete(sessionId);
    memoryMessages.delete(sessionId);
    return true;
  }

  /**
   * Main query processor integrating context & persistence.
   */
  async processQuery(request: ChatRequest, userId: string): Promise<ChatResponse> {
    const language = request.language || KRISHIBOT_CONSTANTS.DEFAULT_LANGUAGE;
    const session = request.sessionId
      ? { id: request.sessionId, userId, language, createdAt: '', updatedAt: '' }
      : await this.getOrCreateSession(userId, language);

    // 1. Fetch recent conversation history for multi-turn context (last 6 messages)
    const history = await this.getSessionMessages(session.id, userId);
    const recentHistory = history.slice(-6);

    // 2. Persist user message immediately
    const userMsgId = await this.saveMessage(session.id, 'user', request.message);

    // 3. Gather real domain context based on keywords in user message
    const domainContext = await this.buildDomainContext(request.message, request.farmerContext);

    // 4. Generate AI reply via OpenRouter or Fallback
    let replyText = '';
    let isAiGenerated = false;

    if (AiClient.isConfigured()) {
      try {
        replyText = await this.queryAiProvider(request.message, language, recentHistory, domainContext);
        isAiGenerated = true;
      } catch (err: any) {
        logger.error(`[KrishiBot] AI provider failed: ${err.message}`);
        if (!config.useMockData) {
          replyText = "KrishiBot AI is temporarily unreachable due to network latency. Please try again shortly.";
        } else {
          replyText = this.getRuleBasedReply(request.message, language as any);
        }
      }
    } else {
      replyText = this.getRuleBasedReply(request.message, language as any);
    }

    // 5. Persist bot response
    const botMsgId = await this.saveMessage(session.id, 'bot', replyText, KRISHIBOT_CONSTANTS.SUGGESTED_ACTIONS);

    return {
      sessionId: session.id,
      messageId: botMsgId,
      reply: replyText,
      suggestedActions: KRISHIBOT_CONSTANTS.SUGGESTED_ACTIONS,
      confidence: isAiGenerated ? 0.95 : 0.7
    };
  }

  private async saveMessage(sessionId: string, sender: 'user' | 'bot', content: string, suggestedActions?: string[]): Promise<string> {
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      try {
        const { data: saved } = await supabase
          .from('krishibot_messages')
          .insert({
            session_id: sessionId,
            sender,
            content,
            suggested_actions: suggestedActions
          })
          .select('id')
          .single();

        if (saved) {
          // Touch session updated_at
          await supabase.from('krishibot_sessions').update({ updated_at: new Date().toISOString() }).eq('id', sessionId);
          return saved.id;
        }
      } catch (err: any) {
        logger.warn(`[KrishiBot] Supabase message insert warning: ${err.message}`);
      }
    }

    // Memory fallback
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const list = memoryMessages.get(sessionId) || [];
    list.push({
      id: msgId,
      sessionId,
      sender,
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions
    });
    memoryMessages.set(sessionId, list);
    return msgId;
  }

  private async buildDomainContext(query: string, farmerContext?: any): Promise<string> {
    const text = query.toLowerCase();
    const contextParts: string[] = [];

    if (farmerContext?.location || farmerContext?.state) {
      contextParts.push(`Farmer Location: ${farmerContext.location || farmerContext.state}`);
    }
    if (farmerContext?.crop) {
      contextParts.push(`Primary Crop: ${farmerContext.crop}`);
    }
    if (farmerContext?.landSize) {
      contextParts.push(`Land Size: ${farmerContext.landSize} Acres`);
    }

    // Weather Context
    if (text.includes('rain') || text.includes('weather') || text.includes('baarish') || text.includes('मौसम') || text.includes('আবহাওয়া') || text.includes('water') || text.includes('spray')) {
      try {
        const weather = await this.weatherRepo.getWeather(farmerContext?.location || 'Punjab');
        contextParts.push(`Live Weather Telemetry: ${weather.temperatureCelsius}°C, ${weather.condition}, Humidity: ${weather.humidityPercent}%, Rain Chance: ${weather.rainfallProbability}%, Wind: ${weather.windSpeedKmh} km/h.`);
      } catch (err) {
        // ignore
      }
    }

    // Marketplace Products Context
    if (text.includes('buy') || text.includes('price') || text.includes('fertilizer') || text.includes('seed') || text.includes('pesticide') || text.includes('khad') || text.includes('खाद') || text.includes('সার') || text.includes('sasta')) {
      try {
        const products = await this.marketplaceRepo.findAll({});
        const summary = products.slice(0, 5).map(p => `${p.title} (₹${p.price}/${p.unit})`).join(', ');
        contextParts.push(`Actual Marketplace Catalog: ${summary}`);
      } catch (err) {
        // ignore
      }
    }

    // Government Schemes Context
    if (text.includes('scheme') || text.includes('subsidy') || text.includes('yojana') || text.includes('pm-kisan') || text.includes('योजना') || text.includes('স্কিম')) {
      try {
        const schemes = await this.schemesRepo.findAll();
        const summary = schemes.slice(0, 4).map(s => `${s.title} (${s.category})`).join(', ');
        contextParts.push(`Official Government Schemes: ${summary}`);
      } catch (err) {
        // ignore
      }
    }

    // Group Buying Pools Context
    if (text.includes('group') || text.includes('pool') || text.includes('bulk') || text.includes('discount')) {
      try {
        const pools = await this.groupBuyingRepo.findAll();
        const summary = pools.slice(0, 3).map(p => `${p.itemTitle} (Original: ₹${p.originalPricePerUnit}, Discounted: ₹${p.discountedPricePerUnit}, Current Qty: ${p.currentQuantity}/${p.targetQuantity})`).join(', ');
        contextParts.push(`Active Group Buying Pools: ${summary}`);
      } catch (err) {
        // ignore
      }
    }

    return contextParts.join('\n');
  }

  private async queryAiProvider(query: string, language: string, history: ChatMessage[], domainContext: string): Promise<string> {
    // Check AI Response Cache first
    const cacheKey = AiCache.createFingerprint('krishibot', { query, language, domainContext });
    const cached = AiCache.get<string>(cacheKey);
    if (cached) return cached;

    const systemPrompt = `You are Shayak (KrishiBot), BharatFarm's intelligent AI agricultural assistant for Indian farmers.
Respond in ${language === 'hi' ? 'Hindi' : language === 'bn' ? 'Bengali' : 'English'}.
Structure your advice clearly:
1. Direct short answer
2. Practical step-by-step action
3. Important safety or weather caution if applicable.

Strict Rules:
- Never invent product prices, government schemes, or weather conditions. Use the verified context provided below.
- Keep responses concise (3-4 bullet points max) so they are easy to digest on mobile devices.
- If vital information (e.g. crop type or stage) is missing to give a safe recommendation, ask 1 concise follow-up question.

[VERIFIED BHARATFARM CONTEXT]
${domainContext || 'No additional domain telemetry required.'}`;

    const messages: AiMessage[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Include recent history for multi-turn context
    for (const h of history) {
      messages.push({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.text
      });
    }

    // Current query
    messages.push({ role: 'user', content: query });

    const reply = await AiClient.chat(messages, { maxTokens: 600 });
    const finalReply = reply.trim() || KRISHIBOT_CONSTANTS.MOCK_FALLBACK_REPLY;

    // Cache response for 1 hour
    AiCache.set(cacheKey, finalReply, 3600000);
    return finalReply;
  }

  private getRuleBasedReply(text: string, requestedLanguage: string): string {
    const query = text.toLowerCase();
    let lang: 'en' | 'hi' | 'bn' = requestedLanguage === 'hi' ? 'hi' : requestedLanguage === 'bn' ? 'bn' : 'en';

    if (query.includes('hello') || query.includes('hi') || query.includes('namaskar') || query.includes('नमस्कार')) {
      if (lang === 'hi')
        return 'नमस्कार! मैं शायक (कृषिबॉट) हूँ। आपकी फसल, मौसम, बाज़ार भाव या सरकारी योजनाओं में क्या सहायता कर सकता हूँ?';
      if (lang === 'bn')
        return 'নমস্কার! আমি শায়াক (কৃষিবট)। আপনার ফসল, আবহাওয়া বা সরকারি স্কিমে কীভাবে সাহায্য করতে পারি?';
      return 'Namaskar! I am Shayak (KrishiBot). How can I assist you today with crop health, market rates, weather alerts, or government schemes?';
    }

    if (query.includes('rain') || query.includes('weather') || query.includes('baarish') || query.includes('मौसम') || query.includes('আবহাওয়া')) {
      if (lang === 'hi')
        return 'मौसम अपडेट: खेत में सिंचाई करने से पहले वर्षा पूर्वानुमान की जाँच करें। भारी वर्षा की संभावना होने पर यूरिया छिड़काव स्थगित रखें।';
      if (lang === 'bn')
        return 'আবহাওয়ার খবর: বৃষ্টির পূর্বাভাস থাকলে সার প্রয়োগ বা জলসেচ আপাতত বন্ধ রাখুন।';
      return 'Weather Advice: Check live radar telemetry before irrigating. Avoid applying top-dressing fertilizers right before expected heavy rainfall.';
    }

    if (query.includes('fertilizer') || query.includes('khad') || query.includes('खाद') || query.includes('সার')) {
      if (lang === 'hi')
        return 'खाद प्रयोग: गेहूं व धान के लिए संतुलित NPK (4:2:1) का प्रयोग करें। हमारे मंडी सेक्शन में समूह खरीद (Group Buying) पर विशेष छूट उपलब्ध है।';
      if (lang === 'bn')
        return 'সার প্রয়োগ: মাটিতে সুষম NPK সারের প্রয়োগ নিশ্চিত করুন। আমাদের মার্কেটপ্লেসে ছাড়ে সার কিনতে পারেন।';
      return 'Fertilizer Guidance: Apply balanced NPK based on soil health test. Check our Group Buying pools for bulk discounts on verified fertilizers.';
    }

    if (lang === 'hi')
      return 'धन्यवाद! आपकी फसल की सुरक्षा के लिए समय पर सिंचाई व सही खाद का प्रयोग करें। विस्तृत सलाह के लिए अपनी फसल का नाम बताएँ।';
    if (lang === 'bn')
      return 'ধন্যবাদ! ভালো ফলনের জন্য সঠিক সার ও জলসেচ দিন। আরও বিস্তারিত তথ্যের জন্য ফসলের নাম বলুন।';
    return 'Thank you! For optimal yield, maintain timely irrigation and weed control. Tell me your crop name for detailed seasonal recommendations.';
  }
}
