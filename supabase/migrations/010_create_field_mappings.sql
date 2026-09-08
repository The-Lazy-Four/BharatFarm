-- ============================================================
-- BharatFarm SIH Migration: field_mappings
-- Stores GPS boundary traces, crop info, and calculated acreage
-- ============================================================

CREATE TABLE IF NOT EXISTS public.field_mappings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  field_name          TEXT NOT NULL DEFAULT 'My Field',
  crop_name           TEXT NOT NULL,
  area_acres          NUMERIC NOT NULL DEFAULT 0,
  perimeter_meters    NUMERIC NOT NULL DEFAULT 0,
  latitude            NUMERIC NOT NULL,
  longitude           NUMERIC NOT NULL,
  boundary_coordinates JSONB NOT NULL DEFAULT '[]'::jsonb,
  location_address    TEXT DEFAULT 'Haldia, West Bengal',
  is_demo             BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_field_mappings_user_id ON public.field_mappings(user_id);

ALTER TABLE public.field_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own field mappings"
  ON public.field_mappings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own field mappings"
  ON public.field_mappings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own field mappings"
  ON public.field_mappings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own field mappings"
  ON public.field_mappings FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_field_mappings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_field_mappings_updated_at
  BEFORE UPDATE ON public.field_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_field_mappings_updated_at();
