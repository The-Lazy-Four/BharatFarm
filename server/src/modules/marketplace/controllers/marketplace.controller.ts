import { Request, Response } from 'express';
import { MarketplaceService } from '../services/marketplace.service.js';
import { ApiResponse } from '../../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware.js';

export class MarketplaceController {
  private service: MarketplaceService;

  constructor() {
    this.service = new MarketplaceService();
  }

  getListings = async (req: Request, res: Response): Promise<void> => {
    const listings = await this.service.getAllListings();
    ApiResponse.success(res, listings, 'Listings fetched successfully');
  };

  getListingById = async (req: Request, res: Response): Promise<void> => {
    const listing = await this.service.getListingById(req.params.id);
    if (!listing) {
      ApiResponse.error(res, 'Listing not found', 'NOT_FOUND', 404);
      return;
    }
    ApiResponse.success(res, listing, 'Listing fetched successfully');
  };

  createListing = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const sellerId = req.user?.id || 'anonymous-user';
    const sellerName = req.user?.email ? req.user.email.split('@')[0] : undefined;
    const created = await this.service.createListing(req.body, sellerId, sellerName);
    ApiResponse.success(res, created, 'Listing created successfully', 201);
  };

  updateListing = async (req: Request, res: Response): Promise<void> => {
    const updated = await this.service.updateListing(req.params.id, req.body);
    if (!updated) {
      ApiResponse.error(res, 'Listing not found to update', 'NOT_FOUND', 404);
      return;
    }
    ApiResponse.success(res, updated, 'Listing updated successfully');
  };

  deleteListing = async (req: Request, res: Response): Promise<void> => {
    const deleted = await this.service.deleteListing(req.params.id);
    if (!deleted) {
      ApiResponse.error(res, 'Listing not found to delete', 'NOT_FOUND', 404);
      return;
    }
    ApiResponse.success(res, { id: req.params.id }, 'Listing deleted successfully');
  };
}
