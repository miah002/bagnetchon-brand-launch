# E2E Playwright Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Playwright E2E test suite covering the full customer order flow, catering inquiry, cart edge cases, and general page health.

**Architecture:** Three spec files (order-flow, catering, pages) share a single network-mock helper that intercepts Supabase REST and delivery-distance API calls via `page.route()`. The dev server runs via `webServer` in the Playwright config so tests work offline without real credentials.

**Tech Stack:** `@playwright/test`, TanStack Start (Vite, port 3000), Supabase JS (PostgREST), React 19, localStorage-backed cart.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `playwright.config.ts` | Runner config, webServer, base URL |
| Modify | `package.json` | Add `test` script |
| Create | `tests/mocks/network.ts` | Shared `page.route()` helpers for all specs |
| Create | `tests/order-flow.spec.ts` | Happy path + cart edge cases |
| Create | `tests/catering.spec.ts` | Catering inquiry happy path + validation |
| Create | `tests/pages.spec.ts` | Home, nav, contact, our-story, newsletter |

---

## Task 1: Install Playwright and add config

**Files:**
- Modify: `package.json`
- Create: `playwright.config.ts`

- [ ] **Step 1: Install `@playwright/test` and browsers**

```bash
npm install --save-dev @playwright/test --legacy-peer-deps
npx playwright install chromium
```

Expected: `@playwright/test` added to `devDependencies`. Chromium browser downloaded.

- [ ] **Step 2: Add `test` script to `package.json`**

In `package.json`, inside `"scripts"`, add:

```json
"test": "playwright test",
"test:ui": "playwright test --ui"
```

- [ ] **Step 3: Create `playwright.config.ts` at project root**

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
```

- [ ] **Step 4: Verify Playwright can reach the dev server**

Start `npm run dev` in a separate terminal, then run:

```bash
npx playwright test --list
```

Expected: lists test files (zero tests yet — that is fine). No "could not connect" errors.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts package.json package-lock.json
git commit -m "chore: install playwright and add test runner config"
```

---

## Task 2: Create network mock helper

**Files:**
- Create: `tests/mocks/network.ts`

- [ ] **Step 1: Create `tests/mocks/network.ts`**

```typescript
import type { Page } from "@playwright/test";

/**
 * Mock the Supabase orders insert.
 * POST **/rest/v1/orders** → [{ created_at }]
 * Supabase .insert().select().single() unwraps first element of array.
 */
export async function mockOrderInsert(page: Page) {
  await page.route("**rest/v1/orders**", (route) => {
    if (route.request().method() !== "POST") return route.continue();
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ created_at: "2026-01-01T00:00:00Z" }]),
    });
  });
}

/**
 * Mock the Supabase inquiries insert.
 * POST **/rest/v1/inquiries** → [{ id, created_at }]
 */
export async function mockInquiryInsert(page: Page) {
  await page.route("**rest/v1/inquiries**", (route) => {
    if (route.request().method() !== "POST") return route.continue();
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ id: "mock-id", created_at: "2026-01-01T00:00:00Z" }]),
    });
  });
}

/**
 * Mock the Supabase subscribers insert (newsletter).
 * POST **/rest/v1/subscribers** → [] (no select, just needs 200 and no error key)
 */
export async function mockSubscriberInsert(page: Page) {
  await page.route("**rest/v1/subscribers**", (route) => {
    if (route.request().method() !== "POST") return route.continue();
    route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });
}

/**
 * Mock the Supabase edge function notify-inquiry (fire-and-forget, swallowed).
 * Returns 200 so it doesn't leave pending requests open.
 */
export async function mockNotifyInquiry(page: Page) {
  await page.route("**functions/v1/notify-inquiry**", (route) => {
    route.fulfill({ status: 200, body: "{}" });
  });
}

/**
 * Mock the delivery distance API.
 * POST /api/public/delivery-distance → { miles }
 * Default 8.2 miles → tier 2 → $15.00 delivery fee.
 */
export async function mockDelivery(page: Page, miles = 8.2) {
  await page.route("**/api/public/delivery-distance**", (route) => {
    if (route.request().method() !== "POST") return route.continue();
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ miles }),
    });
  });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors related to `tests/mocks/network.ts`.

- [ ] **Step 3: Commit**

```bash
git add tests/mocks/network.ts
git commit -m "test: add shared network mock helpers for Playwright"
```

---

## Task 3: Order flow — happy path

**Files:**
- Create: `tests/order-flow.spec.ts`

- [ ] **Step 1: Write the happy path test**

Create `tests/order-flow.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";
import {
  mockOrderInsert,
  mockDelivery,
} from "./mocks/network";

test.describe("Order flow — happy path", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage so cart is empty at test start
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("bagnetchon_cart_v1"));
  });

  test("customer can add item, proceed to checkout, and place order", async ({ page }) => {
    await mockOrderInsert(page);
    await mockDelivery(page);

    // 1. Go to menu, add first item (Original Bagnet, $18.50)
    await page.goto("/menu");
    await page.getByRole("button", { name: "Add to cart" }).first().click();

    // 2. Cart sidebar shows item
    await expect(page.getByText("Original Bagnet")).toBeVisible();
    await expect(page.getByText("1")).toBeVisible(); // qty

    // 3. Proceed to checkout
    await page.getByRole("link", { name: "Proceed to Checkout" }).click();
    await expect(page).toHaveURL("/checkout");

    // 4. Fill customer details
    await page.getByLabel("Full name").fill("Maria Santos");
    await page.getByLabel("Phone").fill("9546259631");
    await page.getByLabel("Email").fill("maria@test.com");

    // 5. Fill delivery address
    await page.getByLabel("Street address").fill("123 Palm Ave");
    await page.getByLabel("City").fill("Fort Lauderdale");
    await page.getByLabel("ZIP").fill("33301");

    // 6. Delivery fee panel shows distance + fee
    await expect(page.getByText("8.2 mi")).toBeVisible();
    await expect(page.getByText("$15.00")).toBeVisible();

    // 7. Place order
    await page.getByRole("button", { name: "Place Order" }).click();

    // 8. Success screen
    await expect(page.getByRole("heading", { name: "Salamat!" })).toBeVisible();
    await expect(page.getByText(/BGN-[A-Z0-9]{4}\d{4}/)).toBeVisible();
  });
});
```

- [ ] **Step 2: Run test to see it pass (or identify real bugs)**

```bash
npm test -- --grep "happy path"
```

Expected: PASS. If FAIL, note the actual error — it points to a real bug in the app.

- [ ] **Step 3: Commit**

```bash
git add tests/order-flow.spec.ts
git commit -m "test: add order flow happy path E2E test"
```

---

## Task 4: Order flow — edge cases

**Files:**
- Modify: `tests/order-flow.spec.ts`

- [ ] **Step 1: Add edge case tests to `tests/order-flow.spec.ts`**

Append a second `describe` block after the happy path describe block:

```typescript
test.describe("Order flow — edge cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("bagnetchon_cart_v1"));
  });

  test("empty cart shows empty state on /checkout", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse the menu" })).toBeVisible();
  });

  test("Place Order button is disabled with blank name", async ({ page }) => {
    await mockDelivery(page);

    await page.goto("/menu");
    await page.getByRole("button", { name: "Add to cart" }).first().click();
    await page.getByRole("link", { name: "Proceed to Checkout" }).click();

    // Fill everything except name
    await page.getByLabel("Phone").fill("9546259631");
    await page.getByLabel("Email").fill("maria@test.com");
    await page.getByLabel("Street address").fill("123 Palm Ave");
    await page.getByLabel("City").fill("Fort Lauderdale");
    await page.getByLabel("ZIP").fill("33301");

    await expect(page.getByRole("button", { name: "Place Order" })).toBeDisabled();
  });

  test("Place Order button is disabled with invalid email", async ({ page }) => {
    await mockDelivery(page);

    await page.goto("/menu");
    await page.getByRole("button", { name: "Add to cart" }).first().click();
    await page.getByRole("link", { name: "Proceed to Checkout" }).click();

    await page.getByLabel("Full name").fill("Maria Santos");
    await page.getByLabel("Phone").fill("9546259631");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Street address").fill("123 Palm Ave");
    await page.getByLabel("City").fill("Fort Lauderdale");
    await page.getByLabel("ZIP").fill("33301");

    await expect(page.getByRole("button", { name: "Place Order" })).toBeDisabled();
  });

  test("Place Order button disabled when ZIP is not 5 digits", async ({ page }) => {
    await mockDelivery(page);

    await page.goto("/menu");
    await page.getByRole("button", { name: "Add to cart" }).first().click();
    await page.getByRole("link", { name: "Proceed to Checkout" }).click();

    await page.getByLabel("Full name").fill("Maria Santos");
    await page.getByLabel("Phone").fill("9546259631");
    await page.getByLabel("Email").fill("maria@test.com");
    await page.getByLabel("Street address").fill("123 Palm Ave");
    await page.getByLabel("City").fill("Fort Lauderdale");
    await page.getByLabel("ZIP").fill("123"); // only 3 digits

    await expect(page.getByRole("button", { name: "Place Order" })).toBeDisabled();
  });

  test("ZIP input strips non-digit characters", async ({ page }) => {
    await page.goto("/checkout");
    const zipField = page.getByLabel("ZIP");
    await zipField.fill("abc12def345"); // letters mixed in
    await expect(zipField).toHaveValue("12345");
  });

  test("cart qty increase and decrease", async ({ page }) => {
    await page.goto("/menu");
    await page.getByRole("button", { name: "Add to cart" }).first().click();

    // Increase qty to 2
    await page.getByRole("button", { name: "Increase" }).click();
    await expect(page.getByText("2").first()).toBeVisible();

    // Decrease back to 1
    await page.getByRole("button", { name: "Decrease" }).click();
    await expect(page.getByText("1").first()).toBeVisible();

    // Decrease to 0 — item should be removed
    await page.getByRole("button", { name: "Decrease" }).click();
    await expect(page.getByText("Original Bagnet")).not.toBeVisible();
    await expect(page.getByText("Nothing in your cart yet")).toBeVisible();
  });

  test("remove button removes item from cart", async ({ page }) => {
    await page.goto("/menu");
    await page.getByRole("button", { name: "Add to cart" }).first().click();
    await expect(page.getByText("Original Bagnet")).toBeVisible();

    await page.getByRole("button", { name: /Remove Original Bagnet/i }).click();
    await expect(page.getByText("Nothing in your cart yet")).toBeVisible();
  });

  test("cart persists across navigation", async ({ page }) => {
    // Add item on /menu
    await page.goto("/menu");
    await page.getByRole("button", { name: "Add to cart" }).first().click();

    // Navigate to home
    await page.goto("/");

    // Navigate back to menu
    await page.goto("/menu");

    // Item still in cart
    await expect(page.getByText("Original Bagnet")).toBeVisible();
  });
});
```

- [ ] **Step 2: Run edge case tests**

```bash
npm test -- --grep "edge cases"
```

Expected: all PASS. Note any failures — they are real bugs.

- [ ] **Step 3: Commit**

```bash
git add tests/order-flow.spec.ts
git commit -m "test: add order flow edge case E2E tests"
```

---

## Task 5: Catering inquiry tests

**Files:**
- Create: `tests/catering.spec.ts`

- [ ] **Step 1: Create `tests/catering.spec.ts`**

```typescript
import { test, expect } from "@playwright/test";
import { mockInquiryInsert, mockNotifyInquiry } from "./mocks/network";

// Produce a date 30 days from now in YYYY-MM-DD format
function futureDate(daysFromNow = 30): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

test.describe("Catering inquiry", () => {
  test.beforeEach(async ({ page }) => {
    await mockInquiryInsert(page);
    await mockNotifyInquiry(page);
  });

  test("happy path: inquire via package card pre-fills form and submits", async ({ page }) => {
    await page.goto("/catering");

    // Click Inquire on the Fiesta package (3rd card, index 2)
    await page.getByRole("article").filter({ hasText: "Fiesta" }).getByRole("button", { name: "Inquire" }).click();

    // Form scrolls into view and package is pre-filled
    await expect(page.locator("#cpkg")).toHaveValue("Fiesta");

    // Fill required fields
    await page.getByLabel("Full Name").fill("James Tan");
    await page.getByLabel("Email").fill("james@test.com");
    await page.getByLabel("Event Date").fill(futureDate());
    await page.getByLabel("Guest Count").fill("50");
    await page.getByLabel("Event Location / Venue").fill("Miami Convention Center");

    // Submit
    await page.getByRole("button", { name: "Send Inquiry" }).click();

    // Success state
    await expect(page.getByRole("heading", { name: "Salamat!" })).toBeVisible();
    await expect(page.getByText("Our catering concierge will reach out within 24 hours")).toBeVisible();
  });

  test("validation: blank name shows Required error", async ({ page }) => {
    await page.goto("/catering");

    // Fill all except name
    await page.getByLabel("Email").fill("james@test.com");
    await page.getByLabel("Event Date").fill(futureDate());
    await page.getByLabel("Guest Count").fill("50");
    await page.getByLabel("Event Location / Venue").fill("Miami Convention Center");

    await expect(page.getByRole("button", { name: "Send Inquiry" })).toBeDisabled();
  });

  test("validation: invalid email shows error", async ({ page }) => {
    await page.goto("/catering");

    await page.getByLabel("Full Name").fill("James Tan");
    await page.getByLabel("Email").fill("not-valid");
    await page.getByLabel("Event Date").fill(futureDate());
    await page.getByLabel("Guest Count").fill("50");
    await page.getByLabel("Event Location / Venue").fill("Miami Convention Center");

    await expect(page.getByRole("button", { name: "Send Inquiry" })).toBeDisabled();
    await expect(page.getByText("Valid email required")).toBeVisible();
  });

  test("validation: today's date shows future-date error", async ({ page }) => {
    await page.goto("/catering");

    await page.getByLabel("Full Name").fill("James Tan");
    await page.getByLabel("Email").fill("james@test.com");

    const today = new Date().toISOString().split("T")[0];
    await page.getByLabel("Event Date").fill(today);
    await page.getByLabel("Guest Count").fill("50");
    await page.getByLabel("Event Location / Venue").fill("Miami Convention Center");

    await expect(page.getByText("Date must be in the future")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send Inquiry" })).toBeDisabled();
  });

  test("validation: guest count of 0 shows error", async ({ page }) => {
    await page.goto("/catering");

    await page.getByLabel("Full Name").fill("James Tan");
    await page.getByLabel("Email").fill("james@test.com");
    await page.getByLabel("Event Date").fill(futureDate());
    await page.getByLabel("Guest Count").fill("0");
    await page.getByLabel("Event Location / Venue").fill("Miami Convention Center");

    await expect(page.getByText("At least 1 guest")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send Inquiry" })).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run catering tests**

```bash
npm test -- --grep "Catering inquiry"
```

Expected: all PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/catering.spec.ts
git commit -m "test: add catering inquiry E2E tests"
```

---

## Task 6: General pages tests

**Files:**
- Create: `tests/pages.spec.ts`

- [ ] **Step 1: Create `tests/pages.spec.ts`**

```typescript
import { test, expect } from "@playwright/test";
import { mockSubscriberInsert } from "./mocks/network";

test.describe("Pages — general health", () => {
  test("home page loads with correct h1", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Crispy");
  });

  test("nav Menu link navigates to /menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Menu" }).click();
    await expect(page).toHaveURL("/menu");
  });

  test("nav Catering link navigates to /catering", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Catering" }).click();
    await expect(page).toHaveURL("/catering");
  });

  test("nav Our Story link navigates to /our-story", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Our Story" }).click();
    await expect(page).toHaveURL("/our-story");
  });

  test("nav Contact link navigates to /contact", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL("/contact");
  });

  test("contact page shows phone and email", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByText("(954) 625-9631")).toBeVisible();
    await expect(page.getByText("hello@bagnetchon.com")).toBeVisible();
  });

  test("our-story page loads without error", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/our-story");
    expect(errors).toHaveLength(0);
  });

  test("newsletter signup shows confirmation", async ({ page }) => {
    await mockSubscriberInsert(page);
    await page.goto("/");

    await page.getByLabel("Email").fill("fan@test.com");
    await page.getByRole("button", { name: "Join" }).click();

    await expect(page.getByText("Salamat! You're on the list.")).toBeVisible();
  });

  test("home bestseller Add button updates nav cart count", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("bagnetchon_cart_v1"));

    // Cart icon should show no count badge
    const cartLink = page.getByRole("link", { name: /Cart/i });
    await expect(cartLink.getByText("1")).not.toBeVisible();

    // Click Add on first bestseller
    await page.getByRole("button", { name: "Add" }).first().click();

    // Nav cart count badge now shows 1
    await expect(cartLink.getByText("1")).toBeVisible();
  });
});
```

- [ ] **Step 2: Run pages tests**

```bash
npm test -- --grep "Pages"
```

Expected: all PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/pages.spec.ts
git commit -m "test: add general page health E2E tests"
```

---

## Task 7: Run full suite and fix failures

**Files:** any file with a bug revealed by tests

- [ ] **Step 1: Run the complete test suite**

```bash
npm test
```

Expected output: all tests PASS. If failures occur, read error output carefully — each failure points to either a real app bug or a selector that needs adjusting.

- [ ] **Step 2: Fix selector issues (if any)**

Common adjustments needed:
- If `getByRole("button", { name: "Increase" })` fails → the aria-label in the code is `"Increase"` but double-check [menu.tsx:169](src/routes/menu.tsx#L169) and [menu.tsx:178](src/routes/menu.tsx#L178) which use `aria-label="Decrease"` and `aria-label="Increase"` — these match exactly.
- If newsletter `getByLabel("Email")` is ambiguous (multiple email inputs on page) → use `page.locator("#newsletter")` instead.
- If `getByText("8.2 mi")` fails → check delivery mock fired before address was filled; add `await page.waitForSelector('text=8.2 mi')`.

- [ ] **Step 3: Re-run after any fixes**

```bash
npm test
```

Expected: all PASS.

- [ ] **Step 4: Commit fixes**

```bash
git add -p  # stage only what changed
git commit -m "test: fix selector issues found during full suite run"
```

---

## Known Gaps (out of scope for this plan)

- **Payment flow:** Stripe not wired — no payment UI to test.
- **Mobile viewport:** `MobileCartBar` renders only at `< md` breakpoint — not tested here.
- **Admin route `/admin`:** No auth flow designed yet.
- **Delivery fallback:** When distance API returns `null`, UI shows a different message — covered by delivery mock defaulting to `8.2` miles; a separate test for the `null` path is future work.
