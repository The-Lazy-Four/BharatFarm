-- ============================================================
-- BharatFarm Foundation Migration: join_group_buying_pool RPC
-- Applied: 2026-08-28
-- ============================================================

CREATE OR REPLACE FUNCTION public.join_group_buying_pool(
  p_pool_id UUID,
  p_user_id UUID,
  p_quantity INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pool RECORD;
  v_new_quantity INT;
  v_new_participant_count INT;
  v_new_status TEXT;
  v_existing_member RECORD;
  v_delta_qty INT;
BEGIN
  -- 1. Lock the pool row for update to prevent concurrent race conditions
  SELECT * INTO v_pool 
  FROM public.group_buying_pools 
  WHERE id = p_pool_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Group buying pool not found', 'code', 'NOT_FOUND');
  END IF;

  -- 2. Validate pool status & deadline
  IF v_pool.deadline < now() THEN
    IF v_pool.status = 'OPEN' THEN
      UPDATE public.group_buying_pools SET status = 'EXPIRED' WHERE id = p_pool_id;
    END IF;
    RETURN jsonb_build_object('success', false, 'error', 'This group buying pool has expired.', 'code', 'POOL_EXPIRED');
  END IF;

  IF v_pool.status != 'OPEN' THEN
    RETURN jsonb_build_object('success', false, 'error', 'This pool is no longer open for new orders (status: ' || v_pool.status || ').', 'code', 'POOL_NOT_OPEN');
  END IF;

  -- 3. Check existing membership for this user
  SELECT * INTO v_existing_member 
  FROM public.group_buying_members 
  WHERE pool_id = p_pool_id AND user_id = p_user_id;

  IF FOUND THEN
    -- Incremental addition for existing member
    v_delta_qty := p_quantity;
    UPDATE public.group_buying_members 
    SET quantity = quantity + p_quantity,
        joined_at = now()
    WHERE pool_id = p_pool_id AND user_id = p_user_id;
  ELSE
    -- New member joining pool
    v_delta_qty := p_quantity;
    INSERT INTO public.group_buying_members (pool_id, user_id, quantity, joined_at)
    VALUES (p_pool_id, p_user_id, p_quantity, now());
  END IF;

  -- 4. Calculate updated pool stats
  v_new_quantity := v_pool.current_quantity + v_delta_qty;
  IF FOUND THEN
    v_new_participant_count := v_pool.participant_count;
  ELSE
    v_new_participant_count := v_pool.participant_count + 1;
  END IF;

  v_new_status := v_pool.status;
  IF v_new_quantity >= v_pool.target_quantity THEN
    v_new_status := 'THRESHOLD_REACHED';
  END IF;

  -- 5. Update pool record atomically
  UPDATE public.group_buying_pools
  SET current_quantity = v_new_quantity,
      participant_count = v_new_participant_count,
      status = v_new_status
  WHERE id = p_pool_id;

  RETURN jsonb_build_object(
    'success', true,
    'pool_id', p_pool_id,
    'current_quantity', v_new_quantity,
    'participant_count', v_new_participant_count,
    'status', v_new_status
  );
END;
$$;
