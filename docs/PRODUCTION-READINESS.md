# Bagnetchon — Production Readiness Plan

Status: drafted 2026-06-29. Builds on the completed backend-hardening pass
(server-authoritative writes, RLS lockdown, validation/honeypot/rate-limit,
security headers). This doc is the roadmap from "hardened" to "production-grade
& compliant" — security, compliance, performance, and data architecture.

Priority key: **P0** ship before real traffic · **P1** within first weeks ·
**P2** scale/maturity · **P3** nice-to-have.

---

## 0. What's already done (baseline)

- Server-authoritative pricing — money recomputed from canonical `MENU` server-side; client sends only `{id, qty}`.
- RLS locked: no anon writes; reads/mutations gated by `public.is_admin()`; writes via service-role server fns only.
- zod validation + control-char sanitization + honeypot + per-IP rate limit on public writes.
- Security headers (CSP, HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy) baked into Vercel output.
- Service-role key server-only; URL/anon key fall back to `VITE_` names.

---

## 1. Security — tighten further

### P0
- **Lock down edge functions.** `notify-order` / `notify-inquiry` use `Access-Control-Allow-Origin: *`. `config.toml` has no `[functions.*]` block, so they use default `verify_jwt` — **but the anon key is public** (it ships in the client bundle) and is itself a valid JWT, so anyone can invoke these and spam the owner's inbox with forged order/inquiry emails. CORS `*` doesn't matter here (abuse comes from non-browser callers).
  - **Real fix:** require a shared secret. The server fn sends `x-fn-secret: <env>`; the function rejects any request whose header ≠ the env value. These only ever run server→function (via service role), so no browser needs direct access.
  - Tighten CORS `Access-Control-Allow-Origin` to the site origin as defense-in-depth.
- **Verify sender domain (also compliance/deliverability).** Resend `FROM` is `onboarding@resend.dev`. Set up a real domain sender with **SPF + DKIM + DMARC**. Without it, owner notifications land in spam and the brand can be spoofed.
- **Disable public Supabase signups.** Defense-in-depth: admin accounts are seeded manually. In Supabase Auth settings, turn off public sign-up so no one can mint an `authenticated` JWT and probe RLS.

### P1
- **Durable rate limiting.** Current limiter is in-memory (per serverless instance) — resets on cold start, not global. Move to a Postgres counter table or Upstash Redis (fixed-window or token bucket keyed by IP+action). Keep the in-memory path as L1 cache.
- **Add CAPTCHA on public forms** (Cloudflare Turnstile — free, privacy-friendly). Honeypot stops dumb bots; Turnstile stops the rest. Verify the token server-side in the place-order/inquiry handlers.
- **CSP: remove `'unsafe-inline'` for scripts.** Today required for the SSR hydration script + React inline styles. Upgrade to a **nonce** pipeline (generate per-request nonce, inject into the hydration script tag + CSP header). Biggest remaining XSS gap.
- **Admin audit log.** Record who changed an order/inquiry status or delivery fee (admin email, timestamp, before/after). New `admin_audit` table written from the admin server fns. Needed for accountability + dispute resolution.

### P2
- **Secret rotation + least privilege.** Document a rotation procedure for `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY`. Confirm no secret is ever `VITE_`-prefixed (currently correct).
- **Dependency + supply-chain scanning.** Enable Dependabot/`npm audit` in CI; pin and review. Add `npm audit --omit=dev` gate.
- **Penetration smoke tests in CI** (see §5): money-tamper insert, RLS read as non-admin, oversized payload, honeypot.

---

## 2. Compliance — web app standards

The site collects PII (name, email, phone, delivery address) from CA consumers → **CCPA/CPRA** applies; **GDPR** if any EU traffic.

### P0
- **Privacy Policy + Terms** pages, linked in the footer. State what's collected, why, retention, third parties (Supabase, Resend, Vercel, Google if distance added), and contact for data requests.
- **Cookie/consent note.** App currently uses only functional storage (Supabase auth) — no analytics/ads cookies. A short banner/notice suffices; add a real consent manager only if analytics are introduced.

### P1
- **Data retention + deletion.** Define retention (e.g. orders 24 mo, inquiries 12 mo, subscribers until unsubscribe). Implement:
  - `unsubscribe` flow for `subscribers` (one-click link with signed token).
  - Admin "delete customer data" action (server fn) for CCPA deletion requests.
  - Scheduled purge (Supabase cron / `pg_cron`) of expired rows.
- **Accessibility (WCAG 2.1 AA).** Audit contrast (gold-on-cream risk), focus rings, alt text on all the new dish/founder photos, keyboard nav through menu filter tabs, `prefers-reduced-motion` honored by the menu animations. Run axe + Lighthouse a11y.
- **Email compliance.** Marketing emails to `subscribers` need an unsubscribe link + physical mailing address (CAN-SPAM).

### P2
- **SEO/standards pass.** Confirm `pageMeta` per route, OpenGraph/Twitter cards, `sitemap.xml`, `robots.txt`, structured data (`Restaurant`/`LocalBusiness` JSON-LD). Helps ranking + share previews.

---

## 3. Performance — keep it fast

The public site is mostly static (menu from code, no DB reads) so the dominant cost is **image weight**, not compute.

### P0
- **Image diet.** `public/Files/` has multi-MB PNGs (parchment 2.7 MB, wood 2.5 MB, corners ~2 MB each) — several likely **unused** after the wood-background revert. Menu JPGs are 500–640 KB each.
  - Audit which assets are actually referenced; delete the dead ones (the wood/parchment/extra corner PNGs are prime suspects).
  - Convert kept photos to **WebP/AVIF**, resize to max displayed dimension (≤1600px hero, ≤800px cards), target <150 KB/photo.
  - Add explicit `width`/`height` (or `aspect-ratio`) to every `<img>` → kills layout shift (CLS).
  - `loading="lazy"` + `decoding="async"` on below-the-fold images; eager-load only the hero.
- **Cache headers for static assets.** `Cache-Control: public, max-age=31536000, immutable` on hashed assets via nitro routeRules (alongside the security headers already there).

### P1
- **Font loading.** `font-display: swap`, preload only the 1–2 critical font files, subset to Latin.
- **Admin pagination.** Admin reads all orders/inquiries. Add range-based pagination + the indexes in §4 so it stays fast as rows grow.
- **Route-level code splitting** — TanStack does this per route; verify the menu animation libs aren't pulled into the initial bundle. `npm run build` + inspect chunk sizes.

### P2
- **Core Web Vitals budget in CI** (Lighthouse CI): LCP < 2.5s, CLS < 0.1, INP < 200ms. Fail the build on regression.
- **Edge caching** of the static marketing pages (Vercel CDN handles this; confirm SSR pages set sensible `s-maxage`).

---

## 4. Supabase data architecture — how tables relate

Current state: `orders`, `inquiries`, `subscribers` are **independent**, no foreign
keys; `orders.items` is a denormalized `jsonb` array. That's acceptable for a
single-kitchen brand site, but here's the model to grow into.

### Recommended relationships (target ERD)

```
admin_emails(email PK)                      -- allowlist, already added

products(id PK, name, price, group, ...)    -- OPTIONAL: DB-driven menu
   └──< order_items(order_id FK→orders.id, product_id FK→products.id,
                    qty, unit_price_snapshot)   -- price captured at order time

orders(id PK, order_ref UNIQUE, ...,        -- header / totals
       status, payment_status, updated_at)
   ├──< order_items                          -- one order → many lines
   └──< payments(id PK, order_id FK→orders.id, provider,
                 amount, status, stripe_session_id)  -- when Stripe lands

inquiries(id PK, ..., status, updated_at)    -- standalone (catering/contact)
subscribers(id PK, email UNIQUE, unsubscribed_at)
```

### Decisions & rationale
- **Keep `MENU` as the pricing source of truth in code for now.** It's tamper-proof (not user-writable) and zero-latency. Introduce a `products` table only when a non-dev needs to edit the menu/prices through the admin panel. If you do, the server fn still snapshots `unit_price` onto each `order_items` row so historical orders never change when prices do.
- **Normalize `items` jsonb → `order_items`** when you need per-item reporting ("how many lechon belly sold this month"). Until then, jsonb is fine and faster to write. Add a `CHECK`/zod guard on the jsonb shape.
- **Add `payments` table** before enabling Stripe — never overload `orders` with multiple payment attempts. `orders.payment_status` stays as a denormalized convenience mirror.
- **No FK between `inquiries` and `orders`** — they're different funnels. Optionally add `orders.inquiry_id` if a catering inquiry converts to an order.

### Schema hardening (P1)
- **Indexes for real query patterns** (admin filters by status/type/date):
  - `orders (status)`, `orders (created_at DESC)` ✅exists, `orders (customer_email)` for lookup.
  - `inquiries (status)`, `inquiries (type)`, `inquiries (created_at DESC)` ✅exists.
- **`updated_at` + trigger** on `orders`/`inquiries` (`moddatetime` extension) → audit + cache invalidation.
- **Tighten money columns:** `numeric(10,2)` good; add `CHECK (subtotal >= 0 AND tax >= 0 AND total >= 0)` and `CHECK (total = subtotal + tax + delivery_fee)` as a DB-level backstop to the server math.
- **`order_ref` format + collision:** currently random 10-char; UNIQUE constraint catches dupes but the insert would fail — add a retry-on-conflict in `placeOrder` (regenerate ref once).
- **Email normalization:** store `lower(trim(email))`; add a `CHECK` or generated column so `is_admin()` and unique constraints behave.

### Backups & DR (P1)
- Confirm Supabase project tier includes **daily backups + PITR**; document restore steps. Export schema (`supabase db dump`) into the repo so it's version-controlled alongside migrations.

---

## 5. Testing, CI/CD, observability

### P1
- **Automated security regression tests** (the manual checks from the audit, codified):
  1. Anon REST insert of an order with `total: 0` → **rejected**.
  2. Non-admin authenticated `select * from orders` → **0 rows**.
  3. UI order → DB `subtotal/tax/total` == server recompute from `MENU`.
  4. Oversized / invalid payload → 4xx with safe message.
  5. Honeypot-filled submit → silently dropped.
- **CI pipeline:** `tsc --noEmit` → `npm run build` → unit/integration tests → `npm audit` → Lighthouse CI. Block merge to `main` on failure.
- **Migrations in CI:** run `supabase db push --dry-run` against a shadow DB so a broken migration never reaches prod (the half-applied RLS migration earlier is exactly what this prevents).

### P2
- **Error monitoring** (Sentry or Logflare). Audit the existing `lovable-error-reporting` to confirm it never ships PII (order details, emails) to a third party — scrub if it does.
- **Uptime + alerting** (health-check endpoint + external monitor).
- **Structured server logs** for `placeOrder`/admin mutations (order ref, no PII in plaintext logs).

---

## 6. Build the missing pieces

### P1
- **`delivery-distance` endpoint.** `src/config/delivery.ts` calls `/api/public/delivery-distance` which doesn't exist yet (gracefully returns null). Build it as a server fn:
  - Google Distance Matrix key **server-side only** (never `VITE_`).
  - Validate/normalize destination, rate-limit per IP, **cache** results (same address → same miles) in a small table to cap API spend.
  - Returns `{ miles }`; the server (not client) computes the fee tier so delivery pricing is also server-authoritative.
- **Stripe (if taking online payment).** Adds PCI scope — use Stripe Checkout (hosted, keeps you in SAQ-A). Webhook (server fn) flips `payment_status`; never trust the client. Add the `payments` table first (§4).

---

## Suggested sequencing

1. **P0 batch (pre-traffic):** edge-function lockdown + CORS, verified email domain, disable signups, image diet + cache headers, Privacy/Terms pages. → one `security/prod-readiness` branch, backup-first merge to `main`.
2. **P1 batch:** durable rate limit, Turnstile, CSP nonce, audit log, schema indexes/`updated_at`/CHECK constraints, retention + unsubscribe + deletion, a11y pass, CI + security tests, `delivery-distance`.
3. **P2/P3:** products/order_items normalization, payments+Stripe, Lighthouse budgets, Sentry/uptime, SEO/structured data.

> Standing rule for all of the above: never touch `main` directly — feature
> branch, back up `origin/main`, then fast-forward merge.
