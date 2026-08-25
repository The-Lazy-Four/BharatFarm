export interface ProductListing {
  id: string;
  title: string;
  category: 'crops' | 'seeds' | 'fertilizers' | 'equipment';
  price: number;
  unit: string;
  quantityAvailable: number;
  location: string;
  sellerId: string;
  sellerName: string;
  sellerRating?: number;
  /** E.164-ish contact number without the "+", e.g. "919831200001" (adapted from OLD marketplace.js `whatsapp` field). */
  sellerWhatsapp?: string;
  sellerPhone?: string;
  verified?: boolean;
  imageUrl?: string;
  createdAt: string;
}

export interface CreateListingDto {
  title: string;
  category: 'crops' | 'seeds' | 'fertilizers' | 'equipment';
  price: number;
  unit: string;
  quantityAvailable: number;
  location: string;
  sellerPhone?: string;
  imageUrl?: string;
}
