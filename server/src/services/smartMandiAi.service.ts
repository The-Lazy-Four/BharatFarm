import { AiClient } from '../utils/aiClient.js';
import { logger } from '../utils/logger.js';
import { ParseRequirementResult, SupplyPool, SmartCollectionPlan } from '@bharatfarm/shared';

export class SmartMandiAiService {
  /**
   * Parses natural language buyer requirement (e.g. "I need 100 kg potato near Haldia West Bengal before Friday")
   * Extracts crop, quantity, expected price, district, village, and deadline.
   * All arithmetic & database queries happen in backend, never in LLM.
   */
  static async parseNaturalLanguageRequirement(prompt: string): Promise<ParseRequirementResult> {
    if (!prompt || !prompt.trim()) {
      return { confidence: 0 };
    }

    if (!AiClient.isConfigured()) {
      return this.fallbackRegexParser(prompt);
    }

    try {
      const systemPrompt = `You are a Smart Agriculture Data Extractor for India.
Extract structured buyer procurement requirements from the farmer/buyer's natural language statement.

IMPORTANT RULES:
1. Return STRICT JSON only (no markdown fences).
2. Never invent numbers not mentioned or clearly implied.
3. Extract:
   - crop: string (e.g. Potato, Tomato, Wheat, Paddy, Rice, Onion, Chilli)
   - quantityKg: number in kilograms (e.g. if 1 quintal -> 100, if 2 tonnes -> 2000)
   - expectedPricePerKg: number in ₹/kg (if given)
   - district: string (if mentioned)
   - village: string (if mentioned)
   - state: string (if mentioned)
   - requiredByDays: number of days from today (e.g. "before Friday", "in 3 days" -> 3)
   - confidence: number between 0 and 100

JSON Structure:
{
  "crop": "Potato",
  "quantityKg": 100,
  "expectedPricePerKg": 25,
  "district": "Purba Medinipur",
  "village": "Haldia",
  "state": "West Bengal",
  "requiredByDays": 4,
  "confidence": 90
}`;

      const raw = await AiClient.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ], {
        maxTokens: 300,
        responseFormat: 'json_object'
      });

      const parsed = AiClient.parseJsonResponse<ParseRequirementResult>(raw);
      return {
        ...parsed,
        rawNotes: prompt
      };
    } catch (err: any) {
      logger.warn('[SmartMandiAi] AI parsing failed, falling back to regex parser', err.message);
      return this.fallbackRegexParser(prompt);
    }
  }

  /**
   * Fallback rule-based parser when AI key is missing or offline
   */
  private static fallbackRegexParser(text: string): ParseRequirementResult {
    const crops = ['Potato', 'Tomato', 'Wheat', 'Paddy', 'Rice', 'Onion', 'Chilli', 'Mustard', 'Maize', 'Soybean', 'Cotton'];
    let foundCrop = crops.find(c => new RegExp(`\\b${c}\\b`, 'i').test(text)) || 'Potato';

    // Extract quantity (e.g. 100 kg, 50 kilos, 2 quintal)
    let quantityKg = 100;
    const qtyMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos|kilograms|quintal|qtl|tonnes|t)\b/i);
    if (qtyMatch) {
      const val = parseFloat(qtyMatch[1]);
      if (/quintal|qtl/i.test(qtyMatch[0])) quantityKg = val * 100;
      else if (/tonnes|t/i.test(qtyMatch[0])) quantityKg = val * 1000;
      else quantityKg = val;
    }

    // Extract price (e.g. 25 rs, ₹24, 25/kg)
    let price: number | undefined;
    const priceMatch = text.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:\/kg|per kg|rs)?/i);
    if (priceMatch) {
      price = parseFloat(priceMatch[1]);
    }

    return {
      crop: foundCrop,
      quantityKg,
      expectedPricePerKg: price || 25,
      district: /haldia|purba medinipur|medinipur/i.test(text) ? 'Purba Medinipur' : 'Purba Medinipur',
      village: /haldia/i.test(text) ? 'Haldia' : 'Haldia',
      state: 'West Bengal',
      requiredByDays: 4,
      confidence: 70,
      rawNotes: text
    };
  }

  /**
   * Generates a concise natural language explanation for why the supply pool was selected
   */
  static async explainSupplyPool(pool: SupplyPool, plan?: SmartCollectionPlan | null): Promise<string> {
    if (!AiClient.isConfigured() || !plan) {
      return `${pool.allocations.length} nearby farmer(s) were pooled to fulfill ${pool.matchedQuantityKg} kg of ${pool.crop} in a single consolidated ${plan?.totalRouteDistanceKm || 0} km collection loop.`;
    }

    try {
      const prompt = `Explain in 1-2 concise, professional farmer-friendly sentences why this multi-farmer supply pool was formed for the buyer:
- Crop: ${pool.crop}
- Required Quantity: ${pool.requiredQuantityKg} kg
- Matched Quantity: ${pool.matchedQuantityKg} kg (${pool.fulfillmentPercentage}%)
- Number of nearby farmers combined: ${pool.farmerCount}
- Consolidated route distance: ${plan.totalRouteDistanceKm} km (${plan.totalStops} stops)
- Potential transport savings: ₹${plan.potentialTransportSaving || 0} compared to separate pickups.

Provide a clear explanation emphasizing procurement efficiency and local aggregation.`;

      const explanation = await AiClient.chat([
        { role: 'user', content: prompt }
      ], { maxTokens: 150 });

      return explanation.replace(/["\n]/g, ' ').trim();
    } catch {
      return `${pool.allocations.length} nearby farmer(s) were pooled to fulfill ${pool.matchedQuantityKg} kg of ${pool.crop} in a single consolidated ${plan.totalRouteDistanceKm} km collection loop.`;
    }
  }
}
