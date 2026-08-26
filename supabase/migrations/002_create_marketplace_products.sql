-- ============================================================
-- BharatFarm Foundation Migration: marketplace_products
-- Applied: 2026-08-27
-- ============================================================

CREATE TABLE IF NOT EXISTS public.marketplace_products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title               TEXT NOT NULL,
  category            TEXT NOT NULL CHECK (category IN ('crops', 'seeds', 'fertilizers', 'equipment')),
  price               NUMERIC NOT NULL CHECK (price >= 0),
  unit                TEXT NOT NULL,
  quantity_available  INTEGER NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  location            TEXT NOT NULL,
  seller_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_name         TEXT NOT NULL DEFAULT '',
  seller_rating       NUMERIC,
  seller_whatsapp     TEXT,
  seller_phone        TEXT,
  verified            BOOLEAN NOT NULL DEFAULT false,
  image_url           TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_category ON public.marketplace_products(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON public.marketplace_products(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_location ON public.marketplace_products(location);

ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to marketplace"
  ON public.marketplace_products FOR SELECT USING (true);

CREATE POLICY "Sellers can create own listings"
  ON public.marketplace_products FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own listings"
  ON public.marketplace_products FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own listings"
  ON public.marketplace_products FOR DELETE USING (auth.uid() = seller_id);
