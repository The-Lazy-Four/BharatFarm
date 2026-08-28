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
    const { category, search, minPrice, maxPrice, sellerId } = req.query;
    const filters = {
      category: typeof category === 'string' ? category : undefined,
      search: typeof search === 'string' ? search : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sellerId: typeof sellerId === 'string' ? sellerId : undefined
    };

    const listings = await this.service.getAllListings(filters);
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
    const sellerName = req.user?.fullName || (req.user?.email ? req.user.email.split('@')[0] : 'Farmer');

    const created = await this.service.createListing(
      req.body,
      sellerId,
      sellerName,
      req.body.sellerPhone
    );
    ApiResponse.success(res, created, 'Listing created successfully', 201);
  };

  updateListing = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const sellerId = req.user?.id;
    try {
      const updated = await this.service.updateListing(req.params.id, req.body, sellerId);
      if (!updated) {
        ApiResponse.error(res, 'Listing not found to update', 'NOT_FOUND', 404);
        return;
      }
      ApiResponse.success(res, updated, 'Listing updated successfully');
    } catch (err: any) {
      if (err.message === 'FORBIDDEN_SELLER_OPERATION') {
        ApiResponse.error(res, 'You are not authorized to update this listing', 'FORBIDDEN', 403);
        return;
      }
      throw err;
    }
  };

  deleteListing = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const sellerId = req.user?.id;
    try {
      const deleted = await this.service.deleteListing(req.params.id, sellerId);
      if (!deleted) {
        ApiResponse.error(res, 'Listing not found to delete', 'NOT_FOUND', 404);
        return;
      }
      ApiResponse.success(res, { id: req.params.id }, 'Listing deleted successfully');
    } catch (err: any) {
      if (err.message === 'FORBIDDEN_SELLER_OPERATION') {
        ApiResponse.error(res, 'You are not authorized to delete this listing', 'FORBIDDEN', 403);
        return;
      }
      throw err;
    }
  };
}

