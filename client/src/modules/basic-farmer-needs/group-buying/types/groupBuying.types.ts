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
  creatorId?: string;
  createdAt?: string;
}

export interface CreateGroupBuyPoolDto {
  itemTitle: string;
  category: 'fertilizer' | 'seeds' | 'machinery';
  originalPricePerUnit: number;
  discountedPricePerUnit: number;
  targetQuantity: number;
  deadline: string;
  location: string;
}

export interface GroupBuyMember {
  id: string;
  poolId: string;
  userId: string;
  quantity: number;
  joinedAt: string;
  userFullName?: string;
}
