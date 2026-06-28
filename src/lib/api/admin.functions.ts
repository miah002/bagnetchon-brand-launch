import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Server-side admin enforcement. requireSupabaseAuth validates the Bearer token;
// assertAdmin then checks the verified email against the server-only ADMIN_EMAILS
// allowlist before any service-role write. RLS (public.is_admin()) is the DB-level
// backstop; this is the application-level gate for service-role mutations.

const round2 = (n: number) => Math.round(n * 100) / 100;

function assertAdmin(claims: unknown): void {
  const email =
    typeof claims === "object" && claims !== null && "email" in claims
      ? String((claims as { email?: unknown }).email ?? "").toLowerCase()
      : "";
  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allow.length === 0 || !email || !allow.includes(email)) {
    throw new Error("Forbidden: admin access required.");
  }
}

const ORDER_STATUS = [
  "pending",
  "confirmed",
  "ready",
  "completed",
  "cancelled",
  "paid",
  "fulfilled",
  "canceled",
] as const;

const INQUIRY_STATUS = ["new", "contacted", "closed"] as const;

/** Recompute total = subtotal + tax + deliveryFee from the STORED row. */
export const updateOrderDelivery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({ id: z.string().uuid(), deliveryFee: z.number().min(0).max(100000) }),
  )
  .handler(async ({ data, context }): Promise<{ total: number }> => {
    assertAdmin(context.claims);

    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .select("subtotal, tax")
      .eq("id", data.id)
      .single();
    if (error || !row) throw new Error("Order not found.");

    const total = round2(Number(row.subtotal) + Number(row.tax) + data.deliveryFee);
    const { error: updErr } = await supabaseAdmin
      .from("orders")
      .update({ delivery_fee: data.deliveryFee, total })
      .eq("id", data.id);
    if (updErr) throw new Error("Could not update delivery fee.");

    return { total };
  });

export const setOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), status: z.enum(ORDER_STATUS) }))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    assertAdmin(context.claims);
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error("Could not update order status.");
    return { ok: true };
  });

export const setInquiryStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), status: z.enum(INQUIRY_STATUS) }))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    assertAdmin(context.claims);
    const { error } = await supabaseAdmin
      .from("inquiries")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error("Could not update inquiry status.");
    return { ok: true };
  });
