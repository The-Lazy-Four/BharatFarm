import { Request, Response, NextFunction } from 'express';
import { fetchWeatherData } from '../services/climateRisk/weatherProvider.js';
import { fetchFloodRisk } from '../services/climateRisk/floodProvider.js';
import { ClimateEngine } from '../services/climateRisk/climateEngine.js';
import { AiClient } from '../utils/aiClient.js';

export const getForecast = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = (req.query.location as string) || 'Haldia, West Bengal';
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;

    const weather = await fetchWeatherData(location, lat, lon);
    res.json({ success: true, data: weather });
  } catch (error) {
    next(error);
  }
};

export const getFloodRisk = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = (req.query.location as string) || 'Haldia, West Bengal';
    const weather = await fetchWeatherData(location);
    const flood = await fetchFloodRisk(weather, location);
    res.json({ success: true, data: flood });
  } catch (error) {
    next(error);
  }
};

export const getAssessment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = (req.body.location as string) || (req.query.location as string) || 'Haldia, West Bengal';
    const crop = (req.body.crop as string) || 'Paddy';
    const cropStage = (req.body.cropStage as string) || 'Flowering';
    const lat = req.body.lat ? parseFloat(req.body.lat) : undefined;
    const lon = req.body.lon ? parseFloat(req.body.lon) : undefined;

    const weather = await fetchWeatherData(location, lat, lon);
    const flood = await fetchFloodRisk(weather, location);
    const assessment = ClimateEngine.analyze(weather, flood, crop, cropStage);

    res.json({
      success: true,
      data: {
        weather,
        flood,
        assessment
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getHarvestAdvisory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = (req.body.location as string) || 'Haldia, West Bengal';
    const crop = (req.body.crop as string) || 'Paddy';
    const cropStage = (req.body.cropStage as string) || 'Flowering';

    const weather = await fetchWeatherData(location);
    const flood = await fetchFloodRisk(weather, location);
    const assessment = ClimateEngine.analyze(weather, flood, crop, cropStage);

    res.json({
      success: true,
      data: {
        harvestAdvisory: assessment.harvestAdvisory,
        farmerActionPlan: assessment.farmerActionPlan,
        operationalAdvisories: assessment.operationalAdvisories
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const historyLogs = [
      { id: 'h-1', date: '08 Sep 2026', location: 'Haldia, West Bengal', crop: 'Paddy', climateRisk: 'HIGH', floodRisk: 'SEVERE', recommendation: 'Consider early harvest of mature crop' },
      { id: 'h-2', date: '05 Sep 2026', location: 'Haldia, West Bengal', crop: 'Paddy', climateRisk: 'LOW', floodRisk: 'MODERATE', recommendation: 'Normal harvest operations permitted' },
      { id: 'h-3', date: '01 Sep 2026', location: 'Ludhiana, Punjab', crop: 'Wheat', climateRisk: 'LOW', floodRisk: 'LOW', recommendation: 'Standard irrigation & field management' },
      { id: 'h-4', date: '25 Aug 2026', location: 'Murshidabad, WB', crop: 'Jute', climateRisk: 'HIGH', floodRisk: 'HIGH', recommendation: 'Clear field drainage channels immediately' }
    ];

    res.json({ success: true, data: historyLogs });
  } catch (error) {
    next(error);
  }
};

export const geocodeLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = (req.query.q as string || '').trim();
    if (!query || query.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.json({ success: true, data: [] });
    }

    const result = await response.json();
    const locations = (result.results || []).map((item: any) => ({
      name: item.name,
      admin1: item.admin1 || '',
      country: item.country || 'India',
      displayName: `${item.name}${item.admin1 ? ', ' + item.admin1 : ''}${item.country ? ', ' + item.country : ''}`,
      latitude: Number(item.latitude.toFixed(4)),
      longitude: Number(item.longitude.toFixed(4))
    }));

    res.json({ success: true, data: locations });
  } catch (error) {
    next(error);
  }
};

export const getAiInsight = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      location = 'Haldia, West Bengal',
      crop = 'Paddy',
      cropStage = 'Flowering',
      overallRiskScore = 60,
      floodScore = 50,
      cropRiskScore = 50,
      harvestCode = 'MONITOR',
      rainfallMm = 20,
      mainThreat = 'Rain'
    } = req.body;

    const fallbackInsight = {
      headline: overallRiskScore >= 70
        ? `${mainThreat || 'Heavy rainfall'} is the dominant near-term agricultural risk.`
        : `Weather conditions remain manageable for ${crop} at ${cropStage} stage.`,
      severity: overallRiskScore >= 70 ? 'SEVERE' : overallRiskScore >= 45 ? 'MODERATE' : 'LOW',
      actions: overallRiskScore >= 70
        ? ['Protect field drainage channels immediately', 'Avoid spray/fertilizer applications before rainfall', 'Inspect low-lying plots & prepare harvest gear']
        : ['Continue regular crop monitoring', 'Maintain optimal irrigation schedules', 'Ensure field drainage exits are cleared'],
      timing: 'Next 24–48 hours',
      source: 'RULE_BASED'
    };

    if (!AiClient.isConfigured()) {
      return res.json({ success: true, data: fallbackInsight });
    }

    const prompt = `You are the BharatFarm Agricultural Climate Intelligence Engine.
Context:
- Location: ${location}
- Crop: ${crop} (Stage: ${cropStage})
- Overall Climate Risk: ${overallRiskScore}/100
- Flood Assessment: ${floodScore}/100
- Crop Risk: ${cropRiskScore}/100
- Harvest Recommendation: ${harvestCode}
- 48h Rain: ${rainfallMm} mm
- Dominant Threat: ${mainThreat}

Instructions:
1. Provide a crisp, 1-sentence decision-first headline for the farmer/evaluator.
2. Provide EXACTLY 3 highest-priority, actionable field steps (max 8 words each).
3. Specify a concise timeframe (e.g. "Next 24–48h").
4. Return pure JSON matching this schema:
{
  "headline": "string",
  "severity": "LOW" | "MODERATE" | "HIGH" | "SEVERE",
  "actions": ["string", "string", "string"],
  "timing": "string"
}`;

    try {
      const aiResponse = await AiClient.chat([
        { role: 'system', content: 'You are an agricultural risk assessment AI. Respond with valid JSON only.' },
        { role: 'user', content: prompt }
      ], {
        maxTokens: 300,
        responseFormat: 'json_object',
        timeoutMs: 12000
      });

      const parsed = JSON.parse(aiResponse);
      const cleanedActions = Array.isArray(parsed.actions) ? parsed.actions.slice(0, 3) : fallbackInsight.actions;

      res.json({
        success: true,
        data: {
          headline: parsed.headline || fallbackInsight.headline,
          severity: parsed.severity || fallbackInsight.severity,
          actions: cleanedActions,
          timing: parsed.timing || fallbackInsight.timing,
          source: 'OPENROUTER_AI'
        }
      });
    } catch (aiErr) {
      res.json({ success: true, data: fallbackInsight });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Live Gemini-Powered Farm Decision Engine
 * Converts raw weather + rainfall + flood risk + crop + stage + completed actions into an actionable, ultra-compact farmer plan in English, Bengali, or Hindi.
 */
export const getGeminiDecision = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const location = (req.body.location as string) || 'Haldia, West Bengal';
    const crop = (req.body.crop as string) || 'Paddy';
    const cropStage = (req.body.cropStage as string) || 'Flowering';
    const language = ((req.body.language as string) || 'en').toLowerCase(); // 'en' | 'bn' | 'hi'
    const lat = req.body.lat ? parseFloat(req.body.lat) : undefined;
    const lon = req.body.lon ? parseFloat(req.body.lon) : undefined;
    const completedActions: string[] = Array.isArray(req.body.completedActions) ? req.body.completedActions : [];

    // 1. Fetch real-time weather & flood telemetry
    const weather = await fetchWeatherData(location, lat, lon);
    const flood = await fetchFloodRisk(weather, location);
    const assessment = ClimateEngine.analyze(weather, flood, crop, cropStage);

    const rainProb = weather.rainfallProbability || 0;
    const rainMm = assessment.rainfallAnalysis.total7DayMm || 0;
    const peakMm = assessment.rainfallAnalysis.maxExpectedMm || 0;
    const floodScore = flood.floodScore || 0;
    const riskLevel = flood.riskLevel === 'SEVERE' || assessment.overallRiskLevel === 'SEVERE'
      ? 'SEVERE'
      : flood.riskLevel === 'HIGH' || assessment.overallRiskLevel === 'HIGH'
      ? 'HIGH'
      : assessment.overallRiskLevel === 'MODERATE'
      ? 'MODERATE'
      : 'LOW';

    // 2. Multilingual smart fallback generator
    const generateSmartFallbackPlan = () => {
      const isRainy = riskLevel === 'SEVERE' || riskLevel === 'HIGH' || rainProb > 60 || peakMm > 25;
      const isMaturity = cropStage.toLowerCase().includes('maturity') || cropStage.toLowerCase().includes('ready') || cropStage.toLowerCase().includes('harvest');
      const isFlowering = cropStage.toLowerCase().includes('flowering');
      const isSowing = cropStage.toLowerCase().includes('sowing') || cropStage.toLowerCase().includes('seedling');
      const isPotato = crop.toLowerCase().includes('potato');

      if (language === 'bn') {
        // ── BENGALI (বাংলা) ──
        if (isRainy) {
          const actions: any[] = [];
          if (!completedActions.includes('act-1') && !completedActions.includes('drainage')) {
            actions.push({
              id: 'act-1',
              priority: 'HIGH',
              title: isPotato ? 'নালা ও খাল পরিষ্কার করুন' : 'নালা পরিষ্কার করুন',
              description: 'বৃষ্টির আগে নালা পরিষ্কার করুন।',
              timing: 'আজকের মধ্যে',
              icon: 'drainage'
            });
          }
          if (isMaturity) {
            actions.push({
              id: 'act-2',
              priority: 'HIGH',
              title: 'পাকা ফসল তুলুন',
              description: 'বৃষ্টির আগে পাকা ফসল কেটে নিন।',
              timing: '১–২ দিনের মধ্যে',
              icon: 'harvest'
            });
            actions.push({
              id: 'act-3',
              priority: 'IMPORTANT',
              title: 'ফসল নিরাপদ স্থানে রাখুন',
              description: 'ফসল শুকনো ও উঁচু জায়গায় রাখুন।',
              timing: 'বৃষ্টির আগে',
              icon: 'protect'
            });
          } else {
            actions.push({
              id: 'act-2',
              priority: 'IMPORTANT',
              title: isFlowering ? 'স্প্রে বন্ধ রাখুন' : 'সার প্রয়োগ বন্ধ রাখুন',
              description: 'ভারী বৃষ্টির আগে স্প্রে বা সার দেবেন না।',
              timing: 'বৃষ্টির আগে',
              icon: 'spray'
            });
            actions.push({
              id: 'act-3',
              priority: 'IMPORTANT',
              title: 'প্রয়োজনীয় জিনিস কিনুন',
              description: 'সার ও কীটনাশক আগে কিনুন।',
              timing: 'বৃষ্টির আগে',
              icon: 'cart'
            });
          }
          if (actions.length < 4) {
            actions.push({
              id: 'act-4',
              priority: 'NORMAL',
              title: 'নিচু জমি ও আল দেখুন',
              description: 'নিচু জমি ও দুর্বল আল পরীক্ষা করুন।',
              timing: 'আজকের মধ্যে',
              icon: 'tools'
            });
          }

          return {
            riskLevel: 'HIGH' as const,
            riskTitle: 'ভারী বৃষ্টির সম্ভাবনা',
            riskTimeline: 'পরবর্তী ৩–৫ দিন',
            riskSummary: 'ভারী বৃষ্টির সম্ভাবনা। জমিতে জল জমতে পারে।',
            aiExplanation: isMaturity
              ? `${crop} কাটার সময় হয়েছে। বৃষ্টির আগে পাকা ফসল কেটে নিরাপদ স্থানে রাখুন।`
              : `${cropStage} অবস্থায় ${crop} গাছে জল জমলে ক্ষতি হবে। নিকাশি ব্যবস্থা ঠিক রাখুন।`,
            whyReasoningSummary: `আপনার ${crop} ফসলের ${cropStage} অবস্থায় ভারী বৃষ্টি হতে পারে বলে এই ব্যবস্থাগুলি জরুরি।`,
            decisionFactors: [
              `পরবর্তী ৩–৫ দিনে ভারী বৃষ্টি (${peakMm} মিমি)`,
              `${crop} ফসল বর্তমানে ${cropStage} অবস্থায় আছে`,
              `নিচু জমিতে জল জমার ঝুঁকি বেশি`
            ],
            actions,
            buyItems: isMaturity ? [
              { name: 'তিরপল ও ত্রিপল কভার', reason: 'তোলা ফসল ভিজে নষ্ট হওয়া থেকে বাঁচান', urgency: 'HIGH', category: 'tools' },
              { name: 'শুকনো বস্তা', reason: 'আর্দ্রতার হাত থেকে শস্য রক্ষা করুন', urgency: 'NORMAL', category: 'tools' }
            ] : [
              { name: 'ছত্রাকনাশক স্প্রে', reason: 'বৃষ্টির পরে ব্লাইট রোগ প্রতিরোধে', urgency: 'HIGH', category: 'pesticides' },
              { name: 'জরুরি সার স্টক (ইউরিয়া/ডিএপি)', reason: 'রাস্তা বন্ধের আগেই সংগ্রহ করুন', urgency: 'HIGH', category: 'fertilizer' },
              { name: 'কোদাল ও নিকাশি সরঞ্জাম', reason: 'নালা পরিষ্কার রাখার জন্য', urgency: 'NORMAL', category: 'tools' }
            ],
            whyBuyNow: 'ভারী বৃষ্টিতে রাস্তা বন্ধ হতে পারে। আগে প্রয়োজনীয় জিনিস কিনে রাখা ভালো।',
            warning: {
              show: true,
              title: 'সতর্কবার্তা',
              headline: 'ভারী বৃষ্টিতে রাস্তা চলাচল কঠিন হতে পারে।',
              subtext: 'প্রয়োজনীয় কৃষি সরঞ্জাম ও সার আগে কিনে নিন।'
            },
            updatedAt: new Date().toISOString(),
            source: 'RULE_BASED' as const
          };
        } else {
          // Stable Bengali
          const actions: any[] = [];
          if (isSowing) {
            actions.push({
              id: 'act-1',
              priority: 'IMPORTANT',
              title: `${crop} বীজতলা তৈরি করুন`,
              description: 'বীজ বোনার জন্য আবহাওয়া অনুকূল।',
              timing: 'এই সপ্তাহে',
              icon: 'seed'
            });
            actions.push({
              id: 'act-2',
              priority: 'NORMAL',
              title: 'উন্নত বীজ ও সার সংগ্রহ করুন',
              description: 'বীজ শোধন করে বপন করুন।',
              timing: '২–৩ দিনের মধ্যে',
              icon: 'cart'
            });
          } else if (isMaturity) {
            actions.push({
              id: 'act-1',
              priority: 'HIGH',
              title: `${crop} ফসল কাটার সময় নির্ধারণ করুন`,
              description: 'রৌদ্রোজ্জ্বল আবহাওয়া ফসল কাটার উপযুক্ত।',
              timing: '১–৩ দিনের মধ্যে',
              icon: 'harvest'
            });
            actions.push({
              id: 'act-2',
              priority: 'NORMAL',
              title: 'শুকনো গুদাম প্রস্তুত রাখুন',
              description: 'ফসল শুকিয়ে নিরাপদে সংরক্ষণ করুন।',
              timing: 'ফসল কাটার আগে',
              icon: 'protect'
            });
          } else {
            actions.push({
              id: 'act-1',
              priority: 'NORMAL',
              title: 'নিয়মিত সেচ দিন',
              description: `${crop} ফসলে পরিমিত জল সরবরাহ বজায় রাখুন।`,
              timing: 'নিয়মমাফিক',
              icon: 'monitor'
            });
            actions.push({
              id: 'act-2',
              priority: 'NORMAL',
              title: 'কীটপতঙ্গ পরীক্ষা করুন',
              description: 'পাতার তলায় পোকার আক্রমণ লক্ষ্য করুন।',
              timing: '২ দিনের মধ্যে',
              icon: 'spray'
            });
            actions.push({
              id: 'act-3',
              priority: 'NORMAL',
              title: 'পুষ্টি উপাদান প্রয়োগ করুন',
              description: 'ফসলের বৃদ্ধিতে প্রয়োজনীয় অনুখাদ্য দিন।',
              timing: 'এই সপ্তাহে',
              icon: 'fertilizer'
            });
          }

          return {
            riskLevel: 'LOW' as const,
            riskTitle: 'স্বাভাবিক আবহাওয়া',
            riskTimeline: 'পরবর্তী ৫–৭ দিন',
            riskSummary: 'আবহাওয়া স্থিতিশীল। নিয়মিত চাষের কাজ চালিয়ে যান।',
            aiExplanation: `${cropStage} অবস্থায় ${crop} ফসলের জন্য আবহাওয়া অনুকূল। নিয়মিত পরিচর্যা করুন।`,
            whyReasoningSummary: `আবহাওয়া স্বাভাবিক থাকায় নিয়মিত কৃষি কাজের পরামর্শ দেওয়া হয়েছে।`,
            decisionFactors: [
              `বৃষ্টির সম্ভাবনা কম (১৫%)`,
              `${crop} ফসল ${cropStage} অবস্থায় আছে`,
              `বন্যা বা ঝড়ের ঝুঁকি নেই`
            ],
            actions,
            buyItems: isSowing ? [
              { name: `উন্নত ${crop} বীজ`, reason: 'ভালো ফলনের জন্য প্রত্যয়িত বীজ', urgency: 'NORMAL', category: 'seeds' },
              { name: 'জৈব সার ও ট্রাইকোডার্মা', reason: 'মাটি তৈরি ও বীজ শোধনে', urgency: 'NORMAL', category: 'fertilizer' }
            ] : [],
            whyBuyNow: 'স্বাভাবিক আবহাওয়ায় বাজারে সঠিক দামে পণ্য পাওয়া যায়।',
            warning: { show: false, title: '', headline: '', subtext: '' },
            updatedAt: new Date().toISOString(),
            source: 'RULE_BASED' as const
          };
        }
      } else if (language === 'hi') {
        // ── HINDI (हिन्दी) ──
        if (isRainy) {
          const actions: any[] = [];
          if (!completedActions.includes('act-1') && !completedActions.includes('drainage')) {
            actions.push({
              id: 'act-1',
              priority: 'HIGH',
              title: isPotato ? 'नालियां व मेड़ साफ करें' : 'नालियां साफ करें',
              description: 'बारिश से पहले नालियां साफ करें।',
              timing: 'आज ही',
              icon: 'drainage'
            });
          }
          if (isMaturity) {
            actions.push({
              id: 'act-2',
              priority: 'HIGH',
              title: 'पकी फसल काटें',
              description: 'बारिश से पहले पकी फसल निकाल लें।',
              timing: '१–२ दिन में',
              icon: 'harvest'
            });
            actions.push({
              id: 'act-3',
              priority: 'IMPORTANT',
              title: 'फसल सुरक्षित जगह रखें',
              description: 'उपज को सूखे और ऊंचे स्थान पर रखें।',
              timing: 'बारिश से पहले',
              icon: 'protect'
            });
          } else {
            actions.push({
              id: 'act-2',
              priority: 'IMPORTANT',
              title: isFlowering ? 'स्प्रे रोकें' : 'खाद डालना रोकें',
              description: 'भारी बारिश से पहले स्प्रे न करें।',
              timing: 'बारिश से पहले',
              icon: 'spray'
            });
            actions.push({
              id: 'act-3',
              priority: 'IMPORTANT',
              title: 'जरूरी सामान खरीदें',
              description: 'खाद और दवा पहले खरीदें।',
              timing: 'बारिश से पहले',
              icon: 'cart'
            });
          }
          if (actions.length < 4) {
            actions.push({
              id: 'act-4',
              priority: 'NORMAL',
              title: 'नीचे वाले खेत देखें',
              description: 'निचले खेतों और मेड़ों की जांच करें।',
              timing: 'आज ही',
              icon: 'tools'
            });
          }

          return {
            riskLevel: 'HIGH' as const,
            riskTitle: 'भारी बारिश की संभावना',
            riskTimeline: 'अगले ३–५ दिन',
            riskSummary: 'भारी बारिश की संभावना है। खेतों में पानी भर सकता है।',
            aiExplanation: isMaturity
              ? `${crop} फसल कटाई के करीब है। बारिश से पहले पकी फसल को सुरक्षित स्थान पर ले जाएं।`
              : `${cropStage} अवस्था में जलजमाव से ${crop} को नुकसान हो सकता है। जल निकासी दुरुस्त रखें।`,
            whyReasoningSummary: `आपकी ${crop} फसल की ${cropStage} अवस्था में बारिश के खतरे को देखते हुए ये सुझाव दिए गए हैं।`,
            decisionFactors: [
              `अगले ३–५ दिनों में तेज बारिश (${peakMm} मिमी)`,
              `${crop} फसल अभी ${cropStage} अवस्था में है`,
              `खेत में जलभराव का खतरा अधिक है`
            ],
            actions,
            buyItems: isMaturity ? [
              { name: 'तिरपाल व वाटरप्रूफ कवर', reason: 'कटी फसल को भीगने से बचाएं', urgency: 'HIGH', category: 'tools' },
              { name: 'सूखी बोरियां', reason: 'नमी से अनाज को सुरक्षित रखें', urgency: 'NORMAL', category: 'tools' }
            ] : [
              { name: 'फफूंदनाशक दवा', reason: 'बारिश के बाद फफूंद रोग रोकने के लिए', urgency: 'HIGH', category: 'pesticides' },
              { name: 'उर्वरक स्टॉक (यूरिया/डीएपी)', reason: 'रास्ते बंद होने से पहले मंगाएं', urgency: 'HIGH', category: 'fertilizer' },
              { name: 'फावड़ा व निकासी औजार', reason: 'नालियां खुली रखने के लिए', urgency: 'NORMAL', category: 'tools' }
            ],
            whyBuyNow: 'भारी बारिश से रास्ते खराब हो सकते हैं। जरूरी कृषि इनपुट पहले से खरीद लें।',
            warning: {
              show: true,
              title: 'चेतावनी',
              headline: 'सड़क पर आवाजाही कठिन हो सकती है।',
              subtext: 'पहले ही जरूरी खाद व बीज का इंतजाम कर लें।'
            },
            updatedAt: new Date().toISOString(),
            source: 'RULE_BASED' as const
          };
        } else {
          // Stable Hindi
          const actions: any[] = [];
          if (isSowing) {
            actions.push({
              id: 'act-1',
              priority: 'IMPORTANT',
              title: `${crop} की बुवाई तैयारी करें`,
              description: 'बीज बोने के लिए मौसम अनुकूल है।',
              timing: 'इस हफ्ते',
              icon: 'seed'
            });
            actions.push({
              id: 'act-2',
              priority: 'NORMAL',
              title: 'प्रमाणित बीज खरीदें',
              description: 'बीज उपचार करके बुवाई करें।',
              timing: '२–३ दिन में',
              icon: 'cart'
            });
          } else if (isMaturity) {
            actions.push({
              id: 'act-1',
              priority: 'HIGH',
              title: `${crop} कटाई की योजना बनाएं`,
              description: 'धूप वाला मौसम कटाई के लिए उत्तम है।',
              timing: '१–३ दिन में',
              icon: 'harvest'
            });
            actions.push({
              id: 'act-2',
              priority: 'NORMAL',
              title: 'साफ भंडार तैयार रखें',
              description: 'अनाज सुखाकर सुरक्षित रखें।',
              timing: 'कटाई से पहले',
              icon: 'protect'
            });
          } else {
            actions.push({
              id: 'act-1',
              priority: 'NORMAL',
              title: 'नियमित सिंचाई करें',
              description: `${crop} फसल में जरूरत अनुसार नमी बनाए रखें।`,
              timing: 'समय अनुसार',
              icon: 'monitor'
            });
            actions.push({
              id: 'act-2',
              priority: 'NORMAL',
              title: 'कीट व रोगों की जांच करें',
              description: 'पत्तियों पर कीटों के प्रकोप पर नजर रखें।',
              timing: '२ दिन में',
              icon: 'spray'
            });
            actions.push({
              id: 'act-3',
              priority: 'NORMAL',
              title: 'पोषक तत्व स्प्रे करें',
              description: 'फसल बढ़वार के लिए सूक्ष्म पोषक तत्व दें।',
              timing: 'इस हफ्ते',
              icon: 'fertilizer'
            });
          }

          return {
            riskLevel: 'LOW' as const,
            riskTitle: 'सामान्य मौसम',
            riskTimeline: 'अगले ५–७ दिन',
            riskSummary: 'मौसम साफ है। नियमित खेती कार्य जारी रखें।',
            aiExplanation: `${cropStage} अवस्था में ${crop} के लिए मौसम अनुकूल है। नियमित देखभाल करें।`,
            whyReasoningSummary: `मौसम स्थिर रहने के कारण सामान्य कार्य जारी रखने का सुझाव है।`,
            decisionFactors: [
              `बारिश की संभावना कम (१५%)`,
              `${crop} फसल ${cropStage} अवस्था में है`,
              `बाढ़ का कोई खतरा नहीं`
            ],
            actions,
            buyItems: isSowing ? [
              { name: `प्रमाणित ${crop} बीज`, reason: 'अच्छी पैदावार के लिए शोधित बीज', urgency: 'NORMAL', category: 'seeds' },
              { name: 'बेसल खाद व ट्राइकोडर्मा', reason: 'खेत की तैयारी के लिए', urgency: 'NORMAL', category: 'fertilizer' }
            ] : [],
            whyBuyNow: 'सामान्य मौसम में बाजार में इनपुट सही दामों पर उपलब्ध रहते हैं।',
            warning: { show: false, title: '', headline: '', subtext: '' },
            updatedAt: new Date().toISOString(),
            source: 'RULE_BASED' as const
          };
        }
      }

      // ── DEFAULT: ENGLISH ──
      if (isRainy) {
        const actions: any[] = [];
        if (!completedActions.includes('act-1') && !completedActions.includes('drainage')) {
          actions.push({
            id: 'act-1',
            priority: 'HIGH',
            title: isPotato ? 'Clear furrows & drains' : 'Clear blocked drains',
            description: 'Clear drains before rain.',
            timing: 'Today',
            icon: 'drainage'
          });
        }
        if (isMaturity) {
          actions.push({
            id: 'act-2',
            priority: 'HIGH',
            title: 'Harvest ready crops',
            description: 'Harvest mature crop early.',
            timing: 'Next 1–2 days',
            icon: 'harvest'
          });
          actions.push({
            id: 'act-3',
            priority: 'IMPORTANT',
            title: 'Protect harvested crops',
            description: 'Move harvest to dry storage.',
            timing: 'Before rain',
            icon: 'protect'
          });
        } else {
          actions.push({
            id: 'act-2',
            priority: 'IMPORTANT',
            title: isFlowering ? 'Stop spraying' : 'Avoid applying fertilizer',
            description: 'Stop spraying before heavy rain.',
            timing: 'Before rain',
            icon: 'spray'
          });
          actions.push({
            id: 'act-3',
            priority: 'IMPORTANT',
            title: 'Buy needed inputs',
            description: 'Buy needed inputs before rain.',
            timing: 'Before rain',
            icon: 'cart'
          });
        }
        if (actions.length < 4) {
          actions.push({
            id: 'act-4',
            priority: 'NORMAL',
            title: 'Check low fields',
            description: 'Check weak bunds and low fields.',
            timing: 'Today',
            icon: 'tools'
          });
        }

        return {
          riskLevel: 'HIGH' as const,
          riskTitle: 'Heavy Rain Likely',
          riskTimeline: 'Next 3–5 days',
          riskSummary: 'High chance of heavy rainfall. Fields may get waterlogged.',
          aiExplanation: isMaturity
            ? `${crop} is near harvest. Harvest mature sections early and store safely.`
            : `${crop} at ${cropStage.toLowerCase()} stage is vulnerable to waterlogging. Keep drains clear.`,
          whyReasoningSummary: `Gemini recommends these actions because heavy rainfall is expected during the ${cropStage.toLowerCase()} stage of your ${crop} crop.`,
          decisionFactors: [
            `Heavy rain expected in next 3–5 days (${peakMm} mm peak)`,
            `${crop} is at the ${cropStage} stage`,
            `High waterlogging risk in low-lying plots`
          ],
          actions,
          buyItems: isMaturity ? [
            { name: 'Waterproof Tarpaulins', reason: 'Protect harvested grain from rain', urgency: 'HIGH', category: 'tools' },
            { name: 'Storage Bags', reason: 'Keep produce dry in humidity', urgency: 'NORMAL', category: 'tools' }
          ] : [
            { name: 'Bio-Fungicide Spray', reason: 'Prevent fungal blast after rain', urgency: 'HIGH', category: 'pesticides' },
            { name: 'Fertilizer Stock', reason: 'Buy before roads get blocked', urgency: 'HIGH', category: 'fertilizer' },
            { name: 'Drainage Tools', reason: 'Useful for channel clearing', urgency: 'NORMAL', category: 'tools' }
          ],
          whyBuyNow: 'Heavy rain may make roads difficult. Buying essential inputs before rainfall reduces delays.',
          warning: {
            show: true,
            title: 'WARNING',
            headline: 'Heavy rain may block roads.',
            subtext: 'Buy important inputs early.'
          },
          updatedAt: new Date().toISOString(),
          source: 'RULE_BASED' as const
        };
      } else {
        const actions: any[] = [];
        if (isSowing) {
          actions.push({
            id: 'act-1',
            priority: 'IMPORTANT',
            title: `Prepare ${crop} seedbed`,
            description: 'Conditions are good for seed sowing.',
            timing: 'This week',
            icon: 'seed'
          });
          actions.push({
            id: 'act-2',
            priority: 'NORMAL',
            title: 'Procure certified seed',
            description: 'Treat seed before sowing.',
            timing: 'Next 2–3 days',
            icon: 'cart'
          });
        } else if (isMaturity) {
          actions.push({
            id: 'act-1',
            priority: 'HIGH',
            title: `Schedule ${crop} harvest`,
            description: 'Sunny weather is ideal for harvest.',
            timing: 'Next 1–3 days',
            icon: 'harvest'
          });
          actions.push({
            id: 'act-2',
            priority: 'NORMAL',
            title: 'Prepare clean storage',
            description: 'Inspect bags for mandi transport.',
            timing: 'Before harvest',
            icon: 'protect'
          });
        } else {
          actions.push({
            id: 'act-1',
            priority: 'NORMAL',
            title: 'Maintain regular irrigation',
            description: `Provide optimum moisture for ${crop}.`,
            timing: 'As per schedule',
            icon: 'monitor'
          });
          actions.push({
            id: 'act-2',
            priority: 'NORMAL',
            title: 'Inspect for pests',
            description: 'Check leaves for pest symptoms.',
            timing: 'Next 2 days',
            icon: 'spray'
          });
          actions.push({
            id: 'act-3',
            priority: 'NORMAL',
            title: 'Apply micronutrients',
            description: `Support growth during ${cropStage.toLowerCase()} phase.`,
            timing: 'This week',
            icon: 'fertilizer'
          });
        }

        return {
          riskLevel: 'LOW' as const,
          riskTitle: 'Stable Weather Conditions',
          riskTimeline: 'Next 5–7 days',
          riskSummary: 'Normal weather expected. Continue regular farm activities.',
          aiExplanation: `Weather conditions remain manageable for ${crop} at ${cropStage.toLowerCase()} stage. Continue regular work.`,
          whyReasoningSummary: `Gemini recommends regular farm routines as weather forecasts show stable conditions.`,
          decisionFactors: [
            `Low rain probability (15%)`,
            `${crop} is currently at ${cropStage} stage`,
            `No flood or storm hazards detected`
          ],
          actions,
          buyItems: isSowing ? [
            { name: `Certified ${crop} Seeds`, reason: 'Quality tested seed stock', urgency: 'NORMAL', category: 'seeds' },
            { name: 'Basal Fertilizer', reason: 'Nutrients for seedbed preparation', urgency: 'NORMAL', category: 'fertilizer' }
          ] : [],
          whyBuyNow: 'Stable weather ensures standard mandi prices and open roads.',
          warning: { show: false, title: '', headline: '', subtext: '' },
          updatedAt: new Date().toISOString(),
          source: 'RULE_BASED' as const
        };
      }
    };

    // 3. If OpenRouter/Gemini is configured, ask Gemini for live structured multilingual decision
    if (AiClient.isConfigured()) {
      const langInstruction = language === 'bn'
        ? 'Generate all text in simple, natural, farmer-friendly Bengali (বাংলা). Do NOT use literal machine translation. Do not mix English unless it is a commonly understood term.'
        : language === 'hi'
        ? 'Generate all text in simple, natural, farmer-friendly Hindi (हिन्दी). Do not mix English unless it is a commonly understood term.'
        : 'Generate all text in clear, simple, farmer-friendly English.';

      const prompt = `You are the BharatFarm Agricultural AI Decision Engine powered by Gemini.
Analyze real-time climate telemetry, location, crop, growth stage, and completed tasks to generate a live farm action plan for an Indian farmer.

LANGUAGE REQUIREMENT:
${langInstruction}

CONTENT LENGTH RULES (STRICT):
1. Action Titles: Maximum 4–6 words. (e.g. "Clear blocked drains", "Stop spraying", "নালা পরিষ্কার করুন", "नालियां साफ करें").
2. Action Descriptions: Maximum 8–12 words. ONE short sentence only. (e.g. "Clear drains before rain.", "Stop spraying before heavy rain.").
3. Action Timing: Maximum 3–4 words. (e.g. "Today", "Before rain", "This week", "আজকের মধ্যে", "आज ही").
4. Priority: "HIGH" | "IMPORTANT" | "NORMAL".
5. Risk Title: Maximum 2–4 words. (e.g. "Heavy Rain Likely", "ভারী বৃষ্টির সম্ভাবনা", "भारी बारिश की संभावना").
6. Risk Summary: Maximum 8–12 words.
7. AI Explanation: Maximum 12–16 words.
8. Maximum 3 to 4 prioritized action cards.
9. DO NOT generate long paragraphs. Keep every recommendation compact and direct.

FARM CONTEXT:
- Location: ${location}
- Crop: ${crop} (Stage: ${cropStage})
- Rain Probability: ${rainProb}%, 48h Peak Rain: ${peakMm} mm, 7-Day Rain: ${rainMm} mm
- Flood Assessment: ${flood.riskLevel} (${floodScore}/100)
- Temperature: ${weather.temperatureCelsius}°C, Humidity: ${weather.humidityPercent}%
- Farmer Completed Tasks: ${completedActions.length > 0 ? completedActions.join(', ') : 'None'}

Respond ONLY with valid JSON matching this schema:
{
  "riskLevel": "LOW" | "MODERATE" | "HIGH" | "SEVERE",
  "riskTitle": "string",
  "riskTimeline": "string",
  "riskSummary": "string",
  "aiExplanation": "string",
  "whyReasoningSummary": "string",
  "decisionFactors": ["string", "string", "string"],
  "actions": [
    {
      "id": "string",
      "priority": "HIGH" | "IMPORTANT" | "NORMAL",
      "title": "string",
      "description": "string",
      "timing": "string",
      "icon": "drainage" | "harvest" | "protect" | "cart" | "spray" | "monitor" | "seed" | "tools" | "fertilizer"
    }
  ],
  "buyItems": [
    {
      "name": "string",
      "reason": "string",
      "urgency": "HIGH" | "NORMAL",
      "category": "fertilizer" | "seeds" | "pesticides" | "tools"
    }
  ],
  "whyBuyNow": "string",
  "warning": {
    "show": boolean,
    "title": "string",
    "headline": "string",
    "subtext": "string"
  }
}`;

      try {
        const aiResponse = await AiClient.chat([
          { role: 'system', content: `You are the Gemini Agricultural Decision Engine for BharatFarm. ${langInstruction} Return valid JSON only.` },
          { role: 'user', content: prompt }
        ], {
          maxTokens: 650,
          responseFormat: 'json_object',
          timeoutMs: 15000
        });

        const parsed = AiClient.parseJsonResponse<any>(aiResponse);
        if (parsed && parsed.riskTitle && Array.isArray(parsed.actions) && parsed.actions.length > 0) {
          return res.json({
            success: true,
            data: {
              ...parsed,
              weatherSummary: {
                temperature: weather.temperatureCelsius,
                condition: weather.condition,
                rainfallProbability: rainProb,
                expectedRainfallMm: peakMm
              },
              updatedAt: new Date().toISOString(),
              source: 'GEMINI_AI'
            }
          });
        }
      } catch (aiErr) {
        console.warn('[Gemini Decision] AI invocation failed, falling back to smart decision engine:', aiErr);
      }
    }

    // Fallback response
    const fallbackPlan = generateSmartFallbackPlan();
    res.json({
      success: true,
      data: {
        ...fallbackPlan,
        weatherSummary: {
          temperature: weather.temperatureCelsius,
          condition: weather.condition,
          rainfallProbability: rainProb,
          expectedRainfallMm: peakMm
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Government Gemini AI Decision Engine
 * Dedicated AI decision stream for state/district food security, procurement, transport, and storage in English, Bengali, or Hindi.
 */
export const getGovtGeminiDecision = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const state = (req.body.state as string) || 'West Bengal';
    const district = (req.body.district as string) || '';
    const location = (req.body.location as string) || `${district ? district + ', ' : ''}${state}`;
    const crop = (req.body.crop as string) || 'Paddy';
    const cropStage = (req.body.cropStage as string) || 'Maturity / Ready to Harvest';
    const language = ((req.body.language as string) || 'en').toLowerCase();
    const rainfallMm = Number(req.body.rainfallMm ?? 45);
    const floodRisk = (req.body.floodRisk as string) || 'HIGH';
    const lossPercentage = Number(req.body.lossPercentage ?? 30);
    const transportAccessibility = (req.body.transportAccessibility as string) || (rainfallMm > 30 ? 'Vulnerable' : 'Good');
    const storageAvailability = (req.body.storageAvailability as string) || (lossPercentage > 20 ? 'Needed' : 'Adequate');

    const isHighRain = rainfallMm > 25 || floodRisk === 'HIGH' || floodRisk === 'SEVERE' || lossPercentage >= 25;
    const isMaturity = cropStage.toLowerCase().includes('matur') || cropStage.toLowerCase().includes('harvest') || cropStage.toLowerCase().includes('ready');

    const generateGovtFallback = () => {
      if (language === 'bn') {
        if (isHighRain) {
          return {
            planTitle: 'সরকারি সংগ্রহ পরিকল্পনা',
            subtitle: 'AI-সংগৃহীত ফসল সংগ্রহ ও পরিবহন পরিকল্পনা',
            riskSummary: `🌾 ভারী বৃষ্টির আগে ${crop === 'Wheat' ? 'গম' : 'ধান'} সংগ্রহে গুরুত্ব দিন। ভারী বৃষ্টিতে ফসল কাটা ও পরিবহন ব্যাহত হতে পারে।`,
            hasUrgentAction: true,
            actions: [
              {
                id: 'g-1',
                priority: 'HIGH',
                title: `${crop === 'Wheat' ? 'গম' : 'ধান'} সংগ্রহে অগ্রাধিকার দিন`,
                description: `বৃষ্টির আগে প্রস্তুত ${crop === 'Wheat' ? 'গম' : 'ধান'} সংগ্রহ করুন।`,
                timing: 'বৃষ্টির আগে',
                icon: 'procurement'
              },
              {
                id: 'g-2',
                priority: 'HIGH',
                title: 'পরিবহনের ব্যবস্থা করুন',
                description: 'রাস্তা খারাপ হওয়ার আগে ফসল সরান।',
                timing: 'বৃষ্টির আগে',
                icon: 'transport'
              },
              {
                id: 'g-3',
                priority: 'IMPORTANT',
                title: 'গুদাম পরীক্ষা করুন',
                description: 'আসা ফসলের জন্য শুকনো জায়গা রাখুন।',
                timing: 'এই সপ্তাহে',
                icon: 'storage'
              },
              {
                id: 'g-4',
                priority: 'NORMAL',
                title: 'সরবরাহ পর্যবেক্ষণ করুন',
                description: 'স্থানীয় ফসলের প্রাপ্যতা ট্র্যাক করুন।',
                timing: 'প্রতিদিন',
                icon: 'monitor'
              }
            ],
            procurementNeeds: [
              { item: `🌾 ${crop === 'Wheat' ? 'গম' : 'ধান'}`, need: 'উচ্চ চাহিদা', urgency: 'HIGH' },
              { item: '🚛 পরিবহন', need: 'আগে ব্যবস্থা করুন', urgency: 'HIGH' },
              { item: '🏠 গুদাম', need: 'ধারণক্ষমতা পরীক্ষা করুন', urgency: 'IMPORTANT' }
            ],
            transportAlert: {
              show: true,
              title: '⚠️ পরিবহন সতর্কতা',
              text: 'ভারী বৃষ্টিতে ফসল পরিবহন ধীর হতে পারে। দ্রুত পরিবহনের ব্যবস্থা করুন।'
            },
            storageAlert: {
              show: true,
              title: '🏠 গুদাম',
              text: 'আসা ফসলের জন্য শুকনো সংরক্ষণের জায়গা প্রয়োজন হতে পারে।'
            },
            updatedAt: new Date().toISOString(),
            source: 'RULE_BASED' as const
          };
        } else {
          return {
            planTitle: 'সরকারি সংগ্রহ পরিকল্পনা',
            subtitle: 'AI-সংগৃহীত ফসল সংগ্রহ ও পরিবহন পরিকল্পনা',
            riskSummary: `খাদ্যশস্য সরবরাহ ও স্থানীয় মজুদ স্থিতিশীল রয়েছে।`,
            hasUrgentAction: false,
            actions: [
              {
                id: 'g-1',
                priority: 'NORMAL',
                title: 'নিয়মিত সংগ্রহ পর্যবেক্ষণ',
                description: 'মান্দি ও সংগ্রহ কেন্দ্রে স্বাভাবিক কাজ রাখুন।',
                timing: 'দৈনিক',
                icon: 'procurement'
              },
              {
                id: 'g-2',
                priority: 'NORMAL',
                title: 'মজুদ সমীক্ষা করুন',
                description: 'জেলা গুদামের মজুদের হিসাব নিন।',
                timing: 'এই সপ্তাহে',
                icon: 'storage'
              }
            ],
            procurementNeeds: [
              { item: `🌾 ${crop === 'Wheat' ? 'গম' : 'ধান'}`, need: 'স্বাভাবিক সংগ্রহ', urgency: 'NORMAL' },
              { item: '🏠 গুদাম', need: 'পর্যাপ্ত জায়গা', urgency: 'NORMAL' }
            ],
            transportAlert: { show: false, text: '' },
            storageAlert: { show: false, text: '' },
            updatedAt: new Date().toISOString(),
            source: 'RULE_BASED' as const
          };
        }
      } else if (language === 'hi') {
        if (isHighRain) {
          return {
            planTitle: 'सरकारी खरीद योजना',
            subtitle: 'AI-जनित खरीद और परिवहन योजना',
            riskSummary: `🌾 भारी बारिश से पहले ${crop === 'Wheat' ? 'गेहूं' : 'धान'} की खरीद पर ध्यान दें। बारिश से कटाई और परिवहन प्रभावित हो सकता है।`,
            hasUrgentAction: true,
            actions: [
              {
                id: 'g-1',
                priority: 'HIGH',
                title: `${crop === 'Wheat' ? 'गेहूं' : 'धान'} खरीद को प्राथमिकता दें`,
                description: `बारिश से पहले तैयार ${crop === 'Wheat' ? 'गेहूं' : 'धान'} खरीदें।`,
                timing: 'बारिश से पहले',
                icon: 'procurement'
              },
              {
                id: 'g-2',
                priority: 'HIGH',
                title: 'परिवहन की व्यवस्था करें',
                description: 'सड़क खराब होने से पहले फसल पहुंचाएं।',
                timing: 'बारिश से पहले',
                icon: 'transport'
              },
              {
                id: 'g-3',
                priority: 'IMPORTANT',
                title: 'भंडारण जांचें',
                description: 'आने वाली फसल के लिए सूखी जगह रखें।',
                timing: 'इस सप्ताह',
                icon: 'storage'
              },
              {
                id: 'g-4',
                priority: 'NORMAL',
                title: 'आपूर्ति पर नजर रखें',
                description: 'स्थानीय फसल उपलब्धता ट्रैक करें।',
                timing: 'रोजाना',
                icon: 'monitor'
              }
            ],
            procurementNeeds: [
              { item: `🌾 ${crop === 'Wheat' ? 'गेहूं' : 'धान'}`, need: 'उच्च आवश्यकता', urgency: 'HIGH' },
              { item: '🚛 परिवहन', need: 'पहले व्यवस्था करें', urgency: 'HIGH' },
              { item: '🏠 भंडारण', need: 'क्षमता की जांच करें', urgency: 'IMPORTANT' }
            ],
            transportAlert: {
              show: true,
              title: '⚠️ परिवहन चेतावनी',
              text: 'भारी बारिश से फसल की आवाजाही धीमी हो सकती है। पहले परिवहन का प्रबंध करें।'
            },
            storageAlert: {
              show: true,
              title: '🏠 भंडारण',
              text: 'आने वाली उपज के लिए सूखे भंडारण की आवश्यकता हो सकती है।'
            },
            updatedAt: new Date().toISOString(),
            source: 'RULE_BASED' as const
          };
        } else {
          return {
            planTitle: 'सरकारी खरीद योजना',
            subtitle: 'AI-जनित खरीद और परिवहन योजना',
            riskSummary: 'खाद्यान्न आपूर्ति और स्थानीय भंडार सुरक्षित स्थिति में है।',
            hasUrgentAction: false,
            actions: [
              {
                id: 'g-1',
                priority: 'NORMAL',
                title: 'नियमित खरीद निगरानी',
                description: 'मंडियों में सामान्य खरीद जारी रखें।',
                timing: 'रोजाना',
                icon: 'procurement'
              },
              {
                id: 'g-2',
                priority: 'NORMAL',
                title: 'भंडार का निरीक्षण करें',
                description: 'जिला गोदामों की स्थिति देखें।',
                timing: 'इस सप्ताह',
                icon: 'storage'
              }
            ],
            procurementNeeds: [
              { item: `🌾 ${crop === 'Wheat' ? 'गेहूं' : 'धान'}`, need: 'सामान्य खरीद', urgency: 'NORMAL' },
              { item: '🏠 भंडारण', need: 'पर्याप्त स्थान', urgency: 'NORMAL' }
            ],
            transportAlert: { show: false, text: '' },
            storageAlert: { show: false, text: '' },
            updatedAt: new Date().toISOString(),
            source: 'RULE_BASED' as const
          };
        }
      }

      // Default: English
      if (isHighRain) {
        return {
          planTitle: 'GOVERNMENT PROCUREMENT PLANNER',
          subtitle: 'AI-generated procurement and transport plan',
          riskSummary: `🌾 ${crop} procurement may need early action. Heavy rain may affect harvesting and transport.`,
          hasUrgentAction: true,
          actions: [
            {
              id: 'g-1',
              priority: 'HIGH',
              title: 'Prioritize local procurement',
              description: `Secure mature ${crop.toLowerCase()} before heavy rain.`,
              timing: 'Before rain',
              icon: 'procurement'
            },
            {
              id: 'g-2',
              priority: 'HIGH',
              title: 'Arrange transport',
              description: 'Move harvested crops before roads worsen.',
              timing: 'Before rain',
              icon: 'transport'
            },
            {
              id: 'g-3',
              priority: 'IMPORTANT',
              title: 'Check storage',
              description: 'Prepare dry storage for incoming crops.',
              timing: 'This week',
              icon: 'storage'
            },
            {
              id: 'g-4',
              priority: 'NORMAL',
              title: 'Monitor supply',
              description: 'Track local crop availability.',
              timing: 'Daily',
              icon: 'monitor'
            }
          ],
          procurementNeeds: [
            { item: `🌾 ${crop}`, need: 'High need', urgency: 'HIGH' },
            { item: '🚛 Transport', need: 'Arrange early', urgency: 'HIGH' },
            { item: '🏠 Storage', need: 'Check capacity', urgency: 'IMPORTANT' }
          ],
          transportAlert: {
            show: true,
            title: '⚠️ TRANSPORT ALERT',
            text: 'Heavy rain may slow crop movement. Arrange transport early.'
          },
          storageAlert: {
            show: true,
            title: '🏠 STORAGE',
            text: 'Dry storage may be needed for incoming crops.'
          },
          updatedAt: new Date().toISOString(),
          source: 'RULE_BASED' as const
        };
      } else {
        return {
          planTitle: 'GOVERNMENT PROCUREMENT PLANNER',
          subtitle: 'AI-generated procurement and transport plan',
          riskSummary: 'Crop procurement and grain availability remain in normal operating balance.',
          hasUrgentAction: false,
          actions: [
            {
              id: 'g-1',
              priority: 'NORMAL',
              title: 'Maintain regular procurement',
              description: 'Continue standard mandi procurement operations.',
              timing: 'Daily',
              icon: 'procurement'
            },
            {
              id: 'g-2',
              priority: 'NORMAL',
              title: 'Inspect buffer storage',
              description: 'Review grain inventory in district godowns.',
              timing: 'This week',
              icon: 'storage'
            }
          ],
          procurementNeeds: [
            { item: `🌾 ${crop}`, need: 'Normal procurement', urgency: 'NORMAL' },
            { item: '🏠 Storage', need: 'Adequate capacity', urgency: 'NORMAL' }
          ],
          transportAlert: { show: false, text: '' },
          storageAlert: { show: false, text: '' },
          updatedAt: new Date().toISOString(),
          source: 'RULE_BASED' as const
        };
      }
    };

    if (AiClient.isConfigured()) {
      const langInstruction = language === 'bn'
        ? 'Generate all output strictly in simple, natural Bengali (বাংলা). Action titles must be in Bengali.'
        : language === 'hi'
        ? 'Generate all output strictly in simple, natural Hindi (हिन्दी). Action titles must be in Hindi.'
        : 'Generate all output in clear, concise English.';

      const prompt = `You are the Gemini Government Food Security & Procurement AI Engine for BharatFarm.
Analyze live telemetry to generate a practical, concise government procurement and transport action plan for food authorities.

LANGUAGE: ${langInstruction}

STRICT GENERATION RULES:
1. Focus exclusively on authority decisions: Procuring mature crops, Arranging transport, Preparing storage, and Monitoring local supply.
2. Summary at top: Maximum 1–2 short lines (e.g. "🌾 Paddy procurement may need early action. Heavy rain may affect harvesting and transport.").
3. 3–4 compact government actions:
   - Action Title: 4–6 words maximum.
   - Description: 8–12 words maximum (one short line).
   - Priority: "HIGH" | "IMPORTANT" | "NORMAL".
   - Timing: 2–4 words (e.g. "Before rain", "This week", "Daily").
4. Procurement Needs: Show only crops/items identified as relevant (e.g. Paddy, Transport, Storage) with a 2–3 word need note.
5. Transport Alert: If rainfall or flood threatens road access, set transportAlert.show = true with a 1-sentence warning. If no meaningful risk, set show = false.
6. Storage Alert: If incoming grain requires dry covered storage, set storageAlert.show = true with a 1-sentence note. If not a concern, set show = false.
7. If there is no urgent issue, set hasUrgentAction = false.
8. NO legal disclaimers, NO policy lectures, NO statistics dumps.

CONTEXT:
- Location: ${location}
- Crop: ${crop} (Stage: ${cropStage}, Harvest Readiness: ${isMaturity ? 'Ready/Near Maturity' : 'Growing'})
- Expected Rainfall: ${rainfallMm} mm, Flood Risk: ${floodRisk}
- Simulated Crop Loss: ${lossPercentage}%
- Transport Accessibility: ${transportAccessibility}, Storage Availability: ${storageAvailability}

Return pure JSON matching this exact structure:
{
  "planTitle": "string",
  "subtitle": "string",
  "riskSummary": "string",
  "hasUrgentAction": boolean,
  "actions": [
    {
      "id": "string",
      "priority": "HIGH" | "IMPORTANT" | "NORMAL",
      "title": "string",
      "description": "string",
      "timing": "string",
      "icon": "procurement" | "transport" | "storage" | "monitor"
    }
  ],
  "procurementNeeds": [
    {
      "item": "string",
      "need": "string",
      "urgency": "HIGH" | "IMPORTANT" | "NORMAL"
    }
  ],
  "transportAlert": {
    "show": boolean,
    "title": "string",
    "text": "string"
  },
  "storageAlert": {
    "show": boolean,
    "title": "string",
    "text": "string"
  }
}`;

      try {
        const aiResponse = await AiClient.chat([
          { role: 'system', content: `You are the Gemini Government Food Security & Procurement AI Engine for BharatFarm. ${langInstruction} Return valid JSON only.` },
          { role: 'user', content: prompt }
        ], {
          maxTokens: 600,
          responseFormat: 'json_object',
          timeoutMs: 15000
        });

        const parsed = AiClient.parseJsonResponse<any>(aiResponse);
        if (parsed && Array.isArray(parsed.actions) && parsed.actions.length > 0) {
          return res.json({
            success: true,
            data: {
              ...parsed,
              updatedAt: new Date().toISOString(),
              source: 'GEMINI_AI'
            }
          });
        }
      } catch (aiErr) {
        console.warn('[Gemini Govt Decision] AI invocation failed, using smart fallback engine:', aiErr);
      }
    }

    const fallback = generateGovtFallback();
    res.json({
      success: true,
      data: {
        ...fallback,
        updatedAt: new Date().toISOString(),
        source: 'RULE_BASED'
      }
    });
  } catch (error) {
    next(error);
  }
};



