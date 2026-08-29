export interface SchemeEligibility {
  minLandSize: number;
  maxLandSize: number;
  states: string[]; // ['All'] or specific state names
  crops: string[]; // ['All'] or specific crop names
}

export interface Scheme {
  id: string;
  title: string;
  department: string;
  category: 'subsidy' | 'loan' | 'insurance' | 'equipment';
  state: string;
  description: string;
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  officialUrl?: string;
  /** Structured eligibility used for programmatic matching (adapted from OLD js/schemesData.json). */
  eligibility?: SchemeEligibility;
  applySteps?: string[];
}

export interface EligibilityCheckRequest {
  state: string;
  landSizeAcres: number;
  cropCategory: string;
  annualIncome?: number;
}

export interface SchemeFilterParams {
  category?: string;
  state?: string;
  search?: string;
}

export interface CreditAssessmentResult {

  assessmentScore: number; // e.g. 750
  eligibilityTier: 'High' | 'Moderate' | 'Low';
  maxEstimatedLoanAmount: number;
  assessmentSummary: string;
  disclaimer: string;
}
