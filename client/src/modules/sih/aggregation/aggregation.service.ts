export interface ProducePool {
  id: string;
  cropName: string;
  variety: string;
  location: string;
  district: string;
  currentTonnage: number;
  targetTonnage: number;
  offeredPricePerQtl: number;
  mspPricePerQtl: number;
  participatingFarmers: number;
  buyerName: string;
  status: 'OPEN' | 'FULLY_BOOKED' | 'DISPATCHED';
}

export interface InputDeal {
  id: string;
  title: string;
  category: string;
  currentOrders: number;
  minOrders: number;
  discountPrice: number;
  marketPrice: number;
  savingsPercentage: number;
}

export class AggregationService {
  /**
   * Fetches active Group Selling (Produce Pools)
   */
  static getProduceSellingPools(): ProducePool[] {
    return [
      {
        id: 'pool-1',
        cropName: 'Wheat',
        variety: 'PBW 725 (A-Grade)',
        location: 'Khanna Block',
        district: 'Ludhiana, Punjab',
        currentTonnage: 480,
        targetTonnage: 500,
        offeredPricePerQtl: 2380,
        mspPricePerQtl: 2275,
        participatingFarmers: 16,
        buyerName: 'Adani Agri Logistics Ltd',
        status: 'OPEN'
      },
      {
        id: 'pool-2',
        cropName: 'Basmati Rice',
        variety: 'Pusa Basmati 1121',
        location: 'Jagraon Block',
        district: 'Ludhiana, Punjab',
        currentTonnage: 290,
        targetTonnage: 400,
        offeredPricePerQtl: 4250,
        mspPricePerQtl: 3900,
        participatingFarmers: 11,
        buyerName: 'KRBL Basmati Exports',
        status: 'OPEN'
      },
      {
        id: 'pool-3',
        cropName: 'Mustard',
        variety: 'Pusa 30 Oilseed',
        location: 'Samrala Block',
        district: 'Ludhiana, Punjab',
        currentTonnage: 180,
        targetTonnage: 200,
        offeredPricePerQtl: 5650,
        mspPricePerQtl: 5450,
        participatingFarmers: 8,
        buyerName: 'Patanjali Agro Industries',
        status: 'OPEN'
      }
    ];
  }

  /**
   * Fetches active Input Group Buying Deals
   */
  static async getInputBuyingDeals(): Promise<InputDeal[]> {
    return [
      {
        id: 'deal-1',
        title: 'IHCO Certified Organic NPK Fertilizer (50kg)',
        category: 'Fertilizer',
        currentOrders: 42,
        minOrders: 50,
        discountPrice: 1250,
        marketPrice: 1600,
        savingsPercentage: 22
      },
      {
        id: 'deal-2',
        title: 'High-Yield Hybrid Mustard Seeds (Pusa 30)',
        category: 'Seeds',
        currentOrders: 88,
        minOrders: 100,
        discountPrice: 850,
        marketPrice: 1100,
        savingsPercentage: 23
      }
    ];
  }
}
