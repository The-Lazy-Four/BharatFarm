import { SchemesRepository } from '../repositories/schemes.repository.js';
import { Scheme, EligibilityCheckRequest, CreditAssessmentResult, SchemeFilterParams } from '../types/schemes.types.js';

export class SchemesService {
  private repository: SchemesRepository;

  constructor() {
    this.repository = new SchemesRepository();
  }

  async getSchemes(filters?: SchemeFilterParams): Promise<Scheme[]> {
    return await this.repository.findAll(filters);
  }

  async getSchemeById(id: string): Promise<Scheme | null> {
    return await this.repository.findById(id);
  }

  async checkEligibility(request: EligibilityCheckRequest): Promise<Scheme[]> {
    return await this.repository.checkEligibility(request);
  }

  async getLoanAssessment(landSizeAcres: number, annualIncome?: number): Promise<CreditAssessmentResult> {
    return await this.repository.calculateCreditAssessment(landSizeAcres, annualIncome);
  }
}

