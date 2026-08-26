import { logger } from '../../../utils/logger.js';
import { AiClient } from '../../../utils/aiClient.js';

/**
 * Crop Lookup Service — Uses Wikipedia API to fetch real crop images.
 * No API key required. Returns the main image (thumbnail) for a crop
 * article from Wikipedia, which is always a real photograph.
 *
 * Validation: We check if the Wikipedia article is categorized under
 * agriculture/plant/crop/fruit/vegetable/spice categories. If the query
 * doesn't match a real crop, returns { isCrop: false }.
 */

// Known Indian crop / agricultural product names for fast local validation
const KNOWN_CROPS = new Set([
  // Cereals & Millets
  'rice', 'wheat', 'maize', 'corn', 'bajra', 'pearl millet', 'jowar', 'sorghum',
  'ragi', 'finger millet', 'barley', 'oats', 'foxtail millet', 'barnyard millet',
  'kodo millet', 'little millet', 'proso millet', 'amaranth', 'buckwheat', 'quinoa',
  // Pulses & Legumes
  'gram', 'chana', 'chickpea', 'arhar', 'toor', 'pigeon pea', 'moong', 'mung bean',
  'urad', 'black gram', 'masoor', 'lentil', 'rajma', 'kidney bean', 'soybean',
  'peas', 'green peas', 'beans', 'cowpea', 'lobia', 'horse gram', 'kulthi', 'moth bean',
  // Oilseeds
  'groundnut', 'peanut', 'mustard', 'sesame', 'til', 'sunflower', 'safflower',
  'castor', 'linseed', 'flaxseed', 'niger seed', 'rapeseed', 'canola', 'palm oil',
  // Cash Crops
  'cotton', 'sugarcane', 'jute', 'tea', 'coffee', 'rubber', 'tobacco', 'indigo',
  // Vegetables
  'potato', 'onion', 'tomato', 'brinjal', 'eggplant', 'cabbage', 'cauliflower',
  'okra', 'bhindi', 'lady finger', 'carrot', 'radish', 'peas', 'beans',
  'chilli', 'capsicum', 'bell pepper', 'spinach', 'palak', 'fenugreek', 'methi',
  'bitter gourd', 'karela', 'bottle gourd', 'lauki', 'ridge gourd', 'turai',
  'snake gourd', 'ash gourd', 'pumpkin', 'kaddu', 'cucumber', 'kheera',
  'sweet potato', 'yam', 'taro', 'arbi', 'beetroot', 'turnip', 'drumstick',
  'moringa', 'lotus root', 'kamal kakdi', 'pointed gourd', 'parwal',
  'ivy gourd', 'tindora', 'cluster beans', 'guar', 'green beans', 'french beans',
  'lettuce', 'celery', 'broccoli', 'zucchini', 'mushroom',
  // Spices & Condiments
  'turmeric', 'haldi', 'ginger', 'adrak', 'garlic', 'lahsun', 'coriander', 'dhaniya',
  'cumin', 'jeera', 'black pepper', 'kali mirch', 'cardamom', 'elaichi',
  'clove', 'laung', 'cinnamon', 'dalchini', 'nutmeg', 'jaiphal',
  'star anise', 'fennel', 'saunf', 'fenugreek seeds', 'ajwain', 'carom seeds',
  'bay leaf', 'tej patta', 'saffron', 'kesar', 'asafoetida', 'hing',
  'tamarind', 'imli', 'curry leaves', 'vanilla',
  // Fruits
  'banana', 'mango', 'apple', 'orange', 'grapes', 'guava', 'papaya',
  'pomegranate', 'coconut', 'pineapple', 'watermelon', 'muskmelon',
  'jackfruit', 'kathal', 'lychee', 'litchi', 'sapota', 'chiku',
  'custard apple', 'sitaphal', 'fig', 'anjeer', 'date', 'khajoor',
  'starfruit', 'kamrakh', 'passion fruit', 'dragon fruit', 'kiwi',
  'strawberry', 'blueberry', 'raspberry', 'mulberry', 'shahtoot',
  'jamun', 'java plum', 'amla', 'indian gooseberry', 'bael', 'wood apple',
  'ber', 'jujube', 'falsa', 'phalsa', 'tamarind fruit', 'lemon', 'nimbu',
  'lime', 'sweet lime', 'mosambi', 'grapefruit', 'tangerine', 'mandarin',
  'plum', 'aloo bukhara', 'peach', 'aadu', 'apricot', 'khubani',
  'cherry', 'pear', 'nashpati', 'persimmon', 'avocado',
  // Nuts & Dry Fruits
  'cashew', 'kaju', 'almond', 'badam', 'walnut', 'akhrot', 'pistachio', 'pista',
  'arecanut', 'supari', 'betel nut',
  // Flowers (for floriculture)
  'marigold', 'rose', 'jasmine', 'mogra', 'chrysanthemum', 'tuberose', 'rajnigandha',
  'gladiolus', 'orchid', 'sunflower', 'hibiscus',
  // Plantation & Others
  'bamboo', 'sandalwood', 'neem', 'teak', 'eucalyptus', 'aloe vera',
  'tulsi', 'holy basil', 'lemongrass', 'citronella', 'vetiver', 'khus',
  'hemp', 'flax', 'sisal', 'kenaf', 'coir',
]);

/** Agriculture-related keywords to verify Wikipedia article category relevance */
const AGRI_KEYWORDS = [
  'plant', 'crop', 'fruit', 'vegetable', 'cereal', 'grain', 'pulse', 'legume',
  'spice', 'herb', 'oilseed', 'tuber', 'root', 'flower', 'nut', 'seed',
  'cultivar', 'agriculture', 'farm', 'harvest', 'edible', 'food', 'botanical',
  'flora', 'tree', 'shrub', 'vine', 'perennial', 'annual',
];

export interface CropLookupResult {
  isCrop: boolean;
  name: string;
  imageUrl: string | null;
  description: string | null;
}

export class CropLookupService {
  /**
   * Look up a crop name and return a real image from Wikipedia.
   * First classifies the input using Gemini AI to verify if it represents a crop,
   * then fetches a real photo using Wikipedia Search.
   */
  async lookup(query: string): Promise<CropLookupResult> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      return { isCrop: false, name: trimmed, imageUrl: null, description: null };
    }

    const lowerQuery = trimmed.toLowerCase();

    // 1. Classify via Gemini AI if key is configured, fallback to local check
    let isCrop = false;
    let searchQuery = trimmed;

    try {
      if (AiClient.isConfigured()) {
        const response = await AiClient.chat([
          {
            role: 'system',
            content: `You are an expert botany and agricultural AI assistant.
Your task is to classify if a search query represents a plant, crop, tree (including fruit trees, cash crops, timber, and plantation trees), fruit, vegetable, spice, pulse, grain, ornamental flower, or other farmable/agricultural product.
Respond ONLY with a valid JSON object matching this schema:
{
  "isCrop": boolean,
  "searchQuery": string
}
- "isCrop" must be true if the input represents a crop, plant, tree, fruit, vegetable, spice, or agricultural product.
- "isCrop" must be false if the input is anything else (e.g. animals like "dog", "cat", "lion"; objects like "car", "computer", "table", "laptop"; abstract concepts; people; places; etc.).
- "searchQuery" must be a clean English term suitable for searching a photo of the item on Wikipedia (e.g. "Rice plant" for "rice", "Mango fruit" for "mango", "Teak tree" for "teak", "Wheat field" for "wheat"). If isCrop is false, set searchQuery to "".
Do not output any markdown formatting, backticks, or other text outside the JSON object.`
          },
          {
            role: 'user',
            content: `Classify this input: "${trimmed}"`
          }
        ]);

        const parsed = AiClient.parseJsonResponse<{ isCrop: boolean; searchQuery: string }>(response);
        isCrop = !!parsed.isCrop;
        searchQuery = parsed.searchQuery || trimmed;
        logger.info(`[CropLookup] Gemini classified "${trimmed}" - isCrop: ${isCrop}, searchQuery: "${searchQuery}"`);
      } else {
        // Fallback to local check if AI is not configured
        isCrop = KNOWN_CROPS.has(lowerQuery) || Array.from(KNOWN_CROPS).some(c => lowerQuery.includes(c));
        logger.info(`[CropLookup] Local check fallback for "${trimmed}" - isCrop: ${isCrop}`);
      }
    } catch (err: any) {
      logger.error(`[CropLookup] AI Classification failed, using local check fallback`, { message: err.message });
      // Fallback to local check
      isCrop = KNOWN_CROPS.has(lowerQuery) || Array.from(KNOWN_CROPS).some(c => lowerQuery.includes(c));
    }

    if (!isCrop) {
      return { isCrop: false, name: trimmed, imageUrl: null, description: null };
    }

    // 2. Wikipedia search for the image using standard search query
    try {
      const wikiResult = await this.searchWikipedia(searchQuery);

      if (!wikiResult) {
        return { isCrop: true, name: trimmed, imageUrl: null, description: null };
      }

      // Verify article content for agriculture relevance if query was not in local list
      const isKnown = KNOWN_CROPS.has(lowerQuery);
      if (!isKnown) {
        const isAgri = this.isAgricultureRelated(wikiResult.description || '', wikiResult.categories || []);
        if (!isAgri) {
          logger.info(`[CropLookup] Wikipedia article content not agriculture related for "${trimmed}"`);
          return { isCrop: false, name: trimmed, imageUrl: null, description: null };
        }
      }

      return {
        isCrop: true,
        name: trimmed,
        imageUrl: wikiResult.imageUrl,
        description: wikiResult.description
      };
    } catch (err: any) {
      logger.error('[CropLookup] Wikipedia API error', { message: err.message });
      return { isCrop: true, name: trimmed, imageUrl: null, description: null };
    }
  }

  /**
   * Search Wikipedia for a crop and return its thumbnail image + extract.
   */
  private async searchWikipedia(query: string): Promise<{
    imageUrl: string | null;
    description: string | null;
    categories: string[];
  } | null> {
    // Step 1: Search for the article title
    let searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=3&format=json&origin=*`;

    let searchResp = await fetch(searchUrl, { signal: AbortSignal.timeout(8000) });
    let searchData = await searchResp.json();
    let results = searchData?.query?.search;

    if (!results || results.length === 0) {
      // Fallback: search with additional terms
      searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + ' plant crop')}&srlimit=3&format=json&origin=*`;
      searchResp = await fetch(searchUrl, { signal: AbortSignal.timeout(8000) });
      searchData = await searchResp.json();
      results = searchData?.query?.search;
    }

    if (!results || results.length === 0) return null;

    // Pick the best match (first result usually)
    const pageTitle = results[0].title;

    // Step 2: Get page thumbnail (main image) + extract + categories
    const detailUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages|extracts|categories&exintro=1&explaintext=1&pithumbsize=400&cllimit=20&format=json&origin=*`;

    const detailResp = await fetch(detailUrl, { signal: AbortSignal.timeout(8000) });
    const detailData = await detailResp.json();
    const pages = detailData?.query?.pages;

    if (!pages) return null;

    const pageId = Object.keys(pages)[0];
    if (pageId === '-1') return null;

    const page = pages[pageId];

    const imageUrl = page.thumbnail?.source || null;
    const description = page.extract ? page.extract.substring(0, 300) : null;
    const categories = (page.categories || []).map((c: any) => c.title?.toLowerCase() || '');

    return { imageUrl, description, categories };
  }

  /**
   * Simple heuristic check: does the Wikipedia article description or categories
   * mention agriculture-related terms?
   */
  private isAgricultureRelated(description: string, categories: string[]): boolean {
    const text = (description + ' ' + categories.join(' ')).toLowerCase();
    return AGRI_KEYWORDS.some(keyword => text.includes(keyword));
  }
}
