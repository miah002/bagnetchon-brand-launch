import { getRequest } from "@tanstack/react-start/server";

// Server-only helpers. The .server.ts suffix keeps this out of the client
// bundle (IP + in-memory rate-limit must never ship to the browser).

/** Best-effort client IP from proxy headers. */
export function getClientIp(): string {
  try {
    const req = getRequest();
    const xff = req?.headers.get("x-forwarded-for");
    if (xff) return xff.split(",")[0]?.trim() || "unknown";
    return req?.headers.get("x-real-ip") || "unknown";
  } catch {
    return "unknown";
  }
}

// In-memory fixed-window limiter. Best-effort only: serverless instances don't
// share memory, so this throttles per-instance bursts, not a global rate. For a
// durable global limit, back this with Upstash/Redis or a Postgres counter.
const buckets = new Map<string, { count: number; resetAt: number }>();

/** Returns true if the action is allowed; false if the limit is exceeded. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}

/** Throttle a named action per client IP. Throws a user-safe error if exceeded. */
export function throttleByIp(action: string, limit: number, windowMs: number): void {
  const ip = getClientIp();
  if (!rateLimit(`${action}:${ip}`, limit, windowMs)) {
    throw new Error("Too many requests. Please wait a moment and try again.");
  }
}
