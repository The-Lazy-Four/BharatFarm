import { WhatsAppMessageType, WhatsAppUserRecord, SupportedWhatsAppLanguage } from '../types/whatsapp.types.js';
import { WhatsAppUserService } from './whatsappUser.service.js';
import { WhatsAppClientService } from './whatsappClient.service.js';
import { ResponseFormatterService, FormattedStepMessage } from './responseFormatter.service.js';
import { IntentRouterService } from './intentRouter.service.js';
import { logger } from '../../../utils/logger.js';

// BharatFarm Services
import { fetchWeatherData } from '../../../services/climateRisk/weatherProvider.js';
import { fetchFloodRisk } from '../../../services/climateRisk/floodProvider.js';
import { ClimateEngine } from '../../../services/climateRisk/climateEngine.js';
import { SmartMandiMatchingService } from '../../../services/smartMandiMatching.service.js';
import { ClaimStore } from '../../../services/insurance/claimStore.js';

export class WhatsAppStateMachineService {
  /**
   * Main router of incoming events through state machine
   */
  static async handleEvent(
    user: WhatsAppUserRecord,
    input: {
      text?: string;
      action?: string;
      payload?: any;
    }
  ): Promise<FormattedStepMessage> {
    const session = WhatsAppUserService.getSession(user.id);
    const rawText = (input.text || '').trim();
    const action = input.action || '';

    // Check for global END command
    if (
      action === 'NAV_END_SESSION' ||
      /^(end|exit|stop|khatam|bye|dhanyawad|band)\b/i.test(rawText)
    ) {
      session.state = 'END_SESSION';
      WhatsAppUserService.updateSession(user.id, { state: 'END_SESSION' });
      const text = ResponseFormatterService.buildEndSession(session.language);
      return { text, buttons: [] };
    }

    // Check for global BACK command
    if (action === 'NAV_BACK' || /^back$/i.test(rawText)) {
      return this.handleBackNavigation(user);
    }

    // Check for global MAIN_MENU command
    if (action === 'NAV_MAIN_MENU' || /^(main menu|menu|ghar)$/i.test(rawText)) {
      this.pushHistory(user, 'MAIN_MENU');
      session.state = 'MAIN_MENU';
      session.service = undefined;
      session.serviceStep = undefined;
      WhatsAppUserService.updateSession(user.id, {
        state: 'MAIN_MENU',
        service: undefined,
        serviceStep: undefined
      });
      return ResponseFormatterService.buildMainMenu(session.language);
    }

    // Check for GREETING / HI restart command
    const isGreeting = /^(hi|hello|namaste|nomoshkar|pranam|start|shuru)$/i.test(rawText) || action === 'START';
    if (isGreeting) {
      // If session is ended or brand new, start workflow
      session.state = 'LANGUAGE_SELECTION';
      session.navigationHistory = ['START', 'LANGUAGE_SELECTION'];
      session.service = undefined;
      session.serviceStep = undefined;
      WhatsAppUserService.updateSession(user.id, {
        state: 'LANGUAGE_SELECTION',
        navigationHistory: session.navigationHistory,
        service: undefined,
        serviceStep: undefined
      });
      return ResponseFormatterService.buildWelcomeMessage();
    }

    // Dispatch based on current session state
    switch (session.state) {
      case 'START':
      case 'END_SESSION':
        // If message is not greeting but an explicit query (e.g. "What is today's mandi price for potato?"),
        // route via free-text intent for fallback queries
        if (rawText.length > 3) {
          const directIntent = await IntentRouterService.classify(rawText);
          if (directIntent.intent === 'CLIMATE_RISK') {
            session.lastIntent = 'CLIMATE_RISK';
            return this.executeService(user, 'CLIMATE_RISK');
          }
          if (directIntent.intent === 'SMART_MANDI' || directIntent.intent === 'PRICE_INFORMATION') {
            session.lastIntent = 'SMART_MANDI';
            return this.executeService(user, 'SMART_MANDI', directIntent.extractedEntity?.crop);
          }
          if (directIntent.intent === 'CROP_DISEASE' || directIntent.intent === 'GOVERNMENT_SCHEME') {
            session.lastIntent = directIntent.intent;
            return this.executeService(user, 'BASIC_FARMER_NEEDS');
          }
        }
        session.state = 'LANGUAGE_SELECTION';
        session.navigationHistory = ['START', 'LANGUAGE_SELECTION'];
        WhatsAppUserService.updateSession(user.id, { state: 'LANGUAGE_SELECTION' });
        return ResponseFormatterService.buildWelcomeMessage();

      case 'LANGUAGE_SELECTION':
        return this.handleLanguageSelection(user, action, rawText);

      case 'ACCOUNT_SELECTION':
        return this.handleAccountSelection(user, action, rawText);

      case 'ACCOUNT_LINK_PHONE':
        return this.handlePhoneSubmission(user, action, rawText, input.payload);

      case 'MAIN_MENU':
        return this.handleMainMenuSelection(user, action, rawText);

      case 'SERVICE_SELECTION':
      case 'SERVICE_PROCESSING':
      case 'SERVICE_RESULT':
        return this.handleServiceInteraction(user, action, rawText, input.payload);

      default:
        // Fallback to Main Menu if connected or start if not
        if (session.accountStatus === 'CONNECTED' || session.accountStatus === 'GUEST') {
          session.state = 'MAIN_MENU';
          WhatsAppUserService.updateSession(user.id, { state: 'MAIN_MENU' });
          return ResponseFormatterService.buildMainMenu(session.language);
        }
        session.state = 'LANGUAGE_SELECTION';
        WhatsAppUserService.updateSession(user.id, { state: 'LANGUAGE_SELECTION' });
        return ResponseFormatterService.buildWelcomeMessage();
    }
  }

  /**
   * Handle Back Navigation
   */
  private static handleBackNavigation(user: WhatsAppUserRecord): FormattedStepMessage {
    const session = WhatsAppUserService.getSession(user.id);
    const history = session.navigationHistory || [];

    // Pop current state
    history.pop();
    const previousState = history[history.length - 1] || 'MAIN_MENU';
    session.state = previousState;
    WhatsAppUserService.updateSession(user.id, { state: previousState, navigationHistory: history });

    switch (previousState) {
      case 'LANGUAGE_SELECTION':
        return ResponseFormatterService.buildLanguageSelection();
      case 'ACCOUNT_SELECTION':
        return ResponseFormatterService.buildAccountQuestion(session.language);
      case 'ACCOUNT_LINK_PHONE':
        return ResponseFormatterService.buildPhoneRequest(session.language);
      case 'MAIN_MENU':
      default:
        session.state = 'MAIN_MENU';
        return ResponseFormatterService.buildMainMenu(session.language);
    }
  }

  private static pushHistory(user: WhatsAppUserRecord, state: any): void {
    const session = WhatsAppUserService.getSession(user.id);
    if (!session.navigationHistory) session.navigationHistory = [];
    if (session.navigationHistory[session.navigationHistory.length - 1] !== state) {
      session.navigationHistory.push(state);
    }
  }

  /**
   * STEP 5: Language Selection
   */
  private static async handleLanguageSelection(
    user: WhatsAppUserRecord,
    action: string,
    text: string
  ): Promise<FormattedStepMessage> {
    const session = WhatsAppUserService.getSession(user.id);
    let chosenLang: SupportedWhatsAppLanguage | null = null;

    if (action === 'LANG_HI' || /^(1|hindi|हिंदी)$/i.test(text)) chosenLang = 'hi';
    else if (action === 'LANG_EN' || /^(2|english|eng)$/i.test(text)) chosenLang = 'en';
    else if (action === 'LANG_BN' || /^(3|bangla|bengali|বাংলা)$/i.test(text)) chosenLang = 'bn';

    if (!chosenLang) {
      // Re-prompt language selection
      return ResponseFormatterService.buildLanguageSelection();
    }

    session.language = chosenLang;
    await WhatsAppUserService.updateLanguage(user.id, chosenLang);

    // Transition to ACCOUNT_SELECTION
    session.state = 'ACCOUNT_SELECTION';
    this.pushHistory(user, 'ACCOUNT_SELECTION');
    WhatsAppUserService.updateSession(user.id, {
      language: chosenLang,
      state: 'ACCOUNT_SELECTION'
    });

    return ResponseFormatterService.buildAccountQuestion(chosenLang);
  }

  /**
   * STEP 6 & 7: Account Selection (Yes / No)
   */
  private static handleAccountSelection(
    user: WhatsAppUserRecord,
    action: string,
    text: string
  ): FormattedStepMessage {
    const session = WhatsAppUserService.getSession(user.id);
    const lang = session.language;

    const isYes = action === 'ACCOUNT_YES' || /^(yes|haan|ha|হ্যাঁ|1)$/i.test(text);
    const isNo = action === 'ACCOUNT_NO' || /^(no|nahi|na|না|2)$/i.test(text);

    if (isYes) {
      session.state = 'ACCOUNT_LINK_PHONE';
      this.pushHistory(user, 'ACCOUNT_LINK_PHONE');
      WhatsAppUserService.updateSession(user.id, { state: 'ACCOUNT_LINK_PHONE' });
      return ResponseFormatterService.buildPhoneRequest(lang);
    }

    if (isNo) {
      session.accountStatus = 'GUEST';
      session.state = 'ACCOUNT_NOT_CONNECTED';
      this.pushHistory(user, 'ACCOUNT_NOT_CONNECTED');
      WhatsAppUserService.updateSession(user.id, {
        accountStatus: 'GUEST',
        state: 'ACCOUNT_NOT_CONNECTED'
      });
      return ResponseFormatterService.buildNoAccountNotice(lang);
    }

    return ResponseFormatterService.buildAccountQuestion(lang);
  }

  /**
   * STEP 8, 9, 10: Phone Number Submission & Account Connection
   */
  private static async handlePhoneSubmission(
    user: WhatsAppUserRecord,
    action: string,
    text: string,
    payload?: any
  ): Promise<FormattedStepMessage> {
    const session = WhatsAppUserService.getSession(user.id);
    const lang = session.language;

    // If user clicked try another phone
    if (action === 'TRY_ANOTHER_PHONE') {
      return ResponseFormatterService.buildPhoneRequest(lang);
    }

    // If user clicked guest continue
    if (action === 'GUEST_CONTINUE' || /continue/i.test(text)) {
      session.accountStatus = 'GUEST';
      session.state = 'MAIN_MENU';
      this.pushHistory(user, 'MAIN_MENU');
      WhatsAppUserService.updateSession(user.id, { state: 'MAIN_MENU', accountStatus: 'GUEST' });
      return ResponseFormatterService.buildMainMenu(lang);
    }

    const inputPhone = payload?.phone || text;
    const cleanPhone = (inputPhone || '').replace(/[^0-9]/g, '');

    // Validate phone number format (10 digits, or 12 digits with 91)
    if (!cleanPhone || (cleanPhone.length !== 10 && cleanPhone.length !== 12)) {
      return {
        text: lang === 'hi'
          ? `⚠️ अमान्य फोन नंबर। कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें (उदा. 9876543210):`
          : lang === 'bn'
          ? `⚠️ ভুল ফোন নম্বর। দয়া করে ১০ সংখ্যার মোবাইল নম্বর লিখুন (যেমন: 9876543210):`
          : `⚠️ Invalid phone number. Please enter a valid 10-digit mobile number (e.g. 9876543210):`,
        buttons: [
          { id: 'NAV_BACK', title: '⬅️ Back' }
        ]
      };
    }

    // Match against farmer accounts (including SIH demo farmer mapping)
    const normalized10 = cleanPhone.slice(-10);
    const matchedFarmer = WhatsAppUserService.findFarmerByPhone(normalized10);

    if (matchedFarmer) {
      session.accountStatus = 'CONNECTED';
      session.farmerId = matchedFarmer.id;
      session.phoneNumber = normalized10;
      session.farmerProfile = {
        name: matchedFarmer.name,
        location: matchedFarmer.location,
        crop: matchedFarmer.crop,
        land: matchedFarmer.land,
        season: matchedFarmer.season
      };
      session.state = 'MAIN_MENU';
      this.pushHistory(user, 'MAIN_MENU');

      WhatsAppUserService.updateSession(user.id, {
        accountStatus: 'CONNECTED',
        farmerId: matchedFarmer.id,
        phoneNumber: normalized10,
        farmerProfile: session.farmerProfile,
        state: 'MAIN_MENU'
      });

      // Format connected success message followed by main menu
      const successMsg = ResponseFormatterService.buildAccountConnected(matchedFarmer, lang);
      const mainMenu = ResponseFormatterService.buildMainMenu(lang);

      return {
        text: `${successMsg}\n\n────────────────────\n\n${mainMenu.text}`,
        interactiveType: mainMenu.interactiveType,
        listTitle: mainMenu.listTitle,
        buttons: mainMenu.buttons
      };
    }

    // Account not found
    return ResponseFormatterService.buildAccountNotFound(lang);
  }

  /**
   * STEP 12: Main Menu Selection & Free-text Intent Routing
   */
  private static async handleMainMenuSelection(
    user: WhatsAppUserRecord,
    action: string,
    text: string
  ): Promise<FormattedStepMessage> {
    const session = WhatsAppUserService.getSession(user.id);
    const lang = session.language;

    // Check if user selected one of the 6 services via button/list/number
    let chosenService: string | null = null;
    if (action === 'SRV_PRICE_RISK' || /^(1|price\s*risk|before\s*you\s*sow)/i.test(text)) {
      chosenService = 'PRICE_RISK';
    } else if (action === 'SRV_CLIMATE_RISK' || /^(2|climate\s*risk|weather|mausam)/i.test(text)) {
      chosenService = 'CLIMATE_RISK';
    } else if (action === 'SRV_AGGREGATION' || /^(3|aggregation|group\s*selling)/i.test(text)) {
      chosenService = 'AGGREGATION';
    } else if (action === 'SRV_CROP_INSURANCE' || /^(4|crop\s*insurance|insurance|bima)/i.test(text)) {
      chosenService = 'CROP_INSURANCE';
    } else if (action === 'SRV_SMART_MANDI' || /^(5|smart\s*mandi|mandi|bhav)/i.test(text)) {
      chosenService = 'SMART_MANDI';
    } else if (action === 'SRV_BASIC_NEEDS' || /^(6|basic\s*farmer\s*needs|farmer\s*needs)/i.test(text)) {
      chosenService = 'BASIC_FARMER_NEEDS';
    }

    // Free-text fallback routing using IntentRouter
    if (!chosenService && text.length > 2) {
      const intentClass = await IntentRouterService.classify(text);
      if (intentClass.intent === 'CLIMATE_RISK') chosenService = 'CLIMATE_RISK';
      else if (intentClass.intent === 'SMART_MANDI' || intentClass.intent === 'PRICE_INFORMATION') chosenService = 'SMART_MANDI';
      else if (intentClass.intent === 'CROP_DISEASE') chosenService = 'BASIC_FARMER_NEEDS';
      else if (intentClass.intent === 'GOVERNMENT_SCHEME') chosenService = 'BASIC_FARMER_NEEDS';
    }

    if (!chosenService) {
      return ResponseFormatterService.buildMainMenu(lang);
    }

    // Execute service flow
    return this.executeService(user, chosenService);
  }

  /**
   * Execute one of the 6 BharatFarm services
   */
  private static async executeService(
    user: WhatsAppUserRecord,
    service: string,
    subSelection?: string
  ): Promise<FormattedStepMessage> {
    const session = WhatsAppUserService.getSession(user.id);
    const lang = session.language;
    const farmer = session.farmerProfile;

    session.service = service as any;
    session.state = 'SERVICE_RESULT';
    this.pushHistory(user, 'SERVICE_RESULT');
    WhatsAppUserService.updateSession(user.id, {
      service: service as any,
      state: 'SERVICE_RESULT'
    });

    switch (service) {
      // 1. PRICE RISK / BEFORE YOU SOW
      case 'PRICE_RISK': {
        const crop = subSelection || farmer?.crop || 'Tomato';
        const isTomato = crop.toLowerCase().includes('tomato');

        const priceRiskData = {
          crop,
          riskLevel: (isTomato ? 'HIGH' : 'MODERATE') as any,
          riskScore: isTomato ? 78 : 45,
          confidence: 84,
          expectedMarketPressure: isTomato ? 'Severe' : 'Moderate',
          reasons: [
            'Local farmer intention is 33% above historical baseline for this agro-climatic cluster.',
            'Mandi arrivals are trending upward across regional terminal markets.',
            'Historical price volatility is elevated during peak harvest weeks.'
          ],
          alternativeCrop: isTomato ? '🧅 Onion' : '🌶️ Chilli',
          isDemoData: true
        };

        return ResponseFormatterService.buildPriceRiskResult(priceRiskData, lang);
      }

      // 2. CLIMATE RISK
      case 'CLIMATE_RISK': {
        const location = farmer?.location || user.locationName || 'Nashik';
        try {
          const weather = await fetchWeatherData(location);
          const flood = await fetchFloodRisk(weather, location);
          const assessment = ClimateEngine.analyze(weather, flood, farmer?.crop || 'Tomato', 'Vegetative');
          return ResponseFormatterService.buildClimateRiskResult(weather, assessment, location, lang);
        } catch {
          // Graceful fallback with valid weather data format
          const fallbackWeather = {
            location,
            temperatureCelsius: 29,
            humidityPercent: 68,
            rainfallProbability: 70,
            expectedRainfallMm: 18,
            windSpeedKmh: 14,
            condition: 'Thunderstorms Likely'
          };
          return ResponseFormatterService.buildClimateRiskResult(fallbackWeather as any, undefined, location, lang);
        }
      }

      // 3. AGGREGATION
      case 'AGGREGATION': {
        const crop = farmer?.crop || 'Tomato';
        const requirements = SmartMandiMatchingService.getAllRequirements();
        const matched = requirements.find(r => r.crop.toLowerCase() === crop.toLowerCase());

        return ResponseFormatterService.buildAggregationResult({
          crop,
          activePools: 2,
          buyerName: matched?.buyerName || 'Sahyadri Farmer Producer Co. Ltd',
          offeredPricePerKg: matched?.expectedPricePerKg || 22,
          transportSavingsPercent: 60,
          clusterArea: farmer?.location || 'Nashik / Niphad Cluster'
        }, lang);
      }

      // 4. CROP INSURANCE
      case 'CROP_INSURANCE': {
        const claims = ClaimStore.getAllClaims();
        const demoClaim = claims[0];

        return ResponseFormatterService.buildCropInsuranceResult({
          farmerName: farmer?.name || user.name || 'Demo Farmer',
          claimId: demoClaim?.claimId || 'CLM-2026-0891',
          crop: farmer?.crop || 'Tomato',
          lossPercentage: demoClaim?.aiAssessment?.affectedPercentage || 42,
          status: 'Under Government Verification (Satellite Evidence Verified)',
          ndviScore: 0.38,
          verificationMethod: 'Sentinel-2 Multi-spectral NDVI & SAR flood telemetry'
        }, lang);
      }

      // 5. SMART MANDI
      case 'SMART_MANDI': {
        const crop = subSelection || farmer?.crop || 'Paddy';
        const isPaddy = crop.toLowerCase().includes('paddy');

        const mandiData = {
          crop,
          mandis: isPaddy
            ? [
                { name: 'Haldia Central APMC', pricePerQtl: 2350, distanceKm: 12, trend: 'INCREASING' },
                { name: 'Contai Terminal Mandi', pricePerQtl: 2280, distanceKm: 28, trend: 'STABLE' },
                { name: 'Kolkata Wholesale Mandi', pricePerQtl: 2450, distanceKm: 88, trend: 'INCREASING' }
              ]
            : [
                { name: 'Lasalgaon APMC', pricePerQtl: 1850, distanceKm: 42, trend: 'STABLE' },
                { name: 'Pimpalgaon Mandi', pricePerQtl: 1720, distanceKm: 55, trend: 'DECREASING' },
                { name: 'Nashik Main APMC', pricePerQtl: 1900, distanceKm: 61, trend: 'STABLE' }
              ],
          recommendedRoute: isPaddy
            ? 'Haldia Central APMC (Highest net margin accounting for ₹45/q transport)'
            : 'Lasalgaon APMC (Lowest arrival congestion today)'
        };

        return ResponseFormatterService.buildSmartMandiResult(mandiData, lang);
      }

      // 6. BASIC FARMER NEEDS
      case 'BASIC_FARMER_NEEDS': {
        if (subSelection) {
          return ResponseFormatterService.buildBasicNeedsSubServiceResult(subSelection, lang);
        }
        return ResponseFormatterService.buildBasicNeedsMenu(lang);
      }

      default:
        return ResponseFormatterService.buildMainMenu(lang);
    }
  }

  /**
   * Handle Service Interaction Sub-actions
   */
  private static async handleServiceInteraction(
    user: WhatsAppUserRecord,
    action: string,
    text: string,
    payload?: any
  ): Promise<FormattedStepMessage> {
    const session = WhatsAppUserService.getSession(user.id);
    const lang = session.language;

    // Basic needs sub-services
    if (action.startsWith('BN_')) {
      return ResponseFormatterService.buildBasicNeedsSubServiceResult(action, lang);
    }

    // Crop selection inside Price Risk or Smart Mandi
    if (/^(tomato|onion|chilli|paddy|wheat|potato)$/i.test(text) || payload?.crop) {
      const crop = payload?.crop || text;
      return this.executeService(user, session.service || 'PRICE_RISK', crop);
    }

    // Default return to Main Menu
    session.state = 'MAIN_MENU';
    WhatsAppUserService.updateSession(user.id, { state: 'MAIN_MENU' });
    return ResponseFormatterService.buildMainMenu(lang);
  }
}
