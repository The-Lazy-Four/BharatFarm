# BharatFarm Marketplace Backend Architecture & Documentation

## Overview
The **BharatFarm Marketplace** module provides a direct trading ecosystem for farmers, buyers, input suppliers, and equipment owners. It allows users to browse, search, create, update, and deactivate crop produce or farm input listings.

This backend module has been fully refactored to support dual-mode execution:
1. **Production Mode (`USE_MOCK_DATA=false`)**: Full persistence with Supabase PostgreSQL (`public.marketplace_products`) enforcing Row Level Security (RLS) policies.
2. **Local/Mock Mode (`USE_MOCK_DATA=true`)**: Local-first development fallback preserving existing UI state and mock demo items without requiring live database access.

---

## 1. Database Schema (`public.marketplace_products`)

The database table definition (found in `supabase/migrations/002_create_marketplace_products.sql`):

```sql
CREATE TABLE IF NOT EXISTS public.marketplace_products (
  id UUID PRIMARY KEY DEFAULT gen_random_policy_uuid(),
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_name TEXT NOT NULL,
  seller_rating NUMERIC DEFAULT 4.5,
  seller_phone TEXT,
  seller_whatsapp TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('crops', 'seeds', 'fertilizers', 'equipment')),
  price NUMERIC NOT NULL CHECK (price >= 0),
  unit TEXT NOT NULL,
  quantity_available NUMERIC NOT NULL DEFAULT 0,
  location TEXT NOT NULL,
  image_url TEXT,
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies
- `SELECT`: Public access (authenticated & unauthenticated users can view active listings).
- `INSERT`: Authenticated users can insert products where `auth.uid() = seller_id`.
- `UPDATE`: Sellers can update their own products (`auth.uid() = seller_id`).
- `DELETE`: Sellers can delete their own products (`auth.uid() = seller_id`).

---

## 2. API Endpoint Specification

Base Path: `/api/marketplace`

### GET `/api/marketplace/listings`
Returns all active marketplace products, filtered by query parameters.

**Query Parameters:**
- `category` (optional, string): Filter by category (`crops`, `seeds`, `fertilizers`, `equipment`).
- `search` (optional, string): Case-insensitive search on title, seller name, or district location.
- `minPrice` (optional, number): Minimum price filter.
- `maxPrice` (optional, number): Maximum price filter.
- `sellerId` (optional, string): Filter listings owned by a specific seller.

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d4e5",
      "title": "Organic Sharbati Wheat 50 Quintals",
      "category": "crops",
      "price": 2400,
      "unit": "quintal",
      "quantityAvailable": 50,
      "location": "Khanna, Punjab",
      "sellerId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "sellerName": "Ramesh Patel",
      "sellerRating": 4.9,
      "sellerWhatsapp": "919876543210",
      "sellerPhone": "+91 98765 43210",
      "verified": true,
      "imageUrl": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b",
      "createdAt": "2026-08-28T16:00:00.000Z"
    }
  ],
  "message": "Listings fetched successfully",
  "timestamp": "2026-08-28T16:45:00.000Z"
}
```

### GET `/api/marketplace/listings/:id`
Fetch detailed information for a single marketplace product by ID.

### POST `/api/marketplace/listings` (Authenticated)
Create a new produce/input listing.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Request Body:**
```json
{
  "title": "Hybrid Maize Seed (Pioneer 3302)",
  "category": "seeds",
  "price": 1850,
  "unit": "bag",
  "quantityAvailable": 30,
  "location": "Karnal, Haryana",
  "sellerPhone": "9876543210",
  "imageUrl": "https://images.unsplash.com/photo-1551754655-cd27e38d2076"
}
```

### PATCH `/api/marketplace/listings/:id` (Authenticated, Owner Only)
Update an existing product listing. Enforces seller ownership.

### DELETE `/api/marketplace/listings/:id` (Authenticated, Owner Only)
Deactivates or deletes a product listing. Enforces seller ownership (`FORBIDDEN_SELLER_OPERATION` returned if seller IDs do not match).

---

## 4. Seeding Architecture & Realistic Demo Data

### Overview
To ensure the BharatFarm Marketplace presents a rich, realistic e-commerce experience on first launch during SIH demonstrations, an **idempotent database seed mechanism** is integrated into the backend server initialization lifecycle (`server/src/config/database.ts`).

### Seed Execution Flow
1. When `USE_MOCK_DATA=false` and the database connection is verified, `seedMarketplaceProducts()` is triggered.
2. The seed service queries `public.marketplace_products` using `getSupabaseAdminClient()`.
3. **Idempotency Safeguard**: If 15 or more products already exist in the database, or if product titles match existing records, the seed process gracefully skips re-insertion. No duplicate rows are created on server restarts.
4. Seeded listings are automatically attached to a valid `public.profiles` user account in Supabase.

### Seed Data Specification (`server/src/modules/marketplace/seed/marketplace.seed.data.ts`)
- **Total Seeded Products**: 42 realistic agricultural listings.
- **Categories Covered**:
  - `crops` (12 items: Sharbati Wheat, Alphonso Mangoes, Desi Tomatoes, Sona Masoori Rice, etc.)
  - `seeds` (10 items: Hybrid Tomato PKM-1, BT Cotton, Pusa Mustard, Pioneer Maize, etc.)
  - `fertilizers` (10 items: NPK 19-19-19, Neem Coated Urea, IFFCO Liquid Nano Urea, Organic Vermicompost, etc.)
  - `equipment` (10 items: Mahindra 575 DI Tractor, 5HP Diesel Water Pump, Battery Knapsack Sprayer, Drip Irrigation Kits, etc.)
- **Seller Identities**: Populated with realistic, non-sensitive demo business profiles (e.g., *Bharat Agro Centre*, *Hooghly Farmers Produce Co-op*, *Malwa Seed Suppliers*).
- **Image Strategy**: High-resolution, domain-matched agricultural imagery sourced from Unsplash with automatic frontend image error fallback handling.

