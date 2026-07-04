-- Harden table privileges + add money/data constraints.
--
-- Follow-up to 20260628120000_harden_rls.sql. That migration enabled RLS and
-- revoked anon INSERT, but anon/authenticated still carried the broad
-- SELECT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER grants left over from the
-- tables' original `GRANT ALL`. RLS blocks row access today (no anon policy),
-- but privileges are defense-in-depth: if RLS is ever toggled off on a table by
-- mistake, those grants would instantly expose or destroy all customer PII
-- through the public REST API. This migration removes them.
--
-- App impact: NONE. Every public write (orders / inquiries / subscribers) goes
-- through service-role server functions (src/lib/api/*.functions.ts →
-- supabaseAdmin), which bypass grants and RLS. The admin dashboard reads/writes
-- as the `authenticated` role gated by public.is_admin(), so authenticated keeps
-- SELECT/INSERT/UPDATE/DELETE — only the never-used TRUNCATE/REFERENCES/TRIGGER
-- are removed.

-- 1. anon: no access at all to these tables ----------------------------------
REVOKE ALL ON public.orders       FROM anon;
REVOKE ALL ON public.inquiries    FROM anon;
REVOKE ALL ON public.subscribers  FROM anon;
REVOKE ALL ON public.admin_emails FROM anon;

-- 2. authenticated: least privilege (RLS still gates every row to admins) -----
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.orders      FROM authenticated;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.inquiries   FROM authenticated;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.subscribers FROM authenticated;
REVOKE ALL ON public.admin_emails FROM authenticated;

-- 3. Keep future auto-created tables from silently re-granting to anon --------
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;

-- 4. Money can never be negative (server computes it; DB defends anyway) ------
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_money_nonneg;
ALTER TABLE public.orders ADD  CONSTRAINT orders_money_nonneg CHECK (
  subtotal >= 0 AND tax >= 0 AND delivery_fee >= 0 AND total >= 0
  AND (delivery_miles IS NULL OR delivery_miles >= 0)
);

-- 5. Audit trail: stamp admin edits ------------------------------------------
ALTER TABLE public.orders    ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_set_updated_at ON public.orders;
CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS inquiries_set_updated_at ON public.inquiries;
CREATE TRIGGER inquiries_set_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
