import { z } from "zod";

// Shared validation schemas for all server functions. Pure (no server-only
// imports) so they can be referenced from the isomorphic module scope of the
// *.functions.ts files. Server-only helpers (IP, rate-limit) live in
// server-utils.server.ts.

/**
 * Strip C0 control chars and DEL (keep tab=9 and newline=10) and trim.
 * Implemented as a code-point scan to avoid embedding control chars in source.
 */
export function sanitizeText(s: string): string {
  let out = "";
  for (const ch of s) {
    const c = ch.codePointAt(0) ?? 0;
    const isControl = (c <= 31 && c !== 9 && c !== 10) || c === 127;
    if (!isControl) out += ch;
  }
  return out.trim();
}

const text = (max: number) => z.string().max(max).transform(sanitizeText);

export const emailSchema = z.string().trim().toLowerCase().email().max(200);

export const customerSchema = z.object({
  name: text(120).pipe(z.string().min(1, "Name required")),
  phone: text(40).pipe(z.string().min(7, "Phone required")),
  email: emailSchema,
  // Address optional at the schema level; enforced per-fulfillment in the handler.
  street: text(200).optional().default(""),
  city: text(120).optional().default(""),
  zip: text(10).optional().default(""),
});

export const lineSchema = z.object({
  id: z.string().min(1).max(64),
  qty: z.number().int().min(1).max(99),
});

export const sourceSchema = text(60).optional().default("Website");

/** Honeypot: must be empty. Bots tend to fill every field. */
export const honeypotSchema = z.string().max(0).optional().default("");

export const placeOrderSchema = z.object({
  lines: z.array(lineSchema).min(1, "Cart is empty").max(50),
  fulfillment: z.enum(["delivery", "pickup"]),
  customer: customerSchema,
  source: sourceSchema,
  hp: honeypotSchema,
});

export const submitInquirySchema = z.object({
  type: z.enum(["catering", "contact"]),
  name: text(120).pipe(z.string().min(1, "Name required")),
  email: emailSchema,
  phone: text(40).optional(),
  eventDate: z.string().max(40).optional(),
  guestCount: z.number().int().min(0).max(100000).optional(),
  location: text(200).optional(),
  package: text(120).optional(),
  notes: text(2000).optional(),
  source: sourceSchema,
  hp: honeypotSchema,
});

export const subscribeSchema = z.object({
  email: emailSchema,
  source: sourceSchema,
  hp: honeypotSchema,
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
export type SubmitInquiryInput = z.infer<typeof submitInquirySchema>;
export type SubscribeInput = z.infer<typeof subscribeSchema>;
