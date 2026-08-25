import { Scheme } from '../types/schemes.types.js';

/**
 * Curated dataset adapted from the OLD project's `js/schemesData.json`
 * (the old app's own local-fallback data, used when its AI scheme-matcher
 * was unavailable). Serves the same purpose here: the offline/mock
 * fallback and the base set that programmatic eligibility filtering runs
 * against when no AI provider is configured.
 */
export const MOCK_SCHEMES: Scheme[] = [
  {
    id: 'pm-kisan',
    title: 'PM Kisan Samman Nidhi',
    department: 'Ministry of Agriculture & Farmers Welfare',
    category: 'subsidy',
    state: 'Central',
    description: 'Direct income support of ₹6,000 per year in three equal installments to eligible farmer families.',
    eligibilityCriteria: ['Small & marginal farmers', 'Valid land ownership documents', 'Aadhaar linked bank account'],
    requiredDocuments: ['Aadhaar Card', 'Land Record (Khata/Khasra)', 'Bank Passbook'],
    officialUrl: 'https://pmkisan.gov.in/',
    eligibility: { minLandSize: 0.1, maxLandSize: 9999, states: ['All'], crops: ['All'] },
    applySteps: ['Visit pmkisan.gov.in and register as a new farmer', 'Submit Aadhaar, land record and bank details']
  },
  {
    id: 'pmfby',
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    department: 'Ministry of Agriculture',
    category: 'insurance',
    state: 'Central',
    description: 'Comprehensive crop insurance coverage against unforeseen crop losses or damage, with a low farmer premium share.',
    eligibilityCriteria: ['All farmers growing notified crops in notified areas'],
    requiredDocuments: ['Proposal form', 'Land possession certificate', 'Sowing certificate'],
    officialUrl: 'https://pmfby.gov.in/',
    eligibility: { minLandSize: 0.1, maxLandSize: 9999, states: ['All'], crops: ['All'] },
    applySteps: ['Apply through your bank, CSC, or the PMFBY portal before the cutoff date', 'Pay the subsidized premium (1.5–2% of sum insured)']
  },
  {
    id: 'bhumihin-krishak-bandhu',
    title: 'Bhumihin Krishak Bandhu (Landless Farmer Scheme)',
    department: 'West Bengal Dept. of Agriculture',
    category: 'subsidy',
    state: 'West Bengal',
    description: "Main scheme for landless farmers in West Bengal who work on others' land but own no agricultural land.",
    eligibilityCriteria: ['Landless agricultural laborer in West Bengal', 'No agricultural land ownership'],
    requiredDocuments: ['Aadhaar Card', 'Bank Account', 'Self-declaration (no land)'],
    officialUrl: 'https://krishakbandhu.wb.gov.in/agricultural-labour/farmer_search',
    eligibility: { minLandSize: 0, maxLandSize: 0, states: ['West Bengal'], crops: ['All'] },
    applySteps: ['Apply through Duare Sarkar camps, BDO office, or the Agriculture portal', 'Submit Aadhaar, bank account and self-declaration of no land']
  },
  {
    id: 'krishak-bandhu',
    title: 'Krishak Bandhu (for sharecroppers also)',
    department: 'West Bengal Dept. of Agriculture',
    category: 'subsidy',
    state: 'West Bengal',
    description: 'Financial assistance for registered sharecroppers (Bhagchasi) and farmers, with a death benefit insurance component.',
    eligibilityCriteria: ['Registered farmer or sharecropper (Bhagchasi) in West Bengal'],
    requiredDocuments: ['Aadhaar Card', 'Land Record or Sharecropper Registration', 'Bank Passbook'],
    officialUrl: 'https://krishakbandhu.wb.gov.in/',
    eligibility: { minLandSize: 0, maxLandSize: 9999, states: ['West Bengal'], crops: ['All'] },
    applySteps: ['Apply via Duare Sarkar camps, BDO or ADA office', 'Ensure registration as a sharecropper or farmer']
  },
  {
    id: 'fssm-wb',
    title: 'Farm Mechanization Scheme (FSSM)',
    department: 'West Bengal Dept. of Agriculture',
    category: 'equipment',
    state: 'West Bengal',
    description: 'Financial support to small and marginal farmers for purchasing power-operated farm equipment in West Bengal.',
    eligibilityCriteria: ['Small/marginal farmer in West Bengal (up to 5 acres)'],
    requiredDocuments: ['Aadhaar Card', 'Land Record', 'Quotation for equipment'],
    officialUrl: 'https://matirkatha.net/',
    eligibility: { minLandSize: 0.1, maxLandSize: 5, states: ['West Bengal'], crops: ['All'] },
    applySteps: ['Apply through the Matir Katha portal or local Agriculture office', 'Submit land record and equipment quotation for subsidy approval']
  },
  {
    id: 'amar-fasal',
    title: 'Amar Fasal Amar Gola/Gari',
    department: 'West Bengal Dept. of Agriculture',
    category: 'subsidy',
    state: 'West Bengal',
    description: 'Subsidies for constructing storehouses and purchasing vending carts to reduce post-harvest losses.',
    eligibilityCriteria: ['Small/marginal farmer in West Bengal growing vegetables, fruits or grains'],
    requiredDocuments: ['Aadhaar Card', 'Land Record'],
    officialUrl: 'https://matirkatha.net/',
    eligibility: { minLandSize: 0.1, maxLandSize: 5, states: ['West Bengal'], crops: ['Vegetables', 'Fruits', 'Grains', 'All'] },
    applySteps: ['Apply through the Matir Katha portal or local Agriculture office']
  },
  {
    id: 'bangla-shasya',
    title: 'Bangla Shasya Bima',
    department: 'West Bengal Dept. of Agriculture',
    category: 'insurance',
    state: 'West Bengal',
    description: 'Free crop insurance for West Bengal farmers — the state bears the entire premium.',
    eligibilityCriteria: ['Farmer in West Bengal growing a notified crop'],
    requiredDocuments: ['Aadhaar Card', 'Land Record or Self-declaration'],
    officialUrl: 'https://banglashasyabima.net/',
    eligibility: { minLandSize: 0.1, maxLandSize: 9999, states: ['West Bengal'], crops: ['Rice', 'Wheat', 'Jute', 'Potato', 'All'] },
    applySteps: ['Register at your local Krishi Bhavan or via banglashasyabima.net']
  },
  {
    id: 'rkvy',
    title: 'Rashtriya Krishi Vikas Yojana (RKVY)',
    department: 'Ministry of Agriculture (Central/State)',
    category: 'subsidy',
    state: 'Central',
    description: 'Supports minor irrigation and agricultural infrastructure development, prioritising small/marginal farmers.',
    eligibilityCriteria: ['Small/marginal farmer (up to 5 acres)'],
    requiredDocuments: ['Aadhaar Card', 'Land Record'],
    officialUrl: 'https://rkvy.nic.in/',
    eligibility: { minLandSize: 0.1, maxLandSize: 5, states: ['All'], crops: ['All'] },
    applySteps: ['Apply through your State Agriculture Department under RKVY guidelines']
  }
];
