import { WeatherData } from '../../../services/climateRisk/weatherProvider.js';
import { ClimateAssessmentResult } from '../../../services/climateRisk/climateEngine.js';

export class ResponseFormatterService {
  /**
   * Format Climate Risk & Weather report for WhatsApp
   */
  static formatClimateReport(
    weather: WeatherData,
    assessment?: ClimateAssessmentResult,
    language: 'en' | 'hi' | 'bn' = 'en'
  ): string {
    const loc = weather.location || 'Your Region';
    const temp = Math.round(weather.temperatureCelsius);
    const rainProb = weather.rainfallProbability;
    const rainMm = weather.expectedRainfallMm;
    const condition = weather.condition;

    if (language === 'hi') {
      let msg = `🌦️ *मौसम एवं फसल जोखिम अपडेट*\n📍 *क्षेत्र:* ${loc}\n\n`;
      msg += `• *तापमान:* ${temp}°C (${condition})\n`;
      msg += `• *बारिश की संभावना:* ${rainProb}% (${rainMm} mm)\n`;
      msg += `• *हवा की गति:* ${Math.round(weather.windSpeedKmh)} km/h\n\n`;

      if (assessment) {
        msg += `⚠️ *जोखिम स्तर:* ${assessment.overallRiskLevel}\n`;
        msg += `🌾 *सिफारिश:* ${assessment.harvestAdvisory.headline}\n\n`;
        msg += `💡 *मुख्य सुझाव:*\n`;
        assessment.harvestAdvisory.actionSteps.slice(0, 2).forEach(step => {
          msg += `• ${step}\n`;
        });
      } else {
        msg += rainProb > 50
          ? `⚠️ आगामी 24 घंटे में बारिश का अनुमान है। कीटनाशक छिड़काव रोकें और जल निकासी साफ रखें।`
          : `✅ मौसम कृषि कार्यों एवं सिंचाई के लिए अनुकूल है।`;
      }
      return msg.trim();
    }

    if (language === 'bn') {
      let msg = `🌦️ *আবহাওয়া ও আবহাওয়াজনিত ঝুঁকি রিপোর্ট*\n📍 *এলাকা:* ${loc}\n\n`;
      msg += `• *তাপমাত্রা:* ${temp}°C (${condition})\n`;
      msg += `• *বৃষ্টিপাতের সম্ভাবনা:* ${rainProb}% (${rainMm} mm)\n`;
      msg += `• *বাতাসের গতি:* ${Math.round(weather.windSpeedKmh)} km/h\n\n`;

      if (assessment) {
        msg += `⚠️ *ঝুঁকির মাত্রা:* ${assessment.overallRiskLevel}\n`;
        msg += `🌾 *পরামর্শ:* ${assessment.harvestAdvisory.headline}\n\n`;
        msg += `💡 *জরুরী পদক্ষেপ:*\n`;
        assessment.harvestAdvisory.actionSteps.slice(0, 2).forEach(step => {
          msg += `• ${step}\n`;
        });
      } else {
        msg += rainProb > 50
          ? `⚠️ আগামী ২৪ ঘন্টায় বৃষ্টির সম্ভাবনা রয়েছে। স্প্রে প্রয়োগ স্থগিত রাখুন এবং নিষ্কাশন নালা পরিষ্কার করুন।`
          : `✅ আবহাওয়া স্বাভাবিক রয়েছে। নিয়মিত চাষের কাজ চালিয়ে যেতে পারেন।`;
      }
      return msg.trim();
    }

    // Default English
    let msg = `🌦️ *Weather & Climate Risk Update*\n📍 *Location:* ${loc}\n\n`;
    msg += `• *Temperature:* ${temp}°C (${condition})\n`;
    msg += `• *Rain Probability:* ${rainProb}% (~${rainMm} mm)\n`;
    msg += `• *Wind Speed:* ${Math.round(weather.windSpeedKmh)} km/h\n\n`;

    if (assessment) {
      msg += `⚠️ *Overall Risk:* ${assessment.overallRiskLevel}\n`;
      msg += `🌾 *Harvest Advisory:* ${assessment.harvestAdvisory.headline}\n\n`;
      msg += `💡 *Recommended Action Steps:*\n`;
      assessment.harvestAdvisory.actionSteps.slice(0, 2).forEach(step => {
        msg += `• ${step}\n`;
      });
    } else {
      msg += rainProb > 50
        ? `⚠️ Rain expected in the next 24 hours. Postpone chemical spraying and inspect field drainage.`
        : `✅ Conditions are favorable for normal field operations and irrigation.`;
    }

    return msg.trim();
  }

  /**
   * Format Smart Mandi & Price Intelligence for WhatsApp
   */
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
    const { crop, nearestMandi, distanceKm, modalPricePerQtl, priceTrend = 'STABLE', buyerDemandKg, expectedPricePerKg } = mandiData;
    const pricePerKg = (modalPricePerQtl / 100).toFixed(1);

    if (language === 'hi') {
      let msg = `🌾 *स्मार्ट मंडी मूल्य अपडेट*\n\n`;
      msg += `📍 *नजदीकी मंडी:* ${nearestMandi}\n`;
      msg += `📏 *दूरी:* ${distanceKm} km\n`;
      msg += `💰 *${crop} का भाव:* ₹${modalPricePerQtl.toLocaleString('en-IN')}/क्विंटल (₹${pricePerKg}/kg)\n`;
      msg += `📈 *भाव का रुझान:* ${priceTrend === 'INCREASING' ? 'तेज 🟢' : priceTrend === 'DECREASING' ? 'मंदा 🔴' : 'स्थिर 🟡'}\n`;

      if (buyerDemandKg && expectedPricePerKg) {
        msg += `\n🤝 *सक्रिय खरीदार मांग (Smart Pool):*\n`;
        msg += `• मांग: ${buyerDemandKg.toLocaleString('en-IN')} kg\n`;
        msg += `• प्रस्तावित मूल्य: ₹${expectedPricePerKg}/kg\n`;
      }

      msg += `\n_BharatFarm के साथ सीधे बेचें और 12-18% अधिक लाभ प्राप्त करें।_`;
      return msg.trim();
    }

    if (language === 'bn') {
      let msg = `🌾 *স্মার্ট মান্ডি দর আপডেট*\n\n`;
      msg += `📍 *নিকটবর্তী মান্ডি:* ${nearestMandi}\n`;
      msg += `📏 *দূরত্ব:* ${distanceKm} কিমি\n`;
      msg += `💰 *${crop}-এর দর:* ₹${modalPricePerQtl.toLocaleString('en-IN')}/কুইন্টাল (₹${pricePerKg}/কেজি)\n`;
      msg += `📈 *দর প্রবণতা:* ${priceTrend === 'INCREASING' ? 'বৃদ্ধি 🟢' : priceTrend === 'DECREASING' ? 'হ্রাস 🔴' : 'স্থিতিশীল 🟡'}\n`;

      if (buyerDemandKg && expectedPricePerKg) {
        msg += `\n🤝 *সক্রিয় ক্রেতা চাহিদা (Smart Pool):*\n`;
        msg += `• চাহিদা: ${buyerDemandKg.toLocaleString('en-IN')} কেজি\n`;
        msg += `• প্রত্যাশিত মূল্য: ₹${expectedPricePerKg}/কেজি\n`;
      }

      msg += `\n_BharatFarm-এর মাধ্যমে সরাসরি বিক্রি করে আরও বেশি লাভবান হন।_`;
      return msg.trim();
    }

    // Default English
    let msg = `🌾 *Smart Mandi Price Update*\n\n`;
    msg += `📍 *Nearest Mandi:* ${nearestMandi}\n`;
    msg += `📏 *Distance:* ${distanceKm} km\n`;
    msg += `💰 *Current ${crop} Price:* ₹${modalPricePerQtl.toLocaleString('en-IN')}/quintal (₹${pricePerKg}/kg)\n`;
    msg += `📈 *Market Trend:* ${priceTrend === 'INCREASING' ? 'Rising 🟢' : priceTrend === 'DECREASING' ? 'Falling 🔴' : 'Stable 🟡'}\n`;

    if (buyerDemandKg && expectedPricePerKg) {
      msg += `\n🤝 *Active Buyer Demand (Smart Aggregation Pool):*\n`;
      msg += `• Requirement: ${buyerDemandKg.toLocaleString('en-IN')} kg\n`;
      msg += `• Offered Price: ₹${expectedPricePerKg}/kg\n`;
    }

    msg += `\n_Direct aggregation on BharatFarm saves transport costs and delivers fair farmgate prices._`;
    return msg.trim();
  }

  /**
   * Format Crop Disease Scan diagnostic for WhatsApp
   */
  static formatCropDiseaseReport(
    scan: {
      disease: string;
      cropName: string;
      confidence: number;
      severity: string;
      recommendations: string[];
      preventativeMeasures: string[];
    },
    language: 'en' | 'hi' | 'bn' = 'en'
  ): string {
    const conf = Math.round(scan.confidence * 100);

    if (language === 'hi') {
      let msg = `🔬 *पत्ता रोग निदान (Leaf Health Report)*\n\n`;
      msg += `🌱 *फसल:* ${scan.cropName}\n`;
      msg += `🦠 *पहचानी गई बीमारी:* ${scan.disease}\n`;
      msg += `📊 *सटीकता:* ${conf}%\n`;
      msg += `⚠️ *गंभीरता:* ${scan.severity.toUpperCase()}\n\n`;

      if (scan.recommendations.length > 0) {
        msg += `💊 *उपचार और दवा:*\n`;
        scan.recommendations.slice(0, 3).forEach(r => {
          msg += `• ${r}\n`;
        });
        msg += `\n`;
      }

      if (scan.preventativeMeasures.length > 0) {
        msg += `🛡️ *रोकथाम उपाय:*\n`;
        scan.preventativeMeasures.slice(0, 2).forEach(p => {
          msg += `• ${p}\n`;
        });
      }

      msg += `\n_नोट: रासायनिक छिड़काव से पहले स्थानीय कृषि विशेषज्ञ से सलाह अवश्य लें।_`;
      return msg.trim();
    }

    if (language === 'bn') {
      let msg = `🔬 *পাতার রোগ নির্ণয় রিপোর্ট*\n\n`;
      msg += `🌱 *ফসল:* ${scan.cropName}\n`;
      msg += `🦠 *চিহ্নিত রোগ:* ${scan.disease}\n`;
      msg += `📊 *নির্ভুলতা:* ${conf}%\n`;
      msg += `⚠️ *ঝুঁকির স্তর:* ${scan.severity.toUpperCase()}\n\n`;

      if (scan.recommendations.length > 0) {
        msg += `💊 *প্রতিকার ও ঔষধ:*\n`;
        scan.recommendations.slice(0, 3).forEach(r => {
          msg += `• ${r}\n`;
        });
        msg += `\n`;
      }

      if (scan.preventativeMeasures.length > 0) {
        msg += `🛡️ *প্রতিরোধ ব্যবস্থা:*\n`;
        scan.preventativeMeasures.slice(0, 2).forEach(p => {
          msg += `• ${p}\n`;
        });
      }

      msg += `\n_পরামর্শ: কীটনাশক স্প্রে করার আগে স্থানীয় কৃষি কর্মকর্তার মতামত নিন।_`;
      return msg.trim();
    }

    // Default English
    let msg = `🔬 *Crop Disease Diagnostic Report*\n\n`;
    msg += `🌱 *Crop:* ${scan.cropName}\n`;
    msg += `🦠 *Detected Disease:* ${scan.disease}\n`;
    msg += `📊 *Confidence:* ${conf}%\n`;
    msg += `⚠️ *Severity:* ${scan.severity.toUpperCase()}\n\n`;

    if (scan.recommendations.length > 0) {
      msg += `💊 *Recommended Treatment:*\n`;
      scan.recommendations.slice(0, 3).forEach(r => {
        msg += `• ${r}\n`;
      });
      msg += `\n`;
    }

    if (scan.preventativeMeasures.length > 0) {
      msg += `🛡️ *Preventative Care:*\n`;
      scan.preventativeMeasures.slice(0, 2).forEach(p => {
        msg += `• ${p}\n`;
      });
    }

    msg += `\n_AI guidance is preliminary. Consult local KVK officer before major chemical applications._`;
    return msg.trim();
  }

  /**
   * Format Government Scheme guidance for WhatsApp
   */
  static formatSchemeGuidance(
    schemeName: string,
    benefits: string,
    eligibility: string[],
    language: 'en' | 'hi' | 'bn' = 'en'
  ): string {
    if (language === 'hi') {
      let msg = `🏛️ *सरकारी योजना विवरण: ${schemeName}*\n\n`;
      msg += `✨ *लाभ:* ${benefits}\n\n`;
      msg += `📋 *पात्रता एवं शर्तें:*\n`;
      eligibility.forEach(e => {
        msg += `• ${e}\n`;
      });
      msg += `\n🔗 _आवेदन के लिए अपने नजदीकी सीएससी (CSC) केंद्र या pmkisan.gov.in पर जाएं।_`;
      return msg;
    }

    if (language === 'bn') {
      let msg = `🏛️ *সরকারি প্রকল্প নির্দেশিকা: ${schemeName}*\n\n`;
      msg += `✨ *সুবিধা:* ${benefits}\n\n`;
      msg += `📋 *যোগ্যতা ও শর্তাবলী:*\n`;
      eligibility.forEach(e => {
        msg += `• ${e}\n`;
      });
      msg += `\n🔗 _আবেদনের জন্য নিকটস্থ সিএসসি সেন্টার বা pmkisan.gov.in পরিদর্শনে যান।_`;
      return msg;
    }

    let msg = `🏛️ *Government Scheme Guide: ${schemeName}*\n\n`;
    msg += `✨ *Benefits:* ${benefits}\n\n`;
    msg += `📋 *Eligibility Criteria:*\n`;
    eligibility.forEach(e => {
      msg += `• ${e}\n`;
    });
    msg += `\n🔗 _Apply at your nearest Common Service Centre (CSC) or official portal pmkisan.gov.in_`;
    return msg;
  }

  /**
   * General Help / Welcome Menu
   */
  static formatHelpMessage(farmerName?: string, language: 'en' | 'hi' | 'bn' = 'en'): string {
    const greeting = farmerName ? `Namaste, ${farmerName} ji! 🙏` : `Namaste! Welcome to BharatFarm Sahayak 🙏`;

    if (language === 'hi') {
      return `${greeting}\n\nमैं आपका डिजिटल कृषि सहायक (Sahayak) हूँ। आप मुझसे WhatsApp पर सीधे पूछ सकते हैं:\n\n` +
        `🌦️ *1. मौसम एवं बारिश:* "कल बारिश होगी क्या?"\n` +
        `🌾 *2. मंडी भाव:* "आज धान और आलू का मंडी भाव क्या है?"\n` +
        `🔬 *3. फसल बीमारी:* पत्ती की फोटो भेजें या लिखें "मेरी फसल में पीले दाग हैं"\n` +
        `🏛️ *4. सरकारी योजनाएं:* "PM Kisan योजना की जानकारी दो"\n` +
        `📍 *5. नजदीकी मंडी:* अपनी WhatsApp लोकेशन शेयर करें\n\n` +
        `आप बोलकर या लिखकर किसी भी भाषा में पूछ सकते हैं!`;
    }

    if (language === 'bn') {
      return `${greeting}\n\nআমি আপনার ডিজিটাল কৃষি সহায়ক (Sahayak)। আপনি সরাসরি WhatsApp-এ আমাকে জিজ্ঞাসা করতে পারেন:\n\n` +
        `🌦️ *১. আবহাওয়া:* "আগামীকাল বৃষ্টি হবে কি?"\n` +
        `🌾 *২. মান্ডি দর:* "আজকের ধানের মান্ডি দর কত?"\n` +
        `🔬 *৩. ফসলের রোগ:* পাতার ছবি পাঠান বা লিখুন "ফসলে পোকার আক্রমণ হয়েছে"\n` +
        `🏛️ *৪. সরকারি প্রকল্প:* "কৃষক বন্ধু বা পিএম কিষান প্রকল্প"\n` +
        `📍 *৫. নিকটবর্তী মান্ডি:* আপনার হোয়াটসঅ্যাপ লোকেশন শেয়ার করুন\n\n` +
        `বাংলা, হিন্দি বা ইংরেজিতে যে কোনো তথ্য জানতে বার্তা পাঠান!`;
    }

    return `${greeting}\n\nI am your BharatFarm agricultural AI companion. You can ask me directly here on WhatsApp:\n\n` +
      `🌦️ *1. Weather & Rain:* "Will it rain tomorrow?"\n` +
      `🌾 *2. Mandi Prices:* "What is today's Paddy rate in my local mandi?"\n` +
      `🔬 *3. Crop Diseases:* Send a photo of the affected leaf for instant diagnosis\n` +
      `🏛️ *4. Government Schemes:* "How to apply for PM Kisan?"\n` +
      `📍 *5. Nearby Intelligence:* Share your WhatsApp location pin\n\n` +
      `Feel free to message in Hindi, Bengali, or English!`;
  }
}
