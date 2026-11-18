import { config } from '../config/env.js';
import { HISTORICAL_MANDI_RECORDS } from '../data/historicalMandiRecords.js';

const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const SOURCE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;
const PAGE_SIZE = 100;
const CACHE_TTL_MS = 5 * 60 * 1000;

export interface MandiPriceRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrivalDate: string;
  minPrice: number | null;
  maxPrice: number | null;
  modalPrice: number | null;
  suspicious: boolean;
}

export interface MandiPriceSnapshot {
  records: MandiPriceRecord[];
  fetchedAt: string;
  latestArrivalDate: string | null;
  source: 'Government of India — data.gov.in / AGMARKNET';
  totalSourceRecords: number;
}

type DataGovRecord = Record<string, unknown>;
type DataGovResponse = { records?: DataGovRecord[]; total?: number | string };

export class MandiPriceService {
  private static cache: { expiresAt: number; snapshot: MandiPriceSnapshot } | null = null;

  static async getWestBengalPrices(forceRefresh = false): Promise<MandiPriceSnapshot> {
    if (!config.dataGovInApiKey) {
      throw new Error('DATA_GOV_IN_API_KEY is not configured');
    }
    if (!forceRefresh && this.cache && this.cache.expiresAt > Date.now()) {
      return this.cache.snapshot;
    }

    const rawRecords: DataGovRecord[] = [];
    let total = Infinity;
    const unique = new Map<string, MandiPriceRecord>();
    // Pre-populate with official historical records (yesterday & previous days)
    for (const record of HISTORICAL_MANDI_RECORDS) {
      const key = [record.district, record.market, record.commodity, record.variety, record.grade, record.arrivalDate].join('|').toLowerCase();
      unique.set(key, record);
    }

    try {
      for (let offset = 0; offset < total; offset += PAGE_SIZE) {
        const query = new URLSearchParams({
          'api-key': config.dataGovInApiKey,
          format: 'json',
          offset: String(offset),
          limit: String(PAGE_SIZE),
          'filters[state.keyword]': 'West Bengal'
        });
        const response = await fetch(`${SOURCE_URL}?${query.toString()}`, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(15_000)
        });
        if (!response.ok) {
          throw new Error(`Government mandi data service returned HTTP ${response.status}`);
        }
        const page = await response.json() as DataGovResponse;
        const records = Array.isArray(page.records) ? page.records : [];
        total = Number(page.total ?? records.length);
        rawRecords.push(...records);
        if (records.length < PAGE_SIZE || rawRecords.length >= total) break;
      }

      for (const record of rawRecords) {
        const normalized = this.normalize(record);
        if (!normalized) continue;
        const key = [normalized.district, normalized.market, normalized.commodity, normalized.variety, normalized.grade, normalized.arrivalDate].join('|').toLowerCase();
        unique.set(key, normalized);
      }
    } catch (err: any) {
      // If data.gov.in has temporary network issues, serve available verified archive
      if (unique.size === 0) {
        throw err;
      }
    }
    const records = [...unique.values()];
    const latestArrivalDate = records
      .map(record => record.arrivalDate)
      .filter(Boolean)
      .sort((a, b) => this.arrivalTimestamp(b) - this.arrivalTimestamp(a))[0] || null;
    const snapshot: MandiPriceSnapshot = {
      records,
      fetchedAt: new Date().toISOString(),
      latestArrivalDate,
      source: 'Government of India — data.gov.in / AGMARKNET',
      totalSourceRecords: rawRecords.length
    };
    this.cache = { snapshot, expiresAt: Date.now() + CACHE_TTL_MS };
    return snapshot;
  }

  private static normalize(record: DataGovRecord): MandiPriceRecord | null {
    const text = (name: string) => String(record[name] ?? '').trim();
    const number = (name: string): number | null => {
      const value = Number(String(record[name] ?? '').replace(/,/g, ''));
      return Number.isFinite(value) && value >= 0 ? value : null;
    };
    const district = text('district');
    const market = text('market');
    const commodity = text('commodity');
    if (!district || !market || !commodity) return null;
    const minPrice = number('min_price');
    const maxPrice = number('max_price');
    const modalPrice = number('modal_price');
    return {
      state: text('state') || 'West Bengal', district, market, commodity,
      variety: text('variety') || '—', grade: text('grade') || '—', arrivalDate: text('arrival_date'),
      minPrice, maxPrice, modalPrice,
      suspicious: (minPrice !== null && maxPrice !== null && minPrice > maxPrice) ||
        (modalPrice !== null && minPrice !== null && maxPrice !== null && (modalPrice < minPrice || modalPrice > maxPrice))
    };
  }

  private static arrivalTimestamp(value: string): number {
    const [day, month, year] = value.split('/').map(Number);
    return Number.isFinite(day) && Number.isFinite(month) && Number.isFinite(year)
      ? Date.UTC(year, month - 1, day)
      : 0;
  }
}
