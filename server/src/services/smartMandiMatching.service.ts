import {
  BuyerRequirement,
  FarmerSupply,
  SupplyPool,
  SupplyMatchAllocation,
  SmartCollectionPlan,
  CollectionStop,
  MandiNotification,
  StructuredLocation
} from '@bharatfarm/shared';
import { logger } from '../utils/logger.js';

// ============================================================
// CONFIGURABLE TRANSPORT MODEL ASSUMPTIONS
// ============================================================
const TRANSPORT_CONFIG = {
  baseCost: 150,       // ₹ base dispatch / handling
  costPerKm: 12,       // ₹ per km for rural transport vehicle
  handlingPerKg: 0.8   // ₹ per kg loading / aggregation handling
};

// ============================================================
// HAVERSINE DISTANCE CALCULATOR
// ============================================================
export function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

// Fallback distance estimation based on address matching
export function estimateLocationDistanceKm(loc1: StructuredLocation, loc2: StructuredLocation): number {
  if (loc1.latitude && loc1.longitude && loc2.latitude && loc2.longitude) {
    return calculateHaversineDistanceKm(loc1.latitude, loc1.longitude, loc2.latitude, loc2.longitude);
  }
  // If in same village -> ~1.5 km
  if (loc1.village && loc2.village && loc1.village.toLowerCase() === loc2.village.toLowerCase()) {
    return 1.5;
  }
  // If in same district -> ~8.0 km
  if (loc1.district && loc2.district && loc1.district.toLowerCase() === loc2.district.toLowerCase()) {
    return 8.0;
  }
  // If in same state -> ~25.0 km
  if (loc1.state && loc2.state && loc1.state.toLowerCase() === loc2.state.toLowerCase()) {
    return 25.0;
  }
  return 50.0;
}

// ============================================================
// IN-MEMORY DATA STORE & SEED FIXTURES
// ============================================================
export class SmartMandiMatchingService {
  private static requirements: Map<string, BuyerRequirement> = new Map();
  private static supplies: Map<string, FarmerSupply> = new Map();
  private static pools: Map<string, SupplyPool> = new Map();
  private static collectionPlans: Map<string, SmartCollectionPlan> = new Map();
  private static notifications: MandiNotification[] = [];

  static {
    this.seedDemoFixtures();
  }

  /**
   * Seed realistic SIH demo fixtures in Haldia / Purba Medinipur
   */
  static seedDemoFixtures(): void {
    this.requirements.clear();
    this.supplies.clear();
    this.pools.clear();
    this.collectionPlans.clear();
    this.notifications = [];

    // Base Haldia coordinates for buyer: 22.0667, 88.0698
    const baseLat = 22.0667;
    const baseLng = 88.0698;

    // 1. Farmer A (50 kg @ 1.2 km, ₹24/kg)
    const supplyA: FarmerSupply = {
      id: 'supply_farmer_a',
      farmerId: 'farmer_a_id',
      farmerName: 'Ramesh Mondal (Farmer A)',
      farmerPhone: '+91 98321 45678',
      crop: 'Potato',
      availableQuantityKg: 50,
      remainingQuantityKg: 50,
      expectedPricePerKg: 24,
      location: {
        district: 'Purba Medinipur',
        village: 'Sutahata (Near Haldia)',
        postOffice: 'Sutahata',
        state: 'West Bengal',
        latitude: baseLat + 0.009, // ~1.2 km away
        longitude: baseLng + 0.006
      },
      availabilityDate: '2026-09-12',
      reliabilityScore: 96,
      completedTransactions: 14,
      status: 'AVAILABLE',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString()
    };

    // 2. Farmer B (30 kg @ 2.0 km, ₹25/kg)
    const supplyB: FarmerSupply = {
      id: 'supply_farmer_b',
      farmerId: 'farmer_b_id',
      farmerName: 'Bikash Jana (Farmer B)',
      farmerPhone: '+91 98322 56789',
      crop: 'Potato',
      availableQuantityKg: 30,
      remainingQuantityKg: 30,
      expectedPricePerKg: 25,
      location: {
        district: 'Purba Medinipur',
        village: 'Durgachak',
        postOffice: 'Durgachak',
        state: 'West Bengal',
        latitude: baseLat + 0.015, // ~2.0 km away
        longitude: baseLng + 0.010
      },
      availabilityDate: '2026-09-12',
      reliabilityScore: 91,
      completedTransactions: 9,
      status: 'AVAILABLE',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString()
    };

    // 3. Farmer C (20 kg @ 3.1 km, ₹24/kg)
    const supplyC: FarmerSupply = {
      id: 'supply_farmer_c',
      farmerId: 'farmer_c_id',
      farmerName: 'Anup Bera (Farmer C)',
      farmerPhone: '+91 98323 67890',
      crop: 'Potato',
      availableQuantityKg: 20,
      remainingQuantityKg: 20,
      expectedPricePerKg: 24,
      location: {
        district: 'Purba Medinipur',
        village: 'Chaitanyapur',
        postOffice: 'Chaitanyapur',
        state: 'West Bengal',
        latitude: baseLat + 0.024, // ~3.1 km away
        longitude: baseLng + 0.016
      },
      availabilityDate: '2026-09-13',
      reliabilityScore: 88,
      completedTransactions: 6,
      status: 'AVAILABLE',
      createdAt: new Date(Date.now() - 10800000).toISOString(),
      updatedAt: new Date(Date.now() - 10800000).toISOString()
    };

    // Extra supplies in other crops/districts to test filtering
    const supplyD: FarmerSupply = {
      id: 'supply_farmer_d',
      farmerId: 'farmer_d_id',
      farmerName: 'Suresh Patil',
      farmerPhone: '+91 98200 12345',
      crop: 'Tomato',
      availableQuantityKg: 100,
      remainingQuantityKg: 100,
      expectedPricePerKg: 22,
      location: {
        district: 'Purba Medinipur',
        village: 'Tamluk',
        postOffice: 'Tamluk',
        state: 'West Bengal',
        latitude: 22.28,
        longitude: 87.92
      },
      availabilityDate: '2026-09-14',
      reliabilityScore: 94,
      completedTransactions: 18,
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.supplies.set(supplyA.id, supplyA);
    this.supplies.set(supplyB.id, supplyB);
    this.supplies.set(supplyC.id, supplyC);
    this.supplies.set(supplyD.id, supplyD);

    logger.info('[SmartMandi] Pre-seeded demo supplies for Haldia / Purba Medinipur Potato');
  }

  // ============================================================
  // BUYER REQUIREMENT ACTIONS
  // ============================================================

  /**
   * Post a buyer requirement and automatically build best supply pool
   */
  static createRequirement(req: Omit<BuyerRequirement, 'id' | 'remainingQuantityKg' | 'status' | 'createdAt' | 'expiresAt'>): {
    requirement: BuyerRequirement;
    pool: SupplyPool | null;
    collectionPlan: SmartCollectionPlan | null;
  } {
    const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const requirement: BuyerRequirement = {
      ...req,
      id,
      remainingQuantityKg: req.requiredQuantityKg,
      status: 'SEARCHING',
      createdAt: new Date().toISOString(),
      expiresAt
    };

    this.requirements.set(id, requirement);

    // Run deterministic matching & multi-farmer pooling
    const { pool, collectionPlan } = this.matchAndPoolForRequirement(requirement);

    return { requirement, pool, collectionPlan };
  }

  static getRequirement(id: string): BuyerRequirement | null {
    return this.requirements.get(id) || null;
  }

  static getAllRequirements(buyerId?: string): BuyerRequirement[] {
    const all = Array.from(this.requirements.values());
    if (buyerId) return all.filter(r => r.buyerId === buyerId);
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // ============================================================
  // FARMER SUPPLY ACTIONS
  // ============================================================

  /**
   * Post a farmer supply and automatically check matching buyer requirements
   */
  static createSupply(supplyInput: Omit<FarmerSupply, 'id' | 'remainingQuantityKg' | 'status' | 'createdAt' | 'updatedAt'>): {
    supply: FarmerSupply;
    matchedRequirements: BuyerRequirement[];
  } {
    const id = `supply_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const supply: FarmerSupply = {
      ...supplyInput,
      id,
      remainingQuantityKg: supplyInput.availableQuantityKg,
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.supplies.set(id, supply);

    // Check if this new supply can backfill or upgrade active buyer requirements
    const matchedRequirements = this.checkAndBackfillRequirementsForSupply(supply);

    return { supply, matchedRequirements };
  }

  static getSupply(id: string): FarmerSupply | null {
    return this.supplies.get(id) || null;
  }

  static getAllSupplies(farmerId?: string): FarmerSupply[] {
    const all = Array.from(this.supplies.values());
    if (farmerId) return all.filter(s => s.farmerId === farmerId);
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // ============================================================
  // CORE DETERMINISTIC MATCHING & POOLING ENGINE
  // ============================================================

  /**
   * Finds matching active farmer supplies, ranks them, allocates quantities,
   * creates consolidated SupplyPool and SmartCollectionPlan.
   */
  static matchAndPoolForRequirement(requirement: BuyerRequirement): {
    pool: SupplyPool | null;
    collectionPlan: SmartCollectionPlan | null;
  } {
    const candidateSupplies = Array.from(this.supplies.values()).filter(s => {
      if (s.crop.toLowerCase() !== requirement.crop.toLowerCase()) return false;
      if (s.remainingQuantityKg <= 0) return false;
      if (s.status !== 'AVAILABLE' && s.status !== 'MATCHED') return false;

      // Distance filter
      const dist = estimateLocationDistanceKm(requirement.location, s.location);
      if (dist > requirement.searchRadiusKm) return false;

      return true;
    });

    if (candidateSupplies.length === 0) {
      requirement.status = 'SEARCHING';
      this.requirements.set(requirement.id, requirement);
      return { pool: null, collectionPlan: null };
    }

    // Rank candidate farmers
    // Criteria: Distance (shorter is better), Quantity (bigger batch is better to minimize stops), Reliability
    const scoredCandidates = candidateSupplies.map(s => {
      const dist = estimateLocationDistanceKm(requirement.location, s.location);
      const priceGap = Math.max(0, s.expectedPricePerKg - requirement.expectedPricePerKg);
      const reliability = s.reliabilityScore || 75;

      // Lower score is better
      const score = (dist * 2.0) + (priceGap * 3.0) - (Math.min(s.remainingQuantityKg, requirement.requiredQuantityKg) * 0.05) - (reliability * 0.05);

      return { supply: s, distanceKm: dist, score };
    });

    scoredCandidates.sort((a, b) => a.score - b.score);

    // Greedily allocate quantities until required quantity is fulfilled
    let neededKg = requirement.requiredQuantityKg;
    let matchedKg = 0;
    const allocations: SupplyMatchAllocation[] = [];

    for (const item of scoredCandidates) {
      if (neededKg <= 0) break;

      const s = item.supply;
      const allocKg = Math.min(s.remainingQuantityKg, neededKg);
      if (allocKg <= 0) continue;

      neededKg -= allocKg;
      matchedKg += allocKg;

      const priceDiff = parseFloat((s.expectedPricePerKg - requirement.expectedPricePerKg).toFixed(2));

      allocations.push({
        farmerSupplyId: s.id,
        farmerId: s.farmerId,
        farmerName: s.farmerName,
        farmerPhone: s.farmerPhone,
        allocatedQuantityKg: allocKg,
        distanceKm: item.distanceKm,
        pricePerKg: s.expectedPricePerKg,
        priceDifferencePerKg: priceDiff,
        reliabilityScore: s.reliabilityScore,
        farmerStatus: 'NOTIFIED'
      });

      // Update farmer supply status to MATCHED (do NOT permanently deduct inventory until confirmed)
      s.status = 'MATCHED';
      this.supplies.set(s.id, s);

      // Create notification for matched farmer
      this.createNotification({
        recipientId: s.farmerId,
        recipientRole: 'FARMER',
        title: `🔔 Buyer Found Near You!`,
        body: `${requirement.buyerName} requested ${allocKg} kg of ${requirement.crop} (${item.distanceKm} km away) at ₹${requirement.expectedPricePerKg}/kg.`,
        type: 'BUYER_FOUND',
        crop: requirement.crop,
        quantityKg: allocKg,
        expectedPricePerKg: requirement.expectedPricePerKg,
        distanceKm: item.distanceKm,
        requirementId: requirement.id,
        supplyId: s.id
      });
    }

    const fulfillmentPercent = Math.min(100, Math.round((matchedKg / requirement.requiredQuantityKg) * 100));
    requirement.remainingQuantityKg = Math.max(0, requirement.requiredQuantityKg - matchedKg);
    requirement.status = fulfillmentPercent === 100 ? 'MATCHED' : fulfillmentPercent > 0 ? 'PARTIAL_MATCH' : 'SEARCHING';
    this.requirements.set(requirement.id, requirement);

    // Compute estimated product value
    const estimatedProductValue = allocations.reduce((sum, a) => sum + (a.allocatedQuantityKg * a.pricePerKg), 0);

    const poolId = `pool_${requirement.id}`;
    const pool: SupplyPool = {
      id: poolId,
      buyerRequirementId: requirement.id,
      crop: requirement.crop,
      requiredQuantityKg: requirement.requiredQuantityKg,
      matchedQuantityKg: matchedKg,
      fulfillmentPercentage: fulfillmentPercent,
      farmerCount: allocations.length,
      estimatedProductValue,
      allocations,
      status: fulfillmentPercent === 100 ? 'MATCHED' : 'PARTIAL_MATCH',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.pools.set(poolId, pool);

    // Create Smart Collection Plan
    const collectionPlan = this.buildCollectionPlan(pool, requirement.location);
    this.collectionPlans.set(poolId, collectionPlan);

    // Create notification for buyer
    this.createNotification({
      recipientId: requirement.buyerId,
      recipientRole: 'BUYER',
      title: fulfillmentPercent === 100 ? `🎉 Supply Pool Fulfilled!` : `📦 Supply Pool Updated (${fulfillmentPercent}%)`,
      body: `Found ${allocations.length} nearby farmer(s) for ${matchedKg}/${requirement.requiredQuantityKg} kg of ${requirement.crop}. Consolidated collection route ready.`,
      type: fulfillmentPercent === 100 ? 'POOL_FULL' : 'SUPPLY_MATCHED',
      crop: requirement.crop,
      quantityKg: matchedKg,
      requirementId: requirement.id,
      poolId: pool.id
    });

    return { pool, collectionPlan };
  }

  /**
   * Route optimization: Orders collection stops in a greedy distance-aware TSP sequence
   * and calculates consolidated transport savings vs. separate individual trips.
   */
  static buildCollectionPlan(pool: SupplyPool, buyerLocation: StructuredLocation): SmartCollectionPlan {
    const allocations = pool.allocations;
    const stops: CollectionStop[] = [];

    if (allocations.length === 0) {
      return {
        id: `plan_${pool.id}`,
        supplyPoolId: pool.id,
        buyerLocation,
        stops: [],
        totalStops: 0,
        totalQuantityKg: 0,
        totalRouteDistanceKm: 0,
        separateTripsDistanceKm: 0,
        transportCostModelAvailable: false,
        efficiencyNote: 'No stops available.'
      };
    }

    // Greedy TSP: Start at buyer location, visit closest unvisited farmer, repeat, return to buyer
    let currentLoc = buyerLocation;
    let remainingAllocs = [...allocations];
    let cumulativeDist = 0;
    let stopIdx = 1;
    let separateTotalDist = 0;

    while (remainingAllocs.length > 0) {
      // Find nearest unvisited farmer from current location
      let nearestIdx = 0;
      let minLegDist = Infinity;

      for (let i = 0; i < remainingAllocs.length; i++) {
        const alloc = remainingAllocs[i];
        const s = this.supplies.get(alloc.farmerSupplyId);
        const farmerLoc = s?.location || buyerLocation;
        const legDist = estimateLocationDistanceKm(currentLoc, farmerLoc);
        if (legDist < minLegDist) {
          minLegDist = legDist;
          nearestIdx = i;
        }
      }

      const chosenAlloc = remainingAllocs[nearestIdx];
      remainingAllocs.splice(nearestIdx, 1);

      const chosenSupply = this.supplies.get(chosenAlloc.farmerSupplyId);
      const chosenLoc = chosenSupply?.location || buyerLocation;
      cumulativeDist = parseFloat((cumulativeDist + minLegDist).toFixed(1));

      stops.push({
        stopNumber: stopIdx++,
        farmerSupplyId: chosenAlloc.farmerSupplyId,
        farmerName: chosenAlloc.farmerName,
        location: chosenLoc,
        quantityKg: chosenAlloc.allocatedQuantityKg,
        distanceFromPrevKm: minLegDist,
        cumulativeDistanceKm: cumulativeDist
      });

      // Separate trip distance for this farmer = 2 * distance from buyer
      const directDist = estimateLocationDistanceKm(buyerLocation, chosenLoc);
      separateTotalDist += (directDist * 2);

      currentLoc = chosenLoc;
    }

    // Add final return leg from last stop back to buyer
    const returnLeg = estimateLocationDistanceKm(currentLoc, buyerLocation);
    const totalRouteDist = parseFloat((cumulativeDist + returnLeg).toFixed(1));
    const roundedSeparateDist = parseFloat(separateTotalDist.toFixed(1));

    // Calculate transport cost based on configured model
    const consolidatedCost = Math.round(
      TRANSPORT_CONFIG.baseCost +
      (totalRouteDist * TRANSPORT_CONFIG.costPerKm) +
      (pool.matchedQuantityKg * TRANSPORT_CONFIG.handlingPerKg)
    );

    const separateTripsCost = Math.round(
      (allocations.length * TRANSPORT_CONFIG.baseCost) +
      (roundedSeparateDist * TRANSPORT_CONFIG.costPerKm) +
      (pool.matchedQuantityKg * TRANSPORT_CONFIG.handlingPerKg)
    );

    const potentialSaving = Math.max(0, separateTripsCost - consolidatedCost);

    return {
      id: `plan_${pool.id}`,
      supplyPoolId: pool.id,
      buyerLocation,
      stops,
      totalStops: stops.length,
      totalQuantityKg: pool.matchedQuantityKg,
      totalRouteDistanceKm: totalRouteDist,
      separateTripsDistanceKm: roundedSeparateDist,
      estimatedTransportCost: consolidatedCost,
      potentialTransportSaving: potentialSaving,
      transportCostModelAvailable: true,
      costAssumptions: TRANSPORT_CONFIG,
      efficiencyNote: `Consolidated collection saves approx ${(roundedSeparateDist - totalRouteDist).toFixed(1)} km (~₹${potentialSaving}) compared to ${allocations.length} separate pickup trips.`
    };
  }

  /**
   * Reverse matching: When a farmer posts new supply, check active partial or searching buyer requirements
   */
  static checkAndBackfillRequirementsForSupply(supply: FarmerSupply): BuyerRequirement[] {
    const matchingReqs = Array.from(this.requirements.values()).filter(r => {
      if (r.crop.toLowerCase() !== supply.crop.toLowerCase()) return false;
      if (r.remainingQuantityKg <= 0) return false;
      if (r.status !== 'SEARCHING' && r.status !== 'PARTIAL_MATCH') return false;

      const dist = estimateLocationDistanceKm(r.location, supply.location);
      return dist <= r.searchRadiusKm;
    });

    for (const req of matchingReqs) {
      if (supply.remainingQuantityKg <= 0) break;
      this.matchAndPoolForRequirement(req);
    }

    return matchingReqs;
  }

  // ============================================================
  // FARMER RESPONSE ACTIONS (Accept / Decline)
  // ============================================================

  static respondToAllocation(poolId: string, farmerSupplyId: string, action: 'ACCEPT' | 'DECLINE'): {
    pool: SupplyPool | null;
    success: boolean;
  } {
    const pool = this.pools.get(poolId);
    if (!pool) return { pool: null, success: false };

    const alloc = pool.allocations.find(a => a.farmerSupplyId === farmerSupplyId);
    if (!alloc) return { pool, success: false };

    if (action === 'ACCEPT') {
      alloc.farmerStatus = 'ACCEPTED';
      const allAccepted = pool.allocations.every(a => a.farmerStatus === 'ACCEPTED');
      if (allAccepted) {
        pool.status = 'ALL_ACCEPTED';
      }
      this.pools.set(poolId, pool);

      const req = this.requirements.get(pool.buyerRequirementId);
      if (req) {
        this.createNotification({
          recipientId: req.buyerId,
          recipientRole: 'BUYER',
          title: `✅ Farmer Accepted Allocation`,
          body: `${alloc.farmerName} confirmed ${alloc.allocatedQuantityKg} kg of ${pool.crop} for your supply pool.`,
          type: 'FARMER_ACCEPTED',
          crop: pool.crop,
          quantityKg: alloc.allocatedQuantityKg,
          requirementId: req.id,
          poolId: pool.id
        });
      }
      return { pool, success: true };
    } else {
      alloc.farmerStatus = 'DECLINED';
      // Re-open supply back to AVAILABLE
      const s = this.supplies.get(farmerSupplyId);
      if (s) {
        s.status = 'AVAILABLE';
        this.supplies.set(s.id, s);
      }

      // Re-run matching for the buyer requirement to backfill
      const req = this.requirements.get(pool.buyerRequirementId);
      if (req) {
        this.createNotification({
          recipientId: req.buyerId,
          recipientRole: 'BUYER',
          title: `⚠️ Farmer Declined Allocation`,
          body: `${alloc.farmerName} declined. Searching other nearby farmers to backfill your ${pool.crop} supply pool.`,
          type: 'FARMER_DECLINED',
          crop: pool.crop,
          quantityKg: alloc.allocatedQuantityKg,
          requirementId: req.id,
          poolId: pool.id
        });
        const recheck = this.matchAndPoolForRequirement(req);
        return { pool: recheck.pool, success: true };
      }
      return { pool, success: true };
    }
  }

  // ============================================================
  // POOL & COLLECTION PLAN LOOKUPS
  // ============================================================

  static getPool(poolId: string): SupplyPool | null {
    return this.pools.get(poolId) || null;
  }

  static getPoolForRequirement(requirementId: string): SupplyPool | null {
    return this.pools.get(`pool_${requirementId}`) || null;
  }

  static getCollectionPlan(poolId: string): SmartCollectionPlan | null {
    return this.collectionPlans.get(poolId) || null;
  }

  // ============================================================
  // NOTIFICATION MANAGEMENT
  // ============================================================

  static createNotification(notif: Omit<MandiNotification, 'id' | 'read' | 'createdAt'>): MandiNotification {
    const full: MandiNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(full);
    return full;
  }

  static getNotifications(recipientId?: string, role?: 'BUYER' | 'FARMER'): MandiNotification[] {
    let list = this.notifications;
    if (recipientId) {
      list = list.filter(n => n.recipientId === recipientId);
    } else if (role) {
      list = list.filter(n => n.recipientRole === role);
    }
    return list.slice(0, 30);
  }

  static markNotificationRead(id: string): boolean {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      return true;
    }
    return false;
  }
}
