/**
 * BharatFarm Feature Images Repository
 * Centralized, high-quality agricultural Unsplash images for feature cards.
 * Designed for Indian farmers: Trustworthy, agrarian, simple, accessible.
 */

export interface FeatureImageItem {
  id: string;
  title: string;
  url: string;
  fallbackUrl: string;
  alt: string;
}

export const FEATURE_IMAGES: Record<string, FeatureImageItem> = {
  krishibot: {
    id: 'krishibot',
    title: 'KrishiBot AI',
    url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
    alt: 'Farmer with AI smart technology'
  },
  scanner: {
    id: 'scanner',
    title: 'Leaf Scanner',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80',
    alt: 'Close-up crop leaf disease detection'
  },
  marketplace: {
    id: 'marketplace',
    title: 'Mandi Marketplace',
    url: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80',
    alt: 'Fresh Indian agricultural produce market'
  },
  weather: {
    id: 'weather',
    title: 'Weather Advisory',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=800&q=80',
    alt: 'Lush green farmland under sky'
  },
  groupbuying: {
    id: 'groupbuying',
    title: 'Group Buying',
    url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    alt: 'Farming seeds fertilizer tractor machinery'
  },
  schemes: {
    id: 'schemes',
    title: 'Government Schemes',
    url: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=800&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80',
    alt: 'Indian government agriculture welfare'
  },
  calculator: {
    id: 'calculator',
    title: 'Farm Calculator',
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=80',
    alt: 'Farm financial budget calculator'
  },
  roadmap: {
    id: 'roadmap',
    title: 'AI Crop Roadmap',
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    alt: 'Crop cultivation journey and field path'
  },
  records: {
    id: 'records',
    title: 'Farm Records',
    url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    alt: 'Agricultural crop harvesting log'
  },
  loan: {
    id: 'loan',
    title: 'Loan Eligibility',
    url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    alt: 'Kisan credit card and farm finance'
  },
  orders: {
    id: 'orders',
    title: 'Orders & Delivery',
    url: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80',
    alt: 'Agricultural input transport logistics'
  },
  sahayak: {
    id: 'sahayak',
    title: 'Sahayak Assistance',
    url: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80',
    fallbackUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
    alt: 'Local agricultural support worker assisting a farmer'
  }
};

/**
 * Utility helper to safely retrieve feature image URL with graceful image fallback
 */
export const getFeatureImage = (key: string): string => {
  const item = FEATURE_IMAGES[key];
  if (!item) return 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80';
  return item.url;
};
