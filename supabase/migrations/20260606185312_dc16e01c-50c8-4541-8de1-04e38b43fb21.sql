
-- inquiries
CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  type text NOT NULL CHECK (type IN ('catering','contact')),
  source text NOT NULL DEFAULT 'Website',
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  event_date date,
  guest_count int,
  location text,
  package text,
  message text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','closed')),
  metadata jsonb
);
GRANT INSERT ON public.inquiries TO anon;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit an inquiry" ON public.inquiries
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read inquiries" ON public.inquiries
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can update inquiries" ON public.inquiries
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete inquiries" ON public.inquiries
  FOR DELETE TO authenticated USING (true);
CREATE INDEX inquiries_created_at_idx ON public.inquiries (created_at DESC);

-- orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  order_ref text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  address_street text NOT NULL,
  address_city text NOT NULL,
  address_zip text NOT NULL,
  source text NOT NULL DEFAULT 'Website',
  items jsonb NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  tax numeric(10,2) NOT NULL,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  delivery_miles numeric(10,2),
  total numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','fulfilled','canceled')),
  payment_status text NOT NULL DEFAULT 'unpaid',
  stripe_session_id text
);
GRANT INSERT ON public.orders TO anon;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can place an order" ON public.orders
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read orders" ON public.orders
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE TO authenticated USING (true);
CREATE INDEX orders_created_at_idx ON public.orders (created_at DESC);

-- subscribers
CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL UNIQUE,
  source text NOT NULL DEFAULT 'Website'
);
GRANT INSERT ON public.subscribers TO anon;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.subscribers TO authenticated;
GRANT ALL ON public.subscribers TO service_role;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.subscribers
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read subscribers" ON public.subscribers
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can update subscribers" ON public.subscribers
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admins can delete subscribers" ON public.subscribers
  FOR DELETE TO authenticated USING (true);
