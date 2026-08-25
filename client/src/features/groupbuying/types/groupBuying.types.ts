export interface GroupBuyPool {
  id: string;
  itemTitle: string;
  category: 'fertilizer' | 'seeds' | 'machinery';
  originalPricePerUnit: number;
  discountedPricePerUnit: number;
  targetQuantity: number;
  currentQuantity: number;
  participantCount: number;
  status: 'OPEN' | 'THRESHOLD_REACHED' | 'COMPLETED' | 'EXPIRED';
  deadline: string;
  location: string;
}
