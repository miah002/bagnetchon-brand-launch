import type { Page } from "@playwright/test";

/**
 * Mock the Supabase orders insert.
 * POST **/rest/v1/orders** → [{ created_at }]
 * Supabase .insert().select().single() unwraps first element of array.
 */
export async function mockOrderInsert(page: Page) {
  await page.route("**/rest/v1/orders*", (route) => {
    if (route.request().method() !== "POST") return route.continue();
    await route.fulfill({
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
  await page.route("**/rest/v1/inquiries*", (route) => {
    if (route.request().method() !== "POST") return route.continue();
    await route.fulfill({
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
  await page.route("**/rest/v1/subscribers*", (route) => {
    if (route.request().method() !== "POST") return route.continue();
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify([{ id: "mock-sub-id" }]),
    });
  });
}

/**
 * Mock the Supabase edge function notify-inquiry (fire-and-forget, swallowed).
 * Returns 200 so it doesn't leave pending requests open.
 */
export async function mockNotifyInquiry(page: Page) {
  await page.route("**/functions/v1/notify-inquiry*", (route) => {
    if (route.request().method() !== "POST") return route.continue();
    await route.fulfill({ status: 200, body: "{}" });
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
