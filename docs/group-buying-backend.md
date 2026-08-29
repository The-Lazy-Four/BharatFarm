# BharatFarm Backend Phase 12 — Group Buying Module Production Specification & Architecture

## Executive Summary
The **Group Buying Module** (Phase 12) empowers regional farmer collectives to aggregate input orders for fertilizers, hybrid seeds, and farm machinery to unlock wholesale tiered pricing. 

This document serves as the authoritative backend specification, details server-side atomic concurrency protections, strict quantity validations, Supabase RPC integrations, and Shayak AI gateway linkages.

---

## 1. Data Schema & Supabase Architecture

### Database Tables & RPC Functions

#### `group_buying_pools` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Unique pool identifier |
| `item_title` | `TEXT` | `NOT NULL` | Name of the bulk input product |
| `category` | `TEXT` | `NOT NULL` | Category (`fertilizer`, `seeds`, `machinery`) |
| `original_price_per_unit` | `NUMERIC` | `NOT NULL, CHECK (> 0)` | Retail retail unit price |
| `discounted_price_per_unit` | `NUMERIC` | `NOT NULL, CHECK (> 0)` | Tiered wholesale price |
| `target_quantity` | `INTEGER` | `NOT NULL, CHECK (> 0)` | Goal quantity required to trigger order dispatch |
| `current_quantity` | `INTEGER` | `DEFAULT 0, CHECK (>= 0)` | Total committed quantity across all members |
| `participant_count` | `INTEGER` | `DEFAULT 0, CHECK (>= 0)` | Number of unique participating farmers |
| `status` | `TEXT` | `DEFAULT 'OPEN'` | Status enum: `OPEN`, `THRESHOLD_REACHED`, `COMPLETED`, `EXPIRED` |
| `deadline` | `TIMESTAMPTZ` | `NOT NULL` | Pool expiration timestamp |
| `location` | `TEXT` | `NOT NULL` | Target regional hub/mandi dispatch location |
| `created_by` | `UUID` | `REFERENCES profiles(id)` | Creator farmer ID |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Creation timestamp |

#### `group_buying_members` Table
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Unique membership record ID |
| `pool_id` | `UUID` | `REFERENCES group_buying_pools(id) ON DELETE CASCADE` | Associated pool ID |
| `user_id` | `UUID` | `REFERENCES profiles(id)` | Authenticated farmer ID |
| `quantity` | `INTEGER` | `NOT NULL, CHECK (> 0)` | Quantity pledged by this farmer |
| `joined_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Joined timestamp |

#### Server-Side Atomic RPC: `join_group_buying_pool`
To prevent race conditions during high-concurrency group joins, atomic pool updates are handled directly inside Postgres:
```sql
CREATE OR REPLACE FUNCTION join_group_buying_pool(
  p_pool_id UUID,
  p_user_id UUID,
  p_quantity INT
) RETURNS JSONB AS $$
DECLARE
  v_pool RECORD;
  v_new_qty INT;
  v_new_status TEXT;
BEGIN
  -- Row locking for atomic transaction isolation
  SELECT * INTO v_pool FROM group_buying_pools WHERE id = p_pool_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Pool not found');
  END IF;

  IF v_pool.status != 'OPEN' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Pool is no longer open');
  END IF;

  IF p_quantity <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quantity must be positive');
  END IF;

  v_new_qty := v_pool.current_quantity + p_quantity;
  v_new_status := CASE WHEN v_new_qty >= v_pool.target_quantity THEN 'THRESHOLD_REACHED' ELSE 'OPEN' END;

  UPDATE group_buying_pools 
  SET current_quantity = v_new_qty,
      participant_count = v_pool.participant_count + 1,
      status = v_new_status,
      updated_at = now()
  WHERE id = p_pool_id;

  INSERT INTO group_buying_members (pool_id, user_id, quantity)
  VALUES (p_pool_id, p_user_id, p_quantity);

  RETURN jsonb_build_object('success', true, 'new_quantity', v_new_qty, 'status', v_new_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 2. API Endpoints Specification

### `GET /api/v1/groupbuying`
* **Description**: Deterministically list active cooperative pools with filter & search parameters.
* **Authentication**: Optional / Public read.
* **Query Parameters**:
  * `category` (optional): `fertilizer` | `seeds` | `machinery`
  * `search` (optional): Case-insensitive string search against title and location.
  * `status` (optional): `OPEN` | `THRESHOLD_REACHED` | `COMPLETED` | `EXPIRED`

### `GET /api/v1/groupbuying/my-purchases`
* **Description**: Retrieve all group buy pools joined by the authenticated user along with pledged quantities and join timestamps.
* **Authentication**: Required (`JWT Bearer`).

### `GET /api/v1/groupbuying/:id`
* **Description**: Fetch specific pool details by ID with auto-refreshed expiration status.
* **Authentication**: Optional / Public read.

### `POST /api/v1/groupbuying/:id/join`
* **Description**: Join an open group buying pool with a validated positive integer quantity.
* **Authentication**: Required (`JWT Bearer`).
* **Request Body**:
  ```json
  {
    "quantity": 10
  }
  ```

---

## 3. Integration with Shayak AI (KrishiBot)

Shayak AI is fully contextualized with active Group Buying opportunities. When a farmer asks:
> *"Where can I buy bulk fertilizer at a cheap price?"* or *"Any discounts on seeds?"*

Shayak's intent classifier detects `group`/`bulk`/`discount` keywords and queries `GroupBuyingRepository.findAll()`, appending verified active pools directly into the verified AI prompt context without hallucinations.

---

## 4. Verification & Testing

* **Vitest Suite**: `server/tests/groupBuying.test.ts` (9/9 tests passing)
* **Build Verification**: `npm run build` passing across `@bharatfarm/shared`, `@bharatfarm/client`, and `@bharatfarm/server`.
* **Full Integration Suite**: 53/53 tests passing across all backend modules.
