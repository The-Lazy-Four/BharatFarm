-- ============================================================
-- BharatFarm Foundation Migration: schemes
-- Applied: 2026-08-27
-- ============================================================

CREATE TABLE IF NOT EXISTS public.schemes (
  id                    TEXT PRIMARY KEY,
  title                 TEXT NOT NULL,
  department            TEXT NOT NULL,
  category              TEXT NOT NULL CHECK (category IN ('subsidy', 'loan', 'insurance', 'equipment')),
  state                 TEXT NOT NULL DEFAULT 'Central',
  description           TEXT NOT NULL,
  eligibility_criteria  TEXT[] NOT NULL DEFAULT '{}',
  required_documents    TEXT[] NOT NULL DEFAULT '{}',
  official_url          TEXT,
  eligibility_min_land  NUMERIC DEFAULT 0,
  eligibility_max_land  NUMERIC DEFAULT 9999,
  eligibility_states    TEXT[] DEFAULT '{All}',
  eligibility_crops     TEXT[] DEFAULT '{All}',
  apply_steps           TEXT[] DEFAULT '{}',
  active                BOOLEAN NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schemes_category ON public.schemes(category);
CREATE INDEX IF NOT EXISTS idx_schemes_state ON public.schemes(state);
CREATE INDEX IF NOT EXISTS idx_schemes_active ON public.schemes(active);

ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to schemes"
  ON public.schemes FOR SELECT USING (true);

CREATE POLICY "Service role manages schemes"
  ON public.schemes FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
