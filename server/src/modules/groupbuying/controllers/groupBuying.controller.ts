import { Request, Response } from 'express';
import { GroupBuyingService } from '../services/groupBuying.service.js';
import { ApiResponse } from '../../../utils/apiResponse.js';

export class GroupBuyingController {
  private service: GroupBuyingService;

  constructor() {
    this.service = new GroupBuyingService();
  }

  getPools = async (req: Request, res: Response): Promise<void> => {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;

    const pools = await this.service.getAllPools({ category, search, status });
    ApiResponse.success(res, pools, 'Group buying pools fetched');
  };

  getPoolById = async (req: Request, res: Response): Promise<void> => {
    const pool = await this.service.getPoolById(req.params.id);
    if (!pool) {
      ApiResponse.error(res, 'Group buy pool not found', 'NOT_FOUND', 404);
      return;
    }
    ApiResponse.success(res, pool, 'Group buy details fetched');
  };

  createPool = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    if (!userId) {
      ApiResponse.error(res, 'Authentication required', 'UNAUTHORIZED', 401);
      return;
    }

    const pool = await this.service.createPool(req.body, userId);
    ApiResponse.success(res, pool, 'Group buying pool created successfully', 201);
  };

  joinPool = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id || '00000000-0000-0000-0000-000000000001';
    const quantity = Number(req.body.quantity);

    const { pool, error } = await this.service.joinGroupBuy(req.params.id, quantity, userId);

    if (!pool && error === 'Group buy pool not found') {
      ApiResponse.error(res, error, 'NOT_FOUND', 404);
      return;
    }

    if (error) {
      ApiResponse.error(res, error, 'JOIN_FAILED', 409);
      return;
    }

    ApiResponse.success(res, pool, 'Successfully joined group buy pool');
  };

  getPoolMembers = async (req: Request, res: Response): Promise<void> => {
    const members = await this.service.getPoolMembers(req.params.id);
    ApiResponse.success(res, members, 'Pool members fetched');
  };

  seedPools = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.seedDemoPools();
    ApiResponse.success(res, result, result.message);
  };
}
