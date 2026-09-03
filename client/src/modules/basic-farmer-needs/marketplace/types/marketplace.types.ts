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
  sellerWhatsapp?: string;
  sellerPhone?: string;
  verified?: boolean;
  imageUrl?: string;
  createdAt: string;
}

export interface CreateListingInput {
  title: string;
  category: ProductListing['category'];
  price: number;
  unit: string;
  quantityAvailable: number;
  location: string;
  sellerPhone: string;
  imageUrl?: string;
}
