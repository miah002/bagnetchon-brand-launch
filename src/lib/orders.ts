import type { CartLine } from "@/context/CartContext";
import { placeOrder } from "./api/orders.functions";

export interface Order {
  ref: string;
  createdAt: string;
  fulfillment: "delivery" | "pickup";
  customer: {
    name: string;
    phone: string;
    email: string;
    street: string;
    city: string;
    zip: string;
  };
  lines: CartLine[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  deliveryMiles?: number | null;
  total: number;
  source: string;
}

/**
 * Places an order via the server-authoritative `placeOrder` server function.
 * The browser sends only line ids + qty and customer details — all money is
 * recomputed on the server from the canonical menu, so the `subtotal/tax/total`
 * passed in here are ignored and replaced by the server's values.
 *
 * Payment stays STUBBED (see placeOrder handler for the Stripe TODO).
 */
export async function createOrder(
  order: Omit<Order, "ref" | "createdAt">,
  hp = "",
): Promise<Order> {
  const res = await placeOrder({
    data: {
      lines: order.lines.map((l) => ({ id: l.id, qty: l.qty })),
      fulfillment: order.fulfillment,
      customer: order.customer,
      source: order.source,
      hp,
    },
  });

  return {
    ...order,
    ref: res.ref,
    createdAt: res.createdAt,
    subtotal: res.subtotal,
    tax: res.tax,
    deliveryFee: res.deliveryFee,
    total: res.total,
  };
}
