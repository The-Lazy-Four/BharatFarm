-- Migration 009: Create push_subscriptions table for Web Push (PWA)
-- Created: 2026-09-08

-- Store push subscriptions for each user device
-- One user can have multiple subscriptions (multiple devices)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint     TEXT NOT NULL UNIQUE,
  p256dh       TEXT NOT NULL,
  auth         TEXT NOT NULL,
  expiration_time BIGINT,
  user_agent   TEXT,
  device_type  TEXT CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by user_id
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
  ON push_subscriptions(user_id);

-- Enable Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only view/manage their own push subscriptions
CREATE POLICY "Users can view their own push subscriptions"
  ON push_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push subscriptions"
  ON push_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push subscriptions"
  ON push_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push subscriptions"
  ON push_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can manage all subscriptions (needed for server-side push sending)
CREATE POLICY "Service role has full access"
  ON push_subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_push_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER push_subscription_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscription_updated_at();

COMMENT ON TABLE push_subscriptions IS 'Web Push API subscriptions for BharatFarm PWA notifications.';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'Browser push service endpoint URL (unique per device).';
COMMENT ON COLUMN push_subscriptions.p256dh IS 'P-256 Diffie-Hellman public key for encrypted push.';
COMMENT ON COLUMN push_subscriptions.auth IS 'Authentication secret for encrypted push.';
