export interface EconomicLossEstimate {
  crop: string;
  marketPrice: number;
  priceUnit: string;
  estimatedProduction: number;
  estimatedLostProduction: number;
  estimatedEconomicLoss: number;
  estimateType: 'preliminary_estimate';
  disclaimer: string;
}

interface CropMarketData {
  marketPricePerQtl: number;
  yieldPerAcreQtl: number;
}

const CROP_MARKET_REGISTRY: Record<string, CropMarketData> = {
  paddy: { marketPricePerQtl: 2400, yieldPerAcreQtl: 10.0 },
  rice: { marketPricePerQtl: 2400, yieldPerAcreQtl: 10.0 },
  tomato: { marketPricePerQtl: 2200, yieldPerAcreQtl: 35.0 },
  wheat: { marketPricePerQtl: 2300, yieldPerAcreQtl: 15.0 },
  potato: { marketPricePerQtl: 1800, yieldPerAcreQtl: 45.0 },
  cotton: { marketPricePerQtl: 6200, yieldPerAcreQtl: 8.0 },
  mustard: { marketPricePerQtl: 5400, yieldPerAcreQtl: 7.0 },
  maize: { marketPricePerQtl: 2090, yieldPerAcreQtl: 18.0 },
  sugarcane: { marketPricePerQtl: 315, yieldPerAcreQtl: 320.0 }
};

export class MarketService {
  /**
   * Calculate preliminary economic loss based on crop, farm area, and damage percentage.
   */
  static calculateEconomicLoss(
    crop: string,
    farmAreaAcres: number,
    affectedPercentage: number
  ): EconomicLossEstimate {
    const normalizedCrop = crop.trim().toLowerCase();
    const marketData = CROP_MARKET_REGISTRY[normalizedCrop] || {
      marketPricePerQtl: 2400,
      yieldPerAcreQtl: 10.0
    };

    const area = Math.max(0.1, farmAreaAcres);
    const affectedFraction = Math.min(1.0, Math.max(0, affectedPercentage / 100));

    const totalProduction = parseFloat((area * marketData.yieldPerAcreQtl).toFixed(1));
    const lostProduction = parseFloat((totalProduction * affectedFraction).toFixed(1));
    const economicLoss = Math.round(lostProduction * marketData.marketPricePerQtl);

    return {
      crop: crop,
      marketPrice: marketData.marketPricePerQtl,
      priceUnit: 'per quintal',
      estimatedProduction: totalProduction,
      estimatedLostProduction: lostProduction,
      estimatedEconomicLoss: economicLoss,
      estimateType: 'preliminary_estimate',
      disclaimer: 'This figure is a preliminary estimate based on current mandi prices and estimated affected area. It does NOT constitute a legally guaranteed insurance payout.'
    };
  }
}
