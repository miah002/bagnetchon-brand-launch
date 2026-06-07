import { test, expect } from "@playwright/test";
import { mockInquiryInsert, mockNotifyInquiry } from "./mocks/network";

// Produce a date 30 days from now in YYYY-MM-DD format
// Uses local date arithmetic to match the browser's timezone
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
    // waitUntil networkidle ensures React has fully hydrated before we interact
    await page.goto("/catering", { waitUntil: "networkidle" });

    // Click Inquire on the Fiesta package card
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

  test("validation: blank name disables submit", async ({ page }) => {
    await page.goto("/catering");

    // Fill all except name
    await page.getByLabel("Email").fill("james@test.com");
    await page.getByLabel("Event Date").fill(futureDate());
    await page.getByLabel("Guest Count").fill("50");
    await page.getByLabel("Event Location / Venue").fill("Miami Convention Center");

    await expect(page.getByRole("button", { name: "Send Inquiry" })).toBeDisabled();
  });

  test("validation: invalid email shows error and disables submit", async ({ page }) => {
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
    await page.goto("/catering", { waitUntil: "networkidle" });

    // Fill name and email first
    await page.getByLabel("Full Name").fill("James Tan");
    await page.getByLabel("Email").fill("james@test.com");

    // The date input has min=today — page.fill() silently rejects dates <= min.
    // We derive today's ISO date from the input's own min attribute (to avoid
    // Node/browser timezone mismatch), then inject it via the React synthetic
    // event pathway (nativeInputValueSetter + input event) so React state updates.
    await page.locator("#cdate").evaluate((el: HTMLInputElement) => {
      const todayIso = el.getAttribute("min")!; // "YYYY-MM-DD" from the component
      // Use the React internal setter so that React's onChange fires correctly
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )!.set!;
      nativeInputValueSetter.call(el, todayIso);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });

    // The date error appears because f.date <= today; button stays disabled
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
