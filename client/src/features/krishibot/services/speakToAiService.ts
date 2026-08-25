// SpeakToAi Service Engine for BharatFarm Multi-Language Voice Guidance

export interface SpeakToAiResult {
  detectedLanguage: 'en' | 'hi' | 'bn';
  isNavigation: boolean;
  navPath?: string;
  responseMessage: string;
  requiresManualConfirmation?: boolean;
}

// Navigation map for English, Hindi, and Bengali natural phrases
const NAV_COMMANDS: Array<{
  keywords: string[];
  path: string;
  guidance: {
    en: string;
    hi: string;
    bn: string;
  };
}> = [
  {
    keywords: ['scanner', 'leaf', 'patt', 'পাত'],
    path: '/scanner',
    guidance: {
      en: 'Leaf Scanner is open. Take a clear close-up picture of the affected leaf or upload one from your gallery for diagnosis.',
      hi: 'लीफ़ स्कैनर खुल गया है। प्रभावित पत्ती की साफ़ फोटो लें या गैलरी से अपलोड करें।',
      bn: 'লিফ স্ক্যানার খোলা হয়েছে। আপনার আক্রান্ত পাতার স্পষ্ট ছবি তুলুন অথবা গ্যালারি থেকে আপলোড করুন।'
    }
  },
  {
    keywords: ['marketplace', 'bazaar', 'mandi', 'বাজার', 'মার্কেটপ্লেস'],
    path: '/marketplace',
    guidance: {
      en: 'Marketplace is open. Here you can view farming products, compare prices, and explore available crop inputs.',
      hi: 'मार्केटप्लेस खुल गया है। यहाँ आप फ़सल उत्पाद देख सकते हैं, कीमतें तुलना कर सकते हैं और इनपुट ख़रीद सकते हैं।',
      bn: 'মার্কেটপ্লেস খোলা হয়েছে। এখানে আপনি ফসলের দাম দেখতে পারেন এবং কেনাকাটা করতে পারেন।'
    }
  },
  {
    keywords: ['scheme', 'government', 'sarkari', 'योजना', 'স্কিম', 'সরকারি'],
    path: '/schemes',
    guidance: {
      en: 'Government Schemes is open. Here you can check schemes and subsidy information. Select the scheme that matches your needs.',
      hi: 'सरकारी योजनाएं खुल गई हैं। यहाँ आप सब्सिडी और पात्रता जानकारी प्राप्त कर सकते हैं।',
      bn: 'সরকারি প্রকল্প খোলা হয়েছে। এখানে আপনি সরকারি ভর্তুকি এবং প্রকল্পের তথ্য জানতে পারবেন।'
    }
  },
  {
    keywords: ['weather', 'mausam', 'baarish', 'मौसम', 'আবহাওয়া'],
    path: '/weather',
    guidance: {
      en: 'Weather Intelligence is open. You can check 7-day forecasts, rainfall alerts, humidity, and irrigation guidance here.',
      hi: 'मौसम जानकारी खुल गई है। यहाँ आप बारिश के अलर्ट, तापमान और सिंचाई सलाह देख सकते हैं।',
      bn: 'আবহাওয়া পূর্বাভাস খোলা হয়েছে। এখানে আপনি বৃষ্টিপাতের সম্ভাবনা ও সেচ পরামর্শ পাবেন।'
    }
  },
  {
    keywords: ['group', 'buying', 'pool', 'खाद', 'বীজ', 'গ্রুপ'],
    path: '/groupbuying',
    guidance: {
      en: 'Group Buying is open. You can join nearby fertilizer or seed pools and see bulk-order discounts.',
      hi: 'ग्रुप बाइंग खुल गया है। यहाँ आप स्थानीय किसानों के साथ मिलकर खाद और बीज पर बचत कर सकते हैं।',
      bn: 'গ্রুপ বায়িং খোলা হয়েছে। এখানে আপনি দলগতভাবে সার ও বীজ কিনে ছাড় পেতে পারেন।'
    }
  },
  {
    keywords: ['record', 'farm', 'khata', 'खाता', 'রেকর্ড'],
    path: '/records',
    guidance: {
      en: 'Farm Records is open. Track your seasonal crop logs, expense entries, and yield metrics here.',
      hi: 'फार्म रिकॉर्ड्स खुल गया है। अपने खेत का ख़र्च और फ़सल लॉग यहाँ दर्ज करें।',
      bn: 'ফার্ম রেকর্ড খোলা হয়েছে। আপনার খামারের খরচ এবং হিসাব এখানে ট্র্যাক করুন।'
    }
  },
  {
    keywords: ['calculator', 'ganana', 'हिसाब', 'ক্যালকুলেটর'],
    path: '/calculator',
    guidance: {
      en: 'Farm Calculator is open. Calculate fertilizer dosages, seed requirements, and expected yields.',
      hi: 'फार्म कैलकुलेटर खुल गया है। अपनी ज़मीन के अनुसार आवश्यक खाद और बीज की गणना करें।',
      bn: 'ফার্ম ক্যালকুলেটর খোলা হয়েছে। সার ও বীজের পরিমাণ সঠিক হিসাব করুন।'
    }
  },
  {
    keywords: ['loan', 'credit', 'kist', 'ऋण', 'ঋণ'],
    path: '/loan-eligibility',
    guidance: {
      en: 'Loan Eligibility is open. Check Kisan Credit Card status and government agricultural credit options.',
      hi: 'लोन पात्रता सेक्शन खुल गया है। किसान क्रेडिट कार्ड और लोन विकल्प यहाँ देखें।',
      bn: 'ঋণ যোগ্যতা নির্ধারণ খোলা হয়েছে। কিষাণ ক্রেডিট কার্ডের বিবরণ দেখুন।'
    }
  },
  {
    keywords: ['order', 'delivery', 'delivery', 'ऑर्डर', 'অর্ডার'],
    path: '/orders',
    guidance: {
      en: 'Orders and Delivery is open. Track your dispatched seeds, fertilizers, and delivery schedules.',
      hi: 'ऑर्डर और डिलीवरी खुल गया है। अपने खरीदे गए सामान का स्टेटस यहाँ देखें।',
      bn: 'অর্ডার ও ডেলিভারি খোলা হয়েছে। আপনার খামারের অর্ডারের স্থিতি পরীক্ষা করুন।'
    }
  },
  {
    keywords: ['sahayak', 'helper', 'assistance', 'सहायक', 'সহায়ক'],
    path: '/sahayak',
    guidance: {
      en: 'Sahayak Assistance is open. Connect with verified local helpers for digital application support.',
      hi: 'सहायक केंद्र खुल गया है। ऐप चलाने में मदद के लिए स्थानीय सहायक से संपर्क करें।',
      bn: 'সহায়ক সহায়তা খোলা হয়েছে। ডিজিটাল সেবার জন্য স্থানীয় সহায়ক খুঁজুন।'
    }
  },
  {
    keywords: ['profile', 'settings', 'user', 'प्रोफ़ाइल', 'প্রোফাইল'],
    path: '/profile',
    guidance: {
      en: 'Profile & Settings is open. Manage your personal details, preferred language, and app settings.',
      hi: 'प्रोफ़ाइल सेटिंग्स खुल गई हैं। अपनी व्यक्तिगत जानकारी यहाँ अपडेट करें।',
      bn: 'প্রোফাইল সেটিংস খোলা হয়েছে। আপনার অ্যাকাউন্ট বিবরণ সংহত করুন।'
    }
  },
  {
    keywords: ['home', 'dashboard', 'मुख्य', 'होम', 'হোম'],
    path: '/',
    guidance: {
      en: 'Welcome to Dashboard. View overall farm telemetry, crop canopy health, and quick actions.',
      hi: 'मुख्य डैशबोर्ड पर आपका स्वागत है। अपने खेत की सेहत और मुख्य सेवाएं यहाँ देखें।',
      bn: 'প্রধান ড্যাশবোর্ডে আপনাকে স্বাগতম। আপনার খামারের সার্বিক বিবরণ এখানে উপলব্ধ।'
    }
  }
];

// Sensitive keywords requiring farmer manual confirmation
const SENSITIVE_KEYWORDS = [
  'pay', 'payment', 'buy now', 'confirm order', 'transfer', 'submitting form',
  'भुगतान', 'खरीदें', 'ऑर्डर दें', 'টাকা', 'পেমেন্ট', 'অর্ডার করুন'
];

/**
 * Detect language based on script/vocabulary
 */
export const detectLanguage = (text: string): 'en' | 'hi' | 'bn' => {
  // Check Bengali Unicode range
  if (/[\u0980-\u09FF]/.test(text) || /\b(amar|tumi|kholo|ta|kemon|kine|krishi)\b/i.test(text)) {
    return 'bn';
  }
  // Check Devanagari Unicode range
  if (/[\u0900-\u097F]/.test(text) || /\b(kholo|kya|kaise|karo|batao|hai|par)\b/i.test(text)) {
    return 'hi';
  }
  return 'en';
};

/**
 * Main Speak-to-AI processing engine
 */
export const processVoiceQuery = (query: string): SpeakToAiResult => {
  const lang = detectLanguage(query);
  const qLower = query.toLowerCase();

  // 1. Check for sensitive actions
  const isSensitive = SENSITIVE_KEYWORDS.some(kw => qLower.includes(kw));
  if (isSensitive) {
    let msg = 'For your security, financial transactions or official submissions require your manual tap and confirmation.';
    if (lang === 'hi') {
      msg = 'आपकी सुरक्षा के लिए, वित्तीय लेनदेन या फ़ॉर्म जमा करने के लिए आपको स्वयं बटन दबाकर पुष्टि करनी होगी।';
    } else if (lang === 'bn') {
      msg = 'আপনার নিরাপত্তার জন্য, আর্থিক লেনদেন বা ফরম জমা দেওয়ার জন্য আপনাকে নিজে ম্যানুয়ালি নিশ্চিত করতে হবে।';
    }
    return {
      detectedLanguage: lang,
      isNavigation: false,
      responseMessage: msg,
      requiresManualConfirmation: true
    };
  }

  // 2. Check for navigation commands
  for (const item of NAV_COMMANDS) {
    if (item.keywords.some(kw => qLower.includes(kw))) {
      return {
        detectedLanguage: lang,
        isNavigation: true,
        navPath: item.path,
        responseMessage: item.guidance[lang]
      };
    }
  }

  // 3. Informational & App usage guidance
  if (qLower.includes('scan') || qLower.includes('leaf') || qLower.includes('पत्ती') || qLower.includes('পাতা')) {
    let msg = 'Open Leaf Scanner from the menu, tap Open Camera, and capture a clear close-up photo of the affected leaf in good lighting.';
    if (lang === 'hi') msg = 'मेन्यू से लीफ़ स्कैनर खोलें, कैमरा चालू करें और अच्छी रोशनी में बीमार पत्ती की स्पष्ट फोटो खींचें।';
    if (lang === 'bn') msg = 'মেনু থেকে লিফ স্ক্যানার খুলুন, ক্যামেরা খুলুন এবং ভালো আলোতে আক্রান্ত পাতার স্পষ্ট ছবি তুলুন।';
    return { detectedLanguage: lang, isNavigation: false, responseMessage: msg };
  }

  if (qLower.includes('crop') || qLower.includes('health') || qLower.includes('फसल') || qLower.includes('ফসল')) {
    let msg = 'Your current crop health is Optimal with an NDVI index of 0.78 for Wheat (Rabi Season). Root zone moisture is 52%.';
    if (lang === 'hi') msg = 'आपकी गेहूं की फसल की सेहत उत्तम (NDVI 0.78) है और जड़ क्षेत्र में नमी 52% है।';
    if (lang === 'bn') msg = 'আপনার গম ফসলের স্বাস্থ্য চমৎকার (NDVI 0.78) এবং মাটির আর্দ্রতা 52%।';
    return { detectedLanguage: lang, isNavigation: false, responseMessage: msg };
  }

  if (qLower.includes('fertilizer') || qLower.includes('khad') || qLower.includes('खाद') || qLower.includes('সার')) {
    let msg = 'For your Wheat crop in Rabi season, recommended fertilizer is NPK 12:32:16 along with timely irrigation.';
    if (lang === 'hi') msg = 'रबी सीजन में गेहूं की फसल के लिए NPK 12:32:16 खाद का उपयोग उचित समय पर सिंचाई के साथ करें।';
    if (lang === 'bn') msg = 'রবি মৌসুমে গম ফসলের জন্য NPK 12:32:16 সার এবং সময়মত সেচ দেওয়ার পরামর্শ দেওয়া হয়।';
    return { detectedLanguage: lang, isNavigation: false, responseMessage: msg };
  }

  // Default friendly fallback
  let fallbackMsg = `I heard: "${query}". You can ask me to open Scanner, Marketplace, Weather, Schemes, or ask farming questions in English, Hindi, or Bengali.`;
  if (lang === 'hi') {
    fallbackMsg = `मैंने सुना: "${query}"। आप मुझसे स्कैनर, मार्केटप्लेस, मौसम या सरकारी योजनाएं खोलने के लिए कह सकते हैं।`;
  } else if (lang === 'bn') {
    fallbackMsg = `আমি শুনেছি: "${query}"। আপনি আমাকে স্ক্যানার, মার্কেটপ্লেস, আবহাওয়া বা সরকারি স্কিম খুলতে বলতে পারেন।`;
  }

  return {
    detectedLanguage: lang,
    isNavigation: false,
    responseMessage: fallbackMsg
  };
};
