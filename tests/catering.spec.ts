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
    await page.goto("/catering");

    // Fill name and email first so React has committed at least one state update —
    // this ensures the date field's onChange closure captures non-initial form state,
    // which is required for pressSequentially to correctly update React state.
    await page.getByLabel("Full Name").fill("James Tan");
    await page.getByLabel("Email").fill("james@test.com");

    // The date input has min=today (set by the component via new Date().toISOString()).
    // page.fill() silently rejects dates <= min; we use pressSequentially with keyboard
    // events instead, which DO trigger React's onChange. Chrome date inputs are segmented
    // (MM/DD/YYYY), so we type digits directly. We derive today's MMDDYYYY from the
    // input's own min attribute to avoid Node/browser timezone mismatch.
    const todayMMDDYYYY = await page.locator("#cdate").evaluate((el: HTMLInputElement) => {
      const iso = el.getAttribute("min")!; // "YYYY-MM-DD" matching component's today
      const [y, m, d] = iso.split("-");
      return m + d + y; // "MMDDYYYY" for Chrome date segment keyboard input
    });

    await page.locator("#cdate").click();
    await page.locator("#cdate").pressSequentially(todayMMDDYYYY);

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
