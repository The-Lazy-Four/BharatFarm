import { describe, it, expect } from 'vitest';
import {
  WEST_BENGAL_DISTRICTS,
  ALL_COMMODITY_OPTIONS,
  ALL_COMMODITIES_BY_CATEGORY,
  rankMandisForCrop,
  parseArrivalTimestamp,
  formatPriceCurrency,
  describeDateRelative,
  matchCropName
} from '../src/modules/sih/smart-mandi/components/SmartMandiFinder.js';
import type { LiveMandiPriceRecord } from '../src/modules/sih/smart-mandi/smartMandi.service.js';

describe('Smart Mandi Finder - All Commodities & Historical Date Awareness', () => {
  const sampleRecords: LiveMandiPriceRecord[] = [
    // Today's record for Carrot in Darjeeling
    {
      state: 'West Bengal',
      district: 'Darjeeling',
      market: 'Siliguri APMC',
      commodity: 'Carrot',
      variety: 'Local',
      grade: 'FAQ',
      arrivalDate: '18/11/2026', // TODAY
      minPrice: 3800,
      maxPrice: 4400,
      modalPrice: 4200,
      suspicious: false
    },
    // Yesterday's record for Potato in Purba Medinipur
    {
      state: 'West Bengal',
      district: 'Purba Medinipur',
      market: 'Haldia APMC',
      commodity: 'Potato',
      variety: 'Jyoti',
      grade: 'FAQ',
      arrivalDate: '17/11/2026', // YESTERDAY
      minPrice: 2100,
      maxPrice: 2350,
      modalPrice: 2250,
      suspicious: false
    },
    // 2 days ago record for Potato in Purba Medinipur
    {
      state: 'West Bengal',
      district: 'Purba Medinipur',
      market: 'Contai Mandi',
      commodity: 'Potato',
      variety: 'Deshi',
      grade: 'FAQ',
      arrivalDate: '16/11/2026', // 2 DAYS AGO
      minPrice: 2000,
      maxPrice: 2250,
      modalPrice: 2150,
      suspicious: false
    },
    // Yesterday's record for Wheat in Murshidabad
    {
      state: 'West Bengal',
      district: 'Murshidabad',
      market: 'Berhampore APMC',
      commodity: 'Wheat',
      variety: 'Sharbati',
      grade: 'FAQ',
      arrivalDate: '17/11/2026', // YESTERDAY
      minPrice: 2500,
      maxPrice: 2750,
      modalPrice: 2620,
      suspicious: false
    }
  ];

  it('1. Provides EVERY commodity crop in options across all categories', () => {
    expect(ALL_COMMODITY_OPTIONS.length).toBeGreaterThan(80);
    // Cereals & Millets
    expect(ALL_COMMODITY_OPTIONS).toContain('Rice');
    expect(ALL_COMMODITY_OPTIONS).toContain('Wheat (Gehun)');
    expect(ALL_COMMODITY_OPTIONS).toContain('Maize (Makka)');
    expect(ALL_COMMODITY_OPTIONS).toContain('Barley (Jau)');
    // Vegetables
    expect(ALL_COMMODITY_OPTIONS).toContain('Potato');
    expect(ALL_COMMODITY_OPTIONS).toContain('Onion');
    expect(ALL_COMMODITY_OPTIONS).toContain('Tomato');
    expect(ALL_COMMODITY_OPTIONS).toContain('Brinjal');
    expect(ALL_COMMODITY_OPTIONS).toContain('Pointed Gourd (Parval)');
    // Cash Crops
    expect(ALL_COMMODITY_OPTIONS).toContain('Jute (Pat)');
    expect(ALL_COMMODITY_OPTIONS).toContain('Cotton (Kapas)');
    expect(ALL_COMMODITY_OPTIONS).toContain('Tea');
    // Pulses
    expect(ALL_COMMODITY_OPTIONS).toContain('Moong Dal (Green Gram)');
    expect(ALL_COMMODITY_OPTIONS).toContain('Masur Dal (Lentil)');
    // Oilseeds
    expect(ALL_COMMODITY_OPTIONS).toContain('Mustard (Sarson)');
  });

  it('2. Correctly categorizes commodities for easy browsing', () => {
    const categories = Object.keys(ALL_COMMODITIES_BY_CATEGORY);
    expect(categories).toContain('Vegetables');
    expect(categories).toContain('Grains, Cereals & Millets');
    expect(categories).toContain('Pulses & Dals');
    expect(categories).toContain('Oilseeds');
    expect(categories).toContain('Cash & Commercial Crops');
    expect(categories).toContain('Spices & Condiments');
    expect(categories).toContain('Fruits');
  });

  it('3. When today\'s data is present, explicitly mentions Today and marks rows as today', () => {
    const result = rankMandisForCrop(sampleRecords, 'Carrot', 'Darjeeling', '18/11/2026');
    expect(result.rows).toHaveLength(1);
    expect(result.isTodayData).toBe(true);
    expect(result.latestDate).toBe('18/11/2026');
    expect(result.relativeDateLabel).toBe('Today');
    expect(result.noticeType).toBe('today');
    expect(result.noticeMessage).toContain('TODAY (18/11/2026)');

    // Row verification
    expect(result.rows[0].market).toBe('Siliguri APMC');
    expect(result.rows[0].arrivalDate).toBe('18/11/2026');
    expect(result.rows[0].isToday).toBe(true);
    expect(result.rows[0].dateRelativeLabel).toBe('Today');
  });

  it('4. When today\'s data is not there, explicitly mentions and gives latest available data from Yesterday (17/11/2026)', () => {
    const result = rankMandisForCrop(sampleRecords, 'Potato', 'Purba Medinipur', '18/11/2026');
    expect(result.rows.length).toBeGreaterThanOrEqual(1);
    expect(result.isTodayData).toBe(false);
    expect(result.latestDate).toBe('17/11/2026');
    expect(result.relativeDateLabel).toBe('Yesterday');
    expect(result.noticeType).toBe('yesterday');

    // Must mention that today's data is not reported and specify the exact latest date
    expect(result.noticeMessage).toContain('Today\'s data (18/11/2026) has not been reported yet');
    expect(result.noticeMessage).toContain('17/11/2026');
    expect(result.noticeMessage).toContain('yesterday');

    // Top row should be Haldia APMC reported yesterday
    expect(result.rows[0].market).toBe('Haldia APMC');
    expect(result.rows[0].arrivalDate).toBe('17/11/2026');
    expect(result.rows[0].dateRelativeLabel).toBe('Yesterday');
    expect(result.rows[0].isToday).toBe(false);
  });

  it('5. If latest date was 2 days ago, relative date helper reports "2 days ago"', () => {
    const twoDaysAgoRel = describeDateRelative('16/11/2026', '18/11/2026');
    expect(twoDaysAgoRel.label).toBe('2 days ago');
    expect(twoDaysAgoRel.daysAgo).toBe(2);
    expect(twoDaysAgoRel.isToday).toBe(false);

    const yesterdayRel = describeDateRelative('17/11/2026', '18/11/2026');
    expect(yesterdayRel.label).toBe('Yesterday');
    expect(yesterdayRel.daysAgo).toBe(1);
    expect(yesterdayRel.isToday).toBe(false);

    const todayRel = describeDateRelative('18/11/2026', '18/11/2026');
    expect(todayRel.label).toBe('Today');
    expect(todayRel.daysAgo).toBe(0);
    expect(todayRel.isToday).toBe(true);
  });

  it('6. When chosen district has no report, gracefully retrieves neighboring West Bengal mandis and mentions status', () => {
    // Search Potato in Hooghly (no record in this small sample) -> falls back to other WB mandis (Purba Medinipur)
    const result = rankMandisForCrop(sampleRecords, 'Potato', 'Hooghly', '18/11/2026');
    expect(result.rows.length).toBeGreaterThanOrEqual(1);
    expect(result.noticeType).toBe('neighboring');
    expect(result.noticeMessage).toContain('Today\'s data (18/11/2026) is not reported for Potato in Hooghly');
    expect(result.noticeMessage).toContain('neighboring West Bengal mandis');
    expect(result.noticeMessage).toContain('17/11/2026');
  });

  it('7. Matches crops flexibly with aliases and parenthesis', () => {
    expect(matchCropName('Wheat', 'Wheat (Gehun)')).toBe(true);
    expect(matchCropName('Potato', 'Potato')).toBe(true);
    expect(matchCropName('Pointed gourd(Parval)', 'Pointed Gourd (Parval)')).toBe(true);
    expect(matchCropName('Green Chilli', 'Green Chilli')).toBe(true);
    expect(matchCropName('Jute', 'Jute (Pat)')).toBe(true);
    expect(matchCropName('Paddy(Common)', 'Paddy (Dhan)')).toBe(true);
  });

  it('8. Ranks mandis in descending order by modal price and marks best price', () => {
    const result = rankMandisForCrop(sampleRecords, 'Potato', 'Purba Medinipur', '18/11/2026');
    // Haldia APMC modal 2250, Contai Mandi modal 2150
    expect(result.rows[0].modalPrice).toBe(2250);
    expect(result.rows[0].isBestPrice).toBe(true);
    expect(result.rows[0].rank).toBe(1);
  });

  it('9. Provides all 23 official districts of West Bengal', () => {
    expect(WEST_BENGAL_DISTRICTS).toHaveLength(23);
    expect(WEST_BENGAL_DISTRICTS).toContain('Purba Medinipur');
    expect(WEST_BENGAL_DISTRICTS).toContain('Bankura');
    expect(WEST_BENGAL_DISTRICTS).toContain('Darjeeling');
    expect(WEST_BENGAL_DISTRICTS).toContain('Hooghly');
  });
});
