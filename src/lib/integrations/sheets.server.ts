// Server-only Google Sheets sync. Appends each website order as a row in the
// client's live order spreadsheet via a container-bound Apps Script Web App
// (see docs/integrations/google-sheet-orders.md for the script + deploy steps).
//
// Fire-and-forget by design: a sheet outage must never fail an order. The
// Supabase row is the source of truth; the sheet is the owner's working view.

export interface SheetOrderRow {
  ref: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  fulfillment: string;
  address: string;
  items: string; // human-readable, e.g. "2× Beef Kare Kare; 1× Steamed Rice"
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  source: string;
}

let warnedMissingEnv = false;

/**
 * POST the order row to the Apps Script Web App. Resolves quietly on any
 * failure (missing env, timeout, non-200) after logging — callers should NOT
 * await this on the critical path.
 */
export async function appendOrderToSheet(row: SheetOrderRow): Promise<void> {
  const url = process.env.SHEETS_WEBAPP_URL;
  const secret = process.env.SHEETS_WEBAPP_SECRET;

  if (!url || !secret) {
    if (!warnedMissingEnv) {
      warnedMissingEnv = true;
      console.warn(
        "[sheets] SHEETS_WEBAPP_URL / SHEETS_WEBAPP_SECRET not set — order rows are not being synced to Google Sheets.",
      );
    }
    return;
  }

  try {
    // Apps Script cannot read request headers, so the secret travels in the
    // body. The Web App URL 302-redirects to googleusercontent for the
    // response; fetch follows it.
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, ...row }),
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) {
      console.error(`[sheets] append failed: HTTP ${res.status}`);
      return;
    }
    const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!body?.ok) {
      console.error(`[sheets] append rejected: ${body?.error ?? "unknown error"}`);
    }
  } catch (err) {
    console.error("[sheets] append error:", err instanceof Error ? err.message : err);
  }
}
