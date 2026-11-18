import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { LiveMandiPriceRecord } from '../smartMandi.service.js';

export const WEST_BENGAL_DISTRICTS: string[] = [
  'Alipurduar',
  'Bankura',
  'Birbhum',
  'Cooch Behar',
  'Dakshin Dinajpur',
  'Darjeeling',
  'Hooghly',
  'Howrah',
  'Jalpaiguri',
  'Jhargram',
  'Kalimpong',
  'Kolkata',
  'Malda',
  'Murshidabad',
  'Nadia',
  'North 24 Parganas',
  'Paschim Bardhaman',
  'Paschim Medinipur',
  'Purba Bardhaman',
  'Purba Medinipur',
  'Purulia',
  'South 24 Parganas',
  'Uttar Dinajpur'
];

export const ALL_COMMODITIES_BY_CATEGORY: Record<string, string[]> = {
  'Vegetables': [
    'Potato', 'Tomato', 'Onion', 'Brinjal', 'Cabbage', 'Cauliflower', 'Carrot', 'Radish',
    'Okra / Bhindi (Ladies Finger)', 'Green Chilli', 'Capsicum', 'Spinach (Palak)',
    'Bitter Gourd (Karela)', 'Bottle Gourd (Lauki)', 'Ridge Gourd', 'Snake Gourd', 'Ash Gourd',
    'Pointed Gourd (Parval)', 'Little Gourd (Kundru)', 'Squash (Chappal Kadoo)', 'Cucumber (Kheera)',
    'Pumpkin / Sweet Pumpkin', 'Sweet Potato', 'Beetroot', 'Turnip', 'Drumstick (Moringa)',
    'Peas (Matar)', 'Beans', 'Cluster Beans', 'Colocasia / Taro', 'Yam'
  ],
  'Grains, Cereals & Millets': [
    'Rice', 'Paddy (Dhan)', 'Wheat (Gehun)', 'Maize (Makka)', 'Bajra (Pearl Millet)',
    'Jowar (Sorghum)', 'Ragi (Finger Millet)', 'Barley (Jau)', 'Oats', 'Foxtail Millet',
    'Barnyard Millet', 'Kodo Millet', 'Little Millet', 'Proso Millet'
  ],
  'Pulses & Dals': [
    'Gram / Chana (Bengal Gram)', 'Arhar / Tur Dal (Pigeon Pea)', 'Moong Dal (Green Gram)',
    'Urad Dal (Black Gram)', 'Masur Dal (Lentil)', 'Rajma (Kidney Beans)', 'Soybean',
    'Cowpea (Lobia)', 'Horse Gram (Kulthi)', 'Moth Bean'
  ],
  'Oilseeds': [
    'Mustard (Sarson)', 'Groundnut (Peanut)', 'Sesame (Til)', 'Sunflower', 'Safflower',
    'Castor Seed', 'Linseed (Alsi)', 'Niger Seed'
  ],
  'Cash & Commercial Crops': [
    'Jute (Pat)', 'Cotton (Kapas)', 'Sugarcane (Ganna)', 'Tea', 'Coffee', 'Tobacco', 'Rubber'
  ],
  'Spices & Condiments': [
    'Ginger (Green / Adrak)', 'Garlic (Lahsun)', 'Turmeric (Haldi)', 'Coriander (Dhaniya)',
    'Cumin (Jeera)', 'Black Pepper (Kali Mirch)', 'Cardamom (Elaichi)', 'Fennel (Saunf)',
    'Fenugreek (Methi)', 'Ajwain', 'Clove (Laung)', 'Cinnamon (Dalchini)'
  ],
  'Fruits': [
    'Banana (Kela)', 'Mango (Aam)', 'Apple (Seb)', 'Orange (Santra)', 'Grapes (Angoor)',
    'Guava (Amrood)', 'Papaya (Papita)', 'Pomegranate (Anar)', 'Coconut (Nariyal)',
    'Pineapple (Ananas)', 'Watermelon (Tarbooj)', 'Muskmelon (Kharbooja)', 'Jackfruit (Kathal)',
    'Lemon (Nimbu)', 'Sweet Lime (Mosambi)', 'Lychee', 'Sapota (Chiku)', 'Custard Apple (Sharifa)'
  ]
};

// Flatten and deduplicate every single commodity
export const ALL_COMMODITY_OPTIONS: string[] = Array.from(
  new Set(Object.values(ALL_COMMODITIES_BY_CATEGORY).flat())
).sort((a, b) => a.localeCompare(b, 'en-IN'));

export const POPULAR_CROPS = [
  { name: 'Potato', icon: '🥔' },
  { name: 'Tomato', icon: '🍅' },
  { name: 'Rice', icon: '🍚' },
  { name: 'Wheat (Gehun)', icon: '🌾' },
  { name: 'Carrot', icon: '🥕' },
  { name: 'Brinjal', icon: '🍆' },
  { name: 'Onion', icon: '🧅' },
  { name: 'Mustard (Sarson)', icon: '🌻' },
  { name: 'Jute (Pat)', icon: '🌿' },
  { name: 'Cauliflower', icon: '🥦' },
  { name: 'Cabbage', icon: '🥬' },
  { name: 'Green Chilli', icon: '🌶️' }
];

export interface RankedMandiRow {
  rank: number;
  market: string;
  district: string;
  commodity: string;
  variety: string;
  grade: string;
  varietyLabel: string;
  minPrice: number | null;
  maxPrice: number | null;
  modalPrice: number | null;
  arrivalDate: string;
  dateRelativeLabel: string;
  isToday: boolean;
  isBestPrice: boolean;
}

export interface RankedMandisOutput {
  rows: RankedMandiRow[];
  searchedCrop: string;
  searchedDistrict: string;
  todayDate: string;
  isTodayData: boolean;
  latestDate: string;
  relativeDateLabel: string;
  noticeType: 'today' | 'yesterday' | 'past' | 'neighboring' | 'empty';
  noticeMessage: string;
}

export function parseArrivalTimestamp(dateStr?: string | null): number {
  if (!dateStr) return 0;
  const parts = dateStr.trim().split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return Date.UTC(year, month, day);
    }
  }
  const fallback = Date.parse(dateStr);
  return isNaN(fallback) ? 0 : fallback;
}

export function formatPriceCurrency(price: number | null): string {
  if (price === null || price === undefined || isNaN(price)) return '—';
  return `₹${price.toLocaleString('en-IN')}/Quintal`;
}

export function normalizeText(val: unknown): string {
  return String(val ?? '').trim().toLowerCase();
}

/**
 * Calculates date difference relative to today reference string.
 */
export function describeDateRelative(dateStr: string, todayStr = '18/11/2026'): { label: string; daysAgo: number; isToday: boolean } {
  const targetTs = parseArrivalTimestamp(dateStr);
  const todayTs = parseArrivalTimestamp(todayStr);
  if (!targetTs || !todayTs) {
    return { label: dateStr || '—', daysAgo: 0, isToday: false };
  }
  const diffDays = Math.round((todayTs - targetTs) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) {
    return { label: 'Today', daysAgo: 0, isToday: true };
  }
  if (diffDays === 1) {
    return { label: 'Yesterday', daysAgo: 1, isToday: false };
  }
  if (diffDays === 2) {
    return { label: '2 days ago', daysAgo: 2, isToday: false };
  }
  return { label: `${diffDays} days ago`, daysAgo: diffDays, isToday: false };
}

/**
 * Robust matching between user search/selected commodity and AGMARKNET record commodity.
 */
export function matchCropName(recordCommodity: string, searchCrop: string): boolean {
  const normRec = normalizeText(recordCommodity);
  const normSearch = normalizeText(searchCrop);

  if (normRec === normSearch) return true;

  // Clean out parenthesis and slashes, e.g. "Wheat (Gehun)" -> "wheat"
  const cleanSearch = normSearch.split(/[\(\/]/)[0].trim();
  const cleanRec = normRec.split(/[\(\/]/)[0].trim();

  if (cleanRec && cleanSearch) {
    if (cleanRec === cleanSearch) return true;
    if (cleanRec.includes(cleanSearch) || cleanSearch.includes(cleanRec)) return true;
  }

  // Cross-word token overlap
  const searchWords = normSearch.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
  for (const w of searchWords) {
    if (normRec.includes(w)) return true;
  }

  return false;
}

/**
 * Filter, group by market (latest date), handle varieties transparently, and rank by modal price descending.
 * Also computes whether today's data was present or fallback to yesterday / 2 days ago / past dates.
 */
export function rankMandisForCrop(
  records: LiveMandiPriceRecord[],
  crop: string,
  district: string,
  todayDateStr = '18/11/2026'
): RankedMandisOutput {
  const normCrop = normalizeText(crop);
  const normDistrict = normalizeText(district);

  if (!normCrop) {
    return {
      rows: [],
      searchedCrop: crop,
      searchedDistrict: district,
      todayDate: todayDateStr,
      isTodayData: false,
      latestDate: '',
      relativeDateLabel: '',
      noticeType: 'empty',
      noticeMessage: 'Please select or search for a crop.'
    };
  }

  // 1. Filter all records matching this crop across entire state
  const cropRecordsAllState = records.filter(r => matchCropName(r.commodity, crop));

  if (cropRecordsAllState.length === 0) {
    return {
      rows: [],
      searchedCrop: crop,
      searchedDistrict: district,
      todayDate: todayDateStr,
      isTodayData: false,
      latestDate: '',
      relativeDateLabel: '',
      noticeType: 'empty',
      noticeMessage: `No official AGMARKNET records found for ${crop} in West Bengal mandis on or prior to ${todayDateStr}. Mandi prices update daily when APMC markets submit auction logs.`
    };
  }

  // 2. Check records specifically in chosen district (if a district was selected)
  const isDistrictSpecific = Boolean(normDistrict && normDistrict !== 'all');
  const cropRecordsInDistrict = isDistrictSpecific
    ? cropRecordsAllState.filter(r => normalizeText(r.district) === normDistrict)
    : cropRecordsAllState;

  let activeRecords: LiveMandiPriceRecord[] = [];
  let isNeighboringFallback = false;

  if (isDistrictSpecific && cropRecordsInDistrict.length === 0) {
    // No records in chosen district, fallback to neighboring West Bengal mandis
    activeRecords = cropRecordsAllState;
    isNeighboringFallback = true;
  } else {
    activeRecords = cropRecordsInDistrict;
  }

  // 3. Find the latest available reporting date in the active records
  const timestamps = activeRecords.map(r => parseArrivalTimestamp(r.arrivalDate)).filter(ts => ts > 0);
  const maxTimestamp = timestamps.length > 0 ? Math.max(...timestamps) : 0;

  // Find the string representation corresponding to maxTimestamp
  const latestDateRecord = activeRecords.find(r => parseArrivalTimestamp(r.arrivalDate) === maxTimestamp);
  const latestDateStr = latestDateRecord?.arrivalDate || todayDateStr;

  const dateRelative = describeDateRelative(latestDateStr, todayDateStr);
  const isTodayData = dateRelative.isToday;

  // 4. Group by market to find the latest available reporting date for each market
  const marketLatestDate = new Map<string, number>();
  for (const r of activeRecords) {
    const mKey = normalizeText(r.market);
    const ts = parseArrivalTimestamp(r.arrivalDate);
    const curr = marketLatestDate.get(mKey) || 0;
    if (ts > curr) {
      marketLatestDate.set(mKey, ts);
    }
  }

  // 5. Keep records from each market's latest date
  const latestDateRecords = activeRecords.filter(r => {
    const mKey = normalizeText(r.market);
    const latestTs = marketLatestDate.get(mKey) || 0;
    return parseArrivalTimestamp(r.arrivalDate) === latestTs;
  });

  // 6. Handle varieties transparently:
  // If multiple varieties exist for the same market on the same date, preserve each variety separately.
  // Group by (market + variety + grade) so unrelated varieties are never silently mixed or averaged.
  const transparentMap = new Map<string, LiveMandiPriceRecord>();
  for (const r of latestDateRecords) {
    const key = `${normalizeText(r.market)}|${normalizeText(r.variety)}|${normalizeText(r.grade)}`;
    const existing = transparentMap.get(key);
    if (!existing || (r.modalPrice ?? -1) > (existing.modalPrice ?? -1)) {
      transparentMap.set(key, r);
    }
  }

  // 7. Sort by Modal Price descending
  const sorted = Array.from(transparentMap.values()).sort(
    (a, b) => (b.modalPrice ?? -1) - (a.modalPrice ?? -1)
  );

  const highestModalPrice = sorted.length > 0 ? (sorted[0].modalPrice ?? -1) : -1;

  // 8. Map to RankedMandiRow
  const rows: RankedMandiRow[] = sorted.map((r, index) => {
    const varietyParts = [
      r.variety && r.variety !== '—' && r.variety !== 'Other' ? r.variety : null,
      r.grade && r.grade !== '—' && r.grade !== 'FAQ' ? `Grade: ${r.grade}` : (r.grade === 'FAQ' ? 'FAQ Grade' : null)
    ].filter(Boolean);

    const varietyLabel = varietyParts.length > 0 ? varietyParts.join(' · ') : 'Standard Variety';
    const isBest = index === 0 && highestModalPrice > 0;
    const rowDateRel = describeDateRelative(r.arrivalDate, todayDateStr);

    return {
      rank: index + 1,
      market: r.market,
      district: r.district,
      commodity: r.commodity,
      variety: r.variety,
      grade: r.grade,
      varietyLabel,
      minPrice: r.minPrice,
      maxPrice: r.maxPrice,
      modalPrice: r.modalPrice,
      arrivalDate: r.arrivalDate,
      dateRelativeLabel: rowDateRel.label,
      isToday: rowDateRel.isToday,
      isBestPrice: isBest
    };
  });

  // 9. Build user notification message mentioning date and status
  let noticeType: RankedMandisOutput['noticeType'] = 'today';
  let noticeMessage = '';

  if (isNeighboringFallback) {
    noticeType = 'neighboring';
    noticeMessage = `Today's data (${todayDateStr}) is not reported for ${crop} in ${district}. Showing latest available official AGMARKNET prices from neighboring West Bengal mandis reported on ${latestDateStr} (${dateRelative.label}).`;
  } else if (!isTodayData) {
    noticeType = dateRelative.daysAgo === 1 ? 'yesterday' : 'past';
    noticeMessage = `Today's data (${todayDateStr}) has not been reported yet for ${crop}${isDistrictSpecific ? ` in ${district}` : ' in these mandis'}. Showing the latest available official AGMARKNET record from ${dateRelative.label.toLowerCase()} (${latestDateStr}).`;
  } else {
    noticeType = 'today';
    noticeMessage = `Showing official mandi prices reported TODAY (${todayDateStr})${isDistrictSpecific ? ` for ${district}` : ' across West Bengal'}.`;
  }

  return {
    rows,
    searchedCrop: crop,
    searchedDistrict: district,
    todayDate: todayDateStr,
    isTodayData,
    latestDate: latestDateStr,
    relativeDateLabel: dateRelative.label,
    noticeType,
    noticeMessage
  };
}

interface SmartMandiFinderProps {
  records: LiveMandiPriceRecord[];
  initialCommodity?: string;
  initialDistrict?: string;
}

export const SmartMandiFinder: React.FC<SmartMandiFinderProps> = ({
  records,
  initialCommodity = '',
  initialDistrict = ''
}) => {
  const [commodity, setCommodity] = useState(initialCommodity);
  const [district, setDistrict] = useState(initialDistrict);
  const [submitted, setSubmitted] = useState(Boolean(initialCommodity));
  const [cropSearchFocused, setCropSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const cropContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cropContainerRef.current && !cropContainerRef.current.contains(event.target as Node)) {
        setCropSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Master merged commodity list (all categories + any live records)
  const allMasterCommodities = useMemo(() => {
    const set = new Set<string>(ALL_COMMODITY_OPTIONS);
    for (const r of records) {
      if (r.commodity?.trim()) set.add(r.commodity.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'en-IN'));
  }, [records]);

  // Active reporting districts from API records
  const activeReportingDistricts = useMemo(() => {
    const set = new Set<string>();
    for (const r of records) {
      if (r.district?.trim()) set.add(r.district.trim().toLowerCase());
    }
    return set;
  }, [records]);

  // All 23 West Bengal districts merged with any API districts
  const allDistricts = useMemo(() => {
    const merged = new Set<string>(WEST_BENGAL_DISTRICTS);
    for (const r of records) {
      if (r.district?.trim()) merged.add(r.district.trim());
    }
    return Array.from(merged).sort((a, b) => a.localeCompare(b, 'en-IN'));
  }, [records]);

  // Filtered commodity autocomplete suggestions
  const autocompleteSuggestions = useMemo(() => {
    let pool = allMasterCommodities;
    if (selectedCategory !== 'All' && ALL_COMMODITIES_BY_CATEGORY[selectedCategory]) {
      pool = ALL_COMMODITIES_BY_CATEGORY[selectedCategory];
    }
    if (!commodity.trim()) {
      return pool;
    }
    const norm = normalizeText(commodity);
    return pool.filter(c => normalizeText(c).includes(norm));
  }, [commodity, allMasterCommodities, selectedCategory]);

  // Filtered and ranked results
  const rankedOutput = useMemo<RankedMandisOutput | null>(() => {
    if (!submitted || !commodity.trim()) return null;
    return rankMandisForCrop(records, commodity, district);
  }, [records, commodity, district, submitted]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commodity.trim()) return;
    setCropSearchFocused(false);
    setSubmitted(true);
  };

  const handleSelectCrop = (cropName: string) => {
    setCommodity(cropName);
    setCropSearchFocused(false);
    setSubmitted(true);
  };

  const handleClearFilters = () => {
    setCommodity('');
    setDistrict('');
    setCropSearchFocused(false);
    setSubmitted(false);
  };

  return (
    <section
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #86EFAC',
        borderRadius: 14,
        padding: '1.25rem',
        boxShadow: '0 4px 14px rgba(22, 101, 52, 0.06)',
        display: 'grid',
        gap: 16
      }}
      aria-label="Smart Mandi Finder"
    >
      {/* ── Section Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 999,
              background: '#DCFCE7',
              color: '#166534',
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: '.04em'
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A' }} />
            SMART MANDI FINDER · 100% REAL OFFICIAL PRICES
          </div>
          <h3 style={{ margin: '8px 0 3px', color: '#14532D', fontSize: 20, fontWeight: 800 }}>
            Find the Best Mandi Price
          </h3>
          <p style={{ margin: 0, color: '#475569', fontSize: 13 }}>
            Compare markets across West Bengal by latest official modal price. If today&apos;s data is not yet recorded, the latest available verified record (yesterday or past days) is automatically retrieved and clearly dated.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 999,
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              color: '#166534',
              fontSize: 12,
              fontWeight: 700
            }}
          >
            Official AGMARKNET / data.gov.in
          </span>
        </div>
      </div>

      {/* ── Popular Crop Quick-Chips ── */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 6 }}>
          Popular Crops (1-Tap Fast Selection):
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {POPULAR_CROPS.map(c => {
            const isSelected = matchCropName(commodity, c.name);
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => handleSelectCrop(c.name)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 11px',
                  borderRadius: 999,
                  border: isSelected ? '1.5px solid #16A34A' : '1px solid #E2E8F0',
                  background: isSelected ? '#DCFCE7' : '#F8FAFC',
                  color: isSelected ? '#14532D' : '#334155',
                  fontSize: 12,
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Search Form ── */}
      <form
        onSubmit={handleSearch}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) auto',
          gap: 12,
          alignItems: 'end'
        }}
      >
        {/* 1. Searchable Crop Selector with Single Smooth Dropdown */}
        <div ref={cropContainerRef} style={{ position: 'relative', display: 'grid', gap: 5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="finder-crop-input" style={{ fontSize: 12, fontWeight: 800, color: '#334155' }}>
              Crop / Commodity ({allMasterCommodities.length} Available) <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <span style={{ fontSize: 11, color: '#166534', fontWeight: 700 }}>
              Search or pick from list
            </span>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              id="finder-crop-input"
              type="text"
              value={commodity}
              placeholder="Search any crop e.g. Potato, Wheat, Jute, Tomato"
              onChange={e => {
                setCommodity(e.target.value);
                setSubmitted(false);
                setCropSearchFocused(true);
              }}
              onClick={() => setCropSearchFocused(true)}
              onFocus={() => setCropSearchFocused(true)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 65px 10px 12px',
                border: cropSearchFocused ? '1.5px solid #16A34A' : '1.5px solid #CBD5E1',
                borderRadius: 8,
                background: '#FFFFFF',
                fontSize: 13,
                fontWeight: 600,
                color: '#0F172A',
                outline: 'none',
                boxShadow: cropSearchFocused ? '0 0 0 3px rgba(22, 163, 74, 0.15)' : 'none',
                transition: 'all 0.15s ease'
              }}
              autoComplete="off"
            />

            <div style={{ position: 'absolute', right: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              {commodity && (
                <button
                  type="button"
                  onClick={() => {
                    setCommodity('');
                    setSubmitted(false);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94A3B8',
                    fontSize: 14,
                    cursor: 'pointer',
                    padding: '2px 4px',
                    lineHeight: 1
                  }}
                  title="Clear crop"
                >
                  ✕
                </button>
              )}

              <button
                type="button"
                onClick={() => setCropSearchFocused(prev => !prev)}
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  borderRadius: 4,
                  color: '#475569',
                  fontSize: 10,
                  cursor: 'pointer',
                  padding: '4px 6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1
                }}
                title="Toggle crop list"
              >
                {cropSearchFocused ? '▲' : '▼'}
              </button>
            </div>
          </div>

          {/* Single Smooth Dropdown right under the input */}
          {cropSearchFocused && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                zIndex: 50,
                background: '#FFFFFF',
                border: '1.5px solid #86EFAC',
                borderRadius: 10,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}
            >
              {/* Category Filter Pills Header */}
              <div
                style={{
                  display: 'flex',
                  gap: 4,
                  padding: '7px 8px',
                  background: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0',
                  overflowX: 'auto'
                }}
              >
                {['All', ...Object.keys(ALL_COMMODITIES_BY_CATEGORY)].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      border: 'none',
                      background: selectedCategory === cat ? '#15803D' : '#E2E8F0',
                      color: selectedCategory === cat ? '#FFFFFF' : '#475569',
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: 4,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'background 0.12s ease'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Crop Options List */}
              <div
                style={{
                  maxHeight: 220,
                  overflowY: 'auto'
                }}
              >
                {autocompleteSuggestions.length === 0 ? (
                  <div style={{ padding: '14px 16px', color: '#94A3B8', fontSize: 13, textAlign: 'center' }}>
                    No crops match &ldquo;{commodity}&rdquo; in this category.
                  </div>
                ) : (
                  autocompleteSuggestions.map(cropItem => {
                    const isSelected = matchCropName(commodity, cropItem);
                    return (
                      <div
                        key={cropItem}
                        onClick={() => handleSelectCrop(cropItem)}
                        style={{
                          padding: '9px 12px',
                          fontSize: 13,
                          color: isSelected ? '#15803D' : '#1E293B',
                          background: isSelected ? '#F0FDF4' : '#FFFFFF',
                          fontWeight: isSelected ? 800 : 500,
                          cursor: 'pointer',
                          borderBottom: '1px solid #F1F5F9',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'background 0.1s ease'
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#F8FAFC';
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#FFFFFF';
                        }}
                      >
                        <span>🌾 {cropItem}</span>
                        {isSelected ? (
                          <span style={{ fontSize: 11, color: '#15803D', fontWeight: 800 }}>✓ Selected</span>
                        ) : (
                          <span style={{ fontSize: 11, color: '#94A3B8' }}>Select</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2. District Selector (All 23 West Bengal districts + All Districts) */}
        <div style={{ display: 'grid', gap: 5 }}>
          <label htmlFor="finder-district-select" style={{ fontSize: 12, fontWeight: 800, color: '#334155' }}>
            District (West Bengal)
          </label>
          <select
            id="finder-district-select"
            value={district}
            onChange={e => {
              setDistrict(e.target.value);
              setSubmitted(false);
            }}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 12px',
              border: '1.5px solid #CBD5E1',
              borderRadius: 8,
              background: '#FFFFFF',
              fontSize: 13,
              fontWeight: 600,
              color: '#0F172A',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">All Districts (West Bengal)</option>
            {allDistricts.map(dist => {
              const isActive = activeReportingDistricts.has(dist.toLowerCase());
              return (
                <option key={dist} value={dist}>
                  {dist} {isActive ? '• Active Reports' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* 3. Action Buttons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="submit"
            disabled={!commodity.trim()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '10px 18px',
              borderRadius: 8,
              border: 'none',
              background: commodity.trim() ? '#15803D' : '#94A3B8',
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 800,
              cursor: commodity.trim() ? 'pointer' : 'not-allowed',
              boxShadow: commodity.trim() ? '0 2px 6px rgba(21, 128, 61, 0.25)' : 'none',
              whiteSpace: 'nowrap',
              minHeight: 40
            }}
          >
            🔍 Find Best Mandi
          </button>

          {(commodity || district || submitted) && (
            <button
              type="button"
              onClick={handleClearFilters}
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#64748B',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                minHeight: 40
              }}
              title="Reset Finder"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* ── Explicit Date & Status Notification Banner ── */}
      {submitted && rankedOutput && rankedOutput.noticeMessage && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            border: rankedOutput.isTodayData
              ? '1.5px solid #86EFAC'
              : rankedOutput.noticeType === 'empty'
              ? '1.5px solid #FCD34D'
              : '1.5px solid #F59E0B',
            background: rankedOutput.isTodayData
              ? '#F0FDF4'
              : rankedOutput.noticeType === 'empty'
              ? '#FFFBEB'
              : '#FEF3C7',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10
          }}
        >
          <span style={{ fontSize: 18 }}>
            {rankedOutput.isTodayData ? '✅' : rankedOutput.noticeType === 'empty' ? 'ℹ️' : '⚠️'}
          </span>
          <div style={{ display: 'grid', gap: 3 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: rankedOutput.isTodayData
                  ? '#166534'
                  : rankedOutput.noticeType === 'empty'
                  ? '#92400E'
                  : '#B45309'
              }}
            >
              {rankedOutput.isTodayData
                ? `Official Mandi Rates Reported Today (${rankedOutput.todayDate})`
                : `Notice: Latest Available Mandi Data (${rankedOutput.relativeDateLabel} · ${rankedOutput.latestDate})`}
            </div>
            <div
              style={{
                fontSize: 13,
                color: rankedOutput.isTodayData ? '#15803D' : '#78350F',
                lineHeight: 1.4
              }}
            >
              {rankedOutput.noticeMessage}
            </div>
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {submitted && rankedOutput && rankedOutput.rows.length === 0 && (
        <div
          style={{
            padding: '16px 18px',
            background: '#FFFBEB',
            border: '1.5px solid #FDE68A',
            borderRadius: 10,
            display: 'grid',
            gap: 8
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#92400E', fontWeight: 800, fontSize: 14 }}>
            <span>⚠️</span>
            <span>No Official Mandi Records Found</span>
          </div>
          <p style={{ margin: 0, color: '#78350F', fontSize: 13, lineHeight: 1.5 }}>
            No recent mandi modal prices were recorded for <b>{commodity}</b>{' '}
            {district ? (
              <>
                in <b>{district}</b> district.
              </>
            ) : (
              'across West Bengal mandis.'
            )}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
            {district && (
              <button
                type="button"
                onClick={() => {
                  setDistrict('');
                  setSubmitted(true);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid #D97706',
                  background: '#FEF3C7',
                  color: '#92400E',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                🔎 Search Across All Districts
              </button>
            )}
            {POPULAR_CROPS.slice(0, 5).map(c => (
              <button
                key={c.name}
                type="button"
                onClick={() => handleSelectCrop(c.name)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #FCD34D',
                  background: '#FFFFFF',
                  color: '#78350F',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Try {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Results Table ── */}
      {submitted && rankedOutput && rankedOutput.rows.length > 0 && (
        <div style={{ marginTop: 6, display: 'grid', gap: 12 }}>
          {/* Results Summary Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
              padding: '8px 12px',
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 8
            }}
          >
            <div style={{ color: '#166534', fontSize: 13, fontWeight: 800 }}>
              Found {rankedOutput.rows.length} matching {rankedOutput.rows.length === 1 ? 'mandi' : 'mandis'} for{' '}
              <span style={{ textDecoration: 'underline' }}>{commodity}</span>
              {district ? ` in ${district}` : ' across West Bengal'}
            </div>
            <div style={{ color: '#15803D', fontSize: 12, fontWeight: 700 }}>
              Ranked by Modal Price (High → Low)
            </div>
          </div>

          {/* Table Container */}
          <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: 10 }}>
            <table style={{ width: '100%', minWidth: 740, borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #CBD5E1' }}>
                  <th style={tableHeaderStyle}>Rank</th>
                  <th style={tableHeaderStyle}>Mandi / Market</th>
                  <th style={tableHeaderStyle}>District</th>
                  <th style={tableHeaderStyle}>Min Price</th>
                  <th style={tableHeaderStyle}>Max Price</th>
                  <th style={{ ...tableHeaderStyle, color: '#15803D' }}>Modal Price</th>
                  <th style={tableHeaderStyle}>Reporting Date</th>
                </tr>
              </thead>
              <tbody>
                {rankedOutput.rows.map(row => {
                  const isTop = row.isBestPrice;
                  return (
                    <tr
                      key={`${row.market}-${row.variety}-${row.grade}-${row.arrivalDate}-${row.rank}`}
                      style={{
                        background: isTop ? '#F0FDF4' : row.rank % 2 === 0 ? '#FCFDFD' : '#FFFFFF',
                        borderBottom: '1px solid #E2E8F0',
                        transition: 'background 0.1s ease'
                      }}
                    >
                      {/* 1. Rank */}
                      <td style={tableCellStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: isTop ? '#15803D' : '#F1F5F9',
                              color: isTop ? '#FFFFFF' : '#475569',
                              fontWeight: 900,
                              fontSize: 12
                            }}
                          >
                            #{row.rank}
                          </span>
                        </div>
                      </td>

                      {/* 2. Mandi / Market Name & Variety Label */}
                      <td style={tableCellStyle}>
                        <div style={{ fontWeight: 800, color: '#0F172A', fontSize: 14 }}>
                          {row.market}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 3 }}>
                          <span
                            style={{
                              fontSize: 11,
                              color: '#475569',
                              background: '#F1F5F9',
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontWeight: 600
                            }}
                          >
                            {row.varietyLabel}
                          </span>
                          {isTop && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '2px 8px',
                                borderRadius: 999,
                                background: '#BBF7D0',
                                color: '#14532D',
                                fontSize: 10,
                                fontWeight: 900,
                                letterSpacing: '.03em',
                                border: '1px solid #86EFAC'
                              }}
                            >
                              ⭐ BEST PRICE FOUND
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. District */}
                      <td style={tableCellStyle}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            color: '#334155',
                            fontSize: 12,
                            fontWeight: 700
                          }}
                        >
                          {row.district}
                        </span>
                      </td>

                      {/* 4. Min Price */}
                      <td style={{ ...tableCellStyle, color: '#64748B', fontSize: 13 }}>
                        {formatPriceCurrency(row.minPrice)}
                      </td>

                      {/* 5. Max Price */}
                      <td style={{ ...tableCellStyle, color: '#64748B', fontSize: 13 }}>
                        {formatPriceCurrency(row.maxPrice)}
                      </td>

                      {/* 6. Modal Price */}
                      <td style={tableCellStyle}>
                        <div
                          style={{
                            color: '#15803D',
                            fontWeight: 900,
                            fontSize: 15,
                            display: 'inline-flex',
                            alignItems: 'baseline',
                            gap: 2
                          }}
                        >
                          {formatPriceCurrency(row.modalPrice)}
                        </div>
                      </td>

                      {/* 7. Reporting Date (with Today / Yesterday / 2 days ago badge) */}
                      <td style={tableCellStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}>
                          <span style={{ fontWeight: 700, color: '#1E293B', fontSize: 12 }}>
                            {row.arrivalDate || '—'}
                          </span>
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 800,
                              background: row.isToday
                                ? '#DCFCE7'
                                : row.dateRelativeLabel === 'Yesterday'
                                ? '#FEF3C7'
                                : '#F1F5F9',
                              color: row.isToday
                                ? '#166534'
                                : row.dateRelativeLabel === 'Yesterday'
                                ? '#92400E'
                                : '#475569',
                              border: row.isToday
                                ? '1px solid #86EFAC'
                                : row.dateRelativeLabel === 'Yesterday'
                                ? '1px solid #FCD34D'
                                : '1px solid #E2E8F0'
                            }}
                          >
                            {row.dateRelativeLabel}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Mandatory Disclaimer ── */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              color: '#64748B',
              fontSize: 12,
              lineHeight: 1.5
            }}
          >
            <div style={{ fontWeight: 800, color: '#475569', marginBottom: 2 }}>
              ℹ️ Important Information for Farmers:
            </div>
            <div>
              • Prices are based on the latest reported mandi data and may change.
            </div>
            <div>
              • A higher modal price does not guarantee the highest farmer profit once transportation costs, loading/unloading fees, and grade-based deductions are accounted for.
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const tableHeaderStyle: React.CSSProperties = {
  padding: '11px 12px',
  fontSize: 12,
  fontWeight: 800,
  color: '#475569',
  borderBottom: '1.5px solid #CBD5E1',
  whiteSpace: 'nowrap'
};

const tableCellStyle: React.CSSProperties = {
  padding: '12px 12px',
  verticalAlign: 'middle'
};
