export interface Inquiry {
  ref: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  guestCount: number;
  location: string;
  package?: string;
  notes?: string;
  source: string;
}

const STORAGE = "bagnetchon_inquiries_v1";

/** Placeholder for Formspree-style endpoint. */
export const FORM_ENDPOINT = "https://formspree.io/f/REPLACE_ME";

/**
 * Stub inquiry submitter. Persists locally; designed so backend (DB + email)
 * drops in cleanly later.
 *
 * TODO(backend): POST to a server fn that writes to Supabase + emails
 * catering@bagnetchon.com, replacing this local persistence.
 */
export async function submitInquiry(
  data: Omit<Inquiry, "ref" | "createdAt">,
): Promise<Inquiry> {
  const ref =
    "INQ-" +
    Math.random().toString(36).slice(2, 6).toUpperCase() +
    "-" +
    Date.now().toString().slice(-4);
  const full: Inquiry = { ...data, ref, createdAt: new Date().toISOString() };
  try {
    const raw = localStorage.getItem(STORAGE);
    const list: Inquiry[] = raw ? JSON.parse(raw) : [];
    list.push(full);
    localStorage.setItem(STORAGE, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  return full;
}

export function listInquiries(): Inquiry[] {
  try {
    const raw = localStorage.getItem(STORAGE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
