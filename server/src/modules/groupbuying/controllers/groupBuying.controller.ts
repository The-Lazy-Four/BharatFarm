import { Request, Response } from 'express';
import { GroupBuyingService } from '../services/groupBuying.service.js';
import { ApiResponse } from '../../../utils/apiResponse.js';

export class GroupBuyingController {
  private service: GroupBuyingService;

  constructor() {
    this.service = new GroupBuyingService();
  }

  getPools = async (req: Request, res: Response): Promise<void> => {
    const pools = await this.service.getAllPools();
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

  joinPool = async (req: Request, res: Response): Promise<void> => {
    const quantity = Number(req.body.quantity);
    const { pool, error } = await this.service.joinGroupBuy(req.params.id, quantity);
    if (!pool) {
      ApiResponse.error(res, error || 'Group buy pool not found', 'NOT_FOUND', 404);
      return;
    }
    if (error) {
      ApiResponse.error(res, error, 'POOL_NOT_OPEN', 409);
      return;
    }
    ApiResponse.success(res, pool, 'Successfully joined group buy pool');
  };
}
