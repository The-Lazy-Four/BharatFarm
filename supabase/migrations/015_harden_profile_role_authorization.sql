-- ============================================================================
-- BharatFarm: profile role authorization hardening
-- This migration changes the already-deployed profiles table without altering
-- migration 001.  User-facing profile updates may never assign application
-- roles; privileged role changes require an existing administrator or the
-- backend service-role client.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- A direct client-side profile insert can only create the default farmer
  -- identity. Registration and trusted administration use service_role.
  IF TG_OP = 'INSERT' THEN
    IF COALESCE(auth.role(), '') <> 'service_role' AND NEW.role <> 'farmer' THEN
      RAISE EXCEPTION 'Only trusted administration can assign a profile role';
    END IF;
    RETURN NEW;
  END IF;

  -- Direct profile edits retain the existing own-row RLS policy, but may not
  -- change role. The guarded RPC below sets this transaction-local flag.
  IF NEW.role IS DISTINCT FROM OLD.role
     AND COALESCE(auth.role(), '') <> 'service_role'
     AND current_setting('app.profile_role_mutation', true) IS DISTINCT FROM 'on'
  THEN
    RAISE EXCEPTION 'Profile role cannot be changed directly';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_protect_role
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

CREATE OR REPLACE FUNCTION public.set_profile_role(
  p_user_id UUID,
  p_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_role NOT IN ('farmer', 'buyer', 'admin', 'expert') THEN
    RAISE EXCEPTION 'Invalid profile role';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Administrator role required';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  PERFORM set_config('app.profile_role_mutation', 'on', true);
  UPDATE public.profiles SET role = p_role WHERE id = p_user_id;
  RETURN jsonb_build_object('user_id', p_user_id, 'role', p_role);
END;
$$;

REVOKE ALL ON FUNCTION public.set_profile_role(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_profile_role(UUID, TEXT) TO authenticated;
