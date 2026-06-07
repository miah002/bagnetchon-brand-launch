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
    await expect(page.getByText("(954) 625-9631").first()).toBeVisible();
    await expect(page.getByText("hello@bagnetchon.com").first()).toBeVisible();
  });

  test("our-story page loads without JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/our-story");
    expect(errors).toHaveLength(0);
  });

  test("newsletter signup shows confirmation", async ({ page }) => {
    await mockSubscriberInsert(page);
    await page.goto("/");

    await page.locator("#newsletter").fill("fan@test.com");
    await page.getByRole("button", { name: "Join" }).click();

    await expect(page.getByText("Salamat! You're on the list.")).toBeVisible();
  });

  test("home bestseller Add button updates nav cart count", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.removeItem("bagnetchon_cart_v1"));
    await page.reload({ waitUntil: "networkidle" });

    // Cart icon should show no count badge initially
    const cartLink = page.getByRole("link", { name: /Cart/i });
    await expect(cartLink.getByText("1")).not.toBeVisible();

    // Click Add on first bestseller
    await page.getByRole("button", { name: "Add" }).first().click();

    // Nav cart count badge now shows 1
    await expect(cartLink.getByText("1")).toBeVisible();
  });
});
