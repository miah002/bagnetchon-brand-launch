import type { CartLine } from "@/context/CartContext";

export interface Order {
  ref: string;
  createdAt: string;
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
  total: number;
  source: string;
}

const STORAGE = "bagnetchon_orders_v1";

/**
 * Stub order creator. Persists locally; designed so a future Stripe Checkout
 * call can drop in here without disturbing callers.
 *
 * TODO(stripe): replace local persistence with a server fn that creates a
 * Stripe Checkout Session and returns the redirect URL. The function should
 * receive this `order` payload unchanged.
 */
export async function createOrder(
  order: Omit<Order, "ref" | "createdAt">,
): Promise<Order> {
  const ref =
    "BCN-" +
    Math.random().toString(36).slice(2, 6).toUpperCase() +
    "-" +
    Date.now().toString().slice(-4);
  const full: Order = { ...order, ref, createdAt: new Date().toISOString() };
  try {
    const raw = localStorage.getItem(STORAGE);
    const list: Order[] = raw ? JSON.parse(raw) : [];
    list.push(full);
    localStorage.setItem(STORAGE, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  return full;
}

export function listOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
