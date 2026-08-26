-- ============================================================
-- BharatFarm Foundation Migration: krishibot_sessions + krishibot_messages
-- Applied: 2026-08-27
-- ============================================================

CREATE TABLE IF NOT EXISTS public.krishibot_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  language    TEXT NOT NULL DEFAULT 'en',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kb_sessions_user ON public.krishibot_sessions(user_id);

CREATE TABLE IF NOT EXISTS public.krishibot_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES public.krishibot_sessions(id) ON DELETE CASCADE,
  sender      TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
  content     TEXT NOT NULL,
  audio_url   TEXT,
  suggested_actions TEXT[],
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kb_messages_session ON public.krishibot_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_kb_messages_created ON public.krishibot_messages(created_at);

ALTER TABLE public.krishibot_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON public.krishibot_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON public.krishibot_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.krishibot_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own sessions"
  ON public.krishibot_messages FOR SELECT
  USING (session_id IN (SELECT id FROM public.krishibot_sessions WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert messages in own sessions"
  ON public.krishibot_messages FOR INSERT
  WITH CHECK (session_id IN (SELECT id FROM public.krishibot_sessions WHERE user_id = auth.uid()));
