import { SchemesRepository } from '../repositories/schemes.repository.js';
import { Scheme, EligibilityCheckRequest, CreditAssessmentResult } from '../types/schemes.types.js';

export class SchemesService {
  private repository: SchemesRepository;

  constructor() {
    this.repository = new SchemesRepository();
  }

  async getSchemes(): Promise<Scheme[]> {
    return await this.repository.findAll();
  }

  async checkEligibility(request: EligibilityCheckRequest): Promise<Scheme[]> {
    return await this.repository.checkEligibility(request);
  }

  async getLoanAssessment(landSizeAcres: number, annualIncome?: number): Promise<CreditAssessmentResult> {
    return await this.repository.calculateCreditAssessment(landSizeAcres, annualIncome);
  }
}
