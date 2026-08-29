# Agricultural Marketplace Complete Backend & Product Architecture

## 1. Overview
The BharatFarm Marketplace enables farmers and agri-input suppliers to list, discover, buy, and sell agricultural products (crops, seeds, fertilizers, equipment). It operates in dual-mode (Supabase production PostgreSQL DB or local mock environment) and integrates with Shayak/KrishiBot for contextual product guidance.

---

## 2. API Specifications & CRUD Operations
All product modifications enforce JWT authentication and verified seller ownership:
- `GET /api/marketplace/listings`: Retrieves product catalog with deterministic filters (`category`, `search`, `minPrice`, `maxPrice`, `sellerId`).
- `GET /api/marketplace/listings/:id`: Returns detailed product specifications and seller contact information.
- `POST /api/marketplace/listings`: Authenticated listing creation. Derives seller identity from `req.user.id` and validates input fields (`title`, `category`, `price`, `quantityAvailable`, `location`).
- `PATCH /api/marketplace/listings/:id`: Owner-only listing updates. Throws `FORBIDDEN_SELLER_OPERATION` if non-owner attempts modification.
- `DELETE /api/marketplace/listings/:id`: Owner-only listing deletion.

---

## 3. Seeded Product Catalog
The database includes 42 verified seeded agricultural listings across India:
- **Crops**: Tomatoes, Nasik Red Onions, Kufri Jyoti Potatoes, Alphonso Mangoes, Sharbati Wheat, Sona Masoori Rice.
- **Seeds**: Hybrid Tomato Seeds, Hybrid Mustard Seeds.
- **Fertilizers**: NPK 19-19-19.
- **Equipment**: Mahindra 575 DI Tractor, Diesel Water Pump, Knapsack Sprayer.

Seeding is strictly idempotent and retains user-created listings.

---

## 4. Platform Context & Shayak Integration
- **Shayak Integration**: Farmers querying Shayak about a marketplace item receive advice referencing real database prices, unit quantities, and suitability for their crop.
- **Group Buying Connection**: When similar items exist in Group Buying pools, Shayak informs the farmer of potential bulk savings.
- **Data Saver Policy**: Browsing, searching, and filtering execute deterministically with **ZERO AI calls**. AI product assistance is triggered ONLY on explicit user request.

---

## 5. Security & Verification
- `sellerId` is extracted from verified JWT tokens (`req.user.id`). Client-supplied user/seller IDs are strictly ignored.
- Vitest suite `server/tests/marketplace.test.ts` validates listing, search/filter, seller ownership enforcement, and unauthorized access blocks (10/10 tests passing).
