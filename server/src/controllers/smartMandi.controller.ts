import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { SmartMandiMatchingService } from '../services/smartMandiMatching.service.js';
import { SmartMandiAiService } from '../services/smartMandiAi.service.js';

export class SmartMandiController {

  /**
   * POST /api/smart-mandi/requirements
   * Buyer posts a requirement. Matching engine automatically searches nearby farmers
   * and creates a consolidated Supply Pool & Smart Collection Plan.
   */
  createRequirement = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        buyerId = 'buyer_haldia_demo',
        buyerName = 'Haldia Agro Foods Ltd.',
        buyerPhone = '+91 98765 43210',
        crop,
        requiredQuantityKg,
        expectedPricePerKg,
        location,
        searchRadiusKm = 10,
        requiredBy,
        notes
      } = req.body;

      if (!crop || !requiredQuantityKg || !expectedPricePerKg || !location?.district || !location?.state) {
        ApiResponse.error(res, 'Missing required fields: crop, requiredQuantityKg, expectedPricePerKg, location.district, location.state', 'VALIDATION_ERROR', 400);
        return;
      }

      if (requiredQuantityKg <= 0 || expectedPricePerKg <= 0) {
        ApiResponse.error(res, 'Quantity and price must be positive numbers', 'VALIDATION_ERROR', 400);
        return;
      }

      const { requirement, pool, collectionPlan } = SmartMandiMatchingService.createRequirement({
        buyerId,
        buyerName,
        buyerPhone,
        crop: crop.trim(),
        requiredQuantityKg: Number(requiredQuantityKg),
        expectedPricePerKg: Number(expectedPricePerKg),
        location: {
          district: location.district.trim(),
          village: location.village?.trim() || location.district.trim(),
          postOffice: location.postOffice?.trim() || location.district.trim(),
          state: location.state.trim(),
          latitude: location.latitude ? Number(location.latitude) : undefined,
          longitude: location.longitude ? Number(location.longitude) : undefined
        },
        searchRadiusKm: Number(searchRadiusKm) || 10,
        requiredBy: requiredBy || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes
      });

      // Generate AI explanation for the pool if created
      if (pool) {
        pool.aiExplanation = await SmartMandiAiService.explainSupplyPool(pool, collectionPlan);
      }

      ApiResponse.success(res, {
        requirement,
        pool,
        collectionPlan
      }, 'Buyer requirement created and matched with nearby farmers');
    } catch (err: any) {
      logger.error('[SmartMandiController] createRequirement error:', err);
      ApiResponse.error(res, 'Failed to create requirement', err.message);
    }
  };

  /**
   * GET /api/smart-mandi/requirements
   */
  getAllRequirements = async (req: Request, res: Response): Promise<void> => {
    try {
      const { buyerId } = req.query;
      const requirements = SmartMandiMatchingService.getAllRequirements(buyerId as string);
      ApiResponse.success(res, requirements);
    } catch (err: any) {
      ApiResponse.error(res, 'Failed to fetch requirements', err.message);
    }
  };

  /**
   * GET /api/smart-mandi/requirements/:id
   */
  getRequirementById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const requirement = SmartMandiMatchingService.getRequirement(id);
      if (!requirement) {
        ApiResponse.error(res, 'Requirement not found', 'NOT_FOUND', 404);
        return;
      }
      const pool = SmartMandiMatchingService.getPoolForRequirement(id);
      const collectionPlan = pool ? SmartMandiMatchingService.getCollectionPlan(pool.id) : null;
      ApiResponse.success(res, { requirement, pool, collectionPlan });
    } catch (err: any) {
      ApiResponse.error(res, 'Failed to fetch requirement', err.message);
    }
  };

  /**
   * POST /api/smart-mandi/parse-requirement
   * AI natural language requirement extractor
   */
  parseNaturalLanguageRequirement = async (req: Request, res: Response): Promise<void> => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        ApiResponse.error(res, 'Prompt text is required', 'VALIDATION_ERROR', 400);
        return;
      }
      const parsed = await SmartMandiAiService.parseNaturalLanguageRequirement(prompt);
      ApiResponse.success(res, parsed);
    } catch (err: any) {
      ApiResponse.error(res, 'Failed to parse natural language requirement', err.message);
    }
  };

  /**
   * POST /api/smart-mandi/supplies
   * Farmer posts available supply. Automatically triggers reverse matching for active requirements.
   */
  createSupply = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        farmerId = 'farmer_demo_1',
        farmerName = 'Local Farmer',
        farmerPhone = '+91 98321 00000',
        crop,
        availableQuantityKg,
        expectedPricePerKg,
        location,
        availabilityDate,
        fieldMappingId,
        notes
      } = req.body;

      if (!crop || !availableQuantityKg || !expectedPricePerKg || !location?.district || !location?.state) {
        ApiResponse.error(res, 'Missing required fields: crop, availableQuantityKg, expectedPricePerKg, location.district, location.state', 'VALIDATION_ERROR', 400);
        return;
      }

      const { supply, matchedRequirements } = SmartMandiMatchingService.createSupply({
        farmerId,
        farmerName,
        farmerPhone,
        crop: crop.trim(),
        availableQuantityKg: Number(availableQuantityKg),
        expectedPricePerKg: Number(expectedPricePerKg),
        location: {
          district: location.district.trim(),
          village: location.village?.trim() || location.district.trim(),
          postOffice: location.postOffice?.trim() || location.district.trim(),
          state: location.state.trim(),
          latitude: location.latitude ? Number(location.latitude) : undefined,
          longitude: location.longitude ? Number(location.longitude) : undefined
        },
        availabilityDate: availabilityDate || new Date().toISOString().split('T')[0],
        fieldMappingId,
        notes
      });

      ApiResponse.success(res, {
        supply,
        matchedRequirementsCount: matchedRequirements.length,
        matchedRequirements
      }, 'Farmer supply created and matched with active buyer requirements');
    } catch (err: any) {
      logger.error('[SmartMandiController] createSupply error:', err);
      ApiResponse.error(res, 'Failed to create supply', err.message);
    }
  };

  /**
   * GET /api/smart-mandi/supplies
   */
  getAllSupplies = async (req: Request, res: Response): Promise<void> => {
    try {
      const { farmerId } = req.query;
      const supplies = SmartMandiMatchingService.getAllSupplies(farmerId as string);
      ApiResponse.success(res, supplies);
    } catch (err: any) {
      ApiResponse.error(res, 'Failed to fetch supplies', err.message);
    }
  };

  /**
   * GET /api/smart-mandi/supply-pools/:id
   */
  getSupplyPool = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const pool = SmartMandiMatchingService.getPool(id);
      if (!pool) {
        ApiResponse.error(res, 'Supply pool not found', 'NOT_FOUND', 404);
        return;
      }
      const collectionPlan = SmartMandiMatchingService.getCollectionPlan(id);
      ApiResponse.success(res, { pool, collectionPlan });
    } catch (err: any) {
      ApiResponse.error(res, 'Failed to fetch supply pool', err.message);
    }
  };

  /**
   * POST /api/smart-mandi/pools/:poolId/allocations/:supplyId/respond
   * Farmer accepts or declines an allocation in a supply pool.
   */
  respondToAllocation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { poolId, supplyId } = req.params;
      const { action } = req.body; // 'ACCEPT' | 'DECLINE'

      if (action !== 'ACCEPT' && action !== 'DECLINE') {
        ApiResponse.error(res, 'Action must be ACCEPT or DECLINE', 'VALIDATION_ERROR', 400);
        return;
      }

      const { pool, success } = SmartMandiMatchingService.respondToAllocation(poolId, supplyId, action);
      if (!success || !pool) {
        ApiResponse.error(res, 'Failed to process allocation response', 'SERVER_ERROR', 500);
        return;
      }

      ApiResponse.success(res, { pool }, `Allocation ${action.toLowerCase()}ed successfully`);
    } catch (err: any) {
      ApiResponse.error(res, 'Failed to respond to allocation', err.message);
    }
  };

  /**
   * GET /api/smart-mandi/notifications
   */
  getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const { recipientId, role } = req.query;
      const notifications = SmartMandiMatchingService.getNotifications(
        recipientId as string,
        role as 'BUYER' | 'FARMER'
      );
      ApiResponse.success(res, notifications);
    } catch (err: any) {
      ApiResponse.error(res, 'Failed to fetch notifications', err.message);
    }
  };

  /**
   * POST /api/smart-mandi/notifications/:id/read
   */
  markNotificationRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const ok = SmartMandiMatchingService.markNotificationRead(id);
      ApiResponse.success(res, { read: ok });
    } catch (err: any) {
      ApiResponse.error(res, 'Failed to update notification', err.message);
    }
  };

  /**
   * POST /api/smart-mandi/seed-demo
   * Re-seeds the Haldia Potato demonstration fixtures.
   */
  seedDemo = async (_req: Request, res: Response): Promise<void> => {
    try {
      SmartMandiMatchingService.seedDemoFixtures();
      ApiResponse.success(res, { seeded: true }, 'Haldia / Purba Medinipur demo fixtures seeded successfully');
    } catch (err: any) {
      ApiResponse.error(res, 'Failed to seed demo fixtures', err.message);
    }
  };
}
