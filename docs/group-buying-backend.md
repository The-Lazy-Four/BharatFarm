# BharatFarm Phase 4 — Group Buying Complete Backend Architecture

## Overview
Phase 4 implements the complete backend architecture for **BharatFarm Group Buying & Input Pooling**. It allows farmers across Indian districts to collectively purchase agricultural inputs (fertilizer, certified hybrid seeds, drip irrigation, machinery) at wholesale prices.

---

## 1. Core Architecture
The Group Buying module follows strict modular layering:
- **Routes (`groupbuying.routes.ts`)**: Express route definitions protected with JWT authentication (`authenticateToken`) and payload schema validation (`validateRequest`).
- **Controller (`groupbuying.controller.ts`)**: Handles HTTP requests/responses, query params filtering (`category`, `status`, `search`), user context extraction, and error formatting.
- **Service (`groupbuying.service.ts`)**: Encapsulates business logic, seed triggering, and pool/membership orchestration.
- **Repository (`groupbuying.repository.ts`)**: Dual-mode data persistence adapter supporting both **Supabase PostgreSQL** and local offline **Mock mode**.

---

## 2. Database Schema & RPC Concurrency Mechanism

### PostgreSQL Tables
- **`public.group_buying_pools`**: Stores pool details (`item_title`, `category`, `original_price_per_unit`, `discounted_price_per_unit`, `target_quantity`, `current_quantity`, `participant_count`, `status`, `deadline`, `location`, `creator_id`).
- **`public.group_buying_members`**: Stores farmer join orders (`pool_id`, `user_id`, `quantity`, `joined_at`) with unique constraint `UNIQUE(pool_id, user_id)`.

### Atomic RPC (`join_group_buying_pool`)
To prevent concurrent race conditions (where multiple farmers joining simultaneously corrupt total pooled quantity):
1. Executes `SELECT * FROM public.group_buying_pools WHERE id = p_pool_id FOR UPDATE;` to lock the target pool row during the transaction.
2. Checks deadline (`now() > deadline`) and status (`OPEN`).
3. Upserts membership record in `public.group_buying_members` (incrementing quantity if existing member).
4. Recalculates `current_quantity` and `participant_count`.
5. Transitions pool status to `THRESHOLD_REACHED` if `current_quantity >= target_quantity`.
6. Returns an atomic JSON payload.

---

## 3. Seed Data & Idempotency
- **Data Set**: 10 realistic Indian agricultural input pools (IFFCO NPK, Hybrid Paddy Seeds, Power Weeder, DAP Fertilizer, Neem Coated Urea, HD-3086 Wheat Seeds, Solar Drip Irrigation, Vermicompost, Vegetable Seed Kits, Battery Sprayers).
- **Idempotency**: Uses deterministic UUIDs (`b1000000-0000-0000-0000-000000000001` to `...0010`).
- **Upsert Strategy**: Supabase `upsert` with `onConflict: 'id'` ensures re-running the seed never produces duplicate pools or corrupted metrics.

---

## 4. API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/groupbuying` | Optional | List all active/filtered group buying pools |
| `GET` | `/api/groupbuying/:id` | Optional | Fetch specific pool details |
| `GET` | `/api/groupbuying/:id/members` | Optional | Fetch participating members of a pool |
| `POST` | `/api/groupbuying` | JWT Required | Create a new group buying pool |
| `POST` | `/api/groupbuying/:id/join` | JWT Required | Join an open pool with requested quantity |
| `POST` | `/api/groupbuying/seed` | Public / Admin | Idempotently seed 10 demo pools into Supabase |

---

## 5. Test Suite Verification
A dedicated unit test suite (`server/tests/groupbuying.test.ts`) verifies 8 critical scenarios:
1. Pool listing
2. Single pool retrieval
3. Valid quantity join operation
4. Rejection of zero/negative quantities
5. Rejection of closed/completed pools
6. Auto-expiration of past deadline pools
7. Seed idempotency without duplicate creation
8. Status transition to `THRESHOLD_REACHED` on target completion

Running `npm test`: **19/19 tests passing across client and server workspaces**.
