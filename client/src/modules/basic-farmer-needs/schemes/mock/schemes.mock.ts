import { Scheme } from '../types/schemes.types';

export const SEEDED_DEMO_SCHEMES: Scheme[] = [
  {
    id: 'pm-kisan',
    title: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    department: 'Ministry of Agriculture',
    category: 'subsidy',
    state: 'All India',
    description: 'Financial benefit of Rs. 6000/- per year in three equal installments to all landholding farmer families.',
    eligibilityCriteria: ['Small and marginal landholding farmers', 'Valid Aadhaar and bank account'],
    requiredDocuments: ['Aadhaar Card', 'Land Holding Papers', 'Bank Passbook'],
    officialUrl: 'https://pmkisan.gov.in'
  },
  {
    id: 'pmfby',
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    department: 'Ministry of Agriculture',
    category: 'insurance',
    state: 'All India',
    description: 'Crop insurance scheme providing financial support to farmers suffering crop loss/damage arising out of unforeseen events.',
    eligibilityCriteria: ['All farmers growing notified crops in notified areas'],
    requiredDocuments: ['Khasra / Land Record', 'Aadhaar Card', 'Sowing Certificate'],
    officialUrl: 'https://pmfby.gov.in'
  },
  {
    id: 'kcc',
    title: 'Kisan Credit Card (KCC)',
    department: 'NABARD / Reserve Bank of India',
    category: 'loan',
    state: 'All India',
    description: 'Provides timely credit to farmers to meet their cultivation and agricultural financial needs at concessional interest rates.',
    eligibilityCriteria: ['Farmers, tenant farmers, share croppers, and SHGs'],
    requiredDocuments: ['Identity Proof', 'Address Proof', 'Land Ownership Records'],
    officialUrl: 'https://myscheme.gov.in'
  }
];

export const MOCK_SCHEMES: Scheme[] = [...SEEDED_DEMO_SCHEMES];
