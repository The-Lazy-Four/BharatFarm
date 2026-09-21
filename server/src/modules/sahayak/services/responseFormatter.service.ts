import { WeatherData } from '../../../services/climateRisk/weatherProvider.js';
import { ClimateAssessmentResult } from '../../../services/climateRisk/climateEngine.js';
import { SupportedWhatsAppLanguage, WhatsAppSessionState } from '../types/whatsapp.types.js';

export interface MessageButtonOption {
  id: string;
  title: string;
}

export interface FormattedStepMessage {
  text: string;
  buttons?: MessageButtonOption[];
  interactiveType?: 'button' | 'list';
  listTitle?: string;
  quickReplies?: string[];
}

export class ResponseFormatterService {
  /**
   * 1. Welcome Message (Trilingual greeting + prompt to select language)
   */
  static buildWelcomeMessage(): FormattedStepMessage {
    const text =
      `🌾 *Welcome to BharatFarm Sahayak*\n\n` +
      `आपका स्वागत है।\n` +
      `BharatFarm Sahayak में आप खेती, मौसम, मंडी भाव और अन्य कृषि सेवाओं की जानकारी आसानी से प्राप्त कर सकते हैं।\n\n` +
      `Welcome to BharatFarm Sahayak.\n` +
      `Get agricultural assistance directly through WhatsApp.\n\n` +
      `BharatFarm Sahayak-এ আপনাকে স্বাগতম।\n` +
      `কৃষি, আবহাওয়া, বাজারদর এবং অন্যান্য পরিষেবার সাহায্য WhatsApp-এর মাধ্যমে পান।\n\n` +
      `────────────────────\n` +
      `*Please choose your language / अपनी भाषा चुनें / আপনার ভাষা নির্বাচন করুন*`;

    return {
      text,
      interactiveType: 'button',
      buttons: [
        { id: 'LANG_HI', title: '🇮🇳 हिंदी' },
        { id: 'LANG_EN', title: '🇬🇧 English' },
        { id: 'LANG_BN', title: '🇧🇩 বাংলা' }
      ]
    };
  }

  /**
   * 2. Language Selection prompt (if asked directly)
   */
  static buildLanguageSelection(): FormattedStepMessage {
    return {
      text: `*Please choose your language / अपनी भाषा चुनें / আপনার ভাষা নির্বাচন করুন*`,
      interactiveType: 'button',
      buttons: [
        { id: 'LANG_HI', title: '🇮🇳 हिंदी' },
        { id: 'LANG_EN', title: '🇬🇧 English' },
        { id: 'LANG_BN', title: '🇧🇩 বাংলা' }
      ]
    };
  }

  /**
   * 3. Account Question ("Do you have a BharatFarm account?")
   */
  static buildAccountQuestion(language: SupportedWhatsAppLanguage): FormattedStepMessage {
    if (language === 'hi') {
      return {
        text: `क्या आपका BharatFarm अकाउंट है?`,
        interactiveType: 'button',
        buttons: [
          { id: 'ACCOUNT_YES', title: '✅ Yes' },
          { id: 'ACCOUNT_NO', title: '❌ No' }
        ]
      };
    }
    if (language === 'bn') {
      return {
        text: `আপনার কি BharatFarm অ্যাকাউন্ট আছে?`,
        interactiveType: 'button',
        buttons: [
          { id: 'ACCOUNT_YES', title: '✅ হ্যাঁ (Yes)' },
          { id: 'ACCOUNT_NO', title: '❌ না (No)' }
        ]
      };
    }
    return {
      text: `Do you have a BharatFarm account?`,
      interactiveType: 'button',
      buttons: [
        { id: 'ACCOUNT_YES', title: '✅ Yes' },
        { id: 'ACCOUNT_NO', title: '❌ No' }
      ]
    };
  }

  /**
   * 4. Phone Request ("Please enter your registered mobile number")
   */
  static buildPhoneRequest(language: SupportedWhatsAppLanguage): FormattedStepMessage {
    if (language === 'hi') {
      return {
        text:
          `अपना BharatFarm अकाउंट कनेक्ट करने के लिए अपना registered mobile number भेजें।\n\n` +
          `📱 *Enter Mobile Number:*\n` +
          `(उदा. 9876543210)`
      };
    }
    if (language === 'bn') {
      return {
        text:
          `BharatFarm অ্যাকাউন্ট সংযুক্ত করতে আপনার registered mobile number পাঠান।\n\n` +
          `📱 *Enter Mobile Number:*\n` +
          `(যেমন: 9876543210)`
      };
    }
    return {
      text:
        `To connect your BharatFarm account, please enter your registered mobile number.\n\n` +
        `📱 *Enter Mobile Number:*\n` +
        `(e.g. 9876543210)`
    };
  }

  /**
   * 5. Account Connected Success
   */
  static buildAccountConnected(
    farmer: { name: string; location: string; crop?: string; land?: string },
    language: SupportedWhatsAppLanguage
  ): string {
    if (language === 'hi') {
      return (
        `✅ *आपका BharatFarm अकाउंट सफलतापूर्वक कनेक्ट हो गया है।*\n\n` +
        `👤 *किसान:* ${farmer.name}\n` +
        `📍 *स्थान:* ${farmer.location}\n` +
        (farmer.land ? `🌾 *भूमि:* ${farmer.land}\n` : '') +
        (farmer.crop ? `🌱 *मुख्य फसल:* ${farmer.crop}\n` : '') +
        `\nअब मैं आपके BharatFarm डेटा के आधार पर सेवाएं दे सकता हूं।`
      );
    }
    if (language === 'bn') {
      return (
        `✅ *আপনার BharatFarm অ্যাকাউন্ট সফলভাবে সংযুক্ত হয়েছে।*\n\n` +
        `👤 *কৃষক:* ${farmer.name}\n` +
        `📍 *অবস্থান:* ${farmer.location}\n` +
        (farmer.land ? `🌾 *জমি:* ${farmer.land}\n` : '') +
        (farmer.crop ? `🌱 *প্রধান ফসল:* ${farmer.crop}\n` : '') +
        `\nএখন আমি আপনার BharatFarm তথ্যের ভিত্তিতে সঠিক সেবা দিতে পারি।`
      );
    }
    return (
      `✅ *Your BharatFarm account has been connected successfully.*\n\n` +
      `👤 *Farmer:* ${farmer.name}\n` +
      `📍 *Location:* ${farmer.location}\n` +
      (farmer.land ? `🌾 *Land:* ${farmer.land}\n` : '') +
      (farmer.crop ? `🌱 *Primary Crop:* ${farmer.crop}\n` : '') +
      `\nI can now provide services using your BharatFarm information.`
    );
  }

  /**
   * 6. Account Not Found
   */
  static buildAccountNotFound(language: SupportedWhatsAppLanguage): FormattedStepMessage {
    if (language === 'hi') {
      return {
        text: `हमें इस नंबर से कोई BharatFarm अकाउंट नहीं मिला।\nआप नया अकाउंट बना सकते हैं या दूसरा नंबर आज़मा सकते हैं।`,
        interactiveType: 'button',
        buttons: [
          { id: 'CREATE_ACCOUNT', title: '➕ Create Account' },
          { id: 'TRY_ANOTHER_PHONE', title: '↩️ Try Another' },
          { id: 'NAV_BACK', title: '⬅️ Back' }
        ]
      };
    }
    if (language === 'bn') {
      return {
        text: `এই নম্বরের সাথে কোনো BharatFarm অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।`,
        interactiveType: 'button',
        buttons: [
          { id: 'CREATE_ACCOUNT', title: '➕ Create Account' },
          { id: 'TRY_ANOTHER_PHONE', title: '↩️ Try Another' },
          { id: 'NAV_BACK', title: '⬅️ Back' }
        ]
      };
    }
    return {
      text: `We could not find any BharatFarm account with this number.`,
      interactiveType: 'button',
      buttons: [
        { id: 'CREATE_ACCOUNT', title: '➕ Create Account' },
        { id: 'TRY_ANOTHER_PHONE', title: '↩️ Try Another' },
        { id: 'NAV_BACK', title: '⬅️ Back' }
      ]
    };
  }

  /**
   * 7. Account Question -> No ("Continue without account")
   */
  static buildNoAccountNotice(language: SupportedWhatsAppLanguage): FormattedStepMessage {
    if (language === 'hi') {
      return {
        text: `कोई समस्या नहीं। आप बिना BharatFarm अकाउंट के भी कुछ Sahayak सेवाओं का उपयोग कर सकते हैं।`,
        interactiveType: 'button',
        buttons: [
          { id: 'GUEST_CONTINUE', title: '🌾 Continue' },
          { id: 'CREATE_ACCOUNT', title: '➕ Create Account' }
        ]
      };
    }
    if (language === 'bn') {
      return {
        text: `কোন সমস্যা নেই। আপনি BharatFarm অ্যাকাউন্ট ছাড়াই বেশ কিছু Sahayak পরিষেবা ব্যবহার করতে পারেন।`,
        interactiveType: 'button',
        buttons: [
          { id: 'GUEST_CONTINUE', title: '🌾 Continue' },
          { id: 'CREATE_ACCOUNT', title: '➕ Create Account' }
        ]
      };
    }
    return {
      text: `No problem. You can continue using selected Sahayak services without a BharatFarm account.`,
      interactiveType: 'button',
      buttons: [
        { id: 'GUEST_CONTINUE', title: '🌾 Continue' },
        { id: 'CREATE_ACCOUNT', title: '➕ Create Account' }
      ]
    };
  }

  /**
   * 8. MAIN SAHAYAK MENU (6 Core BharatFarm modules)
   */
  static buildMainMenu(language: SupportedWhatsAppLanguage): FormattedStepMessage {
    if (language === 'hi') {
      const text =
        `🌾 *BharatFarm Sahayak*\n\n` +
        `आप कौन-सी सेवा लेना चाहते हैं?\n\n` +
        `1️⃣ Before You Sow / Price Risk\n` +
        `2️⃣ Climate Risk\n` +
        `3️⃣ Aggregation\n` +
        `4️⃣ Crop Insurance\n` +
        `5️⃣ Smart Mandi\n` +
        `6️⃣ Basic Farmer Needs`;

      return {
        text,
        interactiveType: 'list',
        listTitle: 'सेवा चुनें (Select Service)',
        buttons: [
          { id: 'SRV_PRICE_RISK', title: '🌾 1. Price Risk' },
          { id: 'SRV_CLIMATE_RISK', title: '🌦️ 2. Climate Risk' },
          { id: 'SRV_AGGREGATION', title: '👥 3. Aggregation' },
          { id: 'SRV_CROP_INSURANCE', title: '🛡️ 4. Crop Insurance' },
          { id: 'SRV_SMART_MANDI', title: '📊 5. Smart Mandi' },
          { id: 'SRV_BASIC_NEEDS', title: '🧰 6. Farmer Needs' }
        ]
      };
    }

    if (language === 'bn') {
      const text =
        `🌾 *BharatFarm Sahayak*\n\n` +
        `আপনি কোন পরিষেবাটি নিতে চান?\n\n` +
        `1️⃣ Before You Sow / Price Risk\n` +
        `2️⃣ Climate Risk\n` +
        `3️⃣ Aggregation\n` +
        `4️⃣ Crop Insurance\n` +
        `5️⃣ Smart Mandi\n` +
        `6️⃣ Basic Farmer Needs`;

      return {
        text,
        interactiveType: 'list',
        listTitle: 'পরিষেবা নির্বাচন করুন',
        buttons: [
          { id: 'SRV_PRICE_RISK', title: '🌾 1. Price Risk' },
          { id: 'SRV_CLIMATE_RISK', title: '🌦️ 2. Climate Risk' },
          { id: 'SRV_AGGREGATION', title: '👥 3. Aggregation' },
          { id: 'SRV_CROP_INSURANCE', title: '🛡️ 4. Crop Insurance' },
          { id: 'SRV_SMART_MANDI', title: '📊 5. Smart Mandi' },
          { id: 'SRV_BASIC_NEEDS', title: '🧰 6. Farmer Needs' }
        ]
      };
    }

    const text =
      `🌾 *BharatFarm Sahayak*\n\n` +
      `Which service would you like to use?\n\n` +
      `1️⃣ Before You Sow / Price Risk\n` +
      `2️⃣ Climate Risk\n` +
      `3️⃣ Aggregation\n` +
      `4️⃣ Crop Insurance\n` +
      `5️⃣ Smart Mandi\n` +
      `6️⃣ Basic Farmer Needs`;

    return {
      text,
      interactiveType: 'list',
      listTitle: 'Select Service',
      buttons: [
        { id: 'SRV_PRICE_RISK', title: '🌾 1. Price Risk' },
        { id: 'SRV_CLIMATE_RISK', title: '🌦️ 2. Climate Risk' },
        { id: 'SRV_AGGREGATION', title: '👥 3. Aggregation' },
        { id: 'SRV_CROP_INSURANCE', title: '🛡️ 4. Crop Insurance' },
        { id: 'SRV_SMART_MANDI', title: '📊 5. Smart Mandi' },
        { id: 'SRV_BASIC_NEEDS', title: '🧰 6. Farmer Needs' }
      ]
    };
  }

  /**
   * 9. Standard Navigation Controls appended to every service
   */
  static buildNavControls(language: SupportedWhatsAppLanguage): MessageButtonOption[] {
    if (language === 'hi') {
      return [
        { id: 'NAV_MAIN_MENU', title: '🏠 Main Menu' },
        { id: 'NAV_BACK', title: '↩️ Back' },
        { id: 'NAV_END_SESSION', title: '❌ End Session' }
      ];
    }
    if (language === 'bn') {
      return [
        { id: 'NAV_MAIN_MENU', title: '🏠 Main Menu' },
        { id: 'NAV_BACK', title: '↩️ Back' },
        { id: 'NAV_END_SESSION', title: '❌ End Session' }
      ];
    }
    return [
      { id: 'NAV_MAIN_MENU', title: '🏠 Main Menu' },
      { id: 'NAV_BACK', title: '↩️ Back' },
      { id: 'NAV_END_SESSION', title: '❌ End Session' }
    ];
  }

  /**
   * 10. Service 1: Price Risk / Before You Sow Result
   */
  static buildPriceRiskResult(
    data: {
      crop: string;
      riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
      riskScore: number;
      confidence: number;
      expectedMarketPressure: string;
      reasons: string[];
      alternativeCrop?: string;
      alternativeReason?: string;
      isDemoData?: boolean;
    },
    language: SupportedWhatsAppLanguage
  ): FormattedStepMessage {
    const { crop, riskLevel, riskScore, confidence, expectedMarketPressure, reasons, alternativeCrop, isDemoData } = data;

    let body = '';
    if (language === 'hi') {
      body =
        `🌾 *BharatFarm Price Risk Analysis*\n\n` +
        `🌱 *फसल:* ${crop}\n` +
        `⚠️ *Risk:* ${riskLevel}\n` +
        `📊 *Risk Score:* ${riskScore}/100\n` +
        `🎯 *Confidence:* ${confidence}%\n` +
        `📈 *Expected Market Pressure:* ${expectedMarketPressure}\n\n` +
        `*Why? (कारण):*\n` +
        reasons.map(r => `• ${r}`).join('\n') + `\n\n` +
        (alternativeCrop ? `🧅 *Alternative (सुरक्षित विकल्प):*\n${alternativeCrop} — Lower market-risk profile\n\n` : '') +
        (isDemoData ? `_🧪 [SIH Demo Data — Deterministic Baseline]_\n\n` : '') +
        `────────────────────\n` +
        `What would you like to do next?`;
    } else if (language === 'bn') {
      body =
        `🌾 *BharatFarm Price Risk Analysis*\n\n` +
        `🌱 *ফসল:* ${crop}\n` +
        `⚠️ *ঝুঁকি (Risk):* ${riskLevel}\n` +
        `📊 *Risk Score:* ${riskScore}/100\n` +
        `🎯 *Confidence:* ${confidence}%\n` +
        `📈 *Expected Market Pressure:* ${expectedMarketPressure}\n\n` +
        `*কারণ:*\n` +
        reasons.map(r => `• ${r}`).join('\n') + `\n\n` +
        (alternativeCrop ? `🧅 *বিকল্প ফসল:*\n${alternativeCrop} — তুলনামূলক কম বাজার ঝুঁকি\n\n` : '') +
        (isDemoData ? `_🧪 [SIH Demo Data — Deterministic Baseline]_\n\n` : '') +
        `────────────────────\n` +
        `পরবর্তী পদক্ষেপ নির্বাচন করুন:`;
    } else {
      body =
        `🌾 *BharatFarm Price Risk Analysis*\n\n` +
        `🌱 *Crop:* ${crop}\n` +
        `⚠️ *Risk:* ${riskLevel}\n` +
        `📊 *Risk Score:* ${riskScore}/100\n` +
        `🎯 *Confidence:* ${confidence}%\n` +
        `📈 *Expected Market Pressure:* ${expectedMarketPressure}\n\n` +
        `*Why?*\n` +
        reasons.map(r => `• ${r}`).join('\n') + `\n\n` +
        (alternativeCrop ? `🧅 *Alternative:*\n${alternativeCrop} — Lower market-risk profile\n\n` : '') +
        (isDemoData ? `_🧪 [SIH Demo Data — Deterministic Baseline]_\n\n` : '') +
        `────────────────────\n` +
        `What would you like to do next?`;
    }

    return {
      text: body,
      interactiveType: 'button',
      buttons: this.buildNavControls(language)
    };
  }

  /**
   * 11. Service 2: Climate Risk Result
   */
  static buildClimateRiskResult(
    weather: WeatherData,
    assessment: ClimateAssessmentResult | undefined,
    location: string,
    language: SupportedWhatsAppLanguage
  ): FormattedStepMessage {
    const temp = Math.round(weather.temperatureCelsius);
    const rainProb = weather.rainfallProbability;
    const rainMm = weather.expectedRainfallMm;
    const condition = weather.condition;

    let body = '';
    if (language === 'hi') {
      body =
        `🌦️ *मौसम एवं फसल जोखिम अपडेट (Climate Risk)*\n\n` +
        `📍 *स्थान:* ${location}\n` +
        `🌡️ *तापमान:* ${temp}°C (${condition})\n` +
        `🌧️ *बारिश की संभावना:* ${rainProb}% (~${rainMm} mm)\n` +
        `💨 *हवा की गति:* ${Math.round(weather.windSpeedKmh)} km/h\n\n` +
        (assessment ? `⚠️ *Risk Level (जोखिम स्तर):* ${assessment.overallRiskLevel}\n🌾 *सलाह:* ${assessment.harvestAdvisory.headline}\n` : '') +
        `\n────────────────────\nआगे क्या करना चाहेंगे?`;
    } else if (language === 'bn') {
      body =
        `🌦️ *Climate Risk & Agricultural Advisory*\n\n` +
        `📍 *Location:* ${location}\n` +
        `🌡️ *Weather:* ${temp}°C (${condition})\n` +
        `🌧️ *Rainfall:* ${rainProb}% (~${rainMm} mm)\n` +
        `💨 *Wind:* ${Math.round(weather.windSpeedKmh)} km/h\n\n` +
        (assessment ? `⚠️ *ঝুঁকির মাত্রা:* ${assessment.overallRiskLevel}\n🌾 *পরামর্শ:* ${assessment.harvestAdvisory.headline}\n` : '') +
        `\n────────────────────\nপরবর্তী পদক্ষেপ নির্বাচন করুন:`;
    } else {
      body =
        `🌦️ *Climate Risk & Agricultural Advisory*\n\n` +
        `📍 *Location:* ${location}\n` +
        `🌡️ *Weather:* ${temp}°C (${condition})\n` +
        `🌧️ *Rainfall:* ${rainProb}% (~${rainMm} mm)\n` +
        `💨 *Wind:* ${Math.round(weather.windSpeedKmh)} km/h\n\n` +
        (assessment ? `⚠️ *Risk Level:* ${assessment.overallRiskLevel}\n🌾 *Advisory:* ${assessment.harvestAdvisory.headline}\n` : '') +
        `\n────────────────────\nWhat would you like to do next?`;
    }

    return {
      text: body,
      interactiveType: 'button',
      buttons: this.buildNavControls(language)
    };
  }

  /**
   * 12. Service 3: Aggregation Result
   */
  static buildAggregationResult(
    data: {
      crop: string;
      activePools: number;
      buyerName: string;
      offeredPricePerKg: number;
      transportSavingsPercent: number;
      clusterArea: string;
    },
    language: SupportedWhatsAppLanguage
  ): FormattedStepMessage {
    let body = '';
    if (language === 'hi') {
      body =
        `👥 *BharatFarm Supply Aggregation*\n\n` +
        `🌱 *फसल:* ${data.crop}\n` +
        `📍 *Cluster:* ${data.clusterArea}\n` +
        `🚚 *Transport Savings:* Up to ${data.transportSavingsPercent}% savings through collective farmer pooling\n` +
        `🏢 *Verified Buyer:* ${data.buyerName}\n` +
        `💰 *Offered Pool Price:* ₹${data.offeredPricePerKg}/kg\n` +
        `📦 *Active Pooling Groups:* ${data.activePools} active group(s)\n\n` +
        `_BharatFarm connects smallholders to consolidate loads and bypass intermediary transport costs._\n\n` +
        `────────────────────\n` +
        `What would you like to do next?`;
    } else if (language === 'bn') {
      body =
        `👥 *BharatFarm Supply Aggregation*\n\n` +
        `🌱 *ফসল:* ${data.crop}\n` +
        `📍 *ক্লাস্টার:* ${data.clusterArea}\n` +
        `🚚 *পরিবহন সাশ্রয়:* দলবদ্ধ বিক্রয়ের মাধ্যমে ৬০% পর্যন্ত পরিবহন খরচ সাশ্রয়\n` +
        `🏢 *ক্রেতা:* ${data.buyerName}\n` +
        `💰 *অফার মূল্য:* ₹${data.offeredPricePerKg}/কেজি\n\n` +
        `────────────────────\n` +
        `পরবর্তী পদক্ষেপ নির্বাচন করুন:`;
    } else {
      body =
        `👥 *BharatFarm Supply Aggregation*\n\n` +
        `🌱 *Crop:* ${data.crop}\n` +
        `📍 *Cluster:* ${data.clusterArea}\n` +
        `🚚 *Transport Savings:* Up to ${data.transportSavingsPercent}% cost reduction via collective pooling\n` +
        `🏢 *Verified Buyer:* ${data.buyerName}\n` +
        `💰 *Offered Pool Price:* ₹${data.offeredPricePerKg}/kg\n` +
        `📦 *Active Pooling Groups:* ${data.activePools} active group(s)\n\n` +
        `_Connects nearby smallholders to consolidate harvest shipments directly to institutional buyers._\n\n` +
        `────────────────────\n` +
        `What would you like to do next?`;
    }

    return {
      text: body,
      interactiveType: 'button',
      buttons: this.buildNavControls(language)
    };
  }

  /**
   * 13. Service 4: Crop Insurance Verification Result
   */
  static buildCropInsuranceResult(
    data: {
      farmerName: string;
      claimId: string;
      crop: string;
      lossPercentage: number;
      status: string;
      ndviScore: number;
      verificationMethod: string;
    },
    language: SupportedWhatsAppLanguage
  ): FormattedStepMessage {
    let body = '';
    if (language === 'hi') {
      body =
        `🛡️ *Crop Insurance Satellite Verification (PMFBY)*\n\n` +
        `👤 *किसान:* ${data.farmerName}\n` +
        `📄 *Claim ID:* ${data.claimId}\n` +
        `🌱 *फसल:* ${data.crop}\n` +
        `🛰️ *Satellite NDVI:* ${data.ndviScore} (Canopy Loss: ${data.lossPercentage}%)\n` +
        `🔍 *Verification Method:* ${data.verificationMethod}\n` +
        `📋 *Status:* ${data.status}\n\n` +
        `_सत्यापन उपग्रह चित्रों एवं मल्टी-स्पेक्ट्रल डेटा द्वारा पारदर्शी रूप से दर्ज किया गया है।_\n\n` +
        `────────────────────\n` +
        `What would you like to do next?`;
    } else if (language === 'bn') {
      body =
        `🛡️ *Crop Insurance Satellite Verification (PMFBY)*\n\n` +
        `👤 *কৃষক:* ${data.farmerName}\n` +
        `📄 *Claim ID:* ${data.claimId}\n` +
        `🌱 *ফসল:* ${data.crop}\n` +
        `🛰️ *Satellite NDVI:* ${data.ndviScore} (${data.lossPercentage}% ক্ষতি পরিমাপ)\n` +
        `📋 *Status:* ${data.status}\n\n` +
        `────────────────────\n` +
        `পরবর্তী পদক্ষেপ নির্বাচন করুন:`;
    } else {
      body =
        `🛡️ *Crop Insurance Satellite Verification (PMFBY)*\n\n` +
        `👤 *Farmer:* ${data.farmerName}\n` +
        `📄 *Claim ID:* ${data.claimId}\n` +
        `🌱 *Crop:* ${data.crop}\n` +
        `🛰️ *Satellite NDVI:* ${data.ndviScore} (${data.lossPercentage}% canopy loss detected)\n` +
        `🔍 *Evidence:* ${data.verificationMethod}\n` +
        `📋 *Current Status:* ${data.status}\n\n` +
        `_Tamper-proof satellite telemetry verification eliminates patwari delay for parametric settlements._\n\n` +
        `────────────────────\n` +
        `What would you like to do next?`;
    }

    return {
      text: body,
      interactiveType: 'button',
      buttons: this.buildNavControls(language)
    };
  }

  /**
   * 14. Service 5: Smart Mandi Result
   */
  static buildSmartMandiResult(
    data: {
      crop: string;
      mandis: Array<{ name: string; pricePerQtl: number; distanceKm: number; trend: string }>;
      recommendedRoute: string;
    },
    language: SupportedWhatsAppLanguage
  ): FormattedStepMessage {
    let body = '';
    const mandiLines = data.mandis.map((m, idx) => {
      const pricePerKg = (m.pricePerQtl / 100).toFixed(1);
      return `${idx + 1}. *${m.name}*\n   • Price: ₹${m.pricePerQtl}/q (₹${pricePerKg}/kg)\n   • Distance: ${m.distanceKm} km\n   • Trend: ${m.trend}`;
    }).join('\n\n');

    if (language === 'hi') {
      body =
        `📊 *स्मार्ट मंडी भाव (Smart Mandi Price & Routing)*\n\n` +
        `🌱 *फसल:* ${data.crop}\n\n` +
        `पास की मंडियों के भाव (Nearby Mandi Options):\n\n` +
        `${mandiLines}\n\n` +
        `💡 *Recommended Route:* ${data.recommendedRoute}\n\n` +
        `────────────────────\n` +
        `आगे क्या करना चाहेंगे?`;
    } else if (language === 'bn') {
      body =
        `📊 *Smart Mandi Price & Routing*\n\n` +
        `🌱 *ফসল:* ${data.crop}\n\n` +
        `কাছের মান্ডি সমূহের দর:\n\n` +
        `${mandiLines}\n\n` +
        `💡 *সুপারিশকৃত মান্ডি:* ${data.recommendedRoute}\n\n` +
        `────────────────────\n` +
        `পরবর্তী পদক্ষেপ নির্বাচন করুন:`;
    } else {
      body =
        `📊 *Smart Mandi Price & Routing*\n\n` +
        `🌱 *Crop:* ${data.crop}\n\n` +
        `Nearby mandi options:\n\n` +
        `${mandiLines}\n\n` +
        `💡 *Recommended Route:* ${data.recommendedRoute}\n\n` +
        `────────────────────\n` +
        `What would you like to do next?`;
    }

    return {
      text: body,
      interactiveType: 'button',
      buttons: this.buildNavControls(language)
    };
  }

  /**
   * 15. Service 6: Basic Farmer Needs Menu & Sub-services
   */
  static buildBasicNeedsMenu(language: SupportedWhatsAppLanguage): FormattedStepMessage {
    let body = '';
    if (language === 'hi') {
      body =
        `🧰 *Basic Farmer Needs Platform*\n\n` +
        `आप किस सुविधा की जानकारी लेना चाहते हैं?`;
    } else if (language === 'bn') {
      body =
        `🧰 *Basic Farmer Needs Platform*\n\n` +
        `আপনি কোন সুবিধার তথ্য চান?`;
    } else {
      body =
        `🧰 *Basic Farmer Needs Platform*\n\n` +
        `Which agricultural utility would you like to access?`;
    }

    return {
      text: body,
      interactiveType: 'list',
      listTitle: 'Farmer Utilities',
      buttons: [
        { id: 'BN_WEATHER', title: '🌦️ Weather' },
        { id: 'BN_LEAF_SCANNER', title: '🔬 Leaf Scanner' },
        { id: 'BN_SCHEMES', title: '🏛️ Govt Schemes' },
        { id: 'BN_ROADMAP', title: '🌱 Crop Roadmap' },
        { id: 'BN_CALCULATOR', title: '🧮 Farm Calculator' },
        { id: 'BN_MARKETPLACE', title: '🛒 Marketplace' }
      ]
    };
  }

  static buildBasicNeedsSubServiceResult(
    serviceKey: string,
    language: SupportedWhatsAppLanguage
  ): FormattedStepMessage {
    let text = '';
    switch (serviceKey) {
      case 'BN_LEAF_SCANNER':
        text = language === 'hi'
          ? `🔬 *Leaf Scanner (पत्ती रोग निदान)*\n\n` +
            `फसल में रोग, धब्बे या कीट का पता लगाने के लिए:\n` +
            `1. BharatFarm ऐप में Leaf Scanner खोलें अथवा\n` +
            `2. यहाँ सीधे प्रभावित पत्ती की साफ़ फोटो भेजें।\n\n` +
            `हमारा AI तुरंत रोग की पहचान कर जैविक व रासायनिक उपचार बताएगा।`
          : `🔬 *Leaf Scanner Pathology Service*\n\n` +
            `To diagnose crop diseases and pests:\n` +
            `1. Open Leaf Scanner in the BharatFarm portal, or\n` +
            `2. Simply send a clear leaf photo directly in this WhatsApp chat.\n\n` +
            `AI will diagnose fungal, bacterial, or pest infestations with exact treatment protocols.`;
        break;

      case 'BN_SCHEMES':
        text = language === 'hi'
          ? `🏛️ *Government Schemes & Subsidies*\n\n` +
            `• *PM-KISAN:* ₹6,000 प्रति वर्ष 3 किस्तों में सीधे बैंक खाते में।\n` +
            `• *PMFBY:* नाममात्र प्रीमियम पर प्राकृतिक आपदा फसल बीमा।\n` +
            `• *KCC Loan:* 4% रियायती ब्याज दर पर कृषि साख।\n\n` +
            `आवेदन के लिए CSC सेंटर या https://pmkisan.gov.in पर जाएं।`
          : `🏛️ *Active Government Schemes*\n\n` +
            `• *PM-KISAN Samman Nidhi:* ₹6,000/yr direct income transfer.\n` +
            `• *PM Fasal Bima Yojana:* Comprehensive natural calamity coverage.\n` +
            `• *Kisan Credit Card (KCC):* Subsidized 4% interest crop loans.\n\n` +
            `Apply through nearest CSC Center or verified state agriculture portals.`;
        break;

      case 'BN_ROADMAP':
        text = `🌱 *Crop Roadmap & Sowing Calendar*\n\n` +
          `Step-by-step guidance for Kharif & Rabi cycles:\n` +
          `• Seed treatment & bio-fertilizer inoculation\n` +
          `• Basal fertilizer scheduling (NPK + Zinc)\n` +
          `• Critical irrigation stages: Tillering, Panicle initiation & Grain filling.`;
        break;

      case 'BN_CALCULATOR':
        text = `🧮 *Farm Fertilizer & Seed Calculator*\n\n` +
          `Standard recommendation for 1 Acre Paddy:\n` +
          `• Urea: 85 kg (split into 3 stages)\n` +
          `• DAP: 50 kg (at sowing)\n` +
          `• MOP (Potash): 30 kg\n` +
          `Estimated input cost: ~₹3,200/acre.`;
        break;

      case 'BN_MARKETPLACE':
        text = `🛒 *Input Marketplace & Equipment Rental*\n\n` +
          `Connect with local FPOs and verified agro-dealers for:\n` +
          `• Certified high-yielding variety seeds\n` +
          `• Tractor & Harvester custom hiring centers nearby\n` +
          `• Zero middleman commission guarantee.`;
        break;

      case 'BN_WEATHER':
      default:
        text = `🌦️ *Weather & Agricultural Forecast*\n\n` +
          `Current conditions: Favorable for irrigation.\n` +
          `Rainfall likelihood for next 3 days is below 20%.\n` +
          `Ideal window for fertilizer top-dressing.`;
        break;
    }

    text += `\n\n────────────────────\nWhat would you like to do next?`;

    return {
      text,
      interactiveType: 'button',
      buttons: this.buildNavControls(language)
    };
  }

  /**
   * 16. End Session message
   */
  static buildEndSession(language: SupportedWhatsAppLanguage): string {
    if (language === 'hi') {
      return `धन्यवाद! BharatFarm Sahayak का उपयोग करने के लिए धन्यवाद। जब भी जरूरत हो, बस 'Hi' भेजें। 🌾`;
    }
    if (language === 'bn') {
      return `ধন্যবাদ! BharatFarm Sahayak ব্যবহার করার জন্য ধন্যবাদ। প্রয়োজনে যেকোনো সময় শুধু 'Hi' পাঠান। 🌾`;
    }
    return `Thank you for using BharatFarm Sahayak. Whenever you need help, simply send 'Hi'. 🌾`;
  }

  /**
   * Legacy formatting helpers for sahayakCore.service.ts
   */
  static formatHelpMessage(farmerName?: string, language: 'en' | 'hi' | 'bn' = 'en'): string {
    const greeting = farmerName ? ` ${farmerName}` : '';
    if (language === 'hi') {
      return `नमस्ते${greeting}! BharatFarm Sahayak में आपका स्वागत है। खेती, मौसम, मंडी भाव या फसल सुरक्षा के लिए 'Hi' भेजें।`;
    }
    if (language === 'bn') {
      return `নমস্কার${greeting}! BharatFarm Sahayak-এ স্বাগতম। কৃষি, আবহাওয়া, মান্ডি দর বা ফসল পরামর্শের জন্য 'Hi' পাঠান।`;
    }
    return `Hello${greeting}! Welcome to BharatFarm Sahayak. Send 'Hi' anytime to access agricultural services.`;
  }

  static formatClimateReport(
    weather: WeatherData,
    assessment?: ClimateAssessmentResult,
    language: 'en' | 'hi' | 'bn' = 'en'
  ): string {
    return this.buildClimateRiskResult(weather, assessment, weather.location || 'Your Region', language).text;
  }

  static formatSmartMandi(
    mandiData: {
      crop: string;
      nearestMandi: string;
      distanceKm: number;
      modalPricePerQtl: number;
      priceTrend?: 'STABLE' | 'INCREASING' | 'DECREASING';
      buyerDemandKg?: number;
      expectedPricePerKg?: number;
    },
    language: 'en' | 'hi' | 'bn' = 'en'
  ): string {
    return this.buildSmartMandiResult({
      crop: mandiData.crop,
      mandis: [{
        name: mandiData.nearestMandi,
        pricePerQtl: mandiData.modalPricePerQtl,
        distanceKm: mandiData.distanceKm,
        trend: mandiData.priceTrend || 'STABLE'
      }],
      recommendedRoute: `${mandiData.nearestMandi} (Distance: ${mandiData.distanceKm} km)`
    }, language).text;
  }

  static formatCropDiseaseReport(
    scan: {
      cropName: string;
      disease: string;
      confidence: number;
      severity: string;
      recommendations: string[];
      preventativeMeasures: string[];
    },
    language: 'en' | 'hi' | 'bn' = 'en'
  ): string {
    const conf = Math.round(scan.confidence * 100);
    if (language === 'hi') {
      let msg = `🔬 *पत्ती रोग निदान रिपोर्ट*\n\n`;
      msg += `🌱 *फसल:* ${scan.cropName}\n`;
      msg += `🦠 *पहचानी गई बीमारी:* ${scan.disease}\n`;
      msg += `📊 *सटीकता:* ${conf}%\n`;
      msg += `⚠️ *गंभीरता:* ${scan.severity.toUpperCase()}\n\n`;
      if (scan.recommendations.length > 0) {
        msg += `💊 *उपचार और दवा:*\n` + scan.recommendations.slice(0, 2).map(r => `• ${r}`).join('\n') + `\n\n`;
      }
      return msg.trim();
    }
    let msg = `🔬 *Crop Disease Diagnostic Report*\n\n`;
    msg += `🌱 *Crop:* ${scan.cropName}\n`;
    msg += `🦠 *Disease:* ${scan.disease}\n`;
    msg += `📊 *Confidence:* ${conf}%\n`;
    msg += `⚠️ *Severity:* ${scan.severity.toUpperCase()}\n\n`;
    if (scan.recommendations.length > 0) {
      msg += `💊 *Treatment:*\n` + scan.recommendations.slice(0, 2).map(r => `• ${r}`).join('\n') + `\n\n`;
    }
    return msg.trim();
  }

  static formatSchemeGuidance(
    schemeName: string,
    benefits: string,
    eligibility: string[],
    language: 'en' | 'hi' | 'bn' = 'en'
  ): string {
    return `🏛️ *${schemeName}*\n\n✨ *Benefits:* ${benefits}\n\n📋 *Eligibility:*\n${eligibility.map(e => `• ${e}`).join('\n')}`;
  }
}
