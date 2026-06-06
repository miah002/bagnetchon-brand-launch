import { supabase } from "@/integrations/supabase/client";

export interface Inquiry {
  ref: string;
  createdAt: string;
  type: "catering" | "contact";
  name: string;
  email: string;
  phone?: string;
  eventDate?: string;
  guestCount?: number;
  location?: string;
  package?: string;
  notes?: string;
  source: string;
}

/**
 * Inserts an inquiry into Lovable Cloud, then fires the notify-inquiry
 * edge function (best-effort). NEVER throws if email/notify isn't configured —
 * the user always sees success once the row is saved.
 */
export async function submitInquiry(
  data: Omit<Inquiry, "ref" | "createdAt">,
): Promise<Inquiry> {
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

  const { data: row, error } = await supabase
    .from("inquiries")
    .insert(payload)
    .select("id, created_at")
    .single();

  if (error || !row) {
    throw new Error(error?.message ?? "Could not submit inquiry");
  }

  // Fire-and-forget owner notification.
  supabase.functions
    .invoke("notify-inquiry", { body: { id: row.id, ...payload } })
    .catch(() => {
      /* swallow: never block success */
    });

  return {
    ...data,
    ref: row.id,
    createdAt: row.created_at,
  };
}
