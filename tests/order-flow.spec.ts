import { test, expect } from "@playwright/test";
import {
  mockOrderInsert,
  mockOrderInsertError,
  mockDelivery,
} from "./mocks/network";

test.describe("Order flow — happy path", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to menu, clear cart, reload, and verify cart is empty
    await page.goto("/menu", { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.removeItem("bagnetchon_cart_v1"));
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByText("Nothing in your cart yet.")).toBeVisible();
  });

  test("customer can add item, proceed to checkout, and place order", async ({ page }) => {
    await mockOrderInsert(page);
    await mockDelivery(page);

    // 1. Add Original Bagnet to cart
    // waitUntil:"networkidle" in beforeEach ensures React has fully hydrated before we click
    // (SSR renders the button in HTML but onClick isn't attached until hydration completes)
    const originalBagnetCard = page.locator("li").filter({ hasText: "Original Bagnet" });
    await originalBagnetCard.getByRole("button", { name: "Add to cart" }).click();

    // 2. Cart sidebar shows item
    const cartAside = page.locator("aside").filter({ hasText: "Your Order" });
    await expect(cartAside.getByText("Original Bagnet")).toBeVisible();
    await expect(page.getByRole("link", { name: "Proceed to Checkout" })).toBeVisible();

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
    // $15.00 appears in both delivery panel and order summary; either is sufficient
    await expect(page.getByText("$15.00").first()).toBeVisible();

    // 7. Place order
    await page.getByRole("button", { name: "Place Order" }).click();

    // 8. Success screen
    await expect(page.getByRole("heading", { name: "Salamat!" })).toBeVisible();
    await expect(page.getByText(/BGN-[A-Z0-9]{4}\d{4}/)).toBeVisible();
  });
});

test.describe("Order flow — Supabase error handling", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/menu", { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.removeItem("bagnetchon_cart_v1"));
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByText("Nothing in your cart yet.")).toBeVisible();
  });

  test("shows error and stops spinner when order insert fails", async ({ page }) => {
    await mockOrderInsertError(page, "column \"fulfillment\" of relation \"orders\" does not exist");
    await mockDelivery(page);

    const card = page.locator("li").filter({ hasText: "Original Bagnet" });
    await card.getByRole("button", { name: "Add to cart" }).click();
    await page.getByRole("link", { name: "Proceed to Checkout" }).click();

    await page.getByLabel("Full name").fill("Test User");
    await page.getByLabel("Phone").fill("5625449882");
    await page.getByLabel("Email").fill("test@bagnetchon.com");
    await page.getByLabel("Street address").fill("100 S Harbor Blvd");
    await page.getByLabel("City").fill("Anaheim");
    await page.getByLabel("ZIP").fill("92805");

    // Wait for delivery estimate
    await expect(page.getByText("8.2 mi")).toBeVisible();

    const btn = page.getByRole("button", { name: "Place Order" });
    await btn.click();

    // Button must not stay disabled/spinning
    await expect(btn).not.toBeDisabled({ timeout: 5_000 });

    // Error shown — success screen must NOT appear
    await expect(page.getByText("Could not place order", { exact: false })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Salamat!" })).not.toBeVisible();
  });
});

test.describe("Order flow — edge cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/menu", { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.removeItem("bagnetchon_cart_v1"));
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByText("Nothing in your cart yet.")).toBeVisible();
  });

  test("empty cart shows empty state on /checkout", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByRole("heading", { name: "Your cart is empty" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse the menu" })).toBeVisible();
  });

  test("Place Order button is disabled with blank name", async ({ page }) => {
    await mockDelivery(page);

    const originalBagnetCard = page.locator("li").filter({ hasText: "Original Bagnet" });
    await originalBagnetCard.getByRole("button", { name: "Add to cart" }).click();
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

    const originalBagnetCard = page.locator("li").filter({ hasText: "Original Bagnet" });
    await originalBagnetCard.getByRole("button", { name: "Add to cart" }).click();
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

    const originalBagnetCard = page.locator("li").filter({ hasText: "Original Bagnet" });
    await originalBagnetCard.getByRole("button", { name: "Add to cart" }).click();
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
    // Need an item in cart so the checkout form renders (not the empty-cart screen)
    const originalBagnetCard = page.locator("li").filter({ hasText: "Original Bagnet" });
    await originalBagnetCard.getByRole("button", { name: "Add to cart" }).click();
    await page.getByRole("link", { name: "Proceed to Checkout" }).click();

    const zipField = page.getByLabel("ZIP");
    await zipField.click();
    await zipField.pressSequentially("abc12def345");
    await expect(zipField).toHaveValue("12345");
  });

  test("cart qty increase and decrease", async ({ page }) => {
    const originalBagnetCard = page.locator("li").filter({ hasText: "Original Bagnet" });
    await originalBagnetCard.getByRole("button", { name: "Add to cart" }).click();

    const cartAside = page.locator("aside").filter({ hasText: "Your Order" });

    // Increase qty to 2
    await cartAside.getByRole("button", { name: "Increase" }).click();
    await expect(cartAside.locator("span.min-w-4")).toHaveText("2");

    // Decrease back to 1
    await cartAside.getByRole("button", { name: "Decrease" }).click();
    await expect(cartAside.locator("span.min-w-4")).toHaveText("1");

    // Decrease to 0 — item should be removed
    await cartAside.getByRole("button", { name: "Decrease" }).click();
    await expect(page.getByText("Nothing in your cart yet.")).toBeVisible();
  });

  test("remove button removes item from cart", async ({ page }) => {
    const originalBagnetCard = page.locator("li").filter({ hasText: "Original Bagnet" });
    await originalBagnetCard.getByRole("button", { name: "Add to cart" }).click();

    const cartAside = page.locator("aside").filter({ hasText: "Your Order" });
    await expect(cartAside.getByText("Original Bagnet")).toBeVisible();

    await cartAside.getByRole("button", { name: /Remove Original Bagnet/i }).click();
    await expect(page.getByText("Nothing in your cart yet.")).toBeVisible();
  });

  test("cart persists across navigation", async ({ page }) => {
    // Add item on /menu
    const originalBagnetCard = page.locator("li").filter({ hasText: "Original Bagnet" });
    await originalBagnetCard.getByRole("button", { name: "Add to cart" }).click();

    // Navigate to home then back
    await page.goto("/");
    await page.goto("/menu", { waitUntil: "networkidle" });

    // Item still in cart
    const cartAside = page.locator("aside").filter({ hasText: "Your Order" });
    await expect(cartAside.getByText("Original Bagnet")).toBeVisible();
  });
});
