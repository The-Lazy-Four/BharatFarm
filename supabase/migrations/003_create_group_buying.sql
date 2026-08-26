-- ============================================================
-- BharatFarm Foundation Migration: group_buying_pools + group_buying_members
-- Applied: 2026-08-27
-- ============================================================

CREATE TABLE IF NOT EXISTS public.group_buying_pools (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_title              TEXT NOT NULL,
  category                TEXT NOT NULL CHECK (category IN ('fertilizer', 'seeds', 'machinery')),
  original_price_per_unit NUMERIC NOT NULL CHECK (original_price_per_unit >= 0),
  discounted_price_per_unit NUMERIC NOT NULL CHECK (discounted_price_per_unit >= 0),
  target_quantity         INTEGER NOT NULL CHECK (target_quantity > 0),
  current_quantity        INTEGER NOT NULL DEFAULT 0 CHECK (current_quantity >= 0),
  participant_count       INTEGER NOT NULL DEFAULT 0 CHECK (participant_count >= 0),
  status                  TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'THRESHOLD_REACHED', 'COMPLETED', 'EXPIRED')),
  deadline                TIMESTAMPTZ NOT NULL,
  location                TEXT NOT NULL,
  creator_id              UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pools_status ON public.group_buying_pools(status);
CREATE INDEX IF NOT EXISTS idx_pools_category ON public.group_buying_pools(category);
CREATE INDEX IF NOT EXISTS idx_pools_deadline ON public.group_buying_pools(deadline);

CREATE TABLE IF NOT EXISTS public.group_buying_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id     UUID NOT NULL REFERENCES public.group_buying_pools(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(pool_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_pool_members_pool ON public.group_buying_members(pool_id);
CREATE INDEX IF NOT EXISTS idx_pool_members_user ON public.group_buying_members(user_id);

ALTER TABLE public.group_buying_pools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to pools"
  ON public.group_buying_pools FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create pools"
  ON public.group_buying_pools FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Pool creators can update own pools"
  ON public.group_buying_pools FOR UPDATE USING (auth.uid() = creator_id);

ALTER TABLE public.group_buying_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to pool members"
  ON public.group_buying_members FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join pools"
  ON public.group_buying_members FOR INSERT WITH CHECK (auth.uid() = user_id);
