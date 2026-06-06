import { createFileRoute } from "@tanstack/react-router";

interface DistanceRow {
  distance?: { value: number };
  status?: string;
}
interface DistanceResp {
  status?: string;
  rows?: { elements?: DistanceRow[] }[];
  error_message?: string;
}

/**
 * POST /api/public/delivery-distance
 * Body: { origin: string, destination: string }
 * Returns: { miles } on success, or { unresolved: true, reason } so the UI
 * can fall back to "We'll confirm your delivery cost after you order."
 */
export const Route = createFileRoute("/api/public/delivery-distance")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { origin?: unknown; destination?: unknown };
        try {
          body = await request.json();
        } catch {
          return Response.json({ unresolved: true, reason: "bad_request" }, { status: 400 });
        }
        const origin = typeof body.origin === "string" ? body.origin.trim() : "";
        const rawDest = typeof body.destination === "string" ? body.destination.trim() : "";
        if (!origin || !rawDest) {
          return Response.json({ unresolved: true, reason: "missing_fields" }, { status: 400 });
        }
        // If user passed a bare 5-digit ZIP, scope it to US for accuracy.
        const destination = /^\d{5}$/.test(rawDest) ? `${rawDest}, USA` : rawDest;

        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          return Response.json({ unresolved: true, reason: "no_api_key" });
        }

        const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
        url.searchParams.set("origins", origin);
        url.searchParams.set("destinations", destination);
        url.searchParams.set("units", "imperial");
        url.searchParams.set("key", apiKey);

        try {
          const res = await fetch(url.toString());
          if (!res.ok) {
            return Response.json({ unresolved: true, reason: "upstream_error" });
          }
          const data = (await res.json()) as DistanceResp;
          if (data.status && data.status !== "OK") {
            return Response.json({ unresolved: true, reason: data.status });
          }
          const el = data.rows?.[0]?.elements?.[0];
          if (!el || el.status !== "OK" || !el.distance) {
            return Response.json({ unresolved: true, reason: el?.status ?? "no_route" });
          }
          const miles = el.distance.value / 1609.344;
          return Response.json({ miles });
        } catch {
          return Response.json({ unresolved: true, reason: "fetch_failed" });
        }
      },
    },
  },
});
