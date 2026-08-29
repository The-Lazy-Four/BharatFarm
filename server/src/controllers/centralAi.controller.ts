import { Request, Response } from 'express';
import { AiClient } from '../utils/aiClient.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { MarketplaceRepository } from '../modules/marketplace/repositories/marketplace.repository.js';
import { GroupBuyingRepository } from '../modules/groupbuying/repositories/groupBuying.repository.js';
import { SchemesRepository } from '../modules/schemes/repositories/schemes.repository.js';
import { WeatherRepository } from '../modules/weather/repositories/weather.repository.js';
import { logger } from '../utils/logger.js';
import { ProductListing } from '../modules/marketplace/types/marketplace.types.js';
import { GroupBuyPool } from '../modules/groupbuying/types/groupBuying.types.js';
import { AiCache } from '../utils/aiCache.js';

export class CentralAiController {
  private marketplaceRepo = new MarketplaceRepository();
  private groupBuyingRepo = new GroupBuyingRepository();
  private schemesRepo = new SchemesRepository();
  private weatherRepo = new WeatherRepository();

  /**
   * Generates a context-aware "Today's Farm Advice" for the Dashboard.
   * Uses server-side caching (4-hour TTL) based on location, crop, and land size.
   */
  getDashboardAdvice = async (req: Request, res: Response): Promise<void> => {
    const { crop = 'Wheat', state = 'Punjab', location = 'Ludhiana, Punjab', landSize = 5 } = req.query;

    const cacheKey = AiCache.createFingerprint('dashboard_advice', { crop, state, location, landSize });
    const cached = AiCache.get<any>(cacheKey);
    if (cached) {
      ApiResponse.success(res, { ...cached, source: 'SERVER_CACHE' });
      return;
    }

    let weatherSummary = 'Temperature 26°C, Clear sky, 10% rain chance';
    try {
      const weather = await this.weatherRepo.getWeather({ location: String(location) });
      weatherSummary = `${weather.condition}, Temp: ${weather.temperatureCelsius}°C, Humidity: ${weather.humidityPercent}%, Rain probability: ${weather.rainfallProbability}%, Wind: ${weather.windSpeedKmh} km/h`;
    } catch {
      logger.warn('[CentralAi] Using default weather context for dashboard advice');
    }

    if (!AiClient.isConfigured()) {
      const fallbackResult = {
        advice: `Weather is clear (${weatherSummary}). Ideal window for routine fertilizer application and canopy inspection on your ${landSize} acres of ${crop}.`,
        source: 'RULE_ENGINE',
        isAiGenerated: false
      };
      AiCache.set(cacheKey, fallbackResult, 4 * 3600 * 1000);
      ApiResponse.success(res, fallbackResult);
      return;
    }

    try {
      const prompt = `You are BharatFarm's senior agronomist. 
Farmer Context:
- Location: ${location} (${state})
- Land size: ${landSize} acres
- Crop: ${crop}
- Current Weather: ${weatherSummary}

Provide a concise, 2-sentence actionable daily farm advice for this farmer.
First sentence: direct crop/irrigation/field recommendation based on weather.
Second sentence: practical step or caution for today.
Plain text only, no markdown formatting.`;

      const advice = await AiClient.chat([{ role: 'user', content: prompt }], { maxTokens: 150 });
      const resultPayload = {
        advice: advice.trim(),
        source: 'OPENROUTER_AI',
        isAiGenerated: true
      };
      AiCache.set(cacheKey, resultPayload, 4 * 3600 * 1000); // 4-hour cache
      ApiResponse.success(res, resultPayload);
    } catch (err: any) {
      logger.error('[CentralAi] Dashboard advice AI query failed, falling back:', { error: err?.message });
      const fallbackResult = {
        advice: `Weather telemetry active (${weatherSummary}). Continue planned field activities and maintain standard moisture levels for ${crop}.`,
        source: 'FALLBACK',
        isAiGenerated: false
      };
      ApiResponse.success(res, fallbackResult);
    }
  };

  /**
   * Natural Language Marketplace Search
   * Bypasses AI for single-word catalog searches (e.g. "wheat", "seeds").
   * Caches interpretation requests.
   */
  naturalMarketplaceSearch = async (req: Request, res: Response): Promise<void> => {
    const { query = '' } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      ApiResponse.error(res, 'Query string is required', 'INVALID_INPUT', 400);
      return;
    }

    const trimmed = query.trim();
    const allProducts: ProductListing[] = await this.marketplaceRepo.findAll();

    // Query Classification: Check if query is a simple single-word/term search that doesn't need AI interpretation
    const words = trimmed.split(/\s+/);
    if (words.length <= 2 && !/\b(under|below|cheap|best|for|suitable|less|than)\b/i.test(trimmed)) {
      const q = trimmed.toLowerCase();
      const matched = allProducts.filter((p: ProductListing) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
      );
      ApiResponse.success(res, {
        matchedProducts: matched,
        explanation: `Found ${matched.length} product(s) matching catalog keyword "${trimmed}".`,
        isAiGenerated: false
      });
      return;
    }

    const cacheKey = AiCache.createFingerprint('marketplace_search', { query: trimmed });
    const cached = AiCache.get<any>(cacheKey);
    if (cached) {
      ApiResponse.success(res, cached);
      return;
    }

    if (!AiClient.isConfigured()) {
      const q = trimmed.toLowerCase();
      const matched = allProducts.filter((p: ProductListing) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
      );
      const resPayload = {
        matchedProducts: matched,
        explanation: `Found ${matched.length} product(s) matching "${trimmed}".`,
        isAiGenerated: false
      };
      AiCache.set(cacheKey, resPayload, 3600 * 1000);
      ApiResponse.success(res, resPayload);
      return;
    }

    try {
      // Context Compression: send lightweight product catalog representation
      const compressedCatalog = allProducts.map((p: ProductListing) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        price: p.price,
        unit: p.unit
      }));

      const prompt = `You are an agricultural marketplace filter assistant.
Catalog: ${JSON.stringify(compressedCatalog)}
Query: "${trimmed}"
Select product IDs matching the query. Return JSON format:
{
  "matchedIds": ["id1", "id2"],
  "explanation": "Short 1-2 sentence explanation."
}`;

      const raw = await AiClient.chat([{ role: 'user', content: prompt }], { responseFormat: 'json_object', maxTokens: 300 });
      const parsed = AiClient.parseJsonResponse<{ matchedIds: string[]; explanation: string }>(raw);
      const matched = allProducts.filter((p: ProductListing) => parsed.matchedIds?.includes(p.id));

      const resPayload = {
        matchedProducts: matched.length > 0 ? matched : allProducts.slice(0, 3),
        explanation: parsed.explanation || `Matches for "${trimmed}".`,
        isAiGenerated: true
      };

      AiCache.set(cacheKey, resPayload, 3600 * 1000); // 1 hour cache
      ApiResponse.success(res, resPayload);
    } catch (err: any) {
      logger.error('[CentralAi] Marketplace natural search AI query failed, falling back:', { error: err?.message });
      const q = trimmed.toLowerCase();
      const matched = allProducts.filter((p: ProductListing) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
      ApiResponse.success(res, {
        matchedProducts: matched,
        explanation: `Showing matching results for "${trimmed}".`,
        isAiGenerated: false
      });
    }
  };

  /**
   * Explains a marketplace product's suitability, usage guidelines, and precautions for a farmer.
   */
  explainProduct = async (req: Request, res: Response): Promise<void> => {
    const { productId, farmerCrop = 'Wheat' } = req.body;
    const allProducts: ProductListing[] = await this.marketplaceRepo.findAll();
    const product = allProducts.find((p: ProductListing) => p.id === productId);

    if (!product) {
      ApiResponse.error(res, 'Product not found', 'NOT_FOUND', 404);
      return;
    }

    const cacheKey = AiCache.createFingerprint('product_explain', { productId, farmerCrop });
    const cached = AiCache.get<any>(cacheKey);
    if (cached) {
      ApiResponse.success(res, cached);
      return;
    }

    if (!AiClient.isConfigured()) {
      const fallbackPayload = {
        explanation: `${product.title} (₹${product.price}/${product.unit}) is suitable for general agricultural use. Follow standard package application guidelines.`,
        dosageTip: 'Apply as per package instructions or local KVK guidelines.',
        isAiGenerated: false
      };
      AiCache.set(cacheKey, fallbackPayload, 24 * 3600 * 1000);
      ApiResponse.success(res, fallbackPayload);
      return;
    }

    try {
      const prompt = `You are a crop inputs expert.
Product Details:
- Title: ${product.title}
- Category: ${product.category}
- Price: ₹${product.price} per ${product.unit}
- Seller Location: ${product.location}

Farmer's primary crop: ${farmerCrop}

Provide concise advice in JSON format:
{
  "explanation": "2 short sentences explaining what this product is and how it helps the farmer's crop.",
  "dosageTip": "1 practical sentence on application safety or timing."
}`;

      const raw = await AiClient.chat([{ role: 'user', content: prompt }], { responseFormat: 'json_object', maxTokens: 250 });
      const parsed = AiClient.parseJsonResponse<{ explanation: string; dosageTip: string }>(raw);

      const resPayload = {
        explanation: parsed.explanation,
        dosageTip: parsed.dosageTip,
        isAiGenerated: true
      };
      AiCache.set(cacheKey, resPayload, 24 * 3600 * 1000); // 24-hour cache for static product explanations
      ApiResponse.success(res, resPayload);
    } catch (err: any) {
      logger.error('[CentralAi] Product explanation AI query failed:', { error: err?.message });
      ApiResponse.success(res, {
        explanation: `${product.title} provides essential crop support. Verify seller details and certificate before bulk purchase.`,
        dosageTip: 'Store in a cool dry area away from direct sunlight.',
        isAiGenerated: false
      });
    }
  };

  /**
   * AI Assistance for Group Buying Pools
   */
  assistGroupBuying = async (req: Request, res: Response): Promise<void> => {
    const { poolId, query, crop = 'Wheat' } = req.body;
    const pools: GroupBuyPool[] = await this.groupBuyingRepo.findAll();

    const cacheKey = AiCache.createFingerprint('groupbuying_assist', { poolId, query: query || '', crop });
    const cached = AiCache.get<any>(cacheKey);
    if (cached) {
      ApiResponse.success(res, cached);
      return;
    }

    if (!AiClient.isConfigured()) {
      const activePool = pools.find((p: GroupBuyPool) => p.id === poolId) || pools[0];
      const savings = activePool ? (activePool.originalPricePerUnit - activePool.discountedPricePerUnit) : 0;
      const resPayload = {
        advice: `Group pool ordering saves ₹${savings} per unit by combining orders with local farmers. ${activePool?.participantCount || 0} farmers have joined.`,
        isAiGenerated: false
      };
      AiCache.set(cacheKey, resPayload, 3600 * 1000);
      ApiResponse.success(res, resPayload);
      return;
    }

    try {
      const prompt = `You are a farm economics assistant specializing in cooperative bulk purchases.
Active Group Buying Pools:
${JSON.stringify(pools.map((p: GroupBuyPool) => ({
  id: p.id,
  item: p.itemTitle,
  originalPrice: p.originalPricePerUnit,
  discountedPrice: p.discountedPricePerUnit,
  participants: p.participantCount,
  location: p.location
})))}

Target Farmer Crop: ${crop}
User Question / Context: ${query || 'How much can I save by joining a pool?'}

Provide a short 2-sentence response explaining how the group purchase works and the financial advantage.
Plain text only.`;

      const advice = await AiClient.chat([{ role: 'user', content: prompt }], { maxTokens: 150 });
      const resPayload = {
        advice: advice.trim(),
        isAiGenerated: true
      };
      AiCache.set(cacheKey, resPayload, 3600 * 1000);
      ApiResponse.success(res, resPayload);
    } catch (err: any) {
      logger.error('[CentralAi] Group buying AI query failed:', { error: err?.message });
      ApiResponse.success(res, {
        advice: 'Group buying allows neighboring farmers to combine order quantities to unlock bulk distributor pricing and save on freight.',
        isAiGenerated: false
      });
    }
  };
}
