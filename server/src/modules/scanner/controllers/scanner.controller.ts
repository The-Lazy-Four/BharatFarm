import { Request, Response } from 'express';
import { ScannerService } from '../services/scanner.service.js';
import { ApiResponse } from '../../../utils/apiResponse.js';

export class ScannerController {
  private service: ScannerService;

  constructor() {
    this.service = new ScannerService();
  }

  analyze = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;
    const result = await this.service.analyzeLeafImage(req.body, userId);
    ApiResponse.success(res, result, 'Leaf image analyzed successfully');
  };

  getHistory = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id || 'demo-user-id';
    const history = await this.service.getHistory(userId);
    ApiResponse.success(res, history, 'Scan history retrieved successfully');
  };

  deleteScan = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id || 'demo-user-id';
    const scanId = req.params.id;
    const success = await this.service.deleteScan(scanId, userId);
    ApiResponse.success(res, { success }, 'Scan history deleted successfully');
  };
}
