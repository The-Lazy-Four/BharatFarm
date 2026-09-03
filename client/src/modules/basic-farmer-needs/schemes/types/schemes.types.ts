export interface SchemeEligibility {
  minLandSize: number;
  maxLandSize: number;
  states: string[];
  crops: string[];
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
  eligibility?: SchemeEligibility;
  applySteps?: string[];
}

export interface EligibilityCheckInput {
  state: string;
  landSizeAcres: number;
  cropCategory: string;
  annualIncome?: number;
}

export interface CreditAssessmentResult {
  assessmentScore: number;
  eligibilityTier: 'High' | 'Moderate' | 'Low';
  maxEstimatedLoanAmount: number;
  assessmentSummary: string;
  disclaimer: string;
}
