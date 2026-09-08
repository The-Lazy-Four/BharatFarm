import { Router } from 'express';
import { SmartMandiController } from '../controllers/smartMandi.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
const controller = new SmartMandiController();

// Buyer Requirement routes
router.post('/requirements', asyncHandler(controller.createRequirement));
router.get('/requirements', asyncHandler(controller.getAllRequirements));
router.get('/requirements/:id', asyncHandler(controller.getRequirementById));
router.post('/parse-requirement', asyncHandler(controller.parseNaturalLanguageRequirement));

// Farmer Supply routes
router.post('/supplies', asyncHandler(controller.createSupply));
router.get('/supplies', asyncHandler(controller.getAllSupplies));

// Supply Pool & Collection Plan routes
router.get('/supply-pools/:id', asyncHandler(controller.getSupplyPool));
router.post('/pools/:poolId/allocations/:supplyId/respond', asyncHandler(controller.respondToAllocation));

// Notifications routes
router.get('/notifications', asyncHandler(controller.getNotifications));
router.post('/notifications/:id/read', asyncHandler(controller.markNotificationRead));

// Demo Seed route
router.post('/seed-demo', asyncHandler(controller.seedDemo));

export default router;
