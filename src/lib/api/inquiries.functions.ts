import { createServerFn } from "@tanstack/react-start";

import { submitInquirySchema } from "./schemas";
import { throttleByIp } from "./server-utils.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface SubmitInquiryResult {
  ref: string;
  createdAt: string;
}

/**
 * Server-authoritative inquiry submission. Validates + sanitizes input, throttles
 * by IP, and writes via the service-role client (anon insert is revoked).
 */
export const submitInquiryFn = createServerFn({ method: "POST" })
  .inputValidator(submitInquirySchema)
  .handler(async ({ data }): Promise<SubmitInquiryResult> => {
    throttleByIp("submitInquiry", 8, 60_000);

    const payload = {
      type: data.type,
      source: data.source,
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
      event_date: data.eventDate || null,
      guest_count: data.guestCount ?? null,
      location: data.location ?? null,
      package: data.package ?? null,
      message: data.notes ?? null,
    };

    const { data: row, error } = await supabaseAdmin
      .from("inquiries")
      .insert(payload)
      .select("id, created_at")
      .single();

    if (error || !row) {
      console.error("Inquiry insert failed:", error?.message);
      throw new Error("Could not submit inquiry. Please try again.");
    }

    supabaseAdmin.functions
      .invoke("notify-inquiry", { body: { id: row.id, ...payload } })
      .catch(() => {
        /* swallow: never block success */
      });

    return { ref: row.id, createdAt: row.created_at };
  });
