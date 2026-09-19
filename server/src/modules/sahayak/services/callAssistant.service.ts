import {
  CallSessionState,
  CallEventRequest,
  CallEventResponse,
  SupportedCallLanguage,
  CallModuleOption
} from '../types/call.types.js';
import { CallSessionService } from './callSession.service.js';
import { VoiceIntentService } from './voiceIntent.service.js';

// Reuse EXISTING BharatFarm backend services (No duplication)
import { fetchWeatherData } from '../../../services/climateRisk/weatherProvider.js';
import { fetchFloodRisk } from '../../../services/climateRisk/floodProvider.js';
import { ClimateEngine } from '../../../services/climateRisk/climateEngine.js';
import { SmartMandiMatchingService } from '../../../services/smartMandiMatching.service.js';
import { ClaimStore } from '../../../services/insurance/claimStore.js';

export class CallAssistantService {
  /**
   * Main entry point for telephony incoming calls, DTMF keypresses, and spoken audio transcripts
   */
  static async processCallEvent(event: CallEventRequest): Promise<CallEventResponse> {
    const session = CallSessionService.getOrCreateSession(event.sessionId, event.callerPhone);

    // If caller explicitly provided language in event
    if (event.language) {
      session.language = event.language;
    }

    const dtmf = event.digits?.trim();
    const speech = event.speechText?.trim();

    // Log caller utterance/digit
    if (dtmf) {
      CallSessionService.addHistory(session.sessionId, 'farmer', `Pressed [${dtmf}]`, dtmf);
    } else if (speech) {
      CallSessionService.addHistory(session.sessionId, 'farmer', speech);
    }

    // Step 1: Check for universal spoken keywords ("main menu", "repeat", "exit", "back")
    if (speech) {
      const special = VoiceIntentService.checkSpecialCommands(speech);
      if (special === 'MAIN_MENU') {
        session.currentStep = 'MAIN_MENU';
        session.activeModule = undefined;
        return this.renderMainMenu(session);
      }
      if (special === 'REPEAT') {
        // Repeat previous prompt
        const lastAi = [...session.history].reverse().find(h => h.speaker === 'ai');
        return {
          sessionId: session.sessionId,
          spokenText: lastAi?.text || 'Namaste. Kripya apna vikalp chunein.',
          displayPrompt: lastAi?.text || 'Namaste. Kripya apna vikalp chunein.',
          currentStep: session.currentStep,
          activeModule: session.activeModule,
          language: session.language
        };
      }
      if (special === 'EXIT') {
        CallSessionService.endSession(session.sessionId);
        return this.renderCallEnded(session);
      }
      if (special === 'BACK') {
        session.currentStep = 'MAIN_MENU';
        session.activeModule = undefined;
        return this.renderMainMenu(session);
      }

      // If caller spoke at WELCOME_LANGUAGE, set language; otherwise retain chosen language
      const speechIntent = VoiceIntentService.classifyCallSpeech(speech);
      if (session.currentStep === 'WELCOME_LANGUAGE' && speechIntent.detectedLanguage) {
        session.language = speechIntent.detectedLanguage;
      }
      if (speechIntent.extractedEntities?.crop) {
        session.crop = speechIntent.extractedEntities.crop;
      }
      if (speechIntent.extractedEntities?.landSizeAcres) {
        session.landSizeAcres = speechIntent.extractedEntities.landSizeAcres;
      }

      if (speechIntent.module) {
        session.activeModule = speechIntent.module;
        switch (speechIntent.module) {
          case 'BEFORE_YOU_SOW':
            session.currentStep = 'BEFORE_YOU_SOW_FLOW';
            return this.handleBeforeYouSowFlow(session, undefined, speech);
          case 'CLIMATE_RISK':
            session.currentStep = 'CLIMATE_RISK_FLOW';
            return await this.handleClimateRiskFlow(session, undefined, speech);
          case 'AGGREGATION':
            session.currentStep = 'AGGREGATION_FLOW';
            return this.handleAggregationFlow(session, undefined, speech);
          case 'CROP_INSURANCE':
            session.currentStep = 'CROP_INSURANCE_FLOW';
            return this.handleCropInsuranceFlow(session, undefined, speech);
          case 'SMART_MANDI':
            session.currentStep = 'SMART_MANDI_FLOW';
            return this.handleSmartMandiFlow(session, undefined, speech);
          case 'BASIC_FARMER_NEEDS':
            session.currentStep = 'BASIC_NEEDS_FLOW';
            return this.handleBasicNeedsFlow(session, undefined, speech);
        }
      }
    }

    // Step 2: Handle based on current call step state machine
    switch (session.currentStep) {
      case 'WELCOME_LANGUAGE':
        return this.handleWelcomeLanguageStep(session, dtmf, speech);

      case 'MAIN_MENU':
        return await this.handleMainMenuStep(session, dtmf, speech);

      case 'BEFORE_YOU_SOW_FLOW':
        return this.handleBeforeYouSowFlow(session, dtmf, speech);

      case 'CLIMATE_RISK_FLOW':
        return await this.handleClimateRiskFlow(session, dtmf, speech);

      case 'AGGREGATION_FLOW':
        return this.handleAggregationFlow(session, dtmf, speech);

      case 'CROP_INSURANCE_FLOW':
        return this.handleCropInsuranceFlow(session, dtmf, speech);

      case 'SMART_MANDI_FLOW':
        return this.handleSmartMandiFlow(session, dtmf, speech);

      case 'BASIC_NEEDS_FLOW':
        return this.handleBasicNeedsFlow(session, dtmf, speech);

      case 'FOLLOW_UP_CONVERSATION':
      default:
        return await this.handleFollowUpConversation(session, dtmf, speech);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 1. WELCOME & LANGUAGE SELECTION (DTMF 1: Hindi, 2: English, 3: Bengali)
  // ─────────────────────────────────────────────────────────────
  private static handleWelcomeLanguageStep(
    session: CallSessionState,
    dtmf?: string,
    speech?: string
  ): CallEventResponse {
    let chosenLang: SupportedCallLanguage | null = null;

    if (dtmf === '1') chosenLang = 'hi';
    else if (dtmf === '2') chosenLang = 'en';
    else if (dtmf === '3') chosenLang = 'bn';
    else if (speech) {
      const detected = VoiceIntentService.classifyCallSpeech(speech).detectedLanguage;
      if (detected) chosenLang = detected;
    }

    if (chosenLang) {
      session.language = chosenLang;
      session.currentStep = 'MAIN_MENU';
      return this.renderMainMenu(session);
    }

    // Default welcome IVR prompt
    const prompt =
      'Welcome to BharatFarm Sahayak.\n\n' +
      'Hindi ke liye 1 dabayein.\n' +
      'For English, press 2.\n' +
      'Bangla bhashar jonno 3 chepe aage barun.';

    CallSessionService.addHistory(session.sessionId, 'ai', prompt);

    return {
      sessionId: session.sessionId,
      spokenText: prompt,
      displayPrompt: prompt,
      optionsMenu: [
        { key: '1', label: '1 → हिंदी (Hindi)' },
        { key: '2', label: '2 → English' },
        { key: '3', label: '3 → বাংলা (Bengali)' }
      ],
      currentStep: 'WELCOME_LANGUAGE',
      language: session.language
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 2. MAIN MENU (DTMF 1 - 6 or Natural Speech)
  // ─────────────────────────────────────────────────────────────
  private static renderMainMenu(session: CallSessionState): CallEventResponse {
    const lang = session.language;

    let spoken = '';
    let options: Array<{ key: string; label: string }> = [];

    if (lang === 'hi') {
      spoken =
        'Namaste. BharatFarm Sahayak mein aapka swagat hai.\n\n' +
        '1: Before You Sow ke liye 1 dabayein.\n' +
        '2: Mausam aur Climate Risk ke liye 2 dabayein.\n' +
        '3: Aggregation aur group selling ke liye 3 dabayein.\n' +
        '4: Crop Insurance verification ke liye 4 dabayein.\n' +
        '5: Mandi aur bazaar jaankari ke liye 5 dabayein.\n' +
        '6: Baaki farmer services ke liye 6 dabayein.\n\n' +
        'Aap bolkar bhi apni zaroorat seedhe bata sakte hain.';

      options = [
        { key: '1', label: '1 → Before You Sow' },
        { key: '2', label: '2 → Climate Risk' },
        { key: '3', label: '3 → Aggregation' },
        { key: '4', label: '4 → Crop Insurance' },
        { key: '5', label: '5 → Smart Mandi' },
        { key: '6', label: '6 → Basic Farmer Needs' }
      ];
    } else if (lang === 'bn') {
      spoken =
        'নমস্কার। ভারতফার্ম সহায়ক ভয়েস সেবায় আপনাকে স্বাগত।\n\n' +
        '১: বপনের পূর্ব প্রস্তুতি ও দামের ঝুঁকির জন্য ১ চাপুন।\n' +
        '২: আবহাওয়া ও ঝুঁকি তথ্যের জন্য ২ চাপুন।\n' +
        '৩: দলবদ্ধ বিক্রয় ও সমবায়ের জন্য ৩ চাপুন।\n' +
        '৪: ফসল বীমা যাচাইয়ের জন্য ৪ চাপুন।\n' +
        '৫: স্মার্ট মান্ডি ও বাজারের জন্য ৫ চাপুন।\n' +
        '৬: অন্যান্য কৃষক সুবিধার জন্য ৬ চাপুন।\n\n' +
        'আপনি সরাসরি কথা বলেও জিজ্ঞাসা করতে পারেন।';

      options = [
        { key: '1', label: '১ → Before You Sow' },
        { key: '2', label: '২ → Climate Risk' },
        { key: '3', label: '৩ → Aggregation' },
        { key: '4', label: '৪ → Crop Insurance' },
        { key: '5', label: '৫ → Smart Mandi' },
        { key: '6', label: '৬ → Basic Farmer Needs' }
      ];
    } else {
      spoken =
        'Welcome to BharatFarm Sahayak Voice Service.\n\n' +
        'Press 1 for Before You Sow.\n' +
        'Press 2 for Climate Risk.\n' +
        'Press 3 for Aggregation.\n' +
        'Press 4 for Crop Insurance.\n' +
        'Press 5 for Smart Mandi.\n' +
        'Press 6 for Basic Farmer Needs.\n\n' +
        'You can also simply speak and tell me what you need.';

      options = [
        { key: '1', label: '1 → Before You Sow' },
        { key: '2', label: '2 → Climate Risk' },
        { key: '3', label: '3 → Aggregation' },
        { key: '4', label: '4 → Crop Insurance' },
        { key: '5', label: '5 → Smart Mandi' },
        { key: '6', label: '6 → Basic Farmer Needs' }
      ];
    }

    CallSessionService.addHistory(session.sessionId, 'ai', spoken);

    return {
      sessionId: session.sessionId,
      spokenText: spoken,
      displayPrompt: spoken,
      optionsMenu: options,
      currentStep: 'MAIN_MENU',
      language: session.language
    };
  }

  private static async handleMainMenuStep(
    session: CallSessionState,
    dtmf?: string,
    speech?: string
  ): Promise<CallEventResponse> {
    let targetModule: CallModuleOption | undefined;

    // DTMF routing
    if (dtmf === '1') targetModule = 'BEFORE_YOU_SOW';
    else if (dtmf === '2') targetModule = 'CLIMATE_RISK';
    else if (dtmf === '3') targetModule = 'AGGREGATION';
    else if (dtmf === '4') targetModule = 'CROP_INSURANCE';
    else if (dtmf === '5') targetModule = 'SMART_MANDI';
    else if (dtmf === '6') targetModule = 'BASIC_FARMER_NEEDS';

    // Natural speech intent routing
    if (!targetModule && speech) {
      const intentResult = VoiceIntentService.classifyCallSpeech(speech);
      if (intentResult.module) {
        targetModule = intentResult.module;
      }
      if (intentResult.extractedEntities?.crop) {
        session.crop = intentResult.extractedEntities.crop;
      }
      if (intentResult.extractedEntities?.landSizeAcres) {
        session.landSizeAcres = intentResult.extractedEntities.landSizeAcres;
      }
    }

    if (!targetModule) {
      return this.renderUnrecognizedQuery(session);
    }

    session.activeModule = targetModule;

    switch (targetModule) {
      case 'BEFORE_YOU_SOW':
        session.currentStep = 'BEFORE_YOU_SOW_FLOW';
        return this.handleBeforeYouSowFlow(session);

      case 'CLIMATE_RISK':
        session.currentStep = 'CLIMATE_RISK_FLOW';
        return await this.handleClimateRiskFlow(session);

      case 'AGGREGATION':
        session.currentStep = 'AGGREGATION_FLOW';
        return this.handleAggregationFlow(session);

      case 'CROP_INSURANCE':
        session.currentStep = 'CROP_INSURANCE_FLOW';
        return this.handleCropInsuranceFlow(session);

      case 'SMART_MANDI':
        session.currentStep = 'SMART_MANDI_FLOW';
        return this.handleSmartMandiFlow(session);

      case 'BASIC_FARMER_NEEDS':
        session.currentStep = 'BASIC_NEEDS_FLOW';
        return this.handleBasicNeedsFlow(session);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. OPTION 1: BEFORE YOU SOW (Price Risk & Planting Decision)
  // ─────────────────────────────────────────────────────────────
  private static handleBeforeYouSowFlow(
    session: CallSessionState,
    _dtmf?: string,
    speech?: string
  ): CallEventResponse {
    const crop = session.crop || 'Paddy';
    const land = session.landSizeAcres || 2.5;
    const district = session.district || 'Purba Medinipur';

    if (speech) {
      const entities = VoiceIntentService.classifyCallSpeech(speech).extractedEntities;
      if (entities?.crop) session.crop = entities.crop;
      if (entities?.landSizeAcres) session.landSizeAcres = entities.landSizeAcres;
    }

    let spoken = '';
    if (session.language === 'hi') {
      spoken =
        `Before You Sow sahayak: Aapke ${district} kshetr mein ${crop} ke liye vartaman market price risk MODERATE (madhyam) hai.\n\n` +
        `• Anumanit harvest bhav: ₹2,180 se ₹2,400 prati quintal.\n` +
        `• Salah: Bote samay beej aur khad ki lagat ko anumanit bhav se milayein.\n` +
        `• Agar aap alternate crop chahte hain, toh Mustard ya Chilli par vichaar kar sakte hain.\n\n` +
        `Kya aap step-by-step lagat aur bo-wai ki check-list sunna chahte hain? Haan ya Main Menu kahein.`;
    } else if (session.language === 'bn') {
      spoken =
        `Before You Sow সহায়ক: আপনার ${district} জেলায় ${crop}-এর ক্ষেত্রে বর্তমান বাজার ঝুঁকি MODERATE (মাঝারি)।\n\n` +
        `• সম্ভাব্য দর: ₹২,১৮০ থেকে ₹২,৪০০ প্রতি কুইন্টাল।\n` +
        `• পরামর্শ: ফলনের খরচের সাথে প্রত্যাশিত দর তুলনা করুন।\n\n` +
        `আপনি কি খরচ ও বপনের প্রস্তুতি তালিকা বিস্তারিত জানতে চান? হ্যাঁ অথবা মেইন মেনু বলুন।`;
    } else {
      spoken =
        `Before You Sow Intelligence: In ${district}, ${crop} currently carries a MODERATE price risk.\n\n` +
        `• Projected harvest rate: ₹2,180 to ₹2,400 per quintal.\n` +
        `• Sowing Advisory: Align your estimated seed & fertilizer expense with projected harvest realization.\n\n` +
        `Would you like to hear step-by-step pre-sowing checks? Say Yes or Main Menu.`;
    }

    session.currentStep = 'FOLLOW_UP_CONVERSATION';
    CallSessionService.addHistory(session.sessionId, 'ai', spoken);

    return {
      sessionId: session.sessionId,
      spokenText: spoken,
      displayPrompt: spoken,
      optionsMenu: [
        { key: '1', label: '1 → Detailed Sowing Checklist' },
        { key: '2', label: '2 → Alternative Crop Options' },
        { key: '*', label: '* → Return to Main Menu' }
      ],
      currentStep: session.currentStep,
      activeModule: 'BEFORE_YOU_SOW',
      language: session.language
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 4. OPTION 2: CLIMATE RISK (Calls existing Weather & Flood engine)
  // ─────────────────────────────────────────────────────────────
  private static async handleClimateRiskFlow(
    session: CallSessionState,
    dtmf?: string,
    speech?: string
  ): Promise<CallEventResponse> {
    const loc = session.district || 'Haldia, West Bengal';

    try {
      // Direct call to existing weather & flood provider
      const weather = await fetchWeatherData(loc);
      const flood = await fetchFloodRisk(weather, loc);
      const assessment = ClimateEngine.analyze(weather, flood, session.crop || 'Paddy', 'Flowering');

      const temp = Math.round(weather.temperatureCelsius);
      const rainProb = weather.rainfallProbability;
      const rainMm = weather.expectedRainfallMm;

      let spoken = '';
      if (session.language === 'hi') {
        spoken =
          `Climate Risk Advisory: ${loc} mein vartaman tapman ${temp}°C hai.\n` +
          `Agle 24 ghante mein baarish ki sambhavna ${rainProb}% (~${rainMm} mm) hai.\n\n` +
          `⚠️ Kheti Salah: ${assessment.harvestAdvisory.headline}.\n` +
          `Action: ${assessment.harvestAdvisory.actionSteps[0] || 'Khet ke drainage channels saaf rakhein.'}\n\n` +
          `Main menu ke liye Star (*) dabayein ya aur jaankari poochein.`;
      } else if (session.language === 'bn') {
        spoken =
          `আবহাওয়া ঝুঁকি রিপোর্ট: ${loc}-এ বর্তমান তাপমাত্রা ${temp}°C।\n` +
          `আগামী ২৪ ঘন্টায় বৃষ্টির সম্ভাবনা ${rainProb}% (~${rainMm} মিলিমিটার)।\n\n` +
          `⚠️ কৃষি পরামর্শ: ${assessment.harvestAdvisory.headline}।\n` +
          `পদক্ষেপ: ড্রেনেজ ব্যবস্থা পরিষ্কার রাখুন ও কীটনাশক প্রয়োগ স্থগিত রাখুন।\n\n` +
          `মেইন মেনুর জন্য স্টার (*) চাপুন অথবা বিস্তারিত জানতে বলুন।`;
      } else {
        spoken =
          `Climate Risk Advisory for ${loc}: Current temperature is ${temp}°C.\n` +
          `Rain probability for the next 24 hours is ${rainProb}% (~${rainMm} mm).\n\n` +
          `⚠️ Operational Guidance: ${assessment.harvestAdvisory.headline}.\n` +
          `Key Action: ${assessment.harvestAdvisory.actionSteps[0] || 'Keep field drainage exits cleared.'}\n\n` +
          `Say "Main Menu" or press * to return to the main menu.`;
      }

      session.currentStep = 'FOLLOW_UP_CONVERSATION';
      CallSessionService.addHistory(session.sessionId, 'ai', spoken);

      return {
        sessionId: session.sessionId,
        spokenText: spoken,
        displayPrompt: spoken,
        optionsMenu: [
          { key: '1', label: '1 → 7-Day Rainfall Forecast' },
          { key: '2', label: '2 → Spraying & Fertilizer Timing' },
          { key: '*', label: '* → Main Menu' }
        ],
        currentStep: session.currentStep,
        activeModule: 'CLIMATE_RISK',
        language: session.language
      };
    } catch {
      return this.renderServiceFailure(session);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 5. OPTION 3: AGGREGATION & GROUP SELLING (Calls SmartMandi pools)
  // ─────────────────────────────────────────────────────────────
  private static handleAggregationFlow(
    session: CallSessionState,
    _dtmf?: string,
    _speech?: string
  ): CallEventResponse {
    const crop = session.crop || 'Potato';
    const requirements = SmartMandiMatchingService.getAllRequirements();
    const targetPool = requirements.find(r => r.crop.toLowerCase() === crop.toLowerCase());

    let spoken = '';
    if (session.language === 'hi') {
      spoken =
        `Aggregation Sahayak: BharatFarm mein aas-paas ke kisan milkar fasal bechte hain jisse transport kharcha 60% tak kam hota hai.\n\n` +
        `• Aapke kshetr mein ${crop} ke liye 1 सक्रिय Supply Aggregation Pool uplabdh hai.\n` +
        `• Buyer: ${targetPool?.buyerName || 'Haldia Agro Foods Ltd'}\n` +
        `• Anumanit Pool Price: ₹${targetPool?.expectedPricePerKg || 24} prati kg.\n\n` +
        `Kya aap is pool mein apni fasal ka quota jodna chahte hain?`;
    } else if (session.language === 'bn') {
      spoken =
        `Aggregation সহায়ক: ভারতফার্মের মাধ্যমে দলবদ্ধভাবে ফসল বিক্রি করলে পরিবহন খরচ ৬০% পর্যন্ত হ্রাস পায়।\n\n` +
        `• আপনার এলাকায় ${crop}-এর জন্য ১টি সক্রিয় কালেকশন পুল রয়েছে।\n` +
        `• প্রত্যাশিত দর: ₹${targetPool?.expectedPricePerKg || 24} প্রতি কেজি।\n\n` +
        `আপনি কি আপনার ফসল যুক্ত করতে চান?`;
    } else {
      spoken =
        `Aggregation Service: Collective farmer aggregation groups lower rural transport dispatch costs by up to 60%.\n\n` +
        `• Active Supply Pool available for ${crop} in your cluster.\n` +
        `• Target Buyer: ${targetPool?.buyerName || 'Haldia Agro Foods Ltd'}\n` +
        `• Buyer Offered Price: ₹${targetPool?.expectedPricePerKg || 24}/kg.\n\n` +
        `Would you like me to register your supply into this collection pool?`;
    }

    session.currentStep = 'FOLLOW_UP_CONVERSATION';
    CallSessionService.addHistory(session.sessionId, 'ai', spoken);

    return {
      sessionId: session.sessionId,
      spokenText: spoken,
      displayPrompt: spoken,
      optionsMenu: [
        { key: '1', label: '1 → Join Collection Pool' },
        { key: '2', label: '2 → Calculate Transport Savings' },
        { key: '*', label: '* → Main Menu' }
      ],
      currentStep: session.currentStep,
      activeModule: 'AGGREGATION',
      language: session.language
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 6. OPTION 4: CROP INSURANCE (PMFBY Satellite Verification)
  // ─────────────────────────────────────────────────────────────
  private static handleCropInsuranceFlow(
    session: CallSessionState,
    _dtmf?: string,
    _speech?: string
  ): CallEventResponse {
    // Check existing claims in ClaimStore
    const claims = ClaimStore.getAllClaims();
    const demoClaim = claims[0];

    const farmerName = session.farmerName || 'Ramesh Patel';
    const lossPct = demoClaim?.aiAssessment?.affectedPercentage || 42;
    const claimId = demoClaim?.claimId || 'CLM-2026-0891';
    const statusStr = demoClaim?.status ? demoClaim.status.replace(/_/g, ' ') : 'Government verification completed';

    let spoken = '';
    if (session.language === 'hi') {
      spoken =
        `Crop Insurance Sahayak: Hum satellite NDVI aur multi-spectral telemetry se fasal nuksaan ka satyapan karte hain.\n\n` +
        `• Aapka registered khet: ${farmerName} (Claim ID: ${claimId})\n` +
        `• Satellite Anuman: ${lossPct}% vegetation loss darj hua hai.\n` +
        `• Status: ${statusStr}.\n\n` +
        `Bina patwari ya daftari chakkar ke digital claim report tayyar hai.`;
    } else if (session.language === 'bn') {
      spoken =
        `ফসল বীমা সহায়ক: স্যাটেলাইট ইমেজারির মাধ্যমে ফসলের ক্ষতি নির্ভুলভাবে যাচাই করা হয়েছে।\n\n` +
        `• কৃষক: ${farmerName} (দাবি নম্বর: ${claimId})\n` +
        `• স্যাটেলাইট ক্ষতি পরিমাপ: ${lossPct}% ক্ষতি রেকর্ড হয়েছে।\n` +
        `• অবস্থা: সরকার কর্তৃক পর্যালোচনা সম্পন্ন হয়েছে।`;
    } else {
      spoken =
        `Crop Insurance Verification: Satellite-backed NDVI validation for parametric & PMFBY settlement.\n\n` +
        `• Registered Farm: ${farmerName} (Claim ID: ${claimId})\n` +
        `• Optical Loss Estimate: ${lossPct}% canopy reduction confirmed.\n` +
        `• Current Verification Status: ${statusStr}.`;
    }

    session.currentStep = 'FOLLOW_UP_CONVERSATION';
    CallSessionService.addHistory(session.sessionId, 'ai', spoken);

    return {
      sessionId: session.sessionId,
      spokenText: spoken,
      displayPrompt: spoken,
      optionsMenu: [
        { key: '1', label: '1 → Detailed Loss Dossier' },
        { key: '2', label: '2 → Submit New Claim' },
        { key: '*', label: '* → Main Menu' }
      ],
      currentStep: session.currentStep,
      activeModule: 'CROP_INSURANCE',
      language: session.language
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 7. OPTION 5: SMART MANDI (Prices, Distance, Trade-offs)
  // ─────────────────────────────────────────────────────────────
  private static handleSmartMandiFlow(
    session: CallSessionState,
    _dtmf?: string,
    speech?: string
  ): CallEventResponse {
    const crop = session.crop || 'Paddy';
    const modalRate = crop.toLowerCase() === 'potato' ? 2400 : crop.toLowerCase() === 'wheat' ? 2275 : 2180;
    const distanceKm = 6.4;

    let spoken = '';
    if (session.language === 'hi') {
      spoken =
        `Smart Mandi Intelligence: Aapke paas ki Haldia APMC Mandi mein aaj ${crop} ka bhav ₹${modalRate} prati quintal hai.\n\n` +
        `• Doori: ${distanceKm} kilometer.\n` +
        `• Bazaar Trend: Tez (badhat ki taraf).\n` +
        `• Sahayak Salah: BharatFarm Aggregation Pool ke zariye bechne par ₹20 se ₹35 prati quintal transport bachat hogi.\n\n` +
        `Kya aap buyer requirement ya transport booking ki jaankari chahte hain?`;
    } else if (session.language === 'bn') {
      spoken =
        `স্মার্ট মান্ডি রিপোর্ট: নিকটবর্তী হলদিয়া মান্ডিতে আজকের ${crop}-এর দর ₹${modalRate} প্রতি কুইন্টাল।\n\n` +
        `• দূরত্ব: ${distanceKm} কিমি।\n` +
        `• বাজার ট্রেন্ড: বৃদ্ধি 🟢।\n` +
        `• পরামর্শ: সমন্বিত গ্রুপ সেলিংয়ে পরিবহন খরচ বাঁচিয়ে আরও লাভবান হন।`;
    } else {
      spoken =
        `Smart Mandi Intelligence: Current ${crop} modal rate at nearest Haldia APMC Mandi is ₹${modalRate} per quintal.\n\n` +
        `• Distance: ${distanceKm} km from farm node.\n` +
        `• Price Trajectory: Increasing 🟢.\n` +
        `• Recommendation: Direct sale through BharatFarm buyer pool avoids intermediary commission and saves transit charges.`;
    }

    session.currentStep = 'FOLLOW_UP_CONVERSATION';
    CallSessionService.addHistory(session.sessionId, 'ai', spoken);

    return {
      sessionId: session.sessionId,
      spokenText: spoken,
      displayPrompt: spoken,
      optionsMenu: [
        { key: '1', label: '1 → Compare All Nearby Mandis' },
        { key: '2', label: '2 → Book Farmer Transport Slot' },
        { key: '*', label: '* → Main Menu' }
      ],
      currentStep: session.currentStep,
      activeModule: 'SMART_MANDI',
      language: session.language
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 8. OPTION 6: BASIC FARMER NEEDS (Guided steps for app tools)
  // ─────────────────────────────────────────────────────────────
  private static handleBasicNeedsFlow(
    session: CallSessionState,
    dtmf?: string,
    speech?: string
  ): CallEventResponse {
    let toolName = 'Leaf Scanner';
    let guidance = '';

    if (session.language === 'hi') {
      guidance =
        `Basic Farmer Needs Sahayak: Yahan aapko 8 zaroori agricultural tools milenge.\n\n` +
        `1. Leaf Scanner: Apne mobile se patti ki photo kheench kar bimari aur dawai jaanein.\n` +
        `2. Marketplace: Saste beej aur fertilizer seedhe order karein.\n` +
        `3. Crop Roadmap: Bo-wai se katai tak ka daily calendar dekhein.\n` +
        `4. Sarkari Yojana: PM-Kisan aur credit card subsidiyan dekhein.\n\n` +
        `BharatFarm app mein Leaf Scanner kholne ke liye Menu mein 'Leaf Scanner' par tap karein.`;
    } else if (session.language === 'bn') {
      guidance =
        `বেসিক ফার্মার নিডস সহায়ক: কৃষকদের জন্য প্রয়োজনীয় দৈনন্দিন সুবিধা:\n\n` +
        `১. লিফ স্ক্যানার: পাতার ছবি তুলে তাৎক্ষণিক রোগ ও ঔষধ জানুন।\n` +
        `২. মার্কেটপ্লেস: সাশ্রয়ী মূল্যে সার ও বীজ ক্রয় করুন।\n` +
        `৩. ক্রপ রোডম্যাপ: প্রতিদিনের চাষের গাইডলাইন দেখুন।\n\n` +
        `ভারতফার্ম অ্যাপের মেনুতে 'Leaf Scanner' চেপে ব্যবহার করতে পারেন।`;
    } else {
      guidance =
        `Basic Farmer Needs Suite provides step-by-step agricultural utilities:\n\n` +
        `1. Leaf Scanner: Snap a clear crop leaf photo to identify diseases and dosage.\n` +
        `2. Farm Marketplace: Purchase certified seeds and inputs at group discounts.\n` +
        `3. Crop Roadmap: Daily stage-by-stage agronomy calendar.\n` +
        `4. Government Schemes: Apply for PM-Kisan & Kisan Credit Card benefits.\n\n` +
        `To open Leaf Scanner in the BharatFarm PWA, navigate to the Scanner menu on your phone.`;
    }

    session.currentStep = 'FOLLOW_UP_CONVERSATION';
    CallSessionService.addHistory(session.sessionId, 'ai', guidance);

    return {
      sessionId: session.sessionId,
      spokenText: guidance,
      displayPrompt: guidance,
      optionsMenu: [
        { key: '1', label: '1 → Leaf Scanner Guide' },
        { key: '2', label: '2 → Government Schemes Guide' },
        { key: '*', label: '* → Main Menu' }
      ],
      currentStep: session.currentStep,
      activeModule: 'BASIC_FARMER_NEEDS',
      language: session.language
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 9. FOLLOW-UP CONVERSATION & NATURAL LANGUAGE Q&A
  // ─────────────────────────────────────────────────────────────
  private static async handleFollowUpConversation(
    session: CallSessionState,
    dtmf?: string,
    speech?: string
  ): Promise<CallEventResponse> {
    if (dtmf === '*') {
      session.currentStep = 'MAIN_MENU';
      session.activeModule = undefined;
      return this.renderMainMenu(session);
    }

    if (speech) {
      const intent = VoiceIntentService.classifyCallSpeech(speech);
      if (intent.module) {
        session.activeModule = intent.module;
        return await this.handleMainMenuStep(session, undefined, speech);
      }
    }

    let response = '';
    if (session.language === 'hi') {
      response =
        'Aapka sawaal darj kar liya gaya hai. Main menu mein lautne ke liye Star (*) dabayein ya "Main Menu" kahein. Call samapt karne ke liye phone kaat sakte hain.';
    } else if (session.language === 'bn') {
      response =
        'আপনার প্রশ্ন নথিভুক্ত করা হয়েছে। প্রারম্ভিক মেনুতে ফিরতে স্টার (*) চাপুন অথবা "মেইন মেনু" বলুন।';
    } else {
      response =
        'Your question has been noted. Say "Main Menu" or press * to return to options, or hang up to conclude.';
    }

    CallSessionService.addHistory(session.sessionId, 'ai', response);

    return {
      sessionId: session.sessionId,
      spokenText: response,
      displayPrompt: response,
      optionsMenu: [
        { key: '*', label: '* → Return to Main Menu' },
        { key: '#', label: '# → Conclude Call' }
      ],
      currentStep: 'FOLLOW_UP_CONVERSATION',
      activeModule: session.activeModule,
      language: session.language
    };
  }

  // ─────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────
  private static renderUnrecognizedQuery(session: CallSessionState): CallEventResponse {
    let msg = '';
    if (session.language === 'hi') {
      msg = 'Maaf kijiye, mujhe samajhne mein dikkat hui. Kripya 1 se 6 tak ka number dabayein, ya apna sawaal spasht bole.';
    } else if (session.language === 'bn') {
      msg = 'দুঃখিত, বুঝতে অসুবিধা হয়েছে। অনুগ্রহ করে ১ থেকে ৬ এর মধ্যে কোনো বোতাম চাপুন অথবা স্পষ্ট করে বলুন।';
    } else {
      msg = 'Sorry, I did not catch that. Please press a key from 1 to 6, or speak your request clearly.';
    }

    CallSessionService.addHistory(session.sessionId, 'ai', msg);

    return {
      sessionId: session.sessionId,
      spokenText: msg,
      displayPrompt: msg,
      optionsMenu: [
        { key: '1', label: '1 → Before You Sow' },
        { key: '2', label: '2 → Climate Risk' },
        { key: '3', label: '3 → Aggregation' },
        { key: '4', label: '4 → Crop Insurance' },
        { key: '5', label: '5 → Smart Mandi' },
        { key: '6', label: '6 → Basic Farmer Needs' }
      ],
      currentStep: session.currentStep,
      language: session.language
    };
  }

  private static renderServiceFailure(session: CallSessionState): CallEventResponse {
    const msg =
      session.language === 'hi'
        ? 'Abhi ye information available nahi hai. Kripya thodi der baad dobara try karein.'
        : session.language === 'bn'
        ? 'বর্তমানে এই তথ্যটি উপলব্ধ নেই। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।'
        : 'This service information is temporarily unavailable. Please try again shortly.';

    return {
      sessionId: session.sessionId,
      spokenText: msg,
      displayPrompt: msg,
      currentStep: 'MAIN_MENU',
      language: session.language
    };
  }

  private static renderCallEnded(session: CallSessionState): CallEventResponse {
    const msg =
      session.language === 'hi'
        ? 'BharatFarm Sahayak ko call karne ke liye dhanyawad. Namaste!'
        : session.language === 'bn'
        ? 'ভারতফার্ম সহায়ককে কল করার জন্য ধন্যবাদ। নমস্কার!'
        : 'Thank you for calling BharatFarm Sahayak. Happy farming!';

    return {
      sessionId: session.sessionId,
      spokenText: msg,
      displayPrompt: msg,
      currentStep: 'WELCOME_LANGUAGE',
      isCallEnded: true,
      language: session.language
    };
  }
}
