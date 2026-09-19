-- ============================================================
-- BharatFarm Migration: 012_create_whatsapp_tables.sql
-- Integration layer for WhatsApp Access into Sahayak
-- ============================================================

-- 1. WhatsApp Users (Mapping WhatsApp numbers to BharatFarm Profiles)
CREATE TABLE IF NOT EXISTS public.whatsapp_users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number    TEXT NOT NULL UNIQUE,
  farmer_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name            TEXT,
  language        TEXT NOT NULL DEFAULT 'en',
  location_lat    NUMERIC,
  location_lng    NUMERIC,
  location_name   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_users_phone ON public.whatsapp_users(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_farmer ON public.whatsapp_users(farmer_id);

-- 2. WhatsApp Inbound/Outbound Messages (Deduplication & Audit Trail)
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_message_id TEXT NOT NULL UNIQUE,
  whatsapp_user_id    UUID REFERENCES public.whatsapp_users(id) ON DELETE CASCADE,
  direction           TEXT NOT NULL CHECK (direction IN ('INBOUND', 'OUTBOUND')),
  message_type        TEXT NOT NULL CHECK (message_type IN ('TEXT', 'IMAGE', 'AUDIO', 'LOCATION', 'INTERACTIVE', 'UNKNOWN')),
  content             TEXT,
  media_id            TEXT,
  intent              TEXT,
  status              TEXT NOT NULL DEFAULT 'RECEIVED' CHECK (status IN ('RECEIVED', 'PROCESSING', 'DELIVERED', 'FAILED')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_msgs_wamid ON public.whatsapp_messages(whatsapp_message_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_msgs_user ON public.whatsapp_messages(whatsapp_user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_msgs_created ON public.whatsapp_messages(created_at DESC);

-- 3. Sahayak Sessions (Multi-turn Context & State)
CREATE TABLE IF NOT EXISTS public.sahayak_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_user_id  UUID NOT NULL UNIQUE REFERENCES public.whatsapp_users(id) ON DELETE CASCADE,
  context           JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_intent       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sahayak_sessions_user ON public.sahayak_sessions(whatsapp_user_id);

-- 4. Row Level Security Policies
ALTER TABLE public.whatsapp_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sahayak_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on whatsapp_users"
  ON public.whatsapp_users FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on whatsapp_messages"
  ON public.whatsapp_messages FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on sahayak_sessions"
  ON public.sahayak_sessions FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
