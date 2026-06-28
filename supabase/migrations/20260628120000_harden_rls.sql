-- Harden RLS: server-authoritative writes + admin-only reads.
--
-- Before: anon could INSERT any order/inquiry/subscriber (WITH CHECK true), and
-- ANY authenticated user could read/update/delete every row (USING true).
-- After: public writes go only through service-role server functions; reads and
-- mutations are restricted to admins via public.is_admin().

-- 1. Admin allowlist + helper -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_emails (
  email text PRIMARY KEY
);

-- Seed owner accounts (idempotent). Add/remove admins by editing this table.
INSERT INTO public.admin_emails (email) VALUES
  ('bagnetchon@gmail.com'),
  ('ulanjeremiah@yahoo.com')
ON CONFLICT (email) DO NOTHING;

-- Lock the table down: only service_role / SECURITY DEFINER may read it.
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_emails FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_emails
    WHERE email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 2. Revoke anon writes (writes now go through service-role server fns) --------
REVOKE INSERT ON public.orders FROM anon;
REVOKE INSERT ON public.inquiries FROM anon;
REVOKE INSERT ON public.subscribers FROM anon;

DROP POLICY IF EXISTS "Anyone can place an order" ON public.orders;
DROP POLICY IF EXISTS "Anyone can submit an inquiry" ON public.inquiries;
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.subscribers;

-- 3. Lock reads/writes to admins only -----------------------------------------
-- orders
DROP POLICY IF EXISTS "Admins can read orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can read orders" ON public.orders
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE TO authenticated USING (public.is_admin());

-- inquiries
DROP POLICY IF EXISTS "Admins can read inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can update inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can delete inquiries" ON public.inquiries;
CREATE POLICY "Admins can read inquiries" ON public.inquiries
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can update inquiries" ON public.inquiries
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete inquiries" ON public.inquiries
  FOR DELETE TO authenticated USING (public.is_admin());
-- Admins may log manual inquiries (DM/phone) from the panel.
DROP POLICY IF EXISTS "Admins can insert inquiries" ON public.inquiries;
CREATE POLICY "Admins can insert inquiries" ON public.inquiries
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- subscribers
DROP POLICY IF EXISTS "Admins can read subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Admins can update subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Admins can delete subscribers" ON public.subscribers;
CREATE POLICY "Admins can read subscribers" ON public.subscribers
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can update subscribers" ON public.subscribers
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete subscribers" ON public.subscribers
  FOR DELETE TO authenticated USING (public.is_admin());
