-- ============================================================
-- BharatFarm Foundation Migration: roadmaps
-- Applied: 2026-08-27
-- ============================================================

CREATE TABLE IF NOT EXISTS public.roadmaps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  crop        TEXT NOT NULL,
  state       TEXT NOT NULL,
  district    TEXT NOT NULL,
  land_size   NUMERIC NOT NULL,
  land_unit   TEXT NOT NULL DEFAULT 'acres' CHECK (land_unit IN ('acres', 'hectares')),
  start_date  DATE NOT NULL,
  soil_type   TEXT,
  irrigation  TEXT,
  activities  JSONB NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_roadmaps_user ON public.roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_crop ON public.roadmaps(crop);

ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roadmaps"
  ON public.roadmaps FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own roadmaps"
  ON public.roadmaps FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own roadmaps"
  ON public.roadmaps FOR DELETE USING (auth.uid() = user_id);
