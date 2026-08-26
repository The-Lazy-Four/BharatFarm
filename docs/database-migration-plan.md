# BharatFarm — Database Migration Plan

## Migration Phases

Each phase migrates one backend module from in-memory arrays to Supabase PostgreSQL persistence. Phases are designed to be completed independently.

---

### PHASE 1: Supabase Foundation ✅ COMPLETED
- Install `@supabase/supabase-js`
- Create real Supabase client (`server/src/config/supabase.ts`)
- Create all database tables with proper constraints, indexes, and RLS
- Save migration files locally (`supabase/migrations/`)
- Update health endpoint with database connectivity indicator
- Create `.env.example`
- Document architecture

### PHASE 2: Authentication
- Integrate Supabase Auth (email/password signup + login)
- Auto-create `profiles` row on signup via database trigger
- Replace mock `auth.routes.ts` with real JWT verification
- Replace mock `auth.middleware.ts` with Supabase token validation
- **Files**: `server/src/routes/auth.routes.ts`, `server/src/middleware/auth.middleware.ts`, `server/src/config/supabase.ts`
- **Dependencies**: profiles table (created)
- **Definition of Done**: Users can register, login, and receive valid JWTs

### PHASE 3: Marketplace
- Refactor `MarketplaceRepository` to use Supabase `marketplace_products` table
- Keep mock data as seed/fallback
- **Files**: `server/src/modules/marketplace/repositories/marketplace.repository.ts`
- **Dependencies**: PHASE 2 (seller_id references profiles)
- **Definition of Done**: Product CRUD persists across server restarts

### PHASE 4: Group Buying
- Refactor `GroupBuyingRepository` to use Supabase tables
- Implement atomic quantity updates via SQL
- Track individual member participation
- **Files**: `server/src/modules/groupbuying/repositories/groupBuying.repository.ts`
- **Dependencies**: PHASE 2
- **Definition of Done**: Pool joins are atomic and persist across restarts

### PHASE 5: Government Schemes
- Seed `schemes` table with existing mock data
- Refactor `SchemesRepository` to read from database
- Keep AI matching logic unchanged
- **Files**: `server/src/modules/schemes/repositories/schemes.repository.ts`
- **Dependencies**: PHASE 1
- **Definition of Done**: Schemes data persists in PostgreSQL

### PHASE 6: KrishiBot Persistence
- Save chat sessions and messages to `krishibot_sessions` + `krishibot_messages`
- Keep AI query logic unchanged
- **Files**: `server/src/modules/krishibot/repositories/krishiBot.repository.ts`
- **Dependencies**: PHASE 2
- **Definition of Done**: Chat history persists per user

### PHASE 7: Roadmap Persistence
- Save generated roadmaps to `roadmaps` table
- Keep AI generation logic unchanged
- **Files**: `server/src/modules/roadmap/repositories/roadmap.repository.ts`
- **Dependencies**: PHASE 2
- **Definition of Done**: Roadmaps persist per user

### PHASE 8: Scanner History
- Save scan results to `scan_results` table
- Prepare for Supabase Storage for image references
- Keep AI vision logic unchanged
- **Files**: `server/src/modules/scanner/repositories/scanner.repository.ts`
- **Dependencies**: PHASE 2
- **Definition of Done**: Scan history persists per user

### PHASE 9: Offline Synchronization
- Implement conflict resolution between IndexedDB and Supabase
- Design sync queue for offline-first operations
- **Dependencies**: PHASES 2-8

### PHASE 10: Security & Production Hardening
- Add rate limiting (`express-rate-limit`)
- Add security headers (`helmet`)
- Review and test all RLS policies
- Add comprehensive backend tests
- **Dependencies**: All previous phases
