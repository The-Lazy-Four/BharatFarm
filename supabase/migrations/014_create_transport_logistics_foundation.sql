-- ============================================================================
-- BharatFarm Phase 1: Transport Logistics database foundation
--
-- This migration intentionally contains no sample providers, drivers, vehicles,
-- mandi coordinates, pools, or location events.  It creates only the secured
-- persistence layer required by a future transport workflow.
-- ============================================================================

CREATE TABLE public.transport_provider_profiles (
  provider_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE RESTRICT,
  business_name TEXT NOT NULL CHECK (char_length(trim(business_name)) BETWEEN 2 AND 160),
  contact_name TEXT NOT NULL CHECK (char_length(trim(contact_name)) BETWEEN 2 AND 160),
  contact_phone TEXT NOT NULL CHECK (char_length(trim(contact_phone)) BETWEEN 6 AND 30),
  contact_email TEXT,
  verification_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.transport_drivers (
  driver_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.transport_provider_profiles(provider_id) ON DELETE RESTRICT,
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) BETWEEN 2 AND 160),
  contact_phone TEXT NOT NULL CHECK (char_length(trim(contact_phone)) BETWEEN 6 AND 30),
  verification_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED')),
  availability_status TEXT NOT NULL DEFAULT 'UNAVAILABLE'
    CHECK (availability_status IN ('UNAVAILABLE', 'AVAILABLE', 'ON_TRIP', 'OFF_DUTY')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.transport_vehicles (
  vehicle_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.transport_provider_profiles(provider_id) ON DELETE RESTRICT,
  vehicle_type TEXT NOT NULL CHECK (char_length(trim(vehicle_type)) BETWEEN 2 AND 80),
  registration_number TEXT NOT NULL UNIQUE
    CHECK (char_length(trim(registration_number)) BETWEEN 4 AND 32),
  capacity_quintals NUMERIC(12, 2) NOT NULL CHECK (capacity_quintals > 0),
  verification_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED')),
  active_status BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.mandi_locations (
  mandi_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_name TEXT NOT NULL CHECK (char_length(trim(market_name)) BETWEEN 2 AND 160),
  district TEXT NOT NULL CHECK (char_length(trim(district)) BETWEEN 2 AND 120),
  state TEXT NOT NULL CHECK (char_length(trim(state)) BETWEEN 2 AND 120),
  latitude NUMERIC(9, 6) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude NUMERIC(9, 6) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  coordinate_source TEXT NOT NULL CHECK (char_length(trim(coordinate_source)) BETWEEN 2 AND 160),
  verification_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'RETIRED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (market_name, district, state)
);

CREATE TABLE public.transport_pools (
  pool_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  -- JSON object only; it is visible only to the creator, administrators, and
  -- confirmed members under the policies below.
  origin_location JSONB NOT NULL CHECK (jsonb_typeof(origin_location) = 'object'),
  destination_mandi_id UUID NOT NULL REFERENCES public.mandi_locations(mandi_id) ON DELETE RESTRICT,
  commodity TEXT NOT NULL CHECK (char_length(trim(commodity)) BETWEEN 2 AND 120),
  total_required_capacity NUMERIC(12, 2) NOT NULL CHECK (total_required_capacity > 0),
  available_capacity NUMERIC(12, 2) NOT NULL CHECK (available_capacity >= 0 AND available_capacity <= total_required_capacity),
  departure_window TSTZRANGE NOT NULL CHECK (NOT isempty(departure_window)),
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'OPEN', 'FULL', 'CONFIRMED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED', 'EXPIRED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (lower(departure_window) >= created_at)
);

CREATE TABLE public.transport_pool_members (
  member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES public.transport_pools(pool_id) ON DELETE RESTRICT,
  farmer_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  quantity_quintals NUMERIC(12, 2) NOT NULL CHECK (quantity_quintals > 0),
  pickup_location JSONB NOT NULL CHECK (jsonb_typeof(pickup_location) = 'object'),
  membership_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (membership_status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'LEFT')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pool_id, farmer_user_id)
);

CREATE INDEX idx_transport_drivers_provider_id ON public.transport_drivers(provider_id);
CREATE INDEX idx_transport_vehicles_provider_id ON public.transport_vehicles(provider_id);
CREATE INDEX idx_transport_pools_creator_user_id ON public.transport_pools(creator_user_id);
CREATE INDEX idx_transport_pools_destination_status ON public.transport_pools(destination_mandi_id, status);
CREATE INDEX idx_transport_pool_members_farmer_user_id ON public.transport_pool_members(farmer_user_id);
CREATE INDEX idx_transport_pool_members_pool_id ON public.transport_pool_members(pool_id);

-- Role checks intentionally use existing profile.role='admin'.  No existing
-- user is made a provider or driver by this migration.
CREATE OR REPLACE FUNCTION public.is_transport_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_verified_transport_provider(p_provider_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.transport_provider_profiles
    WHERE provider_id = p_provider_id
      AND user_id = auth.uid()
      AND verification_status = 'VERIFIED'
  );
$$;

CREATE OR REPLACE FUNCTION public.touch_transport_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_transport_provider_profiles_updated_at
  BEFORE UPDATE ON public.transport_provider_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_transport_updated_at();
CREATE TRIGGER trg_transport_drivers_updated_at
  BEFORE UPDATE ON public.transport_drivers
  FOR EACH ROW EXECUTE FUNCTION public.touch_transport_updated_at();
CREATE TRIGGER trg_transport_vehicles_updated_at
  BEFORE UPDATE ON public.transport_vehicles
  FOR EACH ROW EXECUTE FUNCTION public.touch_transport_updated_at();
CREATE TRIGGER trg_mandi_locations_updated_at
  BEFORE UPDATE ON public.mandi_locations
  FOR EACH ROW EXECUTE FUNCTION public.touch_transport_updated_at();
CREATE TRIGGER trg_transport_pools_updated_at
  BEFORE UPDATE ON public.transport_pools
  FOR EACH ROW EXECUTE FUNCTION public.touch_transport_updated_at();
CREATE TRIGGER trg_transport_pool_members_updated_at
  BEFORE UPDATE ON public.transport_pool_members
  FOR EACH ROW EXECUTE FUNCTION public.touch_transport_updated_at();

-- A provider cannot self-verify itself, its drivers, or its vehicles.
CREATE OR REPLACE FUNCTION public.protect_transport_verification_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NOT public.is_transport_admin()
     AND NEW.verification_status <> 'PENDING'
  THEN
    RAISE EXCEPTION 'Only an administrator can set verification status';
  END IF;
  IF TG_OP = 'UPDATE' AND NOT public.is_transport_admin()
     AND NEW.verification_status IS DISTINCT FROM OLD.verification_status
  THEN
    RAISE EXCEPTION 'Only an administrator can change verification status';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_provider_verification_protected
  BEFORE INSERT OR UPDATE ON public.transport_provider_profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_transport_verification_fields();
CREATE TRIGGER trg_driver_verification_protected
  BEFORE INSERT OR UPDATE ON public.transport_drivers
  FOR EACH ROW EXECUTE FUNCTION public.protect_transport_verification_fields();
CREATE TRIGGER trg_vehicle_verification_protected
  BEFORE INSERT OR UPDATE ON public.transport_vehicles
  FOR EACH ROW EXECUTE FUNCTION public.protect_transport_verification_fields();

-- A new pool always starts fully available.  Thereafter capacity can only be
-- changed by the locked join/leave RPCs below.
CREATE OR REPLACE FUNCTION public.initialize_transport_pool_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.available_capacity := NEW.total_required_capacity;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_transport_pool_capacity_initialized
  BEFORE INSERT ON public.transport_pools
  FOR EACH ROW EXECUTE FUNCTION public.initialize_transport_pool_capacity();

-- Capacity is mutable only in the locked membership RPCs below.
CREATE OR REPLACE FUNCTION public.protect_transport_pool_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF (NEW.total_required_capacity IS DISTINCT FROM OLD.total_required_capacity
      OR NEW.available_capacity IS DISTINCT FROM OLD.available_capacity)
     AND current_setting('app.transport_capacity_mutation', true) IS DISTINCT FROM 'on'
  THEN
    RAISE EXCEPTION 'Pool capacity may only be changed through a transport membership transaction';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_transport_pool_capacity_protected
  BEFORE UPDATE ON public.transport_pools
  FOR EACH ROW EXECUTE FUNCTION public.protect_transport_pool_capacity();

ALTER TABLE public.transport_provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandi_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_pool_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers read own transport profile"
  ON public.transport_provider_profiles FOR SELECT
  USING (user_id = auth.uid() OR public.is_transport_admin());
CREATE POLICY "Users create one own provider profile"
  ON public.transport_provider_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_transport_admin());
CREATE POLICY "Providers update own transport profile"
  ON public.transport_provider_profiles FOR UPDATE
  USING (user_id = auth.uid() OR public.is_transport_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_transport_admin());

CREATE POLICY "Providers read own drivers"
  ON public.transport_drivers FOR SELECT
  USING (public.is_verified_transport_provider(provider_id) OR public.is_transport_admin());
CREATE POLICY "Providers add own drivers"
  ON public.transport_drivers FOR INSERT
  WITH CHECK (public.is_verified_transport_provider(provider_id) OR public.is_transport_admin());
CREATE POLICY "Providers update own drivers"
  ON public.transport_drivers FOR UPDATE
  USING (public.is_verified_transport_provider(provider_id) OR public.is_transport_admin())
  WITH CHECK (public.is_verified_transport_provider(provider_id) OR public.is_transport_admin());
CREATE POLICY "Drivers read own assignment"
  ON public.transport_drivers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Providers read own vehicles"
  ON public.transport_vehicles FOR SELECT
  USING (public.is_verified_transport_provider(provider_id) OR public.is_transport_admin());
CREATE POLICY "Providers add own vehicles"
  ON public.transport_vehicles FOR INSERT
  WITH CHECK (public.is_verified_transport_provider(provider_id) OR public.is_transport_admin());
CREATE POLICY "Providers update own vehicles"
  ON public.transport_vehicles FOR UPDATE
  USING (public.is_verified_transport_provider(provider_id) OR public.is_transport_admin())
  WITH CHECK (public.is_verified_transport_provider(provider_id) OR public.is_transport_admin());

-- Mandi coordinates are operational reference data, not farmer/driver GPS.
-- Only verified records are readable to signed-in users; administration is
-- deliberately restricted to existing BharatFarm administrators.
CREATE POLICY "Authenticated users read verified mandi locations"
  ON public.mandi_locations FOR SELECT
  USING (auth.uid() IS NOT NULL AND verification_status = 'VERIFIED');
CREATE POLICY "Administrators manage mandi locations"
  ON public.mandi_locations FOR ALL
  USING (public.is_transport_admin())
  WITH CHECK (public.is_transport_admin());

CREATE POLICY "Creators and administrators read transport pools"
  ON public.transport_pools FOR SELECT
  USING (creator_user_id = auth.uid() OR public.is_transport_admin());
CREATE POLICY "Creators create own draft transport pools"
  ON public.transport_pools FOR INSERT
  WITH CHECK (
    creator_user_id = auth.uid()
    AND status = 'DRAFT'
  );
CREATE POLICY "Members read pools they joined"
  ON public.transport_pools FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.transport_pool_members m
      WHERE m.pool_id = transport_pools.pool_id
        AND m.farmer_user_id = auth.uid()
        AND m.membership_status = 'CONFIRMED'
    )
  );

-- Members are created/removed exclusively through the transactional RPCs.
-- This prevents direct writes from bypassing the locked capacity calculation.
CREATE POLICY "Farmers read own transport memberships"
  ON public.transport_pool_members FOR SELECT
  USING (farmer_user_id = auth.uid() OR public.is_transport_admin());
CREATE POLICY "Pool creators read pool memberships"
  ON public.transport_pool_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.transport_pools p
      WHERE p.pool_id = transport_pool_members.pool_id AND p.creator_user_id = auth.uid()
    )
  );

-- Pool fields and lifecycle cannot be changed by direct table updates.  These
-- RPCs are the only permitted creator actions after initial creation.
CREATE OR REPLACE FUNCTION public.update_transport_pool_draft(
  p_pool_id UUID,
  p_origin_location JSONB,
  p_destination_mandi_id UUID,
  p_commodity TEXT,
  p_total_required_capacity NUMERIC,
  p_departure_window TSTZRANGE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_pool public.transport_pools%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF p_origin_location IS NULL OR jsonb_typeof(p_origin_location) <> 'object' THEN RAISE EXCEPTION 'Origin location must be a JSON object'; END IF;
  IF p_commodity IS NULL OR char_length(trim(p_commodity)) NOT BETWEEN 2 AND 120 THEN RAISE EXCEPTION 'Commodity must contain between 2 and 120 characters'; END IF;
  IF p_total_required_capacity IS NULL OR p_total_required_capacity <= 0 THEN RAISE EXCEPTION 'Total required capacity must be greater than zero'; END IF;
  IF p_departure_window IS NULL OR isempty(p_departure_window) OR lower(p_departure_window) < now() THEN RAISE EXCEPTION 'Departure window must be non-empty and start in the future'; END IF;

  SELECT * INTO v_pool FROM public.transport_pools WHERE pool_id = p_pool_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Transport pool not found'; END IF;
  IF v_pool.creator_user_id <> auth.uid() AND NOT public.is_transport_admin() THEN RAISE EXCEPTION 'Only the pool creator or an administrator can update this pool'; END IF;
  IF v_pool.status <> 'DRAFT' THEN RAISE EXCEPTION 'Only draft transport pools can be amended'; END IF;
  IF EXISTS (SELECT 1 FROM public.transport_pool_members WHERE pool_id = p_pool_id) THEN RAISE EXCEPTION 'A pool with memberships cannot be amended'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.mandi_locations WHERE mandi_id = p_destination_mandi_id AND verification_status = 'VERIFIED') THEN RAISE EXCEPTION 'Destination mandi must be verified'; END IF;

  PERFORM set_config('app.transport_capacity_mutation', 'on', true);
  UPDATE public.transport_pools
  SET origin_location = p_origin_location,
      destination_mandi_id = p_destination_mandi_id,
      commodity = trim(p_commodity),
      total_required_capacity = p_total_required_capacity,
      available_capacity = p_total_required_capacity,
      departure_window = p_departure_window
  WHERE pool_id = p_pool_id;
  RETURN jsonb_build_object('pool_id', p_pool_id, 'status', 'DRAFT');
END;
$$;

CREATE OR REPLACE FUNCTION public.open_transport_pool(p_pool_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE v_pool public.transport_pools%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT * INTO v_pool FROM public.transport_pools WHERE pool_id = p_pool_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Transport pool not found'; END IF;
  IF v_pool.creator_user_id <> auth.uid() AND NOT public.is_transport_admin() THEN RAISE EXCEPTION 'Only the pool creator or an administrator can open this pool'; END IF;
  IF v_pool.status <> 'DRAFT' THEN RAISE EXCEPTION 'Only draft transport pools can be opened'; END IF;
  IF upper(v_pool.departure_window) IS NOT NULL AND upper(v_pool.departure_window) <= now() THEN RAISE EXCEPTION 'Transport pool departure window has passed'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.mandi_locations WHERE mandi_id = v_pool.destination_mandi_id AND verification_status = 'VERIFIED') THEN RAISE EXCEPTION 'Destination mandi must be verified before opening a pool'; END IF;
  UPDATE public.transport_pools SET status = 'OPEN' WHERE pool_id = p_pool_id;
  RETURN jsonb_build_object('pool_id', p_pool_id, 'status', 'OPEN');
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_transport_pool(p_pool_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE v_pool public.transport_pools%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT * INTO v_pool FROM public.transport_pools WHERE pool_id = p_pool_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Transport pool not found'; END IF;
  IF v_pool.creator_user_id <> auth.uid() AND NOT public.is_transport_admin() THEN RAISE EXCEPTION 'Only the pool creator or an administrator can cancel this pool'; END IF;
  IF v_pool.status NOT IN ('DRAFT', 'OPEN', 'FULL') THEN RAISE EXCEPTION 'This transport pool can no longer be cancelled'; END IF;
  IF EXISTS (SELECT 1 FROM public.transport_pool_members WHERE pool_id = p_pool_id AND membership_status = 'CONFIRMED') THEN RAISE EXCEPTION 'A pool with confirmed memberships cannot be cancelled'; END IF;
  UPDATE public.transport_pool_members SET membership_status = 'CANCELLED' WHERE pool_id = p_pool_id AND membership_status = 'PENDING';
  UPDATE public.transport_pools SET status = 'CANCELLED' WHERE pool_id = p_pool_id;
  RETURN jsonb_build_object('pool_id', p_pool_id, 'status', 'CANCELLED');
END;
$$;

CREATE OR REPLACE FUNCTION public.join_transport_pool(
  p_pool_id UUID,
  p_quantity_quintals NUMERIC,
  p_pickup_location JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_pool public.transport_pools%ROWTYPE;
  v_member_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_quantity_quintals IS NULL OR p_quantity_quintals <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than zero';
  END IF;
  IF p_pickup_location IS NULL OR jsonb_typeof(p_pickup_location) <> 'object' THEN
    RAISE EXCEPTION 'Pickup location must be a JSON object';
  END IF;

  SELECT * INTO v_pool
  FROM public.transport_pools
  WHERE pool_id = p_pool_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transport pool not found';
  END IF;
  IF v_pool.creator_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Pool creator cannot join their own transport pool';
  END IF;
  IF v_pool.status <> 'OPEN' THEN
    RAISE EXCEPTION 'Transport pool is not open for membership';
  END IF;
  IF upper(v_pool.departure_window) <= now() THEN
    RAISE EXCEPTION 'Transport pool departure window has passed';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.transport_pool_members
    WHERE pool_id = p_pool_id AND farmer_user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Farmer already has a membership for this transport pool';
  END IF;
  IF v_pool.available_capacity < p_quantity_quintals THEN
    RAISE EXCEPTION 'Requested quantity exceeds remaining pool capacity';
  END IF;

  INSERT INTO public.transport_pool_members (
    pool_id, farmer_user_id, quantity_quintals, pickup_location, membership_status
  ) VALUES (
    p_pool_id, auth.uid(), p_quantity_quintals, p_pickup_location, 'PENDING'
  ) RETURNING member_id INTO v_member_id;

  PERFORM set_config('app.transport_capacity_mutation', 'on', true);
  UPDATE public.transport_pools
  SET available_capacity = available_capacity - p_quantity_quintals,
      status = CASE WHEN available_capacity - p_quantity_quintals = 0 THEN 'FULL' ELSE status END
  WHERE pool_id = p_pool_id;

  RETURN jsonb_build_object('member_id', v_member_id, 'pool_id', p_pool_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.leave_transport_pool(p_pool_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_pool public.transport_pools%ROWTYPE;
  v_member public.transport_pool_members%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_pool FROM public.transport_pools WHERE pool_id = p_pool_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transport pool not found';
  END IF;
  SELECT * INTO v_member
  FROM public.transport_pool_members
  WHERE pool_id = p_pool_id AND farmer_user_id = auth.uid()
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transport pool membership not found';
  END IF;
  IF v_member.membership_status NOT IN ('PENDING', 'CONFIRMED') THEN
    RAISE EXCEPTION 'This membership is no longer active';
  END IF;
  IF v_pool.status NOT IN ('DRAFT', 'OPEN', 'FULL') THEN
    RAISE EXCEPTION 'Membership cannot be left after pool confirmation';
  END IF;

  UPDATE public.transport_pool_members
  SET membership_status = 'LEFT'
  WHERE member_id = v_member.member_id;

  PERFORM set_config('app.transport_capacity_mutation', 'on', true);
  UPDATE public.transport_pools
  SET available_capacity = LEAST(total_required_capacity, available_capacity + v_member.quantity_quintals),
      status = CASE WHEN status = 'FULL' THEN 'OPEN' ELSE status END
  WHERE pool_id = p_pool_id;

  RETURN jsonb_build_object('member_id', v_member.member_id, 'pool_id', p_pool_id, 'membership_status', 'LEFT');
END;
$$;

REVOKE ALL ON FUNCTION public.is_transport_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_verified_transport_provider(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_transport_pool_draft(UUID, JSONB, UUID, TEXT, NUMERIC, TSTZRANGE) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.open_transport_pool(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cancel_transport_pool(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.join_transport_pool(UUID, NUMERIC, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.leave_transport_pool(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_transport_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_verified_transport_provider(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_transport_pool_draft(UUID, JSONB, UUID, TEXT, NUMERIC, TSTZRANGE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.open_transport_pool(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_transport_pool(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_transport_pool(UUID, NUMERIC, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_transport_pool(UUID) TO authenticated;
