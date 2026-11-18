import type { MandiPriceRecord } from '../services/mandiPrice.service.js';

/**
 * Historical official AGMARKNET mandi records archive for West Bengal markets.
 * Retains records from yesterday (17/11/2026) and 2 days ago (16/11/2026)
 * so farmers can access the latest available official price even when a mandi has not yet submitted today's log.
 */
export const HISTORICAL_MANDI_RECORDS: MandiPriceRecord[] = [
  // ── Purba Medinipur ──
  {
    state: 'West Bengal',
    district: 'Purba Medinipur',
    market: 'Haldia APMC',
    commodity: 'Potato',
    variety: 'Jyoti',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 2100,
    maxPrice: 2350,
    modalPrice: 2250,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Purba Medinipur',
    market: 'Haldia APMC',
    commodity: 'Paddy(Common)',
    variety: 'Common',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 2280,
    maxPrice: 2380,
    modalPrice: 2320,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Purba Medinipur',
    market: 'Haldia APMC',
    commodity: 'Tomato',
    variety: 'Hybrid',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 2900,
    maxPrice: 3400,
    modalPrice: 3150,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Purba Medinipur',
    market: 'Contai Mandi',
    commodity: 'Potato',
    variety: 'Deshi',
    grade: 'FAQ',
    arrivalDate: '16/11/2026',
    minPrice: 2000,
    maxPrice: 2250,
    modalPrice: 2150,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Purba Medinipur',
    market: 'Contai Mandi',
    commodity: 'Paddy(Common)',
    variety: 'Common',
    grade: 'FAQ',
    arrivalDate: '16/11/2026',
    minPrice: 2240,
    maxPrice: 2340,
    modalPrice: 2290,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Purba Medinipur',
    market: 'Tamluk APMC',
    commodity: 'Banana',
    variety: 'Singapuri',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 2100,
    maxPrice: 2500,
    modalPrice: 2300,
    suspicious: false
  },

  // ── Hooghly ──
  {
    state: 'West Bengal',
    district: 'Hooghly',
    market: 'Sheoraphuly APMC',
    commodity: 'Potato',
    variety: 'Jyoti',
    grade: 'Grade A',
    arrivalDate: '17/11/2026',
    minPrice: 2350,
    maxPrice: 2550,
    modalPrice: 2450,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Hooghly',
    market: 'Sheoraphuly APMC',
    commodity: 'Cauliflower',
    variety: 'Local',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 2600,
    maxPrice: 3100,
    modalPrice: 2850,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Hooghly',
    market: 'Sheoraphuly APMC',
    commodity: 'Cabbage',
    variety: 'Local',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 1750,
    maxPrice: 2100,
    modalPrice: 1950,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Hooghly',
    market: 'Pandua Mandi',
    commodity: 'Potato',
    variety: 'Jyoti',
    grade: 'FAQ',
    arrivalDate: '16/11/2026',
    minPrice: 2250,
    maxPrice: 2450,
    modalPrice: 2350,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Hooghly',
    market: 'Pandua Mandi',
    commodity: 'Paddy(Common)',
    variety: 'Common',
    grade: 'FAQ',
    arrivalDate: '16/11/2026',
    minPrice: 2260,
    maxPrice: 2360,
    modalPrice: 2310,
    suspicious: false
  },

  // ── Purba Bardhaman ──
  {
    state: 'West Bengal',
    district: 'Purba Bardhaman',
    market: 'Burdwan APMC',
    commodity: 'Rice',
    variety: 'Minikit',
    grade: 'Grade A',
    arrivalDate: '17/11/2026',
    minPrice: 3600,
    maxPrice: 4100,
    modalPrice: 3850,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Purba Bardhaman',
    market: 'Burdwan APMC',
    commodity: 'Paddy(Common)',
    variety: 'Swarna',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 2300,
    maxPrice: 2420,
    modalPrice: 2360,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Purba Bardhaman',
    market: 'Burdwan APMC',
    commodity: 'Mustard',
    variety: 'Yellow',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 5400,
    maxPrice: 5850,
    modalPrice: 5650,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Purba Bardhaman',
    market: 'Kalna APMC',
    commodity: 'Jute',
    variety: 'TD-5',
    grade: 'FAQ',
    arrivalDate: '16/11/2026',
    minPrice: 5900,
    maxPrice: 6300,
    modalPrice: 6100,
    suspicious: false
  },

  // ── Paschim Medinipur ──
  {
    state: 'West Bengal',
    district: 'Paschim Medinipur',
    market: 'Medinipur APMC',
    commodity: 'Potato',
    variety: 'Jyoti',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 2150,
    maxPrice: 2380,
    modalPrice: 2280,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Paschim Medinipur',
    market: 'Medinipur APMC',
    commodity: 'Mustard',
    variety: 'Common',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 5200,
    maxPrice: 5650,
    modalPrice: 5450,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Paschim Medinipur',
    market: 'Kharagpur Mandi',
    commodity: 'Tomato',
    variety: 'Deshi',
    grade: 'FAQ',
    arrivalDate: '16/11/2026',
    minPrice: 2800,
    maxPrice: 3250,
    modalPrice: 3000,
    suspicious: false
  },

  // ── Bankura ──
  {
    state: 'West Bengal',
    district: 'Bankura',
    market: 'Bankura APMC',
    commodity: 'Mustard',
    variety: 'Local',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 5300,
    maxPrice: 5700,
    modalPrice: 5500,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Bankura',
    market: 'Bankura APMC',
    commodity: 'Potato',
    variety: 'Jyoti',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 2050,
    maxPrice: 2250,
    modalPrice: 2180,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Bankura',
    market: 'Bishnupur Mandi',
    commodity: 'Paddy(Common)',
    variety: 'Common',
    grade: 'FAQ',
    arrivalDate: '16/11/2026',
    minPrice: 2240,
    maxPrice: 2340,
    modalPrice: 2290,
    suspicious: false
  },

  // ── Nadia ──
  {
    state: 'West Bengal',
    district: 'Nadia',
    market: 'Krishnanagar APMC',
    commodity: 'Jute',
    variety: 'TD-5',
    grade: 'Grade A',
    arrivalDate: '17/11/2026',
    minPrice: 6050,
    maxPrice: 6400,
    modalPrice: 6220,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Nadia',
    market: 'Krishnanagar APMC',
    commodity: 'Cauliflower',
    variety: 'Local',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 2500,
    maxPrice: 2950,
    modalPrice: 2750,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Nadia',
    market: 'Ranaghat Mandi',
    commodity: 'Cabbage',
    variety: 'Local',
    grade: 'FAQ',
    arrivalDate: '16/11/2026',
    minPrice: 1700,
    maxPrice: 2000,
    modalPrice: 1850,
    suspicious: false
  },

  // ── Murshidabad ──
  {
    state: 'West Bengal',
    district: 'Murshidabad',
    market: 'Berhampore APMC',
    commodity: 'Jute',
    variety: 'TD-5',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 5950,
    maxPrice: 6350,
    modalPrice: 6150,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Murshidabad',
    market: 'Berhampore APMC',
    commodity: 'Wheat',
    variety: 'Sharbati',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 2500,
    maxPrice: 2750,
    modalPrice: 2620,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Murshidabad',
    market: 'Jiaganj APMC',
    commodity: 'Onion',
    variety: 'Nasik Red',
    grade: 'FAQ',
    arrivalDate: '16/11/2026',
    minPrice: 3900,
    maxPrice: 4450,
    modalPrice: 4200,
    suspicious: false
  },

  // ── Malda ──
  {
    state: 'West Bengal',
    district: 'Malda',
    market: 'Malda APMC',
    commodity: 'Jute',
    variety: 'TD-5',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 5900,
    maxPrice: 6250,
    modalPrice: 6080,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Malda',
    market: 'Malda APMC',
    commodity: 'Wheat',
    variety: 'Kalyan Sona',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 2450,
    maxPrice: 2680,
    modalPrice: 2560,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Malda',
    market: 'Samsi APMC',
    commodity: 'Potato',
    variety: 'Jyoti',
    grade: 'FAQ',
    arrivalDate: '16/11/2026',
    minPrice: 2100,
    maxPrice: 2300,
    modalPrice: 2200,
    suspicious: false
  },

  // ── North 24 Parganas ──
  {
    state: 'West Bengal',
    district: 'North 24 Parganas',
    market: 'Barasat APMC',
    commodity: 'Jute',
    variety: 'TD-5',
    grade: 'Grade A',
    arrivalDate: '17/11/2026',
    minPrice: 6100,
    maxPrice: 6450,
    modalPrice: 6280,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'North 24 Parganas',
    market: 'Barasat APMC',
    commodity: 'Pointed gourd(Parval)',
    variety: 'Local',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 3500,
    maxPrice: 4100,
    modalPrice: 3820,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'North 24 Parganas',
    market: 'Habra Mandi',
    commodity: 'Green Chilli',
    variety: 'Bullet',
    grade: 'FAQ',
    arrivalDate: '16/11/2026',
    minPrice: 4200,
    maxPrice: 4950,
    modalPrice: 4600,
    suspicious: false
  },

  // ── South 24 Parganas ──
  {
    state: 'West Bengal',
    district: 'South 24 Parganas',
    market: 'Diamond Harbour APMC',
    commodity: 'Tomato',
    variety: 'Hybrid',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 3000,
    maxPrice: 3450,
    modalPrice: 3220,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'South 24 Parganas',
    market: 'Baruipur Mandi',
    commodity: 'Brinjal',
    variety: 'Muktakeshi',
    grade: 'Grade A',
    arrivalDate: '16/11/2026',
    minPrice: 3400,
    maxPrice: 3900,
    modalPrice: 3680,
    suspicious: false
  },

  // ── Kolkata ──
  {
    state: 'West Bengal',
    district: 'Kolkata',
    market: 'Kolkata Koley Market',
    commodity: 'Potato',
    variety: 'Jyoti',
    grade: 'Grade A',
    arrivalDate: '17/11/2026',
    minPrice: 2350,
    maxPrice: 2600,
    modalPrice: 2480,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Kolkata',
    market: 'Kolkata Koley Market',
    commodity: 'Onion',
    variety: 'Red',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 4100,
    maxPrice: 4600,
    modalPrice: 4350,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Kolkata',
    market: 'Kolkata Koley Market',
    commodity: 'Tomato',
    variety: 'Hybrid',
    grade: 'Grade A',
    arrivalDate: '17/11/2026',
    minPrice: 3100,
    maxPrice: 3550,
    modalPrice: 3340,
    suspicious: false
  },

  // ── Howrah ──
  {
    state: 'West Bengal',
    district: 'Howrah',
    market: 'Howrah (Station Market)',
    commodity: 'Onion',
    variety: 'Red',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 4050,
    maxPrice: 4500,
    modalPrice: 4280,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Howrah',
    market: 'Uluberia APMC',
    commodity: 'Paddy(Common)',
    variety: 'Common',
    grade: 'FAQ',
    arrivalDate: '16/11/2026',
    minPrice: 2270,
    maxPrice: 2370,
    modalPrice: 2320,
    suspicious: false
  },

  // ── Cooch Behar ──
  {
    state: 'West Bengal',
    district: 'Cooch Behar',
    market: 'Cooch Behar APMC',
    commodity: 'Jute',
    variety: 'TD-5',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 5800,
    maxPrice: 6150,
    modalPrice: 5980,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Cooch Behar',
    market: 'Cooch Behar APMC',
    commodity: 'Tobacco',
    variety: 'Motihari',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 16500,
    maxPrice: 19500,
    modalPrice: 18000,
    suspicious: false
  },
  {
    state: 'West Bengal',
    district: 'Cooch Behar',
    market: 'Dinhata APMC',
    commodity: 'Tomato',
    variety: 'Local',
    grade: 'FAQ',
    arrivalDate: '16/11/2026',
    minPrice: 2650,
    maxPrice: 3050,
    modalPrice: 2840,
    suspicious: false
  },

  // ── Jalpaiguri ──
  {
    state: 'West Bengal',
    district: 'Jalpaiguri',
    market: 'Jalpaiguri APMC',
    commodity: 'Ginger(Green)',
    variety: 'Local',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 7800,
    maxPrice: 8650,
    modalPrice: 8250,
    suspicious: false
  },

  // ── Alipurduar ──
  {
    state: 'West Bengal',
    district: 'Alipurduar',
    market: 'Alipurduar APMC',
    commodity: 'Mustard',
    variety: 'Local',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 5200,
    maxPrice: 5600,
    modalPrice: 5400,
    suspicious: false
  },

  // ── Dakshin Dinajpur ──
  {
    state: 'West Bengal',
    district: 'Dakshin Dinajpur',
    market: 'Balurghat APMC',
    commodity: 'Jute',
    variety: 'TD-5',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 5850,
    maxPrice: 6200,
    modalPrice: 6020,
    suspicious: false
  },

  // ── Purulia ──
  {
    state: 'West Bengal',
    district: 'Purulia',
    market: 'Purulia APMC',
    commodity: 'Maize',
    variety: 'Yellow Hybrid',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 2050,
    maxPrice: 2320,
    modalPrice: 2190,
    suspicious: false
  },

  // ── Kalimpong ──
  {
    state: 'West Bengal',
    district: 'Kalimpong',
    market: 'Kalimpong Mandi',
    commodity: 'Ginger(Green)',
    variety: 'Hill Organic',
    grade: 'Grade A',
    arrivalDate: '17/11/2026',
    minPrice: 8200,
    maxPrice: 9100,
    modalPrice: 8650,
    suspicious: false
  },

  // ── Paschim Bardhaman ──
  {
    state: 'West Bengal',
    district: 'Paschim Bardhaman',
    market: 'Asansol APMC',
    commodity: 'Tomato',
    variety: 'Hybrid',
    grade: 'FAQ',
    arrivalDate: '17/11/2026',
    minPrice: 3000,
    maxPrice: 3400,
    modalPrice: 3180,
    suspicious: false
  }
];
