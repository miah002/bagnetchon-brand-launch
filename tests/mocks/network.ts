import type { Page } from "@playwright/test";

export async function mockOrderInsert(page: Page) {
  await page.route("**/rest/v1/orders*", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ created_at: "2026-01-01T00:00:00Z" }]),
    });
  });
}

export async function mockInquiryInsert(page: Page) {
  await page.route("**/rest/v1/inquiries*", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ id: "mock-id", created_at: "2026-01-01T00:00:00Z" }]),
    });
  });
}

export async function mockSubscriberInsert(page: Page) {
  await page.route("**/rest/v1/subscribers*", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify([{ id: "mock-sub-id" }]),
    });
  });
}

export async function mockNotifyInquiry(page: Page) {
  await page.route("**/functions/v1/notify-inquiry*", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
}

export async function mockDelivery(page: Page, miles = 8.2) {
  await page.route("**/api/public/delivery-distance*", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ miles }),
    });
  });
}
