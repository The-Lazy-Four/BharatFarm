import { Router } from 'express';
import { MarketplaceController } from '../controllers/marketplace.controller.js';
import { CropLookupController } from '../controllers/cropLookup.controller.js';
import { validateRequest } from '../../../middleware/validation.middleware.js';
import { marketplaceSchema } from '../schemas/marketplace.schema.js';
import { authenticateToken } from '../../../middleware/auth.middleware.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

const router = Router();
const controller = new MarketplaceController();
const cropLookupController = new CropLookupController();

// Crop image lookup (public, no auth required) — must be before :id routes
router.get('/crop-lookup', asyncHandler(cropLookupController.lookup));

router.get('/listings', asyncHandler(controller.getListings));
router.get('/listings/:id', asyncHandler(controller.getListingById));
router.post('/listings', authenticateToken, validateRequest(marketplaceSchema), asyncHandler(controller.createListing));
router.patch('/listings/:id', authenticateToken, asyncHandler(controller.updateListing));
router.delete('/listings/:id', authenticateToken, asyncHandler(controller.deleteListing));

export default router;

