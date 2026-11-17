-- ============================================================
-- BharatFarm Authentication: backend profile provisioning
--
-- The application creates and reads profiles exclusively through its
-- server-side service-role client. The service role needs explicit table
-- privileges in addition to its RLS bypass capability.
-- ============================================================

GRANT USAGE ON SCHEMA public TO service_role;

-- Required for profile upsert/select in server/src/routes/auth.routes.ts.
-- Do not grant these privileges to anon or authenticated roles.
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO service_role;
