export interface VoiceIntent {
  id: string;
  route?: string;
  featureName: {
    en: string;
    hi: string;
    bn: string;
  };
  keywords: string[]; // Normalized keywords/phrases in English, Hindi, Bengali, Hinglish, Banglish
  guidance: {
    en: string;
    hi: string;
    bn: string;
  };
}

export const VOICE_INTENTS: VoiceIntent[] = [
  {
    id: 'OPEN_DASHBOARD',
    route: '/',
    featureName: {
      en: 'Dashboard',
      hi: 'मुख्य डैशबोर्ड',
      bn: 'প্রধান ড্যাশবোর্ড'
    },
    keywords: [
      'home', 'dashboard', 'main page', 'main screen',
      'होम', 'डैशबोर्ड', 'मुख्य स्क्रीन', 'मुख्य पेज',
      'হোম', 'ড্যাশবোর্ড', 'প্রধান স্ক্রিন',
      'home screen', 'go home', 'back to home', 'main menu'
    ],
    guidance: {
      en: 'Welcome to your Dashboard. Here you can monitor overall farm telemetry, crop canopy health, soil root zone moisture, and quickly launch any agricultural tool.',
      hi: 'मुख्य डैशबोर्ड पर आपका स्वागत है। यहाँ आप अपने खेत का समग्र क्षेत्र, फसल की सेहत, मिट्टी की नमी और सभी कृषि सेवाओं को देख सकते हैं।',
      bn: 'প্রধান ড্যাশবোর্ডে স্বাগতম। এখানে আপনি খামারের সামগ্রিক পরিমাপ, ফসলের স্বাস্থ্য, মাটির আর্দ্রতা এবং সমস্ত কৃষি পরিষেবা একনজরে দেখতে পারবেন।'
    }
  },
  {
    id: 'OPEN_SCANNER',
    route: '/scanner',
    featureName: {
      en: 'Leaf Scanner',
      hi: 'लीफ स्कैनर',
      bn: 'লিফ স্ক্যানার'
    },
    keywords: [
      'scanner', 'scan', 'leaf', 'leaf scanner', 'plant scan', 'patt', 'patta', 'patte', 'bimar', 'bimari', 'kida', 'keeda', 'pata', 'pata check',
      'स्कैनर', 'स्कैन', 'लीफ', 'पत्ती', 'पत्ता', 'बीमारी', 'कीड़ा', 'रोग',
      'স্ক্যানার', 'স্ক্যান', 'লিফ', 'পাতা', 'রোগ', 'পোকা',
      'plant ko scan karna hai', 'leaf disease check karni hai', 'pata dekhna hai', 'camera'
    ],
    guidance: {
      en: 'Leaf Scanner is now open. Take a clear close-up picture of an affected crop leaf using the camera, or upload a photo from your gallery. Keep the leaf in good lighting. BharatFarm will analyze the image to identify diseases, confidence levels, and organic treatment options.',
      hi: 'लीफ स्कैनर खुल गया है। आप प्रभावित पत्ते की साफ़ तस्वीर कैमरे से ले सकते हैं या गैलरी से फोटो अपलोड कर सकते हैं। पत्ते को साफ़ और अच्छी रोशनी में रखें। BharatFarm तस्वीर का विश्लेषण करके संभावित बीमारी, उसका भरोसा स्तर, उपचार और बचाव की जानकारी देगा।',
      bn: 'লিফ স্ক্যানার খুলে গেছে। আপনি আক্রান্ত পাতার পরিষ্কার ছবি ক্যামেরা দিয়ে তুলতে পারেন অথবা গ্যালারি থেকে ছবি আপলোড করতে পারেন। ভালো আলোতে পাতাটি পরিষ্কারভাবে দেখান। BharatFarm ছবিটি বিশ্লেষণ করে সম্ভাব্য রোগ, নির্ভরযোগ্যতার মাত্রা, চিকিৎসা এবং প্রতিরোধের পরামর্শ দেখাবে।'
    }
  },
  {
    id: 'OPEN_MARKETPLACE',
    route: '/marketplace',
    featureName: {
      en: 'Mandi Marketplace',
      hi: 'मंडी मार्केटप्लेस',
      bn: 'মন্ডি মার্কেটপ্লেস'
    },
    keywords: [
      'marketplace', 'market', 'mandi', 'bazaar', 'buy', 'seeds', 'fertilizer', 'inputs', 'price', 'rate', 'shop', 'store',
      'मार्केटप्लेस', 'मार्केट', 'मंडी', 'बाजार', 'खरीद', 'खाद', 'बीज', 'दाम', 'रेट',
      'মার্কেটপ্লেস', 'মার্কেট', 'মন্ডি', 'বাজার', 'সার', 'বীজ', 'দাম',
      'bazaar kholo', 'mandi rate', 'buy inputs', 'kine'
    ],
    guidance: {
      en: 'Mandi Marketplace is now open. Here you can browse quality crop seeds, bio-fertilizers, organic pesticides, inspect product details, and compare current mandi prices across regional markets.',
      hi: 'मंडी मार्केटप्लेस खुल गया है। यहाँ आप उच्च गुणवत्ता वाले बीज, जैविक खाद, कीटनाशक देख सकते हैं, उत्पाद की जानकारी ले सकते हैं और क्षेत्रीय मंडियों के ताज़ा भावों की तुलना कर सकते हैं।',
      bn: 'মন্ডি মার্কেটপ্লেস খুলে গেছে। এখানে আপনি উন্নত মানের বীজ, জৈব সার, কীটনাশক দেখতে পারেন, পণ্যের বিবরণ জানতে পারেন এবং আঞ্চলিক বাজারের বর্তমান দর তুলনা করতে পারেন।'
    }
  },
  {
    id: 'OPEN_WEATHER',
    route: '/weather',
    featureName: {
      en: 'Weather Intelligence',
      hi: 'मौसम पूर्वाभास',
      bn: 'আবহাওয়া পূর্বাভাস'
    },
    keywords: [
      'weather', 'rain', 'forecast', 'mausam', 'baarish', 'temperature', 'humidity', 'dhoop', 'hawa', 'barsat',
      'मौसम', 'बारिश', 'पूर्वाभास', 'तापमान', 'हवा', 'वर्षा',
      'আবহাওয়া', 'বৃষ্টি', 'পূর্বাভাস', 'তাপমাত্রা',
      'baarish hogi kya', 'mausam kaisa hai', 'weather ta dekhao'
    ],
    guidance: {
      en: 'Weather Intelligence is now open. You can inspect 7-day hyperlocal forecasts, rainfall probability, humidity, wind speeds, and specific irrigation advisories to plan your field operations.',
      hi: 'मौसम पूर्वाभास खुल गया है। यहाँ आप आगामी 7 दिनों का मौसम पूर्वानुमान, बारिश की संभावना, आर्द्रता, हवा की गति और खेत में सिंचाई प्रबंधन के सुझाव देख सकते हैं।',
      bn: 'আবহাওয়া পূর্বাভাস খুলে গেছে। এখানে আপনি ৭ দিনের সঠিক পূর্বাভাস, বৃষ্টির সম্ভাবনা, আর্দ্রতা, বাতাসের গতি এবং সেচ পরিকল্পনা সম্পর্কিত বৈজ্ঞানিক পরামর্শ দেখতে পাবেন।'
    }
  },
  {
    id: 'OPEN_GROUP_BUYING',
    route: '/groupbuying',
    featureName: {
      en: 'Group Buying',
      hi: 'समूह खरीदारी',
      bn: 'গ্রুপ ক্রয়'
    },
    keywords: [
      'group', 'group buying', 'pool', 'bulk', 'together', 'discount', 'samooh', 'khad pool',
      'ग्रुप', 'समूह', 'सस्ता', 'बचत',
      'গ্রুপ', 'একত্রে', 'ছাড়',
      'group buying kholo', 'group khareed'
    ],
    guidance: {
      en: 'Group Buying is now open. Connect with nearby farmers to combine seed and fertilizer orders into bulk pools, unlocking direct manufacturer discounts and lower transportation costs.',
      hi: 'समूह खरीदारी (Group Buying) खुल गया है। आप आसपास के किसानों के साथ मिलकर खाद और बीज के बड़े ऑर्डर दे सकते हैं, जिससे आपको थोक डिस्काउंट और कम डिलीवरी खर्च का लाभ मिलता है।',
      bn: 'গ্রুপ ক্রয় (Group Buying) খুলে গেছে। আশেপাশের কৃষকদের সাথে দলবদ্ধ হয়ে সার ও বীজ অর্ডারে বিশাল ছাড় পান এবং পরিবহন খরচ কমান।'
    }
  },
  {
    id: 'OPEN_SCHEMES',
    route: '/schemes',
    featureName: {
      en: 'Government Schemes',
      hi: 'सरकारी योजनाएं',
      bn: 'সরকারি প্রকল্প'
    },
    keywords: [
      'scheme', 'schemes', 'government', 'sarkari', 'yojana', 'subsidy', 'pm kisan', 'subsidies', 'kisan yojana',
      'योजना', 'सरकारी', 'सब्सिडी', 'स्कीम',
      'প্রকল্প', 'সরকারি', 'ভর্তুকি', 'স্কিম',
      'sarkari yojana dikhao', 'subsidy check'
    ],
    guidance: {
      en: 'Government Schemes portal is now open. Explore state and central agricultural subsidies, eligibility criteria, required documents, and step-by-step application instructions for farmers.',
      hi: 'सरकारी योजनाएं पोर्टल खुल गया है। यहाँ आप केंद्र और राज्य सरकार की कृषि सब्सिडी, पात्रता नियम, आवश्यक दस्तावेज़ और आवेदन करने की पूरी प्रक्रिया देख सकते हैं।',
      bn: 'সরকারি প্রকল্প পোর্টাল খুলে গেছে। এখানে কেন্দ্র ও রাজ্য সরকারের কৃষি ভর্তুকি, যোগ্যতার নিয়মাবলী, প্রয়োজনীয় কাগজপত্র এবং আবেদন নির্দেশিকা বিস্তারিত দেখতে পাবেন।'
    }
  },
  {
    id: 'OPEN_FARM_RECORDS',
    route: '/records',
    featureName: {
      en: 'Farm Records',
      hi: 'फार्म रिकॉर्ड्स',
      bn: 'ফার্ম রেকর্ড'
    },
    keywords: [
      'records', 'record', 'farm records', 'khata', 'hisab', 'bahi', 'expenses', 'yield', 'log',
      'रिकॉर्ड', 'खाता', 'हिसाब', 'खर्च', 'बही',
      'রেকর্ড', 'হিসাব', 'খরচ', 'খাতা',
      'farm khata', 'hisab kitab'
    ],
    guidance: {
      en: 'Farm Records is now open. Track your seasonal crop cultivation history, daily field expenditures, fertilizer logs, harvest yields, and total profit margins.',
      hi: 'फार्म रिकॉर्ड्स खुल गया है। यहाँ आप अपनी फ़सल की खेती का इतिहास, दैनिक खर्च, खाद-बीज का ब्योरा, उपज और कुल मुनाफ़ा आसानी से दर्ज और ट्रैक कर सकते हैं।',
      bn: 'ফার্ম রেকর্ড খুলে গেছে। আপনার ফসলের চাষের ইতিহাস, দৈনন্দিন খরচ, সার-বীজের রেকর্ড এবং মোট মুনাফার হিসাব এখানে পরিচালনা করুন।'
    }
  },
  {
    id: 'OPEN_CALCULATOR',
    route: '/calculator',
    featureName: {
      en: 'Farm Calculator',
      hi: 'कृषि कैलकुलेटर',
      bn: 'ফার্ম ক্যালকুলেটর'
    },
    keywords: [
      'calculator', 'calculate', 'ganana', 'hisab', 'dosage', 'quantity', 'npk calculator',
      'कैलकुलेटर', 'गणना', 'मात्रा', 'हिसाब',
      'ক্যালকুলেটর', 'হিসাব', 'পরিমাণ',
      'fertilizer dosage', 'khad kitna lagega'
    ],
    guidance: {
      en: 'Farm Calculator is now open. Enter your plot size in acres or bighas to instantly calculate exact recommended dosages for NPK fertilizers, seed rate requirements, and estimated water volume.',
      hi: 'कृषि कैलकुलेटर खुल गया है। अपनी ज़मीन का क्षेत्रफल (एकड़/बीघा) दर्ज करें और NPK खाद की सटीक मात्रा, आवश्यक बीज दर और पानी की आवश्यकता की तुरंत गणना करें।',
      bn: 'ফার্ম ক্যালকুলেটর খুলে গেছে। জমির পরিমাণ লিখে সঠিক সার (NPK) প্রয়োগের পরিমাণ, বীজের পরিমাণ এবং প্রয়োজনীয় জলের হিসাব নিমিষেই বের করুন।'
    }
  },
  {
    id: 'OPEN_LOAN',
    route: '/loan-eligibility',
    featureName: {
      en: 'Loan Eligibility',
      hi: 'ऋण पात्रता',
      bn: 'ঋণ যোগ্যতা'
    },
    keywords: [
      'loan', 'credit', 'kcc', 'kisan credit card', 'kist', 'bank', 'bina byaj', 'rin',
      'ऋण', 'लोन', 'क्रेडिट', 'केसीसी', 'बैंक',
      'ঋণ', 'লোন', 'ক্রেডিট', 'কেসিসি',
      'kisan credit card check', 'loan milega kya'
    ],
    guidance: {
      en: 'Loan Eligibility checker is now open. Evaluate your Kisan Credit Card (KCC) limit, low-interest agricultural credit options, required land records, and bank partner guidelines.',
      hi: 'ऋण पात्रता जाँच केंद्र खुल गया है। यहाँ अपने किसान क्रेडिट कार्ड (KCC) की सीमा, कम ब्याज दर वाले कृषि ऋण और बैंक प्रक्रिया की जानकारी प्राप्त करें।',
      bn: 'ঋণ যোগ্যতা মূল্যায়ন কেন্দ্র খুলে গেছে। আপনার কিষাণ ক্রেডিট কার্ড (KCC) সীমা, স্বল্প সুদের কৃষি ঋণ এবং ব্যাংকের বিবরণ যাচাই করুন।'
    }
  },
  {
    id: 'OPEN_ORDERS',
    route: '/orders',
    featureName: {
      en: 'Orders & Delivery',
      hi: 'ऑर्डर और डिलीवरी',
      bn: 'অর্ডার ও ডেলিভারি'
    },
    keywords: [
      'orders', 'order', 'delivery', 'tracking', 'dispatch', 'khareed', 'saman',
      'ऑर्डर', 'डिलीवरी', 'ट्रैकिंग', 'सामान',
      'অর্ডার', 'ডেলিভারি', 'ট্র্যাকিং', 'সামান',
      'mera order', 'delivery kab aayegi'
    ],
    guidance: {
      en: 'Orders & Delivery status is now open. View active dispatches for seeds and agricultural inputs, track estimated arrival times, and inspect order invoices.',
      hi: 'ऑर्डर और डिलीवरी स्टेटस खुल गया है। यहाँ अपने बीज और कृषि इनपुट के ऑर्डर का लाइव स्टेटस, डिलीवरी का समय और इनवॉइस देखें।',
      bn: 'অর্ডার ও ডেলিভারি স্ট্যাটাস খুলে গেছে। আপনার সার ও বীজ অর্ডারের লাইভ ট্র্যাকিং ও ডেলিভারির সময়সূচী দেখতে পাবেন।'
    }
  },
  {
    id: 'OPEN_PROFILE',
    route: '/profile',
    featureName: {
      en: 'Profile & Settings',
      hi: 'प्रोफ़ाइल और सेटिंग्स',
      bn: 'প্রোফাইল ও সেটিংস'
    },
    keywords: [
      'profile', 'settings', 'account', 'user', 'language', 'bhasha', 'naam', 'location',
      'प्रोफ़ाइल', 'सेटिंग्स', 'अकाउंट', 'भाषा', 'नाम',
      'প্রোফাইল', 'সেটিংস', 'অ্যাকাউন্ট', 'ভাষা', 'নাম',
      'my profile', 'change language'
    ],
    guidance: {
      en: 'Profile & Settings is now open. Manage your personal farmer profile, registered land location, preferred regional language, and security preferences.',
      hi: 'प्रोफ़ाइल और सेटिंग्स खुल गई हैं। अपनी व्यक्तिगत जानकारी, खेत का पता, पसंदीदा भाषा और खाता सुरक्षा प्रबंधित करें।',
      bn: 'প্রোফাইল ও সেটিংস খুলে গেছে। আপনার ব্যক্তিগত তথ্য, খামারের অবস্থান, পছন্দের ভাষা এবং সেটিংস আপডেট করুন।'
    }
  },
  {
    id: 'OPEN_SAHAYAK',
    route: '/sahayak',
    featureName: {
      en: 'Sahayak Assistance',
      hi: 'सहायक केंद्र',
      bn: 'সহায়ক সহায়তা'
    },
    keywords: [
      'sahayak', 'helper', 'assistance', 'agent', 'help desk', 'sahayata', 'madad',
      'सहायक', 'सहायता', 'मदद', 'हेल्पर',
      'সহায়ক', 'সাহায্য', 'সহায়তা', 'হেল্পার',
      'sahayak chahiye', 'help me use app'
    ],
    guidance: {
      en: 'Sahayak Assistance is now open. Sahayak connects farmers who need extra digital support with verified local helpers. Learn how to use services or book assisted digital farming appointments.',
      hi: 'सहायक सहायता केंद्र खुल गया है। सहायक उन किसानों की मदद करता है जिन्हें BharatFarm इस्तेमाल करने में सहायता चाहिए। आप सुविधाओं को समझ सकते हैं और सत्यापित स्थानीय सहायक से संपर्क कर सकते हैं।',
      bn: 'সহায়ক সহায়তা কেন্দ্র খুলে গেছে। সহায়ক সেই কৃষকদের সাহায্য করে যাদের অ্যাপ ব্যবহারে সহায়তা প্রয়োজন। যাচাইকৃত স্থানীয় সহায়কের মাধ্যমে সেবা নিন।'
    }
  },
  {
    id: 'OPEN_KRISHIBOT',
    route: '/krishibot',
    featureName: {
      en: 'KrishiBot AI Chat',
      hi: 'कृषिबॉट एआई चैट',
      bn: 'কৃষিবট এআই চ্যাট'
    },
    keywords: [
      'krishibot', 'bot', 'chat', 'chatbot', 'ai advisor', 'salahkar', 'baat karo',
      'कृषिबॉट', 'बॉट', 'चैट', 'सलाहकार',
      'কৃষিবট', 'বট', 'চ্যাট', 'উপদেষ্টা',
      'ask bot', 'talk to bot'
    ],
    guidance: {
      en: 'KrishiBot AI Advisory Chat is now open. Type or speak any detailed question regarding crop management, pest diagnostics, fertilizer doses, or government farming subsidies.',
      hi: 'कृषिबॉट एआई चैट केंद्र खुल गया है। फसल प्रबंधन, कीट नियंत्रण, खाद की खुराक या सरकारी योजनाओं के बारे में कोई भी सवाल टाइप करें या पूछें।',
      bn: 'কৃষিবট এআই চ্যাট কেন্দ্র খুলে গেছে। ফসল ব্যবস্থাপনা, পোকা দমন, সারের পরিমাণ বা সরকারি স্কিম সম্পর্কিত যেকোনো প্রশ্ন এখানে সরাসরি জিজ্ঞাসা করুন।'
    }
  }
];

// Sensitive keywords requiring manual farmer action
export const SENSITIVE_KEYWORDS = [
  'pay', 'payment', 'buy now', 'confirm order', 'transfer', 'submitting form', 'checkout', 'apply now',
  'भुगतान', 'खरीदें', 'ऑर्डर दें', 'पैसे', 'पेमेंट',
  'টাকা', 'পেমেন্ট', 'অর্ডার করুন', 'আবেদন করুন'
];

/** Standard clarification prompts in all 3 languages */
export const CLARIFICATION_PROMPTS = {
  en: "I didn't fully understand. Do you want to open a feature (like Scanner, Marketplace, or Weather), ask about your crop health, check rainfall, or get farming advice?",
  hi: "मैं पूरी तरह समझ नहीं पाया। क्या आप कोई फ़ीचर (जैसे लीफ़ स्कैनर, मार्केटप्लेस या मौसम) खोलना चाहते हैं, अपनी फ़सल की सेहत या बारिश के बारे में पूछना चाहते हैं?",
  bn: "আমি পুরোপুরি বুঝতে পারিনি। আপনি কি কোনো ফিচার (যেমন লিফ স্ক্যানার, মার্কেটপ্লেস বা আবহাওয়া) খুলতে চান, নাকি ফসল ও বৃষ্টির বিবরণ জানতে চান?"
};
