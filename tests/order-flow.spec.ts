import { test, expect } from "@playwright/test";
import {
  mockOrderInsert,
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
