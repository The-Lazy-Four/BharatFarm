/**
 * sahayakDemoKnowledge.ts
 * SIH Demo Knowledge Layer for BharatFarm Sahayak Voice Helpline.
 * 
 * Provides:
 * - Curated intents for all 6 BharatFarm modules + language switching
 * - High-coverage multi-lingual queries (Hindi, Bengali, English)
 * - Greetings, prompts, clarification messages, and fallback guidance
 */

export interface IntentExample {
  text: string;
  lang: 'hi' | 'en' | 'bn';
  description?: string;
}

export interface ModuleIntentConfig {
  moduleCode: string;
  nameEn: string;
  nameHi: string;
  nameBn: string;
  description: string;
  examples: IntentExample[];
  clarification: {
    hi: string;
    en: string;
    bn: string;
  };
  sampleAnswer: {
    hi: string;
    en: string;
    bn: string;
  };
  followUps: {
    hi: string[];
    en: string[];
    bn: string[];
  };
}

export const SAHAYAK_GREETINGS = {
  INITIAL_IVR: {
    spoken: "Namaste. BharatFarm Sahayak mein aapka swagat hai. Kripya apni bhasha chuniye. Hindi ke liye 1 dabayein. For English, press 2. Banglar jonno 3 chapun.",
    display: "Namaste. BharatFarm Sahayak mein aapka swagat hai.\n\n• Hindi ke liye 1 dabayein\n• For English, press 2\n• বাংলার জন্য 3 চাপুন",
  },
  WELCOME_AFTER_LANG: {
    hi: {
      spoken: "Namaste. Aap BharatFarm Sahayak se jude hain. Main aapko mausam, mandi bhav, fasal risk, crop insurance, aggregation aur anya farmer services mein madad kar sakta hoon. Kripya batayein aapko kis cheez mein madad chahiye.",
      display: "Namaste! Aap BharatFarm Sahayak se jude hain.\nMain aapko mausam, mandi bhav, fasal risk, insurance aur aggregation mein madad kar sakta hoon. Kripya batayein aapko kis cheez mein madad chahiye.",
    },
    en: {
      spoken: "Hello. You are now connected to BharatFarm Sahayak. I can help you with climate risk, mandi intelligence, crop planning, crop insurance, aggregation, and farmer services. How can I help you today?",
      display: "Hello! You are connected to BharatFarm Sahayak.\nI can help with climate risk, mandi intelligence, crop planning, crop insurance, aggregation, and farmer services. How can I help you?",
    },
    bn: {
      spoken: "Nomoshkar. AApni BharatFarm Sahayak-e jukto hoyechhen. Aami aponake aabohawa, mandi dor, foshol bima, ebong onnano krishi shebay shahajjo korte pari. Bolun aponar ki shahajjo dorkar?",
      display: "নমস্কার! আপনি ভারতফার্ম সহায়ক-এ যুক্ত হয়েছেন।\nআমি আপনাকে আবহাওয়া, মান্ডি দর, ফসল বীমা, সমবায় বিক্রি ও অন্যান্য কৃষি সেবায় সাহায্য করতে পারি। আপনার কী সাহায্য দরকার?",
    }
  },
  LANGUAGE_SWITCH_PROMPT: {
    hi: "Aap kaunsi bhasha chunna chahte hain? Hindi ke liye 1, English ke liye 2, Bangla ke liye 3 dabayein ya bolein.",
    en: "Which language would you like to switch to? Press or say 1 for Hindi, 2 for English, or 3 for Bengali.",
    bn: "Aapni kon bhasha bechhe nite chan? Hindi-r jonno 1, English-er jonno 2, ba Bangla-r jonno 3 dabun.",
  },
  DID_NOT_UNDERSTAND: {
    hi: "Maaf kijiye, mujhe aapki baat samajh nahi aayi. Kripya dobara boliye, ya keypad se number dabayein.",
    en: "Sorry, I didn't catch that. Please say it again, or select an option from the keypad.",
    bn: "Dukkito, aami aponar kotha bujhte parini. Doya kore aarekbar bolun ba keypad bebohar koroon.",
  }
};

export const SAHAYAK_KNOWLEDGE_MODULES: Record<string, ModuleIntentConfig> = {
  BEFORE_YOU_SOW: {
    moduleCode: "BEFORE_YOU_SOW",
    nameEn: "Before You Sow & Price Risk",
    nameHi: "बिफोर यू सो (बुवाई से पहले फसल सलाह)",
    nameBn: "বপনের আগের ঝুঁকি ও ফসল পরামর্শ",
    description: "Helps farmers plan crop planting, analyze historical price volatility, and avoid oversupply price crashes.",
    examples: [
      { text: "What should I sow this season?", lang: "en" },
      { text: "Which crop should I grow?", lang: "en" },
      { text: "Is paddy suitable for this season?", lang: "en" },
      { text: "What is the price risk for paddy?", lang: "en" },
      { text: "Should I grow wheat this season?", lang: "en" },
      { text: "Mere liye kaunsi fasal lagana sahi rahega?", lang: "hi" },
      { text: "Is baar dhan lagana theek rahega kya?", lang: "hi" },
      { text: "Kaunsi fasal lagayein jismein munafa ho?", lang: "hi" },
      { text: "Gehun lagane par market risk kitna hai?", lang: "hi" },
      { text: "কী ফসল বপন করা লাভজনক হবে?", lang: "bn" },
      { text: "এই মৌসুমে ধান লাগানো কি ঠিক হবে?", lang: "bn" },
    ],
    clarification: {
      hi: "Before You Sow mein hum aapki zameen aur aane wale mausam ke hisaab se sabse safe aur profitable fasal batate hain.",
      en: "Before You Sow evaluates price volatility and local soil-climate viability before you invest in seeds.",
      bn: "বপনের আগের মডিউল আপনাকে বীজ কেনার আগে ফসলের ঝুঁকি ও সম্ভাব্য লাভ যাচাই করতে সাহায্য করে।"
    },
    sampleAnswer: {
      hi: "Hamare analysis ke anusar, is season mein Dhan ke liye 12% price risk hai aur Mandi demand achhi hai. Agar aap 2 acre mein lagate hain toh estimated return 48,000 rupaye prati acre hai.",
      en: "Based on our BharatFarm Price Risk Model, Paddy shows moderate 12% market volatility with strong regional demand. Expected yield realization is favorable this season.",
      bn: "আমাদের ভারতফার্ম বিশ্লেষণ অনুযায়ী, এই মৌসুমে ধানের ক্ষেত্রে বাজার ঝুঁকি মাঝারি এবং চাহিদা ভালো রয়েছে।"
    },
    followUps: {
      hi: ["Kya aap kisi doosri fasal ka risk check karna chahte hain?", "Kya aapko beej khareedne ki salah chahiye?"],
      en: ["Would you like to compare another crop?", "Do you want to see recommended seed varieties?"],
      bn: ["আপনি কি অন্য কোনো ফসলের ঝুঁকি তুলনা করতে চান?"]
    }
  },

  CLIMATE_RISK: {
    moduleCode: "CLIMATE_RISK",
    nameEn: "Climate Risk & Spray Advisory",
    nameHi: "मौसम एवं क्लाइमेट रिस्क",
    nameBn: "আবহাওয়া ও জলবায়ু ঝুঁকি",
    description: "Actionable weather forecasts, flood warnings, rainfall windows, and safe pesticide spray guidance.",
    examples: [
      { text: "Will it rain tomorrow?", lang: "en" },
      { text: "What is the weather forecast?", lang: "en" },
      { text: "Is there flood risk in my area?", lang: "en" },
      { text: "Can I spray pesticide tomorrow?", lang: "en" },
      { text: "Should I irrigate today?", lang: "en" },
      { text: "Kal baarish hogi kya?", lang: "hi" },
      { text: "Mausam kaisa rahega?", lang: "hi" },
      { text: "Baarish kab hogi?", lang: "hi" },
      { text: "Kya kal khet mein dawai spray kar sakte hain?", lang: "hi" },
      { text: "Pani kab lagana chahiye?", lang: "hi" },
      { text: "আগামীকাল বৃষ্টি হবে কি?", lang: "bn" },
      { text: "আগামীকাল আবহাওয়া কেমন থাকবে?", lang: "bn" },
      { text: "কীটনাশক স্প্রে করার উপযুক্ত সময় কখন?", lang: "bn" }
    ],
    clarification: {
      hi: "Hum sirf mausam nahi batate, balki kheti ke spray aur sinchai ka sahi samay batate hain.",
      en: "We provide agricultural weather advisory, specifically recommending irrigation and pesticide spray timings.",
      bn: "আমরা আবহাওয়ার সঙ্গে কীটনাশক স্প্রে এবং সেচ দেওয়ার সেরা সময় জানিয়ে দিই।"
    },
    sampleAnswer: {
      hi: "Kal dopahar ke baad halki se madhyam baarish ki 75% sambhavana hai. Agar aap spray karne wale hain toh aaj hi rokein kyunki barish se dawai dhul sakti hai.",
      en: "There is a 75% probability of moderate showers tomorrow afternoon. We advise postponing chemical spraying to prevent runoff washouts.",
      bn: "আগামীকাল দুপুরে ৭৫ শতাংশ বৃষ্টির সম্ভাবনা রয়েছে। তাই কীটনাশক স্প্রে না করার পরামর্শ দেওয়া হচ্ছে।"
    },
    followUps: {
      hi: ["Kya aap agle 5 dinon ka mausam janna chahte hain?", "Kya sinchai ki timing janni hai?"],
      en: ["Do you want a 5-day weather forecast?", "Would you like optimal irrigation timings?"],
      bn: ["আপনি কি আগামী ৫ দিনের আবহাওয়া জানতে চান?"]
    }
  },

  AGGREGATION: {
    moduleCode: "AGGREGATION",
    nameEn: "Aggregation & Collective Selling",
    nameHi: "एग्रीगेशन और सामूहिक बिक्री",
    nameBn: "সমবায় বিক্রি ও ইনপুট ক্রয়",
    description: "Combines farm yields with nearby farmers for bulk transport savings and higher bargaining prices.",
    examples: [
      { text: "How can I sell together with nearby farmers?", lang: "en" },
      { text: "How does collective selling work?", lang: "en" },
      { text: "How do I join a crop pooling group?", lang: "en" },
      { text: "Group selling kaise hoti hai?", lang: "hi" },
      { text: "Mujhe group mein fasal bechni hai", lang: "hi" },
      { text: "Pados ke kisano ke saath milkar kaise bechein?", lang: "hi" },
      { text: "Bulk transport mein kiraya kaise bachega?", lang: "hi" },
      { text: "দলবদ্ধভাবে ফসল বিক্রি কীভাবে করব?", lang: "bn" },
      { text: "অন্য কৃষকদের সাথে একত্র হয়ে বিক্রি করার উপায় কী?", lang: "bn" }
    ],
    clarification: {
      hi: "Aggregation mein aap apne gaon ke kisano ke saath milkar fasal bech sakte hain jisse transport kharcha 40% tak kam hota hai.",
      en: "Aggregation groups nearby harvests so smallholders get corporate bulk buyer rates and split logistics costs.",
      bn: "সমবায় বিক্রিতে কৃষকরা একত্রিত হয়ে বড় ক্রেতাদের কাছে বেশি দামে এবং কম পরিবহন খরচে ফসল বিক্রি করতে পারেন।"
    },
    sampleAnswer: {
      hi: "Aapke aas-paas ke gaon mein Dhan ke liye 12 kisano ka samuh active hai jinke paas kul 45 ton produce hai. Judne par aapko 180 rupaye prati quintal behtar rate mil sakta hai.",
      en: "There is an active Paddy pooling hub in your block with 12 farmers aggregating 45 metric tonnes. Joining this cluster yields an estimated ₹180 premium per quintal.",
      bn: "আপনার এলাকায় ১২ জন কৃষকের একটি দল সক্রিয় রয়েছে। তাদের সাথে যুক্ত হলে কুইন্টাল প্রতি ১৮০ টাকা বেশি পাওয়ার সুযোগ রয়েছে।"
    },
    followUps: {
      hi: ["Kya aap is group mein judne ke liye request bhejna chahte hain?", "Kya aap group buying mein khad khareedna chahte hain?"],
      en: ["Would you like to submit a request to join this group?", "Are you interested in group fertilizer purchasing?"],
      bn: ["আপনি কি এই গ্রুপে যুক্ত হতে অনুরোধ পাঠাতে চান?"]
    }
  },

  CROP_INSURANCE: {
    moduleCode: "CROP_INSURANCE",
    nameEn: "Crop Insurance & Satellite Verification",
    nameHi: "फसल बीमा एवं सैटेलाइट सत्यापन",
    nameBn: "ফসল বীমা ও স্যাটেলাইট ভেরিফিকেশন",
    description: "Guidance on PMFBY claims, satellite NDVI loss assessments, and claim status tracking.",
    examples: [
      { text: "How does crop insurance verification work?", lang: "en" },
      { text: "How is crop damage verified via satellite?", lang: "en" },
      { text: "How do I file a PMFBY insurance claim?", lang: "en" },
      { text: "Insurance claim kaise verify hota hai?", lang: "hi" },
      { text: "Satellite se crop loss kaise pata chalta hai?", lang: "hi" },
      { text: "Fasal bima claim status kya hai?", lang: "hi" },
      { text: "Mera bima claim kab milega?", lang: "hi" },
      { text: "ফসল বীমার দাবি কীভাবে যাচাই হয়?", lang: "bn" },
      { text: "স্যাটেলাইটের মাধ্যমে কীভাবে ফসলের ক্ষতি দেখা হয়?", lang: "bn" }
    ],
    clarification: {
      hi: "BharatFarm satellite index (NDVI) se aapke khet ke nuksan ko bina patwari intezaar ke turant verify karne mein madad karta hai.",
      en: "BharatFarm utilizes Sentinel satellite multispectral imagery to verify localized flood or drought crop damage objectively.",
      bn: "ভারতফার্ম স্যাটেলাইট ইমেজের মাধ্যমে ফসলের ক্ষতির পরিমাণ দ্রুত যাচাই করতে সহায়তা করে।"
    },
    sampleAnswer: {
      hi: "Aapka plot satellite NDVI analysis se check kiya gaya hai. Sukhe ke kaaran 32% crop stress paya gaya hai jo PMFBY claim verification ke liye valid evidence hai.",
      en: "Satellite NDVI analysis of your farm geo-coordinates shows a 32% canopy stress index, which qualifies as valid objective evidence under PMFBY guidelines.",
      bn: "স্যাটেলাইট বিশ্লেষণের মাধ্যমে আপনার জমির ৩২% ক্ষতি চিহ্নিত হয়েছে যা বীমা দাবির জন্য উপযুক্ত।"
    },
    followUps: {
      hi: ["Kya aap claim certificate generate karna chahte hain?", "Kya claim status dekhna hai?"],
      en: ["Would you like to generate an instant satellite claim dossier?", "Check status of previous claim?"],
      bn: ["আপনি কি ক্লেম সার্টিফিকেট তৈরি করতে চান?"]
    }
  },

  SMART_MANDI: {
    moduleCode: "SMART_MANDI",
    nameEn: "Smart Mandi & Real-time Prices",
    nameHi: "स्मार्ट मंडी और लाइव भाव",
    nameBn: "স্মার্ট মান্ডি ও পাইকারি দর",
    description: "Locates nearest mandis, evaluates net realization after transport costs, and tracks buyer demand.",
    examples: [
      { text: "What is today's mandi price?", lang: "en" },
      { text: "Which is the nearest mandi for paddy?", lang: "en" },
      { text: "Where should I sell my crop?", lang: "en" },
      { text: "Best mandi price for wheat?", lang: "en" },
      { text: "Dhan ka aaj ka rate kya hai?", lang: "hi" },
      { text: "Mere paas wali mandi mein kya bhav hai?", lang: "hi" },
      { text: "Dhan kahan bechna sabse achha rahega?", lang: "hi" },
      { text: "Sabse paas wali mandi kaun si hai?", lang: "hi" },
      { text: "আজ ধানের মান্ডি দর কত?", lang: "bn" },
      { text: "আমার কাছের মান্ডি কোনটি?", lang: "bn" },
      { text: "কোথায় ধান বিক্রি করলে বেশি লাভ হবে?", lang: "bn" }
    ],
    clarification: {
      hi: "Smart Mandi aapko sirf bhaav nahi batati, balki transport kharcha nikaal kar sabse zyada munafa dene wali mandi batati hai.",
      en: "Smart Mandi calculates net profit by factoring travel distance and transport cost against quoted wholesale prices.",
      bn: "স্মার্ট মান্ডি পরিবহন খরচ বাদ দিয়ে আপনার এলাকার সবচেয়ে লাভজনক মান্ডি খুঁজে দেয়।"
    },
    sampleAnswer: {
      hi: "Aapke paas wali APMC mandi mein Dhan Grade-A ka bhav 2,350 rupaye prati quintal hai. Transport kharcha 40 rupaye nikalne ke baad aapko net 2,310 rupaye milenge jo sabse behtar hai.",
      en: "At your nearest APMC mandi, Grade-A Paddy is currently trading at ₹2,350 per quintal. After ₹40 estimated transport cost, your net realization is ₹2,310 per quintal.",
      bn: "নিকটবর্তী মান্ডিতে ধানের বর্তমান দর প্রতি কুইন্টাল ২,৩৫০ টাকা। পরিবহন খরচ বাদ দিয়ে নেট ২,৩১০ টাকা পাবেন।"
    },
    followUps: {
      hi: ["Kya aap doosri mandi se comparison dekhna chahte hain?", "Kya mandi route navigation chahiye?"],
      en: ["Would you like to compare with neighboring district mandis?", "Need truck booking assistance?"],
      bn: ["আপনি কি পাশের মান্ডির দরের তুলনা করতে চান?"]
    }
  },

  BASIC_FARMER_NEEDS: {
    moduleCode: "BASIC_FARMER_NEEDS",
    nameEn: "Basic Farmer Needs & Tools",
    nameHi: "दैनिक किसान सेवाएं एवं टूल्स",
    nameBn: "দৈনন্দিন কৃষক সেবা ও টুলস",
    description: "Leaf disease scanner, KrishiBot, fertilizer calculator, crop roadmap, and government schemes.",
    examples: [
      { text: "How do I use the leaf scanner?", lang: "en" },
      { text: "How to check leaf disease with camera?", lang: "en" },
      { text: "Government schemes for small farmers?", lang: "en" },
      { text: "Where is the fertilizer calculator?", lang: "en" },
      { text: "Leaf scanner kaise use karu?", lang: "hi" },
      { text: "Patte ki bimari kaise check karein?", lang: "hi" },
      { text: "Sarkari yojana kaun si available hai?", lang: "hi" },
      { text: "Khad kitni dalni hai calculator kahan hai?", lang: "hi" },
      { text: "পাতা স্ক্যানার কীভাবে ব্যবহার করব?", lang: "bn" },
      { text: "সরকারি যোজনা কীভাবে পাব?", lang: "bn" },
      { text: "সার ক্যালকুলেটর কোথায় পাব?", lang: "bn" }
    ],
    clarification: {
      hi: "Basic Farmer Needs mein aap camera se fasal ki bimari pehchan sakte hain, khad calculate kar sakte hain aur sarkari scheme dekh sakte hain.",
      en: "Basic Farmer Needs offers camera-based AI leaf diagnostics, PM-Kisan scheme tracking, and dosage calculators.",
      bn: "বেসিক নিডস বিভাগে আপনি পাতার ছবি তুলে রোগ নির্ণয় ও সার ক্যালকুলেটর ব্যবহার করতে পারেন।"
    },
    sampleAnswer: {
      hi: "Leaf scanner use karne ke liye BharatFarm app mein 'Crop Scanner' kholein, khet ke patte ki saaf photo khechein. AI 5 second mein bimari aur sahi dawai bata dega.",
      en: "To diagnose crop leaves, open the 'Crop Scanner' tab on BharatFarm and snap a clear photo of the infected leaf. Our AI will instantly detect disease and prescribe treatments.",
      bn: "পাতা স্ক্যান করতে ভারতফার্মের 'ক্রপ স্ক্যানার' অপশনে গিয়ে পাতার স্পষ্ট ছবি তুলুন। এআই তৎক্ষণাৎ রোগ ও ওষুধ বলে দেবে।"
    },
    followUps: {
      hi: ["Kya aap sarkari subsidy yojana ke baare mein janna chahte hain?", "Kya fertilizer calculator use karna hai?"],
      en: ["Would you like details on government subsidy schemes?", "Need help with the fertilizer dosage calculator?"],
      bn: ["আপনি কি সরকারি ভর্তুকি যোজনা সম্পর্কে জানতে চান?"]
    }
  }
};

/**
 * Deterministic helper to match user speech against curated SIH demo knowledge.
 */
export function matchSahayakDemoIntent(text: string): {
  moduleCode?: string;
  matchedLang?: 'hi' | 'en' | 'bn';
  isLanguageSwitch?: boolean;
  targetLang?: 'hi' | 'en' | 'bn';
  confidence: number;
} {
  const clean = text.toLowerCase().trim();

  // 1. Language switch intent
  if (
    /change\s*language|switch\s*language|bhasha\s*badlo|bhasha\s*change|language\s*badlo|ভাষা\s*পরিবর্তন|ভাষা\s*বদল/i.test(clean)
  ) {
    return { isLanguageSwitch: true, confidence: 0.99 };
  }
  if (/hindi|हिंदी/i.test(clean) && clean.length < 20) {
    return { isLanguageSwitch: true, targetLang: 'hi', confidence: 0.95 };
  }
  if (/english|अंग्रेजी|ইংরেজি/i.test(clean) && clean.length < 20) {
    return { isLanguageSwitch: true, targetLang: 'en', confidence: 0.95 };
  }
  if (/bengali|bangla|বাংলা|बंगाली/i.test(clean) && clean.length < 20) {
    return { isLanguageSwitch: true, targetLang: 'bn', confidence: 0.95 };
  }

  // 2. Score against all knowledge modules
  let bestModule: string | undefined;
  let bestScore = 0;
  let detectedLang: 'hi' | 'en' | 'bn' = 'en';

  if (/[\u0900-\u097F]/.test(clean) || /kya|kaise|batao|hogi|chahiye|fasal|pani|mandi/i.test(clean)) {
    detectedLang = 'hi';
  } else if (/[\u0980-\u09FF]/.test(clean) || /kemon|bristi|dhan|koto|khobor|hobe/i.test(clean)) {
    detectedLang = 'bn';
  }

  for (const [modKey, config] of Object.entries(SAHAYAK_KNOWLEDGE_MODULES)) {
    for (const ex of config.examples) {
      const exClean = ex.text.toLowerCase().trim();
      if (clean === exClean || clean.includes(exClean) || exClean.includes(clean)) {
        return {
          moduleCode: modKey,
          matchedLang: ex.lang,
          confidence: 0.95
        };
      }

      // Keyword token overlap
      const exWords = exClean.split(/\s+/).filter(w => w.length > 2);
      const cleanWords = clean.split(/\s+/).filter(w => w.length > 2);
      let matches = 0;
      for (const w of cleanWords) {
        if (exWords.includes(w)) matches++;
      }
      const score = matches / Math.max(exWords.length, 1);
      if (score > bestScore && score > 0.4) {
        bestScore = score;
        bestModule = modKey;
      }
    }
  }

  if (bestModule) {
    return {
      moduleCode: bestModule,
      matchedLang: detectedLang,
      confidence: bestScore
    };
  }

  return { confidence: 0, matchedLang: detectedLang };
}
