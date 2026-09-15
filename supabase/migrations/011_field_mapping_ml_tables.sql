-- ============================================================
-- BharatFarm SIH Migration: ML-Ready Field Mapping Tables
-- Adds sessions, raw GPS point streams, and ML training observations
-- ============================================================

-- 1. Mapping Sessions Table (Tracks mapping attempts & quality)
CREATE TABLE IF NOT EXISTS public.field_mapping_sessions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id               UUID REFERENCES public.field_mappings(id) ON DELETE CASCADE,
  user_id                UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name              TEXT NOT NULL,
  mapping_mode           TEXT NOT NULL CHECK (mapping_mode IN ('REAL_GPS', 'DEMO')),
  started_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at               TIMESTAMPTZ,
  total_points           INTEGER NOT NULL DEFAULT 0,
  valid_points           INTEGER NOT NULL DEFAULT 0,
  rejected_points        INTEGER NOT NULL DEFAULT 0,
  total_distance_meters  NUMERIC NOT NULL DEFAULT 0,
  average_accuracy_meters NUMERIC DEFAULT 0,
  device_info            JSONB DEFAULT '{}'::jsonb,
  sync_status            TEXT NOT NULL DEFAULT 'SYNCED' CHECK (sync_status IN ('LOCAL_ONLY', 'SYNCING', 'SYNCED', 'SYNC_FAILED')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Raw GPS Points Table (Preserves immutable raw coordinate stream)
CREATE TABLE IF NOT EXISTS public.field_gps_points (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id             UUID NOT NULL REFERENCES public.field_mapping_sessions(id) ON DELETE CASCADE,
  user_id                UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sequence_number        INTEGER NOT NULL,
  latitude               NUMERIC NOT NULL,
  longitude              NUMERIC NOT NULL,
  accuracy_meters        NUMERIC,
  altitude_meters        NUMERIC,
  heading_degrees        NUMERIC,
  speed_mps              NUMERIC,
  point_timestamp        TIMESTAMPTZ NOT NULL DEFAULT now(),
  quality                TEXT NOT NULL DEFAULT 'GOOD' CHECK (quality IN ('GOOD', 'FAIR', 'POOR', 'REJECTED')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. ML Training Observations Table (Structured ML-ready feature store)
CREATE TABLE IF NOT EXISTS public.ml_training_observations (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id               UUID REFERENCES public.field_mappings(id) ON DELETE CASCADE,
  session_id             UUID REFERENCES public.field_mapping_sessions(id) ON DELETE CASCADE,
  crop_name              TEXT NOT NULL,
  area_sq_meters         NUMERIC NOT NULL,
  area_acres             NUMERIC NOT NULL,
  perimeter_meters       NUMERIC NOT NULL,
  centroid_latitude      NUMERIC NOT NULL,
  centroid_longitude     NUMERIC NOT NULL,
  mapping_mode           TEXT NOT NULL DEFAULT 'REAL_GPS',
  data_quality_score     NUMERIC DEFAULT 1.0,
  feature_schema_version TEXT NOT NULL DEFAULT 'v1',
  dataset_provenance     TEXT NOT NULL DEFAULT 'FIELD_MAPPING_GPS',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_field_user ON public.field_mapping_sessions(field_id, user_id);
CREATE INDEX IF NOT EXISTS idx_gps_points_session_seq ON public.field_gps_points(session_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_ml_obs_crop_mode ON public.ml_training_observations(crop_name, mapping_mode);

-- Enable RLS
ALTER TABLE public.field_mapping_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_gps_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_training_observations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Mapping Sessions
CREATE POLICY "Users view own mapping sessions" ON public.field_mapping_sessions FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users insert own mapping sessions" ON public.field_mapping_sessions FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for GPS Points
CREATE POLICY "Users view own gps points" ON public.field_gps_points FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users insert own gps points" ON public.field_gps_points FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for ML Observations
CREATE POLICY "Users view own ml observations" ON public.ml_training_observations FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users insert own ml observations" ON public.ml_training_observations FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
