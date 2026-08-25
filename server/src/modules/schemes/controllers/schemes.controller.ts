import { Request, Response } from 'express';
import { SchemesService } from '../services/schemes.service.js';
import { ApiResponse } from '../../../utils/apiResponse.js';

export class SchemesController {
  private service: SchemesService;

  constructor() {
    this.service = new SchemesService();
  }

  getSchemes = async (req: Request, res: Response): Promise<void> => {
    const schemes = await this.service.getSchemes();
    ApiResponse.success(res, schemes, 'Government schemes retrieved successfully');
  };

  checkEligibility = async (req: Request, res: Response): Promise<void> => {
    const { state, landSizeAcres, cropCategory, annualIncome } = req.body;
    const eligible = await this.service.checkEligibility({
      state,
      landSizeAcres: Number(landSizeAcres),
      cropCategory: cropCategory || '',
      annualIncome: annualIncome !== undefined ? Number(annualIncome) : undefined
    });
    ApiResponse.success(res, eligible, 'Eligibility check completed');
  };

  assessLoanEligibility = async (req: Request, res: Response): Promise<void> => {
    const landSize = Number(req.body.landSizeAcres);
    const annualIncome = req.body.annualIncome !== undefined ? Number(req.body.annualIncome) : undefined;
    const result = await this.service.getLoanAssessment(landSize, annualIncome);
    ApiResponse.success(res, result, 'Loan eligibility assessment generated');
  };
}
