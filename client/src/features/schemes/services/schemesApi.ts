import { ApiClient } from '../../../services/apiClient.js';
import { Scheme, CreditAssessmentResult, EligibilityCheckInput } from '../types/schemes.types.js';

export class SchemesApi {
  static async getSchemes(): Promise<Scheme[]> {
    const res = await ApiClient.get<Scheme[]>('/schemes');
    return res.data || [];
  }

  static async checkEligibility(input: EligibilityCheckInput): Promise<Scheme[]> {
    const res = await ApiClient.post<Scheme[]>('/schemes/check-eligibility', input);
    return res.data || [];
  }

  static async getLoanAssessment(landSizeAcres: number, annualIncome?: number): Promise<CreditAssessmentResult | null> {
    const res = await ApiClient.post<CreditAssessmentResult>('/schemes/loan-assessment', { landSizeAcres, annualIncome });
    return res.data || null;
  }
}
