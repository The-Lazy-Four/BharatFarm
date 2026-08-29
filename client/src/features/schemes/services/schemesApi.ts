import { ApiClient } from '../../../services/apiClient.js';
import { Scheme, CreditAssessmentResult, EligibilityCheckInput } from '../types/schemes.types.js';

export class SchemesApi {
  static async getSchemes(params?: { category?: string; state?: string; search?: string }): Promise<Scheme[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.state) query.append('state', params.state);
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString();
    const endpoint = queryString ? `/schemes?${queryString}` : '/schemes';
    const res = await ApiClient.get<Scheme[]>(endpoint);
    return res.data || [];
  }

  static async getSchemeById(id: string): Promise<Scheme | null> {
    const res = await ApiClient.get<Scheme>(`/schemes/${id}`);
    return res.data || null;
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
