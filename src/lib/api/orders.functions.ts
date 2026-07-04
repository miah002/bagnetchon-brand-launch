import { createServerFn } from "@tanstack/react-start";

import { placeOrderSchema } from "./schemas";
import { throttleByIp } from "./server-utils.server";
import { MENU } from "@/data/menu";
import { TAX_RATE } from "@/config/delivery";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { appendOrderToSheet } from "@/lib/integrations/sheets.server";

const round2 = (n: number) => Math.round(n * 100) / 100;

function genRef() {
  return "BGN-" + crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
}

export interface PlaceOrderResult {
  ref: string;
  createdAt: string;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
}

/**
 * Server-authoritative order placement. The client sends only line ids + qty
 * and customer details — NEVER money. All pricing is recomputed here from the
 * canonical MENU, so a tampered client total is impossible. Writes via the
 * service-role client (anon insert is revoked at the DB level).
 */
export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator(placeOrderSchema)
  .handler(async ({ data }): Promise<PlaceOrderResult> => {
    throttleByIp("placeOrder", 10, 60_000);

    // Recompute money from the canonical menu — ignore anything client-derived.
    let subtotal = 0;
    for (const line of data.lines) {
      const item = MENU.find((m) => m.id === line.id);
      if (!item) throw new Error(`Unknown item: ${line.id}`);
      if (item.requestQuote || item.price == null) {
        throw new Error(`"${item.name}" is quote-only and can't be ordered online.`);
      }
      subtotal += item.price * line.qty;
    }
    subtotal = round2(subtotal);
    const tax = round2(subtotal * TAX_RATE);
    const deliveryFee = 0; // confirmed by the team after the order
    const total = round2(subtotal + tax + deliveryFee);

    const isPickup = data.fulfillment === "pickup";
    if (!isPickup) {
      if (data.customer.street.length < 3 || data.customer.city.length < 2 || !/^\d{5}$/.test(data.customer.zip)) {
        throw new Error("A complete delivery address is required.");
      }
    }

    const ref = genRef();
    const payload = {
      order_ref: ref,
      fulfillment: data.fulfillment,
      customer_name: data.customer.name,
      customer_email: data.customer.email,
      customer_phone: data.customer.phone,
      address_street: isPickup ? "Pickup" : data.customer.street,
      address_city: isPickup ? "Pickup" : data.customer.city,
      address_zip: isPickup ? "00000" : data.customer.zip,
      source: data.source,
      items: data.lines,
      subtotal,
      tax,
      delivery_fee: deliveryFee,
      delivery_miles: null,
      total,
      status: "pending",
      payment_status: "unpaid",
    };

    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .insert(payload)
      .select("created_at")
      .single();

    if (error || !row) {
      console.error("Order insert failed:", error?.message);
      throw new Error("Could not place order. Please try again.");
    }

    // Fire-and-forget owner notification — never blocks success.
    supabaseAdmin.functions
      .invoke("notify-order", { body: { ...payload } })
      .catch(() => {
        /* swallow */
      });

    // Row into the owner's Google Sheet (same spreadsheet the order form
    // feeds). Awaited because Vercel may freeze the instance right after the
    // response, dropping floating promises — but it never throws and is
    // capped at 5s, so the order itself can't fail on a sheet outage.
    await appendOrderToSheet({
      ref,
      createdAt: row.created_at,
      name: data.customer.name,
      email: data.customer.email,
      phone: data.customer.phone,
      fulfillment: data.fulfillment,
      address: isPickup
        ? "Pickup"
        : `${data.customer.street}, ${data.customer.city} ${data.customer.zip}`,
      items: data.lines
        .map((l) => `${l.qty}× ${MENU.find((m) => m.id === l.id)?.name ?? l.id}`)
        .join("; "),
      subtotal,
      tax,
      deliveryFee,
      total,
      source: data.source,
    });

    return { ref, createdAt: row.created_at, subtotal, tax, deliveryFee, total };
  });
