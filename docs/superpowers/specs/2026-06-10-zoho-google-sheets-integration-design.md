# Zoho Invoice + Google Sheets Integration — Design

- **Date:** 2026-06-10
- **Status:** Draft — credential-dependent details (Zoho org/region, Google Sheet/Apps Script, exact columns) will be confirmed once the user has Zoho + Google access. Values marked _(verify on access)_ are sensible defaults, not blockers.
- **Owner:** Jeremiah (miah002)
- **App:** Bagnetchon — TanStack Start + Supabase (Lovable Cloud), deployed on Vercel.

## Goal

Flow website form data outward to two destinations, server-side, without exposing secrets to the browser:

1. **Google Sheet** — append a row per submission for **orders, catering inquiries, and contact messages** (not newsletter signups).
2. **Zoho Invoice** — generate an invoice for an **order**, triggered manually when the order is **confirmed in the admin panel**.

## Locked decisions (from brainstorming)

| Question | Decision |
|---|---|
| Google destination | **Google Sheet** (row per submission), not Google Form responses |
| Zoho product | **Zoho Invoice** |
| Invoice trigger | **On admin confirm** (explicit button in `/admin`), not auto-on-submit |
| Sheet scope | Orders, Catering inquiries, Contact messages (NOT newsletter) |
| Server runtime | **TanStack `createServerFn`** (secrets in Vercel env via `config.server.ts`) |
| Sheet write mechanism | **Apps Script Web App** webhook (header-mapped), shared-secret auth |
| Catering inquiries | Sheet only — no invoice (no fixed total / "market price") |

## Architecture

New folder `src/lib/integrations/`:

- `sheets.server.ts` — `appendRow(tab, data)`: POST JSON + shared secret to the Apps Script Web App URL. Server-only.
- `zoho.server.ts` — OAuth token manager (refresh-token → access-token, cached ~55 min in module scope, auto-renew on 401) + `createInvoiceForOrder(order)`. Server-only.
- `integrations.functions.ts` — two `createServerFn`s: `logToSheet`, `generateInvoice`.

Secrets read per-request inside `config.server.ts` getters (per the file's Cloudflare/per-request note — never module-scope).

### Data flow

```
Flow A — Google Sheet (on submit, best-effort, never blocks user)
  checkout createOrder()  --save--> Supabase orders
  catering/contact submitInquiry() --save--> Supabase inquiries
        |
        +--> logToSheet({ type, payload })  (fire-and-forget)
                 --> appendRow(tab) --> Apps Script /exec --> Sheet row
                 --> on success: set sheet_synced_at

Flow B — Zoho Invoice (on admin confirm, synchronous to the click)
  /admin order row --> [Generate Invoice] button
        |
        +--> generateInvoice({ orderId })  (createServerFn)
                 1. load order row (server-side Supabase read)
                 2. idempotency: if zoho_invoice_id set -> return existing
                 3. Zoho: find-or-create contact (by email)
                 4. Zoho: create invoice (line items + delivery + tax)
                 5. write back zoho_invoice_id, zoho_invoice_url,
                    invoiced_at, status='confirmed'
                 6. return invoice_url -> admin shows link / toast
```

## Connectors

### Google Sheet (Apps Script Web App)

- A bound Apps Script Web App (script provided during implementation) deployed as a Web App (`/exec` URL).
- The website POSTs `{ secret, tab, row }`. The script verifies `secret`, opens the named tab, reads the **header row**, and writes values **mapped by column name**.
- **Consequence:** columns can be added / renamed / reordered in the Sheet later with **zero code change** — directly addresses "columns not finalized." A header the website doesn't send is left blank; a value with no matching header is ignored.
- Tabs: `Orders`, `Catering`, `Contact`.

### Zoho Invoice (REST API, OAuth2)

- Self-client refresh-token flow. Access tokens (~1 h) minted from the refresh token, cached, auto-renewed on 401.
- Region-aware: accounts domain + API domain configurable (`.com` / `.eu` / `.in` / `.com.au`). _(verify on access)_
- Calls:
  - `POST /contacts` (or search then create) — find-or-create by email.
  - `POST /invoices` — create with line items.
- `reference_number` = `order_ref` (cross-link + secondary duplicate guard).

#### Order → Invoice field mapping

| Order field | Zoho invoice |
|---|---|
| `customer_name` / `email` / `phone` | Contact (find-or-create by email) |
| `address_street/city/zip` + `CA` | Contact billing address |
| `items[]` (`{ name, qty, price }`) | `line_items[] { name, rate, quantity }` |
| `delivery_fee` (> 0) | extra line item `"Delivery"` |
| `tax` (7.75%) | Zoho tax record via `ZOHO_TAX_ID` if configured, else a reconciling adjustment/line so invoice total == `order.total` _(verify on access)_ |
| `order_ref` | `reference_number` |
| `total` | reconciliation target (assert equality; on mismatch, apply adjustment) |

## Data model (Supabase migrations)

- `orders`: add `zoho_invoice_id text`, `zoho_invoice_url text`, `invoiced_at timestamptz`, `sheet_synced_at timestamptz`
- `inquiries`: add `sheet_synced_at timestamptz`

Regenerate `src/integrations/supabase/types.ts` after migration.

## Admin UI

`src/routes/admin.tsx` orders table gains an **Invoice** column:

- No invoice yet → **Generate Invoice** button → calls `generateInvoice`, shows spinner, then success (link) or error.
- Invoice exists → show a link to `zoho_invoice_url`; button hidden/disabled (no duplicates).
- On success the row's status moves to `confirmed`. Existing status dropdown stays.

## Configuration (env vars)

Added to `config.server.ts` getters (read per-request):

| Var | Purpose |
|---|---|
| `APPS_SCRIPT_URL` | Apps Script Web App `/exec` endpoint |
| `APPS_SCRIPT_SECRET` | shared secret verified by the script |
| `ZOHO_CLIENT_ID` / `ZOHO_CLIENT_SECRET` | Zoho self-client app |
| `ZOHO_REFRESH_TOKEN` | long-lived; scopes `ZohoInvoice.invoices.CREATE`, `ZohoInvoice.contacts.CREATE`, `ZohoInvoice.contacts.READ` |
| `ZOHO_ORG_ID` | Zoho Invoice organization id |
| `ZOHO_ACCOUNTS_DOMAIN` | e.g. `https://accounts.zoho.com` _(verify region)_ |
| `ZOHO_API_DOMAIN` | e.g. `https://www.zohoapis.com` _(verify region)_ |
| `ZOHO_TAX_ID` (optional) | Zoho tax record id for 7.75% |

Set in Vercel project env (Production + Preview) and in `.env.local` for dev. None use the `VITE_` prefix (secrets must not reach the client).

## Prerequisites (user provides on access)

- **Google:** create the Sheet with `Orders` / `Catering` / `Contact` tabs + header rows; deploy the provided Apps Script as a Web App; supply the `/exec` URL and choose a shared secret.
- **Zoho Invoice:** register a Self Client at the Zoho API console; generate a refresh token with the scopes above; supply `client_id`, `client_secret`, `refresh_token`, `org_id`, region domains, and (optional) a tax id for 7.75%.

## Default Sheet columns (starter — change anytime via header row)

- **Orders:** Timestamp, Order Ref, Status, Fulfillment, Name, Email, Phone, Street, City, ZIP, Items, Subtotal, Tax, Delivery Fee, Delivery Miles, Total, Source, Zoho Invoice URL
- **Catering:** Timestamp, Inquiry ID, Status, Name, Email, Phone, Event Date, Guest Count, Location, Package, Notes, Source
- **Contact:** Timestamp, Inquiry ID, Name, Email, Phone, Message, Source

## Error handling & reliability

- **Sheet (best-effort):** failures are caught and logged; `sheet_synced_at` stays null; the user never sees an error. (A manual "resync unsynced rows" admin action is possible later — out of scope now.)
- **Zoho (synchronous):** clear success (invoice link) or error message in admin; **idempotent** (guards on `zoho_invoice_id`, secondary check on `reference_number`); safe to retry by clicking again. 401 → token auto-refresh and one retry.
- **Missing/!configured secrets:** server fns return a clear "integration not configured" result; the site and existing flows keep working.

## Testing

- **Unit (pure, no network):** order→Zoho-invoice payload builder; Sheet row mapper; token manager with mocked `fetch` (refresh, cache, 401 renew).
- **Integration (manual, staging):** submit a test order → row appears in Sheet, confirm in admin → invoice appears in Zoho with matching total; double-confirm → exactly one invoice; submit catering/contact → rows appear, no invoice.

## Out of scope (YAGNI)

Newsletter → Sheet; auto-invoice on submit; Stripe-paid-triggered invoicing; invoice editing / voiding / PDF emailing from admin; two-way sync; DB-trigger-based Sheet sync (client best-effort used instead).

## Implementation order (high level)

1. Supabase migration + regenerate types.
2. `config.server.ts` getters for the new env vars.
3. `sheets.server.ts` + `logToSheet` server fn; wire into `createOrder` / `submitInquiry` (best-effort). Provide the Apps Script.
4. `zoho.server.ts` (token manager + invoice builder) + `generateInvoice` server fn (idempotent).
5. Admin **Invoice** column/button.
6. Unit tests; manual staging pass once credentials exist.

## Open items to confirm on access

- Zoho region domains + `org_id`; whether to use a Zoho tax record (`ZOHO_TAX_ID`) vs an adjustment line for the 7.75% tax.
- Final Sheet column set + tab names.
- Whether contact messages should ever become Zoho contacts (currently: Sheet only).
