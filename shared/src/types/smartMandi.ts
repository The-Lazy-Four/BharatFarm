// ============================================================
// BharatFarm Smart Mandi — Shared TypeScript Types
// Automatic Buyer-Farmer Matching, Multi-Farmer Supply Pool & Smart Collection
// ============================================================

export type RequirementStatus =
  | 'SEARCHING'
  | 'PARTIAL_MATCH'
  | 'MATCHED'
  | 'AWAITING_CONFIRMATION'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type SupplyStatus =
  | 'AVAILABLE'
  | 'MATCHED'
  | 'ACCEPTED'
  | 'RESERVED'
  | 'SOLD';

export type FarmerAllocationStatus =
  | 'NOTIFIED'
  | 'ACCEPTED'
  | 'DECLINED';

export type SupplyPoolStatus =
  | 'SEARCHING'
  | 'PARTIAL_MATCH'
  | 'MATCHED'
  | 'AWAITING_FARMER_CONFIRMATION'
  | 'ALL_ACCEPTED'
  | 'CONFIRMED';

export type NotificationType =
  | 'BUYER_FOUND'
  | 'SUPPLY_MATCHED'
  | 'FARMER_ACCEPTED'
  | 'FARMER_DECLINED'
  | 'POOL_FULL';

export interface StructuredLocation {
  district: string;
  village: string;
  postOffice: string;
  state: string;
  latitude?: number;
  longitude?: number;
}

export interface BuyerRequirement {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone?: string;
  crop: string;
  requiredQuantityKg: number;
  remainingQuantityKg: number;
  expectedPricePerKg: number;
  location: StructuredLocation;
  searchRadiusKm: number;
  requiredBy: string; // YYYY-MM-DD or ISO
  notes?: string;
  status: RequirementStatus;
  createdAt: string;
  expiresAt: string;
}

export interface FarmerSupply {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone?: string;
  crop: string;
  availableQuantityKg: number;
  remainingQuantityKg: number;
  expectedPricePerKg: number;
  location: StructuredLocation;
  availabilityDate: string; // YYYY-MM-DD or ISO
  fieldMappingId?: string;
  notes?: string;
  reliabilityScore?: number; // 0-100 or undefined for new sellers
  completedTransactions?: number;
  status: SupplyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SupplyMatchAllocation {
  farmerSupplyId: string;
  farmerId: string;
  farmerName: string;
  farmerPhone?: string;
  allocatedQuantityKg: number;
  distanceKm: number;
  pricePerKg: number;
  priceDifferencePerKg: number; // farmerPrice - buyerPrice
  reliabilityScore?: number;
  farmerStatus: FarmerAllocationStatus;
}

export interface SupplyPool {
  id: string;
  buyerRequirementId: string;
  crop: string;
  requiredQuantityKg: number;
  matchedQuantityKg: number;
  fulfillmentPercentage: number;
  farmerCount: number;
  estimatedProductValue: number;
  allocations: SupplyMatchAllocation[];
  status: SupplyPoolStatus;
  aiExplanation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionStop {
  stopNumber: number;
  farmerSupplyId: string;
  farmerName: string;
  location: StructuredLocation;
  quantityKg: number;
  distanceFromPrevKm: number;
  cumulativeDistanceKm: number;
}

export interface SmartCollectionPlan {
  id: string;
  supplyPoolId: string;
  buyerLocation: StructuredLocation;
  stops: CollectionStop[];
  totalStops: number;
  totalQuantityKg: number;
  totalRouteDistanceKm: number;
  separateTripsDistanceKm: number;
  estimatedTransportCost?: number;
  potentialTransportSaving?: number;
  transportCostModelAvailable: boolean;
  costAssumptions?: {
    baseCost: number;
    costPerKm: number;
    handlingPerKg: number;
  };
  efficiencyNote: string;
}

export interface MandiNotification {
  id: string;
  recipientId: string;
  recipientRole: 'BUYER' | 'FARMER';
  title: string;
  body: string;
  type: NotificationType;
  crop: string;
  quantityKg: number;
  expectedPricePerKg?: number;
  distanceKm?: number;
  requirementId?: string;
  supplyId?: string;
  poolId?: string;
  allocationId?: string;
  read: boolean;
  createdAt: string;
}

export interface ParseRequirementResult {
  crop?: string;
  quantityKg?: number;
  expectedPricePerKg?: number;
  district?: string;
  village?: string;
  state?: string;
  requiredByDays?: number;
  confidence: number;
  rawNotes?: string;
}
