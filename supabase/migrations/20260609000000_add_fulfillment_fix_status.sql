-- Add fulfillment column (missing from initial migration)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS fulfillment text NOT NULL DEFAULT 'delivery'
    CHECK (fulfillment IN ('delivery', 'pickup'));

-- Fix status constraint to include all admin-managed values.
-- Drop old constraint, add new one with full set of statuses.
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
    CHECK (status IN ('pending', 'confirmed', 'ready', 'completed', 'cancelled', 'paid', 'fulfilled', 'canceled'));
