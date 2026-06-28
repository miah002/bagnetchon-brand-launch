import { subscribeEmailFn } from "./api/subscribers.functions";

/**
 * Subscribes an email to the newsletter via the server-authoritative
 * `subscribeEmailFn` server function (validation + rate-limiting on the server).
 * Duplicate emails are silently ignored server-side.
 */
export async function subscribeEmail(email: string, source = "Website", hp = ""): Promise<void> {
  await subscribeEmailFn({ data: { email, source, hp } });
}
