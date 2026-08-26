// ============================================================
// Crop Roadmap — Request Validation Schema
// ============================================================

const VALID_CROPS = [
  'rice', 'wheat', 'maize', 'potato', 'tomato', 'onion', 'mustard',
  'jute', 'brinjal', 'cabbage', 'cauliflower', 'chili', 'cotton',
  'groundnut', 'sugarcane', 'soybean', 'sunflower', 'pea', 'lentil',
  'chickpea', 'barley', 'millet', 'sorghum', 'turmeric', 'ginger',
  'garlic', 'coriander', 'cucumber', 'watermelon', 'mango', 'banana',
  'papaya', 'guava', 'litchi', 'tea', 'coffee', 'rubber', 'coconut',
  'areca nut', 'black pepper', 'cardamom', 'clove', 'cinnamon'
];

const VALID_LAND_UNITS = ['acres', 'hectares'];

export const roadmapSchema = {
  validate: (body: Record<string, unknown>) => {
    if (!body) {
      return { error: { message: 'Request body is required' } };
    }

    // Crop — required
    if (!body.crop || typeof body.crop !== 'string' || body.crop.trim() === '') {
      return { error: { message: 'Crop name is required' } };
    }

    const normalizedCrop = body.crop.toString().trim().toLowerCase();
    if (!VALID_CROPS.includes(normalizedCrop)) {
      return { error: { message: `Unsupported crop: "${body.crop}". Please select a valid Indian crop.` } };
    }

    // State — required
    if (!body.state || typeof body.state !== 'string' || body.state.trim() === '') {
      return { error: { message: 'State is required for location-aware recommendations' } };
    }

    // District — required
    if (!body.district || typeof body.district !== 'string' || body.district.trim() === '') {
      return { error: { message: 'District is required for location-aware recommendations' } };
    }

    // Land size — required, positive number
    if (body.landSize === undefined || body.landSize === null) {
      return { error: { message: 'Land size is required' } };
    }
    const landSize = Number(body.landSize);
    if (isNaN(landSize) || landSize <= 0 || landSize > 10000) {
      return { error: { message: 'Land size must be a positive number (max 10,000)' } };
    }

    // Land unit — required
    if (!body.landUnit || !VALID_LAND_UNITS.includes(body.landUnit as string)) {
      return { error: { message: 'Land unit must be "acres" or "hectares"' } };
    }

    // Start date — required, valid date
    if (!body.startDate || typeof body.startDate !== 'string') {
      return { error: { message: 'Start date is required' } };
    }
    const dateObj = new Date(body.startDate as string);
    if (isNaN(dateObj.getTime())) {
      return { error: { message: 'Invalid start date format. Use YYYY-MM-DD.' } };
    }

    return { error: null };
  }
};
