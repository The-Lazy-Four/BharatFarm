-- ============================================================
-- BharatFarm Foundation Migration: scan_results
-- Applied: 2026-08-27
-- ============================================================

CREATE TABLE IF NOT EXISTS public.scan_results (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status                TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed')),
  disease               TEXT NOT NULL,
  confidence            NUMERIC NOT NULL DEFAULT 0,
  crop_name             TEXT NOT NULL DEFAULT 'Unknown',
  severity              TEXT NOT NULL DEFAULT 'none' CHECK (severity IN ('low', 'medium', 'high', 'none')),
  recommendations       TEXT[] NOT NULL DEFAULT '{}',
  preventative_measures TEXT[] NOT NULL DEFAULT '{}',
  image_storage_path    TEXT,
  crop_hint             TEXT,
  scanned_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scans_user ON public.scan_results(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_disease ON public.scan_results(disease);
CREATE INDEX IF NOT EXISTS idx_scans_date ON public.scan_results(scanned_at);

ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scans"
  ON public.scan_results FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans"
  ON public.scan_results FOR INSERT WITH CHECK (auth.uid() = user_id);
