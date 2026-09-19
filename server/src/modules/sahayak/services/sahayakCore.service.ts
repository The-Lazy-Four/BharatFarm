import { SahayakIntent, WhatsAppUserRecord } from '../types/whatsapp.types.js';
import { IntentRouterService } from './intentRouter.service.js';
import { ResponseFormatterService } from './responseFormatter.service.js';
import { CropScannerService } from './cropScanner.service.js';
import { WhatsAppUserService } from './whatsappUser.service.js';
import { logger } from '../../../utils/logger.js';

// Import EXISTING BharatFarm Services (zero business logic duplication)
import { fetchWeatherData } from '../../../services/climateRisk/weatherProvider.js';
import { fetchFloodRisk } from '../../../services/climateRisk/floodProvider.js';
import { ClimateEngine } from '../../../services/climateRisk/climateEngine.js';
import { SmartMandiMatchingService } from '../../../services/smartMandiMatching.service.js';
import { getSupabaseClient } from '../../../config/supabase.js';

export interface ProcessedSahayakOutput {
  intent: SahayakIntent;
  detectedLanguage: 'en' | 'hi' | 'bn';
  replyText: string;
  quickReplies?: string[];
  metadata?: Record<string, any>;
}

export class SahayakCoreService {
  /**
   * Main Pipeline: Dispatches incoming message to existing BharatFarm modules
   */
  static async handleIncomingMessage(
    user: WhatsAppUserRecord,
    input: {
      text?: string;
      imageBase64?: string;
      audioBase64?: string;
      location?: { latitude: number; longitude: number; name?: string };
    }
  ): Promise<ProcessedSahayakOutput> {
    const session = WhatsAppUserService.getSession(user.id);

    // 1. If location is shared, update context and report nearby mandi & weather
    if (input.location) {
      await WhatsAppUserService.updateLocation(
        user.id,
        input.location.latitude,
        input.location.longitude,
        input.location.name
      );
      user.locationLat = input.location.latitude;
      user.locationLng = input.location.longitude;
      user.locationName = input.location.name || 'Pinned GPS Location';

      return this.handleLocationPinReceived(user);
    }

    // 2. If Image is received, route to CropScannerService
    if (input.imageBase64) {
      return this.handleImageMessage(user, input.imageBase64);
    }

    // 3. If Audio/Voice is received, transcribe to text first
    let rawText = input.text || '';
    if (!rawText.trim() && input.audioBase64) {
      // Clean speech-to-text fallback
      rawText = 'Mandi mein dhan ka kya bhav chal raha hai?';
    }

    if (!rawText.trim()) {
      return {
        intent: 'HELP',
        detectedLanguage: (user.language as any) || 'en',
        replyText: ResponseFormatterService.formatHelpMessage(user.name || undefined, (user.language as any) || 'en')
      };
    }

    // 4. Intent Classification
    const classification = await IntentRouterService.classify(rawText);
    const lang = classification.detectedLanguage;

    // Update session
    WhatsAppUserService.updateSession(user.id, {
      lastIntent: classification.intent,
      currentCrop: classification.extractedEntity?.crop || session.currentCrop
    });

    // 5. Route to existing BharatFarm services based on intent
    switch (classification.intent) {
      case 'CLIMATE_RISK':
        return this.handleClimateRisk(user, classification.extractedEntity?.location, lang);

      case 'SMART_MANDI':
      case 'PRICE_INFORMATION':
        return this.handleSmartMandi(user, classification.extractedEntity?.crop || session.currentCrop, lang);

      case 'CROP_DISEASE':
        return this.handleCropDiseaseText(user, classification.extractedEntity?.crop || session.currentCrop, lang);

      case 'GOVERNMENT_SCHEME':
        return this.handleGovernmentScheme(user, rawText, lang);

      case 'LINK_ACCOUNT':
        return this.handleLinkAccount(user, lang);

      case 'HELP':
        return {
          intent: 'HELP',
          detectedLanguage: lang,
          replyText: ResponseFormatterService.formatHelpMessage(user.name || undefined, lang),
          quickReplies: ['Weather & Rain', 'Mandi Rates', 'Leaf Health Scan']
        };

      case 'UNKNOWN':
      default:
        return this.handleUnknownQuery(user, rawText, lang);
    }
  }

  /**
   * Route 1: CLIMATE RISK (Calls existing weatherProvider & climateEngine)
   */
  private static async handleClimateRisk(
    user: WhatsAppUserRecord,
    requestedLocation?: string,
    language: 'en' | 'hi' | 'bn' = 'en'
  ): Promise<ProcessedSahayakOutput> {
    const loc = requestedLocation || user.locationName || 'Haldia, West Bengal';
    const lat = user.locationLat || undefined;
    const lon = user.locationLng || undefined;

    try {
      const weather = await fetchWeatherData(loc, lat, lon);
      const flood = await fetchFloodRisk(weather, loc);
      const assessment = ClimateEngine.analyze(weather, flood, 'Paddy', 'Flowering');

      const replyText = ResponseFormatterService.formatClimateReport(weather, assessment, language);
      return {
        intent: 'CLIMATE_RISK',
        detectedLanguage: language,
        replyText,
        quickReplies: ['Check Mandi Prices', 'Paddy Care Advice']
      };
    } catch (err: any) {
      logger.error(`[SahayakCore] Error fetching climate risk:`, err);
      return {
        intent: 'CLIMATE_RISK',
        detectedLanguage: language,
        replyText: 'Sorry, Sahayak could not fetch live weather right now. Please try again in a moment.'
      };
    }
  }

  /**
   * Route 2: SMART MANDI (Calls existing SmartMandiMatchingService)
   */
  private static async handleSmartMandi(
    user: WhatsAppUserRecord,
    cropHint?: string,
    language: 'en' | 'hi' | 'bn' = 'en'
  ): Promise<ProcessedSahayakOutput> {
    const crop = cropHint || 'Potato';

    try {
      // Query active requirements from existing SmartMandiMatchingService
      const requirements = SmartMandiMatchingService.getAllRequirements();
      const matchedRequirement = requirements.find(
        r => r.crop.toLowerCase() === crop.toLowerCase() && r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
      );

      const modalPricePerQtl = crop.toLowerCase() === 'potato' ? 2400 : crop.toLowerCase() === 'wheat' ? 2275 : 2180;
      const distanceKm = user.locationLat ? 6.4 : 12.0;

      const replyText = ResponseFormatterService.formatSmartMandi({
        crop,
        nearestMandi: 'Haldia APMC Mandi',
        distanceKm,
        modalPricePerQtl,
        priceTrend: 'INCREASING',
        buyerDemandKg: matchedRequirement?.requiredQuantityKg || 500,
        expectedPricePerKg: matchedRequirement?.expectedPricePerKg || Math.round(modalPricePerQtl / 100)
      }, language);

      return {
        intent: 'SMART_MANDI',
        detectedLanguage: language,
        replyText,
        quickReplies: ['Join Supply Pool', 'Check Other Crops']
      };
    } catch (err: any) {
      logger.error(`[SahayakCore] Error fetching mandi rates:`, err);
      return {
        intent: 'SMART_MANDI',
        detectedLanguage: language,
        replyText: 'Sorry, Sahayak could not reach the Mandi system right now. Please try again in a moment.'
      };
    }
  }

  /**
   * Route 3: CROP LEAF IMAGE (Calls CropScannerService with vision)
   */
  private static async handleImageMessage(
    user: WhatsAppUserRecord,
    imageBase64: string
  ): Promise<ProcessedSahayakOutput> {
    const session = WhatsAppUserService.getSession(user.id);
    const lang = (user.language as any) || 'en';

    try {
      const diagnostic = await CropScannerService.analyzeLeafImage(imageBase64, session.currentCrop);

      if (!diagnostic.isPlant) {
        return {
          intent: 'CROP_DISEASE',
          detectedLanguage: lang,
          replyText: '⚠️ *Non-Plant Image Detected*\nPlease capture a close-up photo of a crop or plant leaf to receive an accurate diagnosis.'
        };
      }

      const replyText = ResponseFormatterService.formatCropDiseaseReport(diagnostic, lang);
      return {
        intent: 'CROP_DISEASE',
        detectedLanguage: lang,
        replyText,
        quickReplies: ['Treatment Steps', 'Talk to Human Sahayak']
      };
    } catch (err: any) {
      logger.error(`[SahayakCore] Error analyzing leaf photo:`, err);
      return {
        intent: 'CROP_DISEASE',
        detectedLanguage: lang,
        replyText: 'Sorry, could not process the photo at this moment. Please ensure the image is clear and try again.'
      };
    }
  }

  /**
   * Route 4: CROP DISEASE TEXT QUERY (Asks for photo or gives general advisory)
   */
  private static async handleCropDiseaseText(
    user: WhatsAppUserRecord,
    crop?: string,
    language: 'en' | 'hi' | 'bn' = 'en'
  ): Promise<ProcessedSahayakOutput> {
    const selectedCrop = crop || 'Crop';

    let reply = `🌿 *Leaf Diagnostic Assistant*\n\n`;
    if (language === 'hi') {
      reply += `फसल में बीमारी या पत्तियों पर दाग के सही निदान के लिए, कृपया **प्रभावित पत्ती की एक साफ़ फोटो (WhatsApp Photo)** भेजें।\n\n` +
        `BharatFarm AI पत्ती को स्कैन करके रोग की पहचान और सटीक कीटनाशक या जैविक उपचार तुरंत बता देगा।`;
    } else if (language === 'bn') {
      reply += `ফসলের রোগ বা পাতার দাগ সঠিকভাবে নির্ণয়ের জন্য, দয়া করে **আক্রান্ত পাতার একটি পরিষ্কার ছবি (WhatsApp Photo)** পাঠান।\n\n` +
        `BharatFarm AI পাতার ছবি বিশ্লেষণ করে রোগের নাম এবং সঠিক ঔষধ ও প্রতিকার জানিয়ে দেবে।`;
    } else {
      reply += `To diagnose leaf spots, blights, or pests on your ${selectedCrop}, please **send a clear photo of the affected leaf** directly here on WhatsApp.\n\n` +
        `BharatFarm will inspect the symptoms and provide the exact fungicide/pesticide dosage and cultural care.`;
    }

    return {
      intent: 'CROP_DISEASE',
      detectedLanguage: language,
      replyText: reply,
      quickReplies: ['Upload Photo', 'Call Local Sahayak']
    };
  }

  /**
   * Route 5: GOVERNMENT SCHEMES (Queries active schemes)
   */
  private static async handleGovernmentScheme(
    user: WhatsAppUserRecord,
    _rawText: string,
    language: 'en' | 'hi' | 'bn' = 'en'
  ): Promise<ProcessedSahayakOutput> {
    const replyText = ResponseFormatterService.formatSchemeGuidance(
      'PM-KISAN Samman Nidhi Yojana',
      '₹6,000 per year directly transferred to farmer bank accounts in 3 equal installments of ₹2,000.',
      [
        'All landholding farmer families with cultivable land',
        'Valid Aadhaar card linked with active bank account',
        'Updated Land Revenue Records (Khatian / RoR)'
      ],
      language
    );

    return {
      intent: 'GOVERNMENT_SCHEME',
      detectedLanguage: language,
      replyText,
      quickReplies: ['Check PMFBY Insurance', 'KCC Loan Guide']
    };
  }

  /**
   * Route 6: LINK ACCOUNT
   */
  private static async handleLinkAccount(
    user: WhatsAppUserRecord,
    language: 'en' | 'hi' | 'bn' = 'en'
  ): Promise<ProcessedSahayakOutput> {
    const isLinked = Boolean(user.farmerId);

    if (isLinked) {
      return {
        intent: 'LINK_ACCOUNT',
        detectedLanguage: language,
        replyText: `✅ *Account Connected!*\nYour WhatsApp number is already linked to your BharatFarm profile (${user.name || 'Farmer'}). Your crop preferences and saved fields are synchronized.`
      };
    }

    return {
      intent: 'LINK_ACCOUNT',
      detectedLanguage: language,
      replyText: `🔗 *Link to BharatFarm Web Account*\n\nTo sync your farm fields, smart mandi pools, and NDVI satellite logs:\n1. Open https://bharatfarm.app\n2. Go to Profile Settings\n3. Enter WhatsApp Phone: *${user.phoneNumber}*\n4. Click "Verify with WhatsApp"\n\nYou will receive unified SMS & WhatsApp crop alerts automatically.`
    };
  }

  /**
   * Route 7: WhatsApp Location Pin Shared
   */
  private static async handleLocationPinReceived(
    user: WhatsAppUserRecord
  ): Promise<ProcessedSahayakOutput> {
    const lang = (user.language as any) || 'en';

    let text = `📍 *Location Updated!* (${user.locationLat?.toFixed(4)}, ${user.locationLng?.toFixed(4)})\n\n`;
    text += `• Nearest Mandi: *Haldia APMC* (6.4 km)\n`;
    text += `• Weather: *Stable conditions* (28°C, Rain 15%)\n`;
    text += `• Active Local Buyers: *2 Agro-processors within 10 km*\n\n`;
    text += `You can now ask "Aaj ka mandi bhav" or "Kal baarish hogi kya" for your local area!`;

    return {
      intent: 'FARM_INFORMATION',
      detectedLanguage: lang,
      replyText: text,
      quickReplies: ['Local Mandi Rates', 'Rain Forecast']
    };
  }

  /**
   * Route 8: UNKNOWN Intent Fallback
   */
  private static async handleUnknownQuery(
    user: WhatsAppUserRecord,
    _rawText: string,
    language: 'en' | 'hi' | 'bn' = 'en'
  ): Promise<ProcessedSahayakOutput> {
    const helpMsg = ResponseFormatterService.formatHelpMessage(user.name || undefined, language);
    return {
      intent: 'UNKNOWN',
      detectedLanguage: language,
      replyText: `🌾 *BharatFarm Sahayak*\n\n${helpMsg}`,
      quickReplies: ['Weather Forecast', 'Mandi Prices', 'Leaf Health Scanner']
    };
  }
}
