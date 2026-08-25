export const SCHEMES_CONSTANTS = {
  CREDIT_DISCLAIMER: 'BharatFarm Credit Assessment is an internal estimated evaluation based on farm size and reported income. It is not an official CIBIL score.'
};

/**
 * State picker options, adapted from the OLD project's `INDIAN_STATES`
 * lookup (js/marketplace.js) — names only here since the Schemes wizard
 * doesn't need districts, unlike the old Marketplace location picker.
 */
export const INDIAN_STATES: string[] = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
].sort();
