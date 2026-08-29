import { Request, Response } from 'express';
import { SchemesService } from '../services/schemes.service.js';
import { ApiResponse } from '../../../utils/apiResponse.js';

export class SchemesController {
  private service: SchemesService;

  constructor() {
    this.service = new SchemesService();
  }

  getSchemes = async (req: Request, res: Response): Promise<void> => {
    const { category, state, search } = req.query;
    const schemes = await this.service.getSchemes({
      category: category ? String(category) : undefined,
      state: state ? String(state) : undefined,
      search: search ? String(search) : undefined
    });
    ApiResponse.success(res, schemes, 'Government schemes retrieved successfully');
  };

  getSchemeById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const scheme = await this.service.getSchemeById(id);
    if (!scheme) {
      ApiResponse.error(res, 'Government scheme not found', 'NOT_FOUND', 404);
      return;
    }

    ApiResponse.success(res, scheme, 'Government scheme details retrieved successfully');
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
