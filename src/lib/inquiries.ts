import { submitInquiryFn } from "./api/inquiries.functions";

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
 * Submits an inquiry via the server-authoritative `submitInquiryFn` server
 * function (validation, sanitization, rate-limiting, and the owner notification
 * all happen on the server). Keeps the previous client signature.
 */
export async function submitInquiry(
  data: Omit<Inquiry, "ref" | "createdAt">,
  hp = "",
): Promise<Inquiry> {
  const res = await submitInquiryFn({
    data: {
      type: data.type,
      name: data.name,
      email: data.email,
      phone: data.phone,
      eventDate: data.eventDate,
      guestCount: data.guestCount,
      location: data.location,
      package: data.package,
      notes: data.notes,
      source: data.source,
      hp,
    },
  });

  return { ...data, ref: res.ref, createdAt: res.createdAt };
}
