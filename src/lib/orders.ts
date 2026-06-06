import type { CartLine } from "@/context/CartContext";
import { supabase } from "@/integrations/supabase/client";

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
  deliveryMiles?: number | null;
  total: number;
  source: string;
}

function genRef() {
  return (
    "BGN-" +
    Math.random().toString(36).slice(2, 6).toUpperCase() +
    Date.now().toString().slice(-4)
  );
}

/**
 * Persists an order in Lovable Cloud. Payment stays STUBBED.
 *
 * TODO(stripe): create a Stripe Checkout Session here, store
 * stripe_session_id, and redirect the user instead of returning success
 * immediately. Update status='paid' / payment_status='paid' via Stripe webhook.
 */
export async function createOrder(
  order: Omit<Order, "ref" | "createdAt">,
): Promise<Order> {
  const ref = genRef();
  const payload = {
    order_ref: ref,
    customer_name: order.customer.name,
    customer_email: order.customer.email,
    customer_phone: order.customer.phone,
    address_street: order.customer.street,
    address_city: order.customer.city,
    address_zip: order.customer.zip,
    source: order.source,
    items: order.lines as unknown as Record<string, unknown>[],
    subtotal: order.subtotal,
    tax: order.tax,
    delivery_fee: order.deliveryFee,
    delivery_miles: order.deliveryMiles ?? null,
    total: order.total,
    status: "pending",
    payment_status: "unpaid",
  };

  const { data: row, error } = await supabase
    .from("orders")
    .insert(payload)
    .select("created_at")
    .single();

  if (error || !row) {
    throw new Error(error?.message ?? "Could not place order");
  }

  return { ...order, ref, createdAt: row.created_at };
}
