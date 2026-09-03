import { ApiClient } from '../apiClient';

export interface FarmAdviceResponse {
  advice: string;
  source: string;
  isAiGenerated: boolean;
}

export interface NaturalSearchResponse {
  matchedProducts: any[];
  explanation: string;
  isAiGenerated: boolean;
}

export interface ProductExplainResponse {
  explanation: string;
  dosageTip?: string;
  isAiGenerated: boolean;
}

export interface GroupBuyingAssistResponse {
  advice: string;
  isAiGenerated: boolean;
}

export class CentralAiApi {
  /**
   * Fetch context-aware daily farm advice for the Dashboard.
   */
  static async getFarmAdvice(params?: { crop?: string; state?: string; location?: string; landSize?: number }): Promise<FarmAdviceResponse> {
    const query = new URLSearchParams();
    if (params?.crop) query.append('crop', params.crop);
    if (params?.state) query.append('state', params.state);
    if (params?.location) query.append('location', params.location);
    if (params?.landSize) query.append('landSize', String(params.landSize));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await ApiClient.get<FarmAdviceResponse>(`/ai/farm-advice${queryString}`);
    if (res.success && res.data) {
      return res.data;
    }
    return {
      advice: 'Weather conditions are stable. Continue scheduled field irrigation and crop canopy inspections.',
      source: 'FALLBACK',
      isAiGenerated: false
    };
  }

  /**
   * Send natural language query to match products in Marketplace.
   */
  static async naturalMarketplaceSearch(query: string): Promise<NaturalSearchResponse> {
    const res = await ApiClient.post<NaturalSearchResponse>('/ai/marketplace-search', { query });
    if (res.success && res.data) {
      return res.data;
    }
    throw new Error(res.error?.message || 'Natural search failed');
  }

  /**
   * Explain a product's suitability and application guidance.
   */
  static async explainProduct(productId: string, farmerCrop?: string): Promise<ProductExplainResponse> {
    const res = await ApiClient.post<ProductExplainResponse>('/ai/marketplace-explain', { productId, farmerCrop });
    if (res.success && res.data) {
      return res.data;
    }
    throw new Error(res.error?.message || 'Failed to explain product');
  }

  /**
   * Get AI assistance and savings analysis for group buying pools.
   */
  static async assistGroupBuying(poolId?: string, query?: string, crop?: string): Promise<GroupBuyingAssistResponse> {
    const res = await ApiClient.post<GroupBuyingAssistResponse>('/ai/groupbuying-assist', { poolId, query, crop });
    if (res.success && res.data) {
      return res.data;
    }
    return {
      advice: 'Group buying pools pool regional farmer demand to lower per-unit seed and fertilizer prices.',
      isAiGenerated: false
    };
  }
}
