-- ============================================================
-- BharatFarm Foundation Migration: profiles
-- Linked to Supabase auth.users via id
-- Applied: 2026-08-27
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL DEFAULT '',
  email       TEXT,
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'farmer'
              CHECK (role IN ('farmer', 'buyer', 'admin', 'expert')),
  avatar_url  TEXT,
  state       TEXT,
  district    TEXT,
  pincode     TEXT,
  land_size_acres NUMERIC,
  primary_crops   TEXT[],
  preferred_language TEXT DEFAULT 'en',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
