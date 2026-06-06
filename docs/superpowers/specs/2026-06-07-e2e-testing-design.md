# E2E Testing Design — Bagnetchon Brand Launch

Date: 2026-06-07

## Scope

End-to-end Playwright test suite covering all major customer-facing flows: order placement, catering inquiry, and general page health. Payment is intentionally stubbed in the codebase (Stripe TODO); tests reflect that reality.

## Stack

- **Test runner:** `@playwright/test`
- **Browser:** Chromium only (single browser reduces CI time; expand later if needed)
- **Dev server:** `npm run dev` (TanStack Start / Vite, port 3000)
- **Mocking:** Playwright `page.route()` network interception — no real Supabase or delivery API calls

## Architecture

```
tests/
  mocks/
    network.ts          ← shared route-intercept helpers
  order-flow.spec.ts    ← happy path + cart edge cases
  catering.spec.ts      ← catering inquiry form
  pages.spec.ts         ← home, nav, contact, our-story, newsletter
playwright.config.ts    ← root config
```

## Mock Helper — `tests/mocks/network.ts`

Four exported functions used in `test.beforeEach` blocks:

| Function | Intercepts | Stub response |
|---|---|---|
| `mockOrderInsert(page)` | `POST **/rest/v1/orders**` | `[{ created_at: "2026-01-01T00:00:00Z" }]` |
| `mockInquiryInsert(page)` | `POST **/rest/v1/inquiries**` | `[{ id: "mock-id", created_at: "2026-01-01T00:00:00Z" }]` |
| `mockSubscriberInsert(page)` | `POST **/rest/v1/subscribers**` | `[{ id: "mock-id" }]` |
| `mockDelivery(page, miles?)` | `POST **/api/public/delivery-distance**` | `{ miles: 8.2 }` |

Supabase JS (PostgREST) returns arrays; `.single()` picks the first element. All order/inquiry mocks return single-element arrays to match this contract.

## Config — `playwright.config.ts`

- `baseURL: http://localhost:3000`
- `webServer.command: npm run dev`
- `webServer.url: http://localhost:3000`
- `webServer.reuseExistingServer: true` (skip restart if already running)
- `testDir: ./tests`
- Single `chromium` project

## Test Files

### `tests/order-flow.spec.ts`

**Happy path — full order flow:**
1. Navigate to `/menu`
2. Click "Add to cart" on first visible menu item
3. Verify item name and quantity appear in cart sidebar
4. Click "Proceed to Checkout"
5. Fill: name, phone, email, street, city, zip (valid FL zip)
6. Verify delivery fee panel shows distance and `$15.00` fee (8.2 mi → tier 2)
7. Click "Place Order"
8. Verify success screen: "Salamat!" heading + order ref matching `/BGN-[A-Z0-9]{4}\d{4}/`

**Edge cases:**
- Navigate to `/checkout` with empty cart → heading "Your cart is empty", link to `/menu`
- "Place Order" button disabled when name is blank
- "Place Order" button disabled when email is invalid format
- "Place Order" button disabled when ZIP is not 5 digits
- ZIP input strips non-digit characters; enforces 5-char max
- Cart sidebar qty `+` increases count; qty `−` to 0 removes item from list
- Remove (trash) button removes item from cart sidebar
- Add item on `/menu`, navigate to `/`, navigate back to `/menu` — item still in cart (localStorage persistence)

### `tests/catering.spec.ts`

**Happy path — catering inquiry:**
1. Navigate to `/catering`
2. Click "Inquire" on the Fiesta package card
3. Verify page scrolls to `#inquiry-form` and package select shows "Fiesta"
4. Fill: name, email, future date (today + 30 days), guest count, location
5. Click "Send Inquiry"
6. Verify success state: "Salamat!" heading

**Validation edge cases:**
- Submit with blank name → error "Required" shown for name field
- Submit with invalid email → error "Valid email required" shown
- Submit with today's date → error "Date must be in the future" shown
- Submit with guest count 0 → error "At least 1 guest" shown
- Submit button disabled when any required field invalid

### `tests/pages.spec.ts`

- Home page loads; `h1` contains "Crispy"
- Nav "Menu" link → navigates to `/menu`
- Nav "Catering" link → navigates to `/catering`
- Nav "Our Story" link → navigates to `/our-story`
- Nav "Contact" link → navigates to `/contact`
- Contact page: contains "(954) 625-9631" and "hello@bagnetchon.com"
- Our Story page: loads without JS errors (no console errors check)
- Newsletter form: enter valid email, submit → "Salamat! You're on the list." confirmation
- Home bestseller "Add" button: clicking adds item (MobileCartBar or cart sidebar count updates)

## Known Limitations

- **Payment not tested:** Stripe is stubbed. Order flow ends at Supabase insert. No payment UI to test yet.
- **Delivery distance fallback:** When delivery API returns null, UI shows "We'll confirm your delivery cost after you order." — not tested in happy path (mocked to return miles).
- **Admin route:** `/admin` not in scope — no auth flow designed yet.
- **Mobile viewport:** Tests run desktop by default. Mobile cart bar (`MobileCartBar`) not tested in this pass.
