import { createFileRoute } from "@tanstack/react-router";

interface RouteResp {
  routes?: { distanceMeters?: number }[];
  error?: { message?: string };
}

/**
 * POST /api/public/delivery-distance
 * Body: { origin: string, destination: string }
 * Returns: { miles } on success, or { unresolved: true, reason } so the UI
 * can fall back to "We'll confirm your delivery cost after you order."
 *
 * Uses Google Routes API (replaces legacy Distance Matrix API).
 * Enable "Routes API" in Google Cloud Console.
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
        const destination = /^\d{5}$/.test(rawDest) ? `${rawDest}, USA` : rawDest;

        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          return Response.json({ unresolved: true, reason: "no_api_key" });
        }

        try {
          const res = await fetch(
            "https://routes.googleapis.com/directions/v2:computeRoutes",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": "routes.distanceMeters",
              },
              body: JSON.stringify({
                origin: { address: origin },
                destination: { address: destination },
                travelMode: "DRIVE",
                routingPreference: "TRAFFIC_UNAWARE",
              }),
            },
          );

          if (!res.ok) {
            return Response.json({ unresolved: true, reason: "upstream_error" });
          }
          const data = (await res.json()) as RouteResp;
          const meters = data.routes?.[0]?.distanceMeters;
          if (typeof meters !== "number") {
            return Response.json({ unresolved: true, reason: "no_route" });
          }
          const miles = meters / 1609.344;
          return Response.json({ miles });
        } catch {
          return Response.json({ unresolved: true, reason: "fetch_failed" });
        }
      },
    },
  },
});
