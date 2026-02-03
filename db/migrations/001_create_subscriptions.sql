-- Migration: create subscriptions table
-- Requires: pgcrypto extension for gen_random_uuid()

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NULL,
  order_no text NOT NULL UNIQUE,
  status text NOT NULL,
  tx_hash text NULL,
  amount numeric(12,2) NULL,
  metadata jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_order_no ON subscriptions(order_no);
