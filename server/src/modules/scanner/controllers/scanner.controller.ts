import { Request, Response } from 'express';
import { ScannerService } from '../services/scanner.service.js';
import { ApiResponse } from '../../../utils/apiResponse.js';

export class ScannerController {
  private service: ScannerService;

  constructor() {
    this.service = new ScannerService();
  }

  analyze = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.analyzeLeafImage(req.body);
    ApiResponse.success(res, result, 'Leaf image analyzed successfully (Mock Mode)');
  };
}
